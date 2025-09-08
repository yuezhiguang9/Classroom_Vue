<template>
  <div class="admin-user-container">
    <!-- 统计卡片区域 -->
    <div class="stats-container">
      <div class="stat-card" v-for="(item, index) in data.statsCards" :key="index">
        <div class="stat-icon" :style="{ backgroundColor: item.bgColor }">
          <el-icon :size="24" :color="'white'">
            <component :is="item.icon"></component>
          </el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-title">{{ item.title }}</div>
        </div>
      </div>
    </div>

    <!-- 日志管理区域 -->
    <div class="user-management-container">               
        <!-- 搜索区域 -->
        <div class="search-card">
            <el-form :model="data.searchForm" inline>
                <el-form-item label="申请状态" style="width: 200px;">
                    <el-select v-model="data.searchForm.apply_status" placeholder="请选择状态" clearable>
                        <el-option label="待审核" value="待审核"></el-option>
                        <el-option label="已批准" value="已批准"></el-option>
                        <el-option label="已拒绝" value="已拒绝"></el-option>
                    </el-select>
                </el-form-item>
                
                <el-form-item label="学院名称" style="width: 200px;">
                    <el-select v-model="data.searchForm.college_id" placeholder="请选择学院" clearable>
                        <el-option v-for="item in data.collegeData" :key="item.collegeId" 
                                  :label="item.collegeName" :value="item.collegeId"></el-option>
                    </el-select>
                </el-form-item>
                
                <el-form-item label="楼栋名称" style="width: 200px;">
                    <el-select v-model="data.searchForm.building_id" placeholder="请选择楼栋" clearable>
                        <el-option v-for="item in data.buildingData" :key="item.buildingId" 
                                  :label="item.buildingName" :value="item.buildingId"></el-option>
                    </el-select>
                </el-form-item>
                
                <el-form-item label="申请人" style="width: 200px;">
                    <el-input v-model="data.searchForm.user_name" placeholder="请输入姓名"></el-input>
                </el-form-item>
                
                <el-form-item label="开始日期">
                    <el-date-picker
                        v-model="data.searchForm.start_date"
                        type="date"
                        placeholder="选择开始日期"
                        value-format="YYYY-MM-DD"
                        :editable="false"
                        :clearable="true">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="结束日期">
                    <el-date-picker
                        v-model="data.searchForm.end_date"
                        type="date"
                        placeholder="选择结束日期"
                        value-format="YYYY-MM-DD"
                        :editable="false"
                        clearable
                        :disabled-date="(time) => {
                            if (data.searchForm.start_date) {
                                return time.getTime() < new Date(data.searchForm.start_date).getTime();
                            }
                            return false;
                        }">
                    </el-date-picker>
                </el-form-item>
                
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 表格区域 -->
        <div class="content-card">
            <div class="table-header">
                <h3 class="table-title">日志显示</h3>
            </div>

            <el-table :data="data.tableData" stripe border highlight-current-row class="user-table" style="width: 100%">
                <el-table-column label="姓名" prop="user_name" align="center"></el-table-column>
                <el-table-column label="联系电话" prop="phone" align="center"></el-table-column>
                <el-table-column label="预约时间" prop="book_time"></el-table-column>
                <el-table-column label="教室" align="center">
                    <template #default="scope">
                        {{ `${scope.row.building_name} ${scope.row.room_num}` }}
                    </template>
                </el-table-column>
                <el-table-column label="使用时间">
                    <template #default="scope">
                        {{ `${scope.row.date}${scope.row.week}${scope.row.day_of_week}${scope.row.period}`}}
                    </template>
                </el-table-column>
                <el-table-column label="用途" prop="purpose" align="center"></el-table-column>
                <el-table-column label="人数" prop="person_count" align="center"></el-table-column>
                <el-table-column label="审核状态" prop="apply_status" align="center">
                    <template #default="scope">
                        <el-tag :type="getStatusTagType(scope.row.apply_status)">
                            {{ scope.row.apply_status }}
                        </el-tag>
                    </template>
                </el-table-column>
                 <el-table-column label="驳回原因" prop="apply_reject_reason">
                    <template #default="scope">
                        <span v-if="scope.row.apply_status === '已拒绝'">{{ scope.row.apply_reject_reason }}</span>
                        <span v-else>-</span>
                    </template>
                </el-table-column>

            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
                <el-pagination 
                    background 
                    layout="total, sizes, prev, pager, next, jumper" 
                    v-model:page-size="data.size"
                    :page-sizes="[5, 10, 20, 50]"
                    v-model:current-page="data.page" 
                    :total="data.total" 
                    @size-change="handleSizeChange"
                    @current-change="changePage" />
            </div>
        </div>


    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import request from '@/utils/request';
