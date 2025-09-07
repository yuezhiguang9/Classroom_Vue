<template>
  <div class="admin-user-container">
    <div class="page-header">
      <h1>教室查询结果</h1>
      <p>查找并预约合适的教室用于教学、会议或活动</p>
    </div>

    <div class="user-management-container">               
      <!-- 搜索区域 -->
      <div class="search-card">
        <el-form :model="data.searchForm" inline>
          <el-form-item label="星期" style="width: 200px;">
            <el-select v-model="data.searchForm.res_day_of_week" placeholder="请选择星期" clearable>
              <el-option label="星期一" value="星期一"></el-option>
              <el-option label="星期二" value="星期二"></el-option>
              <el-option label="星期三" value="星期三"></el-option>
              <el-option label="星期四" value="星期四"></el-option>
              <el-option label="星期五" value="星期五"></el-option>
              <el-option label="星期六" value="星期六"></el-option>
              <el-option label="星期日" value="星期日"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="楼栋名称" style="width: 200px;">
            <el-select v-model="data.searchForm.building_id" placeholder="请选择楼栋" clearable>
              <el-option v-for="item in data.buildingData" :key="item.id" 
                        :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="教室类型" style="width: 200px;">
            <el-select v-model="data.searchForm.room_type" placeholder="请选择教室类型" clearable>
              <el-option label="普通教室" value="普通教室"></el-option>
              <el-option label="阶梯教室" value="阶梯教室"></el-option>
              <el-option label="实验室" value="实验室"></el-option>
              <el-option label="多媒体教室" value="多媒体教室"></el-option>
              <el-option label="计算机房" value="计算机房"></el-option>
              <el-option label="语音室" value="语音室"></el-option>
              <el-option label="智慧教室" value="智慧教室"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="教室状态" style="width: 200px;">
            <el-select v-model="data.searchForm.room_status" placeholder="请选择教室状态" clearable>
              <el-option label="空闲" value="空闲"></el-option>
              <el-option label="已预约" value="已预约"></el-option>
              <el-option label="待审核" value="待审核"></el-option>
              <el-option label="已拒绝" value="已拒绝"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="使用日期">
            <el-icon color="red"><StarFilled /></el-icon>
            <el-date-picker
              v-model="data.searchForm.date"
              type="date" 
              placeholder="选择日期"
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
          <h3 class="table-title">可用教室</h3>
        </div>

        <el-table 
          :data="data.tableData" 
          stripe 
          border 
          highlight-current-row 
          class="user-table" 
          style="width: 100%"
          v-loading="loading">
          <el-table-column label="教室" align="center">
            <template #default="scope">
              {{ `${scope.row.building_name || ''} ${scope.row.room_num || ''}` }}
            </template>
          </el-table-column>
          <el-table-column label="容量" prop="capacity" align="center"></el-table-column>
          <el-table-column label="教室类型" prop="room_type"></el-table-column>
         
          <el-table-column label="周次" prop="res_week" align="center"></el-table-column>
          <el-table-column label="星期" prop="res_day_of_week" align="center"></el-table-column>
          <el-table-column label="状态" align="center">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.room_status || scope.row.apply_status)">
                {{ scope.row.room_status || scope.row.apply_status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="节次" align="center">
            <template #default="scope">
              {{ Array.isArray(scope.row.period) ? scope.row.period.join(',') : scope.row.period }}
            </template>
          </el-table-column>
          <el-table-column label="预约" align="center">
            <template #default="scope">
              <el-button 
                v-if="(scope.row.room_status || scope.row.apply_status) === '空闲'" 
                type="primary" 
                size="small"
                @click="handleReservation(scope.row)">
                预约
              </el-button>
              <span 
                v-else 
                class="not-available"
                style="color: #909399; cursor: not-allowed;">
                不可预约
              </span>
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

    <!-- 预约弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="教室预约申请"
      width="500px"
      :before-close="handleClose">
      <el-form
        ref="reservationFormRef"
        :model="reservationForm"
        :rules="formRules"
        label-width="100px">
        <el-form-item label="学号" prop="user_account">
          <el-input
            v-model="reservationForm.user_account"
            placeholder="请输入学号"
            maxlength="20"
          />
        </el-form-item>
        
        <el-form-item label="教室编号" prop="room_num">
          <el-input
            v-model="reservationForm.room_num"
            disabled
          />
        </el-form-item>
        
        <el-form-item label="使用日期" prop="use_date">
          <el-input
            v-model="reservationForm.use_date"
            disabled
            placeholder="选择节次后自动生成"
          />
        </el-form-item>
        
        <el-form-item label="预约节次" prop="period">
          <el-select
            v-model="reservationForm.period"
            multiple
            placeholder="请选择节次"
            @change="handlePeriodChange"
          >
            <el-option 
              v-for="period in availablePeriods" 
              :key="period" 
              :label="period" 
              :value="period">
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 显示节次对应的时间段 -->
        <el-form-item v-if="Object.keys(selectedPeriodsTime).length > 0">
          <div class="period-time-info">
            <p class="info-label">节次时间信息：</p>
            <div class="period-time-list">
              <div v-for="(time, period) in selectedPeriodsTime" :key="period" class="period-item">
                {{ period }}: {{ time.start }} - {{ time.end }}
              </div>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="参与人数" prop="person_count">
          <el-input
            v-model.number="reservationForm.person_count"
            type="number"
            min="1"
            placeholder="请输入参与人数"
          />
        </el-form-item>
        
        <el-form-item label="申请理由" prop="purpose">
          <el-input
            v-model="reservationForm.purpose"
            type="textarea"
            :rows="4" 
            placeholder="请输入申请理由"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReservation">提交预约</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { StarFilled } from '@element-plus/icons-vue';
import axios from 'axios'

// 状态变量
const loading = ref(false);
const dialogVisible = ref(false);
const reservationFormRef = ref(null);
const availablePeriods = ref([]); // 存储当前教室可用的节次
const selectedPeriodsTime = ref({}); // 存储选中节次的具体时间段

// 响应式数据
const data = reactive({
  searchForm: {
    building_id: '',
    capacity: '',
    room_type: '',
    room_status: '',
    res_week: '',
    res_day_of_week: '',
    period: '',
    date: '', // 仅存储日期部分，格式：YYYY-MM-DD
  },
  
  tableData: [],
  page: 1,
  size: 5,
  total: 0,
  
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

// 预约表单数据 - 严格按照后端接口定义
const reservationForm = reactive({
  user_account: '',       // 学号 - String，必填
  use_date: '',           // 使用日期 - String，格式:2025-09-12 12:00:00，必填
  room_num: '',           // 教室编号 - String，必填
  period: [],             // 预约节次 - String(数组)，必填
  purpose: '',            // 申请理由 - String，必填
  person_count: null      // 参与人数 - Integer，必填
});

// 节次与对应时间段的映射关系
const periodTimeMap = {
  '第一节': { start: '08:00:00', end: '08:40:00' },
  '第二节': { start: '08:50:00', end: '09:30:00' },
  '第三节': { start: '09:45:00', end: '10:25:00' },
  '第四节': { start: '10:35:00', end: '11:15:00' },
  '第五节': { start: '11:25:00', end: '12:05:00' },
  '第六节': { start: '14:30:00', end: '15:10:00' },
  '第七节': { start: '15:20:00', end: '16:00:00' },
  '第八节': { start: '16:15:00', end: '16:55:00' },
  '第九节': { start: '17:05:00', end: '17:45:00' },
};

// 表单验证规则 - 确保符合后端要求
const formRules = reactive({
  user_account: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ],
  period: [
    { required: true, message: '请选择节次', trigger: 'change' }
  ],
  purpose: [
    { required: true, message: '请输入申请理由', trigger: 'blur' },
    { min: 3, message: '申请理由至少3个字符', trigger: 'blur' }
  ],
  person_count: [
    { required: true, message: '请输入参与人数', trigger: 'blur' },
    { type: 'number', min: 1, message: '参与人数至少1人', trigger: 'blur' }
  ]
});

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch(status) {
    case '待审核': return 'warning';
    case '已批准': return 'success';
    case '已拒绝': return 'danger';
    case '空闲': return 'success';
    case '已预约': return 'warning';
    case '不可用': return 'danger';
    default: return 'info';
  }
};

// 打开预约弹窗
const handleReservation = (row) => {
  // 处理节次数据 - 确保是数组格式
  let periods = [];
  if (Array.isArray(row.period)) {
    periods = row.period;
  } else if (typeof row.period === 'string' && row.period) {
    periods = row.period.split(',').map(p => p.trim());
  }
  
  // 存储可用节次
  availablePeriods.value = periods;
  
  // 重置表单并赋值
  Object.assign(reservationForm, {
    user_account: '',
    use_date: '',
    room_num: row.room_num || '',
    period: [],
    purpose: '',
    person_count: null
  });
  
  // 清空选中节次的时间信息
  selectedPeriodsTime.value = {};
  
  // 显示弹窗
  dialogVisible.value = true;
  
  // 重置表单验证状态
  nextTick(() => {
    reservationFormRef.value && reservationFormRef.value.resetFields();
  });
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  nextTick(() => {
    reservationFormRef.value && reservationFormRef.value.resetFields();
  });
  availablePeriods.value = [];
  selectedPeriodsTime.value = {};
};

// 辅助函数：确保数字有两位（带前导零）
const padWithZero = (num) => {
  return num.toString().padStart(2, '0');
};

// 节次选择变化时，自动设置使用日期和时间 - 严格匹配后端格式要求
const handlePeriodChange = () => {
  if (reservationForm.period.length > 0 && data.searchForm.date) {
    // 收集选中节次的时间信息
    const periodTimeInfo = {};
    reservationForm.period.forEach(period => {
      if (periodTimeMap[period]) {
        periodTimeInfo[period] = periodTimeMap[period];
      }
    });
    selectedPeriodsTime.value = periodTimeInfo;
    
    // 取第一个节次的开始时间作为use_date的值
    const firstPeriod = reservationForm.period[0];
    if (periodTimeMap[firstPeriod]) {
      // 转换日期格式为 YYYY-MM-DD (带前导零)，严格匹配2025-09-12 12:00:00格式
      const dateParts = data.searchForm.date.split('-');
      const year = dateParts[0];
      const month = padWithZero(parseInt(dateParts[1], 10)); // 确保带前导零
      const day = padWithZero(parseInt(dateParts[2], 10));   // 确保带前导零
      
      reservationForm.use_date = `${year}-${month}-${day} ${periodTimeMap[firstPeriod].start}`;
    }
  } else {
    reservationForm.use_date = '';
    selectedPeriodsTime.value = {};
  }
};

// 提交预约申请 - 严格按照后端接口要求处理参数
const submitReservation = async () => {
  try {
    // 表单验证
    await reservationFormRef.value.validate();
    
    // 准备提交数据 - 严格匹配后端接口定义的参数名和类型
    const submitData = {
      user_account: reservationForm.user_account,       // String类型
      use_date: reservationForm.use_date,               // String类型，格式:2025-09-12 12:00:00
      room_num: reservationForm.room_num,               // String类型
      period: reservationForm.period.join(','),         // 转换为逗号分隔的字符串，符合String(数组)要求
      purpose: reservationForm.purpose,                 // String类型
      person_count: Number(reservationForm.person_count) // 确保是Integer类型
    };
    
    // 验证数据格式是否完全符合后端要求
    const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (!dateRegex.test(submitData.use_date)) {
      ElMessage.error(`使用日期格式错误，必须为"YYYY-MM-DD HH:mm:ss"格式（如2025-09-12 12:00:00）`);
      return;
    }
    
    if (!submitData.period) {
      ElMessage.error('请至少选择一个节次');
      return;
    }
    
    if (!Number.isInteger(submitData.person_count) || submitData.person_count < 1) {
      ElMessage.error('参与人数必须是正整数');
      return;
    }
    
    // 确认提交
    await ElMessageBox.confirm(
      `您确定要预约 ${submitData.room_num} 教室吗？\n使用日期：${submitData.use_date.split(' ')[0]}\n节次：${submitData.period}`,
      '预约确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      }
    );
    
    // 发送请求 - 确保请求配置正确
    const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyMDAxIiwidXNlcl9wYXNzd29yZCI6IjY2NiIsImlhdCI6MTc1NzE2NTI0MCwiZXhwIjoxNzU3MjUxNjQwfQ._gMitQSNCj48EVvL4GG0j5Adxu4CO8EQJ80sgY4_JR7b2feEyg_Cjw422VsZ3m0ScH6yT2_Fjaqexplt3bSl8w";
    const headers = token ? { Authorization: `${token}` } : {};
    
    loading.value = true;
    
    // 打印提交数据用于调试
    console.log('提交的数据:', submitData);
    
    const res = await axios.post('http://localhost:8080/user/submitClassroomApply', submitData, { headers });
    console.log('服务器响应:', res.data);
    
    // 处理后端返回的结果
    if (res.data && res.data.code === 200) {
      ElMessage.success('预约申请提交成功，请等待审核');
      dialogVisible.value = false;
      load(); // 重新加载数据
    } else {
      ElMessage.error(res.data?.message || '预约申请提交失败，服务器拒绝了请求');
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      console.log('表单验证失败：', error);
      ElMessage.warning('请完善表单信息');
    } else if (error === 'cancel') {
      // 用户取消了确认对话框
      ElMessage.info('已取消预约');
    } else {
      console.error('预约申请提交失败:', error);
      // 显示更详细的错误信息
      if (error.response) {
        console.error('响应状态:', error.response.status);
        console.error('响应数据:', error.response.data);
        ElMessage.error(`提交失败: ${error.response.data.msg || `服务器返回错误 (${error.response.status})`}`);
      } else {
        ElMessage.error(`提交失败: ${error.message || '网络错误'}`);
      }
    }
  } finally {
    loading.value = false;
  }
};

// 加载数据
const load = async () => {
  if (!data.searchForm.date) {
    ElMessage.warning('请选择使用日期');
    return;
  }
  
  loading.value = true;
  
  try {
    const params = {
      page: data.page,
      size: data.size,
      date: data.searchForm.date
    };

    if (data.searchForm.building_id) params.building_id = data.searchForm.building_id;
    if (data.searchForm.capacity) params.capacity = data.searchForm.capacity;
    if (data.searchForm.room_type) params.room_type = data.searchForm.room_type;
    if (data.searchForm.room_status) params.room_status = data.searchForm.room_status;
    if (data.searchForm.res_week) params.res_week = data.searchForm.res_week;
    if (data.searchForm.res_day_of_week) params.res_day_of_week = data.searchForm.res_day_of_week;
    if (data.searchForm.period) params.period = data.searchForm.period;
    
    const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyMDAxIiwidXNlcl9wYXNzd29yZCI6IjY2NiIsImlhdCI6MTc1NzE2NTI0MCwiZXhwIjoxNzU3MjUxNjQwfQ._gMitQSNCj48EVvL4GG0j5Adxu4CO8EQJ80sgY4_JR7b2feEyg_Cjw422VsZ3m0ScH6yT2_Fjaqexplt3bSl8w";
    const headers = token ? { Authorization: `${token}` } : {};
    
    const res = await axios.get('http://localhost:8080/user/selectClassroom', { 
      headers,
      params
    });
    
    if (!res.data || !res.data.data) {
      ElMessage.warning('未获取到有效数据');
      data.tableData = [];
      data.total = 0;
      return;
    }
    
    data.tableData = res.data.data.records || res.data.data || [];
    data.total = res.data.data.total || 0;
    data.page = res.data.data.page || data.page;
    data.size = res.data.data.size || data.size;
    
  } catch (err) {
    console.error('请求失败:', err);
    ElMessage.error(`加载数据失败: ${err.response?.data?.message || err.message || '网络错误'}`);
    data.tableData = [];
    data.total = 0;
  } finally {
    loading.value = false;
  }
};

// 查询按钮
const handleSearch = () => {
  data.page = 1;
  load();
};

// 重置按钮
const resetSearch = () => {
  data.searchForm = {
    building_id: '',
    capacity: '',
    room_type: '',
    room_status: '',
    res_week: '',
    res_day_of_week: '',
    period: '',
    date: '',
  };
  handleSearch();
};

// 分页处理
const handleSizeChange = (newSize) => {
  data.size = newSize;
  data.page = 1;
  load();
};

const changePage = (newPage) => {
  data.page = newPage;
  load();
};
</script>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: 20px;
  padding: 15px 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.page-header h1 {
  margin: 0;
  color: #303133;
  font-size: 22px;
}

.admin-user-container {
  padding: 15px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

.search-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
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

.not-available {
  color: #909399;
  cursor: not-allowed;
}

/* 节次时间信息样式 */
.period-time-info {
  margin-top: 5px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.info-label {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.period-time-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.period-item {
  font-size: 13px;
  color: #333;
  padding: 3px 8px;
  background-color: #e8f4fd;
  border-radius: 3px;
}

@media (max-width: 768px) {
  .search-card {
    padding: 15px;
  }
  
  .el-form-item {
    width: 100% !important;
  }
}
</style>
