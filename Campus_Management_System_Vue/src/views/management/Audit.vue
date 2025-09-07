<template>
  <div class="admin-user-container">
    <!-- 统计卡片区域 -->
    <div class="stats-container">
        <div class="page-header">
        <h2>教室审核情况通知</h2>
        <p>查看审核通过后的教室情况</p>
    
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
    </div></div>

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
                
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <!-- <el-button @click="resetSearch">重置</el-button> -->
                </el-form-item>
            </el-form>
        </div>

        <!-- 表格区域 -->
        <div class="content-card">
            <div class="table-header">
                <h3 class="table-title">教室显示</h3>
            </div>

            <el-table :data="data.tableData" stripe border highlight-current-row class="user-table" style="width: 100%">
                <!-- <el-table-column label="申请编号" prop="apply_id" align="center"></el-table-column> -->
                <!-- <el-table-column label="使用者" prop="user_name" align="center"></el-table-column>
              <el-table-column label="教秘" prop="sec_name" align="center"></el-table-column> -->
                <el-table-column label="教室" align="center" prop="classroom">
                    
                </el-table-column>
                <el-table-column label="使用时间" prop="date" align="center"></el-table-column>
                <el-table-column label="用途" prop="purpose" align="center"></el-table-column>
               
                <!-- <el-table-column label="审核状态" prop="apply_status" align="center">
                    <template #default="scope">
                        <el-tag :type="getStatusTagType(scope.row.apply_status)">
                            {{ scope.row.apply_status }}
                        </el-tag>
                    </template>
                </el-table-column> -->
                
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
import { reactive, onMounted } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { 
  User, Medal, Search, RefreshRight, Plus, Edit, Delete, CircleCheck, Warning, 
  Check
} from '@element-plus/icons-vue';
import axios from 'axios'

// 响应式数据
const data = reactive({
  // 统计卡片数据
  statsCards: [
    {
      title: '管辖教室总数',
      value: 0,
      icon: Check,
      bgColor: '#409EFF'
    },
  ],
  
  // 搜索表单
  searchForm: {
    apply_status: '已批准'
  },
  
  // 日志管理数据
  tableData: [],
  page: 1,
  size: 5,
  total: 0,
  
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
const load = () => {
  const params = {
    page: data.page,
    size: data.size
  };

  // 处理单选参数
  if (data.searchForm.apply_status) {
    params.apply_status = data.searchForm.apply_status;
  }
  
  console.log('发送请求到后端，参数:', params);
  // 手动配置请求头
  const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtZ3IwMDEiLCJ1c2VyX3Bhc3N3b3JkIjoibWdycGFzczEiLCJpYXQiOjE3NTcxNjYyNDAsImV4cCI6MTc1NzI1MjY0MH0.sAwkl_34c0cKGsnqpjQj0ukitPEDDKUtip_XF76G49B8gkYanfiSqG2shswrupnv8rvUEVBBE2HqmUOUXUGr5A";
  const headers = token ? { Authorization: `${token}` } : {};
  axios.get('http://localhost:8080/mgr/listApplyInfo', { 
    headers: headers,
    params: params
  }).then(res => {
    console.log("后端返回的数据：", res);
    if (res.data.code === 200 && res.data.data) {
      data.statsCards[0].value = res.data.data.managed_rooms || 0;
      
      data.tableData = res.data.data.records || [];
      data.total = res.data.data.total_applyinfo || 0;
      data.page = res.data.data.page || 1;
      data.size = res.data.data.size || 5;
      //const rejectedItems = data.tableData.filter(item => item.apply_status === '已拒绝');
      //console.log('表格数据中【已拒绝】记录的 reject_reason：', rejectedItems.map(item => item.reject_reason));
    } else {
      ElMessage.error(res.data.message || '数据加载失败');
    }
  }).catch(err => {
    console.error("请求失败详情：", err);
    if (err.response?.status === 401) {
      ElMessage.error('登录状态已过期，请重新登录');
      localStorage.removeItem('auth_token');
    } else {
      ElMessage.error(`请求失败：${err.message || '网络错误'}`);
    }
  });
};

// 查询按钮，更新表格数据
const handleSearch = () => {
  data.page = 1;
  // 强制创建新对象确保响应式更新
  data.searchForm = {...data.searchForm};
  load();
};

// 重置按钮，清空条件
const resetSearch = () => {
  data.searchForm = {
    apply_status: ''
  };
  handleSearch();
};

// 每页条数变化事件
const handleSizeChange = (newSize) => {
  data.size = newSize; // 同步参数名
  data.page = 1; // 切换每页条数时，建议重置为第1页
  load();
};

// 新增页码变化事件
const changePage = (newPage) => {
  data.page = newPage; // 同步参数名
  load();
};

// 生命周期钩子：挂载后
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
.page-header { 
  margin-bottom: 24px; 
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.page-header h2 { 
  font-size: 22px; 
  font-weight: 600; 
  margin-bottom: 8px; 
  color: #1f2937;
}
.page-header p { 
  color: #6b7280; 
  margin: 0;
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
  justify-content: flex-start;
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