import { ElMessage } from 'element-plus';
import { 
  Search, CircleCheck, Warning
} from '@element-plus/icons-vue';

// 响应式数据
const data = reactive({
  // 统计卡片数据
  statsCards: [
    {
      title: '全校今日待审核',
      value: 0,
      icon: Search,
      bgColor: '#409EFF'
    },
    {
      title: '全校本周通过',
      value: 0,
      icon: CircleCheck,
      bgColor: '#67C23A'
    },
    {
      title: '全校本周驳回',
      value: 0,
      icon: Warning,
      bgColor: '#F56C6C'
    }
  ],
  
  // 搜索表单
  searchForm: {
    apply_status: '',
    college_id: '',
    building_id: '',
    user_name: '',
    start_date: '',
    end_date: ''
  },
  
  // 日志管理数据
  tableData: [],
  page: 1,
  size: 5,
  total: 0,
  // 学院数据，从后端获取
  collegeData: [],
  // 楼栋数据，从后端获取
  buildingData: []
});

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch(status) {
    case '待审核': return 'warning';
    case '已批准': return 'success';
    case '已拒绝': return 'danger';
    default: return 'info';
  }
};

// 获取学院列表
const getColleges = async () => {
  try {
    console.log('开始请求学院列表...');
    const res = await request.get('/common/getColleges');
    console.log('学院列表请求响应:', res);
    if (res && res.code === 200) {
      if (res.data && Array.isArray(res.data)) {
        data.collegeData = res.data;
        console.log('学院列表数据更新成功:', data.collegeData);
      } else {
        console.error('学院数据格式不正确，应为数组:', res.data);
        ElMessage.error('获取学院列表数据格式错误');
      }
    } else {
      console.error('获取学院列表失败，状态码:', res?.code);
      ElMessage.error(`获取学院列表失败: ${res?.message || '未知错误'}`);
    }
  } catch (e) {
    console.error('获取学院列表异常:', e);
    ElMessage.error(`网络错误，获取学院列表失败: ${e.message}`);
  }
};

// 获取楼栋列表
const getBuildings = async () => {
  try {
    console.log('开始请求楼栋列表...');
    const res = await request.get('/common/getBuildings');
    console.log('楼栋列表请求响应:', res);
    if (res && res.code === 200) {
      if (res.data && Array.isArray(res.data)) {
        data.buildingData = res.data;
        console.log('楼栋列表数据更新成功:', data.buildingData);
      } else {
        console.error('楼栋数据格式不正确，应为数组:', res.data);
        ElMessage.error('获取楼栋列表数据格式错误');
      }
    } else {
      console.error('获取楼栋列表失败，状态码:', res?.code);
      ElMessage.error(`获取楼栋列表失败: ${res?.message || '未知错误'}`);
    }
  } catch (e) {
    console.error('获取楼栋列表异常:', e);
    ElMessage.error(`网络错误，获取楼栋列表失败: ${e.message}`);
  }
};

