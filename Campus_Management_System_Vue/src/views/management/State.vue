<template>
  <div class="admin-user-container">
    <h2>教室管理员工作台</h2>
    <p>管理教室状态与查看相关信息</p>
    <!-- 今日可用教室数展示区域 -->
    <el-card class="today-available-card">
      <div class="card-content">
        <div class="icon-container">
          <el-icon><Open /></el-icon>
        </div>
        <div class="count-info">
          <div class="count">{{ data.todayAvailableCount }}</div>
          <div class="desc">今日可用教室数</div>
        </div>
      </div>
    </el-card>
    <!-- 批量操作区域 -->
    <div class="batch-operation">
      <el-select v-model="batchRoomStatus" placeholder="选择状态">
        <el-option label="空闲" value="空闲"></el-option>
        <el-option label="不可用" value="不可用"></el-option>
      </el-select>
      <el-input
        v-model="batchDuration"
        placeholder="请输入不可用结束时间，格式：yyyy-MM-dd HH:mm:ss"
        :disabled="batchRoomStatus !== '不可用'"
        maxlength="19"
        @blur="validateTimeFormat"
      />
      <el-button type="primary" @click="batchUpdateStatus">批量更新状态</el-button>
    </div>
    <!-- 日志管理区域 -->
    <div class="user-management-container">               
        <!-- 搜索区域 -->
        <div class="search-card">
            <el-form :model="data.searchForm" inline>
                <el-form-item label="最小容量" style="width: 200px;">
                    <el-input v-model.number="data.searchForm.capacity" placeholder="输入最小容量" type="number"></el-input>
                </el-form-item>
                
                <el-form-item label="教室状态" style="width: 200px;">
                    <el-select v-model="data.searchForm.roomStatus" placeholder="请选择状态" clearable>
                        <el-option label="可用" value="可用"></el-option>
                        <el-option label="已占用" value="已占用"></el-option>
                        <el-option label="维护中" value="维护中"></el-option>
                    </el-select>
                </el-form-item>
                
                <el-form-item label="教室类型" style="width: 200px;">
                    <el-select v-model="data.searchForm.roomType" placeholder="请选择教室类型" clearable>
                        <el-option label="普通教室" value="普通教室"></el-option>
                        <el-option label="阶梯教室" value="阶梯教室"></el-option>
                        <el-option label="实验室" value="实验室"></el-option>
                        <el-option label="多媒体教室" value="多媒体教室"></el-option>
                        <el-option label="计算机房" value="计算机房"></el-option>
                        <el-option label="语音室" value="语音室"></el-option>
                        <el-option label="智慧教室" value="智慧教室"></el-option>
                    </el-select>
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
                <h3 class="table-title">教室列表</h3>
            </div>

            <el-table 
                :data="data.tableData" 
                stripe 
                border 
                highlight-current-row 
                class="user-table" 
                style="width: 100%"
                v-loading="loading"
                @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column label="教室编号" prop="roomNum" align="center"></el-table-column>
                <el-table-column label="教室容量" prop="capacity" align="center"></el-table-column>
                <el-table-column label="教室类型" prop="roomType" align="center"></el-table-column>
                <el-table-column label="教室状态" prop="roomStatus" align="center">
                    <template #default="scope">
                        <el-tag :type="getStatusTagType(scope.row.roomStatus)">
                            {{ scope.row.roomStatus }}
                        </el-tag>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
                <el-pagination 
                    background 
                    layout="total, sizes, prev, pager, next, jumper" 
                    v-model:page-size="data.size"
                    :page-sizes="[10, 20, 50]"
                    v-model:current-page="data.page" 
                    :total="data.total" 
                    @size-change="handleSizeChange"
                    @current-change="changePage" 
                />
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from "vue";
import { ElMessage, ElCard, ElIcon, ElSelect, ElOption, ElInput, ElButton } from "element-plus";
import { Open } from "@element-plus/icons-vue";
import axios from 'axios'

