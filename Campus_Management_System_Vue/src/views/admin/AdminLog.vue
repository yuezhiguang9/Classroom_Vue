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
                        <el-option v-for="item in data.collegeData" :key="item.id" 
                                  :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                
                <el-form-item label="楼栋名称" style="width: 200px;">
                    <el-select v-model="data.searchForm.building_id" placeholder="请选择楼栋" clearable>
                        <el-option v-for="item in data.buildingData" :key="item.id" 
                                  :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                
                <el-form-item label="申请人" style="width: 200px;">
                    <el-input v-model="data.searchForm.user_name" placeholder="请输入姓名"></el-input>
                </el-form-item>
                
                <el-form-item label="使用时间范围">
                    <el-date-picker
                        v-model="data.searchForm.date_range"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        value-format="YYYY-MM-DD">
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
                <el-table-column label="驳回原因" prop="reject_reason">
                    <template #default="scope">
                        <span v-if="scope.row.apply_status === '已拒绝'">{{ scope.row.reject_reason }}</span>
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
import { reactive, ref, onMounted } from 'vue';
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
    date_range: []
  },
  
  // 日志管理数据
  tableData: [],
  page: 1,
  size: 5,
  total: 0,
  // 从后端接口获取这些数据
  // 建议后端接口:
  // GET /listColleges 返回: [{id: number, name: string}, ...]
  // GET /listBuildings 返回: [{id: number, name: string}, ...]
  collegeData: [
    { id: 'col001', name: '人工智能学院' },
    { id: 'col002', name: '电子与物理学院' },
    { id: 'col003', name: '外国语学院' },
    { id: 'col004', name: '国际教育学院' },
    { id: 'col005', name: '文学院' },
    { id: 'col006', name: '政治与管理学院' },
    { id: 'col007', name: '民族与社会学学院' },
  ],
  buildingData: [
    { id: 'b001', name: '学友楼' },
    { id: 'b002', name: '校友楼' },
    { id: 'b003', name: '国教楼' },
    { id: 'b004', name: '文综楼' },
    { id: 'b005', name: '逸夫楼' },
    { id: 'b006', name: '创新楼' },
    { id: 'b007', name: '科技楼' },
  ]
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
    if (data.searchForm.date_range && data.searchForm.date_range.length === 2) {
      params.date_start = data.searchForm.date_range[0];
      params.date_end = data.searchForm.date_range[1];
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
        data.page = d.recordsPage.page || 1;
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
    date_range: []
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

onMounted(() => {
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
  align-items: center;
  justify-content: center;
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

