// 加载数据
const load = async () => {
  try {
    // 构建请求参数
    const params = {
      page: data.page,
      size: data.size,
      user_name: data.searchForm.user_name
    };
    
    // 打印请求参数（关键验证步骤）
    console.log('请求分页参数:', {
      page: params.page,
      size: params.size,
      total: data.total
    });

    // 处理单选参数
    if (data.searchForm.apply_status) {
      params.apply_status = data.searchForm.apply_status;
    }
    
    if (data.searchForm.college_id) {
      params.college_id = data.searchForm.college_id;
    }
    
    if (data.searchForm.building_id) {
      params.building_id = data.searchForm.building_id;
    }
      
    // 处理日期范围
    if (data.searchForm.start_date) {
      params.date_start = data.searchForm.start_date;
    }
    if (data.searchForm.end_date) {
      params.date_end = data.searchForm.end_date;
    }
    
    console.log('发送请求到后端，参数:', params);
    
    const res = await request.get('/admin/listLogs', {
      params: params
    });

    console.log("后端返回的数据：", res);
    
    if (res && res.code === 200) {
      // 适配后端实际返回的数据结构
      const d = res.data[0] || {};
      
      // 统计卡片
      data.statsCards[0].value = d.today_pending || 0;
      data.statsCards[1].value = d.week_approved || 0;
      data.statsCards[2].value = d.week_rejected || 0;

      // 表格数据
      if (d.recordsPage && d.recordsPage.records) {
        data.tableData = d.recordsPage.records;
        data.total = d.recordsPage.total || 0;
        // data.page = d.recordsPage.page || 1;
        data.size = d.recordsPage.size || 10;
        
        // 调试已拒绝的记录
        const rejectedItems = data.tableData.filter(item => item.apply_status === '已拒绝');
        console.log('后端返回的【已拒绝】记录详情：', rejectedItems);
        console.log('后端返回的【已拒绝】记录的 reject_reason：', rejectedItems.map(item => item.reject_reason));
      } else {
        console.error('后端返回的数据结构不符合预期:', d);
        data.tableData = [];
        data.total = 0;
      }
    } else {
      ElMessage.error(res?.message || '获取日志数据失败');
    }
  } catch (e) {
    console.error('获取日志失败:', e);
    ElMessage.error(e.response?.data?.message || e.message || '网络错误');
  }
};

// 查询按钮
const handleSearch = () => {
  data.page = 1;
  load();
};

// 重置
const resetSearch = () => {
  data.searchForm = {
    apply_status: '',
    college_id: '',
    building_id: '',
    user_name: '',
    start_date: '',
    end_date: ''
  };
  data.page = 1;
  load();
};

// 分页
const handleSizeChange = (val) => {
  data.size = val;
  data.page = 1;
  load();
};
const changePage = (val) => {
  data.page = val;
  load();
};

// 监听日期范围变化，防止重置问题
watch(() => data.searchForm.date_range, (newVal, oldVal) => {
  // 确保日期范围是一个有效的数组
  if (newVal && Array.isArray(newVal)) {
    // 如果数组长度不为2，保持原值
    if (newVal.length !== 2 && newVal.length !== 0) {
      data.searchForm.date_range = oldVal || [];
    }
  }
});

onMounted(async () => {
  // 并行获取学院和楼栋数据
  await Promise.all([getColleges(), getBuildings()]);
  // 获取日志数据
  load();
});
</script>

<style scoped>
.admin-user-container {
  padding: 15px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

/* 统计卡片样式 */
.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-title {
  font-size: 14px;
  color: #666;
}

/* 日志管理区域样式 */
.search-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.date-range-form {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.role-filter-buttons {
  display: flex;
  gap: 15px;
  align-items: center;
}

.filter-btn {
  min-width: 120px;
  height: 40px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.3s;
}

.filter-btn:not(.el-button--primary) {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
  color: #606266;
}

.filter-btn:not(.el-button--primary):hover {
  background-color: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.content-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.add-button {
  font-weight: 500;
}

.user-table {
  margin-bottom: 20px;
  border-radius: 6px;
  overflow: hidden;
}

.code-text {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #606266;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.user-form {
  margin: 0 auto;
  max-width: 400px;
}

.dialog-footer {
  text-align: right;
  margin-top: 20px;
}

/* 适配小屏幕 */
@media (max-width: 1200px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
}
</style>

