// 加载状态
const loading = ref(false);

// 响应式数据
const data = reactive({
  // 搜索表单
  searchForm: {
    roomNum: '',       // 楼层筛选，存储要匹配的首数字
    capacity: null,     // 最小容量筛选
    roomStatus: '',     // 教室状态筛选(可用/已占用/维护中)
    roomType: ''        // 教室类型筛选
  },
  
  // 教室列表数据
  tableData: [],
  page: 1,             // 页码
  size: 10,            // 每页条数
  total: 0,            // 符合条件的教室总数
  todayAvailableCount: 0 // 今日可用教室数
});

// 批量操作相关数据
const selectedRows = ref([]);
const batchRoomStatus = ref('');
const batchDuration = ref('');

// 处理楼层输入，确保只输入数字且长度为1
const handleFloorInput = (value) => {
  // 只保留数字，且最多保留1位
  const numericValue = value.replace(/[^0-9]/g, '').slice(0, 1);
  data.searchForm.roomNum = numericValue;
};

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch(status) {
    case '可用': return 'success';
    case '已占用': return 'info';
    case '维护中': return 'warning';
    default: return 'info';
  }
};

// 处理表格选中事件
const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

// 验证时间格式
const validateTimeFormat = () => {
  if (!batchDuration.value) return true;
  
  // 允许月份、日期、小时、分钟、秒数为1位或2位，例如2025-8-30 3:5:9
  const regex = /^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/;
  
  if (!regex.test(batchDuration.value)) {
    ElMessage.warning("时间格式不正确，请使用 yyyy-MM-dd HH:mm:ss 格式（例如：2025-8-30 23:59:59）");
    return false;
  }
  
  // 验证日期有效性
  const parts = batchDuration.value.split(/[- :]/);
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 月份从0开始
  const day = parseInt(parts[2], 10);
  const hours = parseInt(parts[3], 10);
  const minutes = parseInt(parts[4], 10);
  const seconds = parseInt(parts[5], 10);
  
  const date = new Date(year, month, day, hours, minutes, seconds);
  
  if (
    date.getFullYear()!== year ||
    date.getMonth()!== month ||
    date.getDate()!== day ||
    date.getHours()!== hours ||
    date.getMinutes()!== minutes ||
    date.getSeconds()!== seconds
  ) {
    ElMessage.warning("请输入有效的日期时间");
    return false;
  }
  
  // 验证时间不能早于当前时间
  if (date <= new Date()) {
    ElMessage.warning("不可用结束时间不能早于当前时间");
    return false;
  }
  
  return true;
};

// 加载数据
const load = () => {
  loading.value = true;
  
  // 构建请求参数
  const params = {
    page: data.page,
    size: data.size
  };
  
  // 处理筛选参数，只传递有值的参数
  if (data.searchForm.roomNum) {
    params.roomNum = data.searchForm.roomNum;
  }
  
  if (data.searchForm.capacity) {
    params.capacity = data.searchForm.capacity;
  }
  
  if (data.searchForm.roomStatus) {
    params.roomStatus = data.searchForm.roomStatus;
  }
  
  // 教室类型参数
  if (data.searchForm.roomType) {
    params.room_type = data.searchForm.roomType;
  }
  
  console.log('发送请求到后端，参数:', params);
  
  // 配置请求头
  const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtZ3IwMDEiLCJ1c2VyX3Bhc3N3b3JkIjoibWdycGFzczEiLCJpYXQiOjE3NTcxNjYyNDAsImV4cCI6MTc1NzI1MjY0MH0.sAwkl_34c0cKGsnqpjQj0ukitPEDDKUtip_XF76G49B8gkYanfiSqG2shswrupnv8rvUEVBBE2HqmUOUXUGr5A";
  const headers = token ? { Authorization: `${token}` } : {};
  
  // 调用教室查询接口
  axios.get('http://localhost:8080/mgr/selectClassroom', { 
    headers: headers,
    params: params
  }).then(res => {
    console.log("后端返回的数据：", res);
    
    data.tableData = res.data.data || [];
    data.total = (res.data.data || []).length;
    data.todayAvailableCount = data.tableData.length > 0 ? (data.tableData[0].today_available_count || 0) : 0;
    
  }).catch(error => {
    console.error("请求出错：", error);
    ElMessage.error("获取教室数据失败，请重试");
  }).finally(() => {
    loading.value = false;
  });
};

// 批量更新教室状态
const batchUpdateStatus = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请选择要更新的教室");
    return;
  }
  if (!batchRoomStatus.value) {
    ElMessage.warning("请选择要更新的状态");
    return;
  }
  if (batchRoomStatus.value === '不可用') {
    if (!batchDuration.value) {
      ElMessage.warning("请输入不可用结束时间");
      return;
    }
    if (!validateTimeFormat()) {
      return;
    }
  }

  // 构建符合后端要求的请求数据
  const requestData = {
    roomNum: selectedRows.value.map(row => row.roomNum),
    roomStatus: batchRoomStatus.value,
   ...(batchRoomStatus.value === '不可用' && { duration: batchDuration.value })
  };

  // 配置请求头
  const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtZ3IwMDEiLCJ1c2VyX3Bhc3N3b3JkIjoibWdycGFzczEiLCJpYXQiOjE3NTcxNjYyNDAsImV4cCI6MTc1NzI1MjY0MH0.sAwkl_34c0cKGsnqpjQj0ukitPEDDKUtip_XF76G49B8gkYanfiSqG2shswrupnv8rvUEVBBE2HqmUOUXUGr5A";
  const headers = token ? { 
    Authorization: `${token}`,
    'Content-Type': 'application/json'
  } : {};

  axios.post('http://localhost:8080/mgr/batchUpdateStatus', requestData, { headers })
    .then(res => {
      if (res.data) {
        ElMessage.success("批量更新成功");
        // 重置表单
        selectedRows.value = [];
        batchRoomStatus.value = '';
        batchDuration.value = '';
        load(); // 更新后重新加载数据
      } else {
        ElMessage.error("批量更新失败");
      }
    })
    .catch(error => {
      console.error("批量更新请求出错：", error);
      ElMessage.error("批量更新失败，请重试");
    });
};

// 查询按钮，更新表格数据
const handleSearch = () => {
  data.page = 1;
  load();
};

// 重置按钮，清空条件
const resetSearch = () => {
  data.searchForm = {
    roomNum: '',
    capacity: null,
    roomStatus: '',
    roomType: ''
  };
  data.page = 1;
  load();
};

// 每页条数变化事件
const handleSizeChange = (newSize) => {
  data.size = newSize;
  data.page = 1;
  load();
};

// 页码变化事件
const changePage = (newPage) => {
  data.page = newPage;
  load();
};

// 生命周期钩子：挂载后加载数据
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

/* 今日可用教室数卡片样式 */
.today-available-card {
  width: 300px;
  margin-bottom: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.card-content {
  display: flex;
  align-items: center;
}

.icon-container {
  width: 40px;
  height: 40px;
  background-color: #409EFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.count-info .count {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.count-info .desc {
  font-size: 14px;
  color: #666;
}

/* 批量操作区域样式 */
.batch-operation {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.batch-operation.el-input {
  width: 280px;
}

/* 搜索区域样式 */
.search-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

/* 表格区域样式 */
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

.user-table {
  margin-bottom: 20px;
  border-radius: 6px;
  overflow: hidden;
}

.pagination-container {
  display: flex;
  justify-content: flex-start;
  margin-top: 20px;
}

@media (max-width: 1200px) {
  .search-card, .batch-operation {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .batch-operation.el-input {
    width: 100%;
  }
}
</style>
    