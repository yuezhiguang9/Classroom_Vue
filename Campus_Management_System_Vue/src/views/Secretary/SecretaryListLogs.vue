<template>
  <div class="app-wrapper">
    <!-- 顶部导航栏 -->
    <header class="header" :class="{ 'header-scrolled': isScrolled }">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <a href="#" class="logo-text">教室预约管理系统————教秘界面</a>
          </div>
          
          <div class="header-right hidden-md">
            <div class="user-menu">
              <div class="user-info">
                <span class="user_name">{{ user_name || '教秘用户' }}</span>
                <a href="#" class="dropdown-item logout-btn" @click.prevent="handleLogout">退出登录</a>
              </div>
            </div>
          </div>
          
          <div class="mobile-menu-btn md-hidden">
            <button type="button" @click="toggleSidebar">
              <i class="fa fa-bars text-lg"></i>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="app-container">
      <!-- 侧边导航栏 -->
      <aside class="sidebar" :class="{ 'sidebar-hidden': !sidebarOpen }">
        <nav class="sidebar-nav">
          <router-link 
            to="/sec/listLogs" 
            class="sidebar-item" 
            :class="{ active: route.path === '/sec/listLogs' }"
          >
            <span>审核教室申请</span>
          </router-link>
        
          <router-link 
            to="/sec/classroomUsage" 
            class="sidebar-item classroom-usage-item" 
            :class="{ active: route.path === '/sec/classroomUsage' }"
          >   
            <span>教室使用率统计</span>
          </router-link>
        </nav>
      </aside>

      <!-- 主体内容 -->
      <main class="main-content" :class="{ 'sidebar-collapsed': !sidebarOpen }">
        <div class="content-wrapper">
          <div class="page-header">
            <h1 class="page-title">审核教室申请</h1>
            <p class="page-description">处理本学院的教室预约申请审核</p>
          </div>
          
          <!-- 统计卡片 -->
          <div class="stats-grid">
            <div class="stat-card animate-fade-in">
              <div class="stat-content">
                <div>
                  <p class="stat-label">今日待审核</p>
                  <h3 class="stat-value">{{ todayPending || '0' }}</h3>
                  
                  <p class="stat-trend">
                      <i class="fa" :class="[
                        todayPendingTrendIcon,
                        {
                          'text-danger': todayPendingChange.value > 0,
                          'text-success': todayPendingChange.value < 0,
                          'text-gray-500': todayPendingChange.value === 0
                        }
                      ]"></i>
                    {{ todayPendingTrendText || '无数据' }}
                  </p>
                </div>
                <div class="stat-icon bg-yellow-50">
                  <i class="fa fa-clock-o text-yellow-500 text-base"></i>
                </div>
              </div>
            </div>
            
            <div class="stat-card animate-fade-in" style="animation-delay: 0.2s">
              <div class="stat-content">
                <div>
                  <p class="stat-label">本周通过</p>
                  <h3 class="stat-value">{{ weekApproved || '0' }}</h3>
                  
                  <p class="stat-trend">
                    <i class="fa" :class="[
                      weekApprovedTrendIcon,
                      {
                        'text-success': weekApprovedChange.value > 0,
                        'text-danger': weekApprovedChange.value < 0,
                        'text-gray-500': weekApprovedChange.value === 0
                      }
                    ]"></i>
                    {{ weekApprovedTrendText || '无数据' }}
                  </p>
                </div>
                <div class="stat-icon bg-green-50">
                  <i class="fa fa-check-circle-o text-green-500 text-base"></i>
                </div>
              </div>
            </div>
            
            <div class="stat-card animate-fade-in" style="animation-delay: 0.3s">
              <div class="stat-content">
                <div>
                  <p class="stat-label">本周驳回</p>
                  <h3 class="stat-value">{{ weekRejected || '0' }}</h3>
                  
                  <p class="stat-trend">
                    <i class="fa" :class="[
                        weekRejectedTrendIcon,
                        {
                          'text-danger': weekRejectedChange.value > 0,
                          'text-success': weekRejectedChange.value < 0,
                          'text-gray-500': weekRejectedChange.value === 0
                        }
                      ]"></i>
                    {{ weekRejectedTrendText || '无数据' }}
                  </p>
                </div>
                <div class="stat-icon bg-red-50">
                  <i class="fa fa-times-circle-o text-red-500 text-base"></i>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 筛选区域 -->
          <div class="card filter-card animate-fade-in" style="animation-delay: 0.4s">
            <div class="filter-header">
              <h2 class="filter-title">筛选条件</h2>
            </div>
            
            <div class="filter-content">
              <div class="filter-form">
                <div class="filter-row">
                  <div class="form-group">
                    <label class="form-label">申请状态</label>
                    <select 
                      class="form-select" 
                      v-model="filter.apply_status" 
                      @change="fetchLogs"
                    >
                      <option value="">全部状态</option>
                      <option value="待审核">待审核</option>
                      <option value="已批准">已批准</option>
                      <option value="已拒绝">已拒绝</option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">楼栋</label>
                    <select 
                      class="form-select" 
                      v-model="filter.building_id" 
                      @change="fetchLogs"
                    >
                      <option value="">全部楼栋</option>
                      <option 
        v-for="building in buildings" 
        :value="building.building_id"  
        :key="building.building_id"   
        
      >
        {{ building.buildingName }}  <!-- 使用后端的buildingName字段 -->
      </option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">申请人</label>
                    <input 
                      type="text" 
                      class="form-input" 
                      v-model="filter.user_name" 
                      placeholder="输入申请人姓名"
                      @input="handleSearchInput"
                    >
                  </div>
                </div>
                
                <div class="filter-row">
                  <div class="form-group">
                    <label class="form-label">使用教室开始日期</label>
                    <input 
                      type="date" 
                      class="form-input" 
                      v-model="filter.date_start"
                      @change="fetchLogs"
                    >
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">使用教室结束日期</label>
                    <input 
                      type="date" 
                      class="form-input" 
                      v-model="filter.date_end"
                      @change="fetchLogs"
                    >
                  </div>
                  
                  <div class="form-group form-actions">
                    <button 
                      type="button" 
                      class="btn reset-btn" 
                      @click="resetFilter"
                    >
                      重置
                    </button>
                    <button 
                      type="button" 
                      class="btn search-btn" 
                      @click="fetchLogs"
                    >
                      查询
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 申请列表表格 -->
          <div class="card table-card animate-fade-in" style="animation-delay: 0.5s">
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>申请人</th>
                    <th>联系电话</th>
                    <th>预约时间</th>
                    <th>教室</th>
                    <th>使用时间</th>
                    <th>用途</th>
                    <th>人数</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td colspan="9" class="text-center py-4">加载中...</td>
                  </tr>
                  <tr v-for="(item, index) in logsData" :key="index">
                    <td>{{ item.user_name }}</td>
                    <td>{{ item.phone }}</td>
                    <td>{{ item.book_time }}</td>
                    <td>{{ item.classroom }}</td>
                    <td>{{ item.use_time }}</td>
                    <td>{{ item.purpose }}</td>
                    <td>{{ item.person_count }}</td>
                    <td>
                      <span class="status-tag" :class="{
                        'pending': item.apply_status === '待审核',
                        'approved': item.apply_status === '已批准',
                        'rejected': item.apply_status === '已拒绝'
                      }">
                        {{ item.apply_status }}
                      </span>
                    </td>
                    <td>
                      <button 
                        class="btn view-btn" 
                        @click="viewDetails(item.apply_id)"
                      >
                        查看详情
                      </button>
                      <button 
                        class="btn approve-btn" 
                        @click="handleApprove(item.apply_id)"
                        v-if="item.apply_status === '待审核'"
                      >
                        通过
                      </button>
                      <button 
                        class="btn reject-btn" 
                        @click="handleReject(item.apply_id)"
                        v-if="item.apply_status === '待审核'"
                      >
                        驳回
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!loading && logsData.length === 0">
                    <td colspan="9" class="text-center py-4">暂无数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- 分页 -->
            <div class="pagination" v-if="!loading && pagination.total > 0">
              <button 
                class="pagination-btn" 
                :disabled="pagination.page === 1" 
                @click="changePage(pagination.page - 1)"
              >
                <i class="fa fa-chevron-left"></i>
              </button>
              
              <!-- 动态生成页码按钮 -->
              <template v-for="page in visiblePages" :key="page">
                <button 
                  class="pagination-btn" 
                  :class="{ 'active': pagination.page === page }" 
                  @click="changePage(page)"
                >
                  {{ page }}
                </button>
              </template>
              
              <button 
                class="pagination-btn" 
                :disabled="pagination.page === Math.ceil(pagination.total / pagination.size)" 
                @click="changePage(pagination.page + 1)"
              >
                <i class="fa fa-chevron-right"></i>
              </button>
              
              <div class="pagination-info">
                共 {{ pagination.total }} 条，
                每页 
                <select 
                  class="page-size-select" 
                  v-model="pagination.size" 
                  @change="changePageSize"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                条
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <!-- 详情弹窗 -->
    <div class="modal-backdrop" v-if="showDetails">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">预约详情</h3>
          <button class="modal-close" @click="closeDetails">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-item">
            <span class="detail-label">申请人：</span>
            <span class="detail-value">{{ currentDetail.user_name || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">联系电话：</span>
            <span class="detail-value">{{ currentDetail.phone || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">预约时间：</span>
            <span class="detail-value">{{ currentDetail.book_time || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">教室：</span>
            <span class="detail-value">{{ currentDetail.classroom || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">使用时间：</span>
            <span class="detail-value">{{ currentDetail.use_time || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">用途：</span>
            <span class="detail-value">{{ currentDetail.purpose || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">人数：</span>
            <span class="detail-value">{{ currentDetail.person_count || '-' }}</span>
          </div>
          <div class="detail-item" v-if="currentDetail.apply_status === '已批准'">
            <span class="detail-label">审核时间：</span>
            <span class="detail-value">{{ currentDetail.approve_time || '-' }}</span>
          </div>
          <div class="detail-item" v-if="currentDetail.apply_status === '已拒绝'">
            <span class="detail-label">驳回时间：</span>
            <span class="detail-value">{{ currentDetail.reject_time || '-' }}</span>
          </div>
          <div class="detail-item" v-if="currentDetail.apply_status === '已拒绝' && currentDetail.reject_reason">
            <span class="detail-label">驳回原因：</span>
            <span class="detail-value">{{ currentDetail.reject_reason }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn close-btn" @click="closeDetails">关闭</button>
        </div>
      </div>
    </div>
    
    <!-- 驳回原因弹窗 -->
    <div class="modal-backdrop" v-if="showRejectReason">
      <div class="modal reject-modal">
        <div class="modal-header">
          <h3 class="modal-title">驳回申请</h3>
          <button class="modal-close" @click="cancelReject">×</button>
        </div>
        <div class="modal-body">
          <textarea 
            v-model="rejectReason" 
            class="reason-textarea" 
            placeholder="请输入驳回原因"
            rows="4"
          ></textarea>
          <p class="textarea-hint">请说明驳回原因，以便申请人了解情况</p>
        </div>
        <div class="modal-footer">
          <button class="btn cancel-btn" @click="cancelReject">取消</button>
          <button class="btn confirm-reject-btn" @click="confirmReject">确认驳回</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from '@/utils/axios';

// 路由相关
const route = useRoute();
const router = useRouter();

// 响应式状态
const user_name = ref('');
const isScrolled = ref(false);
const sidebarOpen = ref(true);
const isMobile = ref(false);


// 修改筛选参数定义（驼峰命名，匹配后端）
const filter = ref({
  page: 1,        // 对应后端pageNum
  size: 10,      // 对应后端pageSize
  apply_status: '',   // 对应后端apply_status
  user_name: '',      // 对应后端user_name
  building_id: '',    // 对应后端 building_id
  date_start: '',     // 对应后端date_start
  date_end: ''        // 对应后端date_end
});

// 列表数据
const logsData = ref([]);
const loading = ref(false);
const todayPending = ref(0);
const weekApproved = ref(0);
const weekRejected = ref(0);

// 统计趋势数据
const todayPendingChange = ref(0); // 今日待审核与昨日变化
const weekApprovedChange = ref(0); // 本周通过与上周变化
const weekRejectedChange = ref(0); // 本周驳回与上周变化

// 趋势显示计算属性
const todayPendingTrendIcon = computed(() => {
  if (todayPendingChange.value > 0) return 'fa-arrow-up';
  if (todayPendingChange.value < 0) return 'fa-arrow-down';
  return 'fa-minus';
});

const todayPendingTrendText = computed(() => {
  const absValue = Math.abs(todayPendingChange.value);
  if (todayPendingChange.value > 0) return `较昨日上升 ${absValue} 单`;
  if (todayPendingChange.value < 0) return `较昨日下降 ${absValue} 单`;
  return '与昨日持平';
});

const weekApprovedTrendIcon = computed(() => {
  if (weekApprovedChange.value > 0) return 'fa-arrow-up';
  if (weekApprovedChange.value < 0) return 'fa-arrow-down';
  return 'fa-minus';
});

const weekApprovedTrendText = computed(() => {
  const absValue = Math.abs(weekApprovedChange.value);
  if (weekApprovedChange.value > 0) return `较上周上升 ${absValue} 单`;
  if (weekApprovedChange.value < 0) return `较上周下降 ${absValue} 单`;
  return '与上周持平';
});

const weekRejectedTrendIcon = computed(() => {
  if (weekRejectedChange.value > 0) return 'fa-arrow-up';
  if (weekRejectedChange.value < 0) return 'fa-arrow-down';
  return 'fa-minus';
});

const weekRejectedTrendText = computed(() => {
  const absValue = Math.abs(weekRejectedChange.value);
  if (weekRejectedChange.value > 0) return `较上周上升 ${absValue} 单`;
  if (weekRejectedChange.value < 0) return `较上周下降 ${absValue} 单`;
  return '与上周持平';
});

// 分页数据
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
});

// 楼栋数据
const buildings = ref([]);

// 详情弹窗
const showDetails = ref(false);
const currentDetail = ref({});

// 驳回相关
const showRejectReason = ref(false);
const rejectReason = ref('');
const currentApplyId = ref('');

// 搜索防抖计时器
const searchTimer = ref(null);

// 检查值是否为空
const isEmpty = (value) => {
  return value === undefined || value === null || value === '';
};

// 检查参数类型
const checkParamTypes = (params) => {
  const typeInfo = {};
  for (const key in params) {
    typeInfo[key] = {
      type: typeof params[key],
      value: params[key],
      isEmpty: isEmpty(params[key])
    };
  }
  return typeInfo;
};

// 获取请求头
const getRequestHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  
  console.log('请求头信息:', {
    hasToken: !!token,
    headers: headers
  });
  
  return headers;
};

// 检查响应结构
const checkResponseStructure = (response) => {
  console.log('📦 开始检查响应结构');
  
  if (!response) {
    console.error('⚠️ 响应为空');
    ElMessage.error('查询失败，未获取到数据');
    return false;
  }
  
  // 检查状态码
  if (response.code !== undefined) {
    console.log('后端状态码:', response.code);
    if (response.code !== 200 && response.code !== 0) {
      console.warn('⚠️ 后端返回非成功状态码:', response.code, '消息:', response.msg || response.message);
      ElMessage.error(response.msg || response.message || '查询失败');
      return false;
    }
  } else {
    console.warn('⚠️ 响应中没有状态码code字段');
  }
  
  // 检查数据字段
  if (!response.data) {
    console.warn('⚠️ 响应中没有data字段');
    logsData.value = [];
    pagination.value.total = 0;
    return false;
  }
  
  return true;
};

// 处理搜索输入防抖
const handleSearchInput = () => {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value);
  }
  searchTimer.value = setTimeout(() => {
    filter.value.page = 1; // 重置到第一页
    fetchLogs();
  }, 500);
};

// 获取楼栋数据
const fetchBuildings = async () => {
  try {
    console.log('开始获取楼栋数据，请求地址:', '/common/getBuildings');
    
    const headers = getRequestHeaders();
    const response = await axios.get('/common/getBuildings', { headers });
    
    console.log('楼栋接口响应:', response);
    
    // 检查响应结构
    if (!checkResponseStructure(response)) {
      return;
    }
    
    let buildingData = null;
    if (Array.isArray(response.data)) {
      buildingData = response.data;
    } else if (response.data && response.data.data) {
      buildingData = response.data.data;
    }
    
    console.log('解析到的楼栋数据:', buildingData);
    
    if (Array.isArray(buildingData) && buildingData.length > 0) {
      buildings.value = buildingData;
      console.log('成功加载楼栋数据，共', buildingData.length, '条');
      
      // 验证数据结构是否正确（使用后端实际返回的字段名）
      const firstBuilding = buildingData[0];
      if (!firstBuilding.building_id || !firstBuilding.buildingName) {
        console.warn('楼栋数据结构不符合预期，可能导致显示异常');
        ElMessage.warning('楼栋数据格式异常');
      } else {
        console.log('楼栋数据结构验证通过');
      }
    } else {
      console.warn('未获取到有效楼栋数据或数据为空数组');
      buildings.value = [];
    }
  } catch (error) {
    console.error('获取楼栋数据失败:', error);
    
    if (error.response) {
      console.error('错误响应详情:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      if (error.response.status === 401) {
        console.warn('⚠️ 可能是未登录或Token失效');
        ElMessage.error('登录已过期，请重新登录');
      } else if (error.response.status === 403) {
        console.warn('⚠️ 没有查询权限');
        ElMessage.error('您没有权限查询该数据');
      } else if (error.response.status === 404) {
        console.warn('⚠️ 接口地址不存在');
        ElMessage.error('查询接口不存在');
      } else {
        ElMessage.error(`查询失败: ${error.response.data?.msg || '服务器错误'}`);
      }
    } else if (error.request) {
      console.error('⚠️ 没有收到后端响应:', error.request);
      ElMessage.error('未收到服务器响应，请检查网络');
    } else {
      console.error('⚠️ 请求准备阶段出错:', error.message);
      ElMessage.error(`查询失败: ${error.message}`);
    }
  }
};

// 获取申请记录日志列表数据
const fetchLogs = async () => {
  console.groupCollapsed('🔍 开始执行查询操作');
  console.log('查询触发时间:', new Date().toISOString());
  
  loading.value = true;
  try {
    // 构建请求参数
    const params = {
      apply_status: filter.value.apply_status,
      building_id: filter.value.building_id,
      user_name: filter.value.user_name,
      date_start: filter.value.date_start,
      date_end: filter.value.date_end,
      page: filter.value.page,
      size: filter.value.size
    };
    
    console.log('构建的查询参数:', {
      参数数量: Object.keys(params).length,
      具体参数: params,
      参数类型检查: checkParamTypes(params)
    });
    
    const headers = getRequestHeaders();
    
    const requestStartTime = Date.now();
    console.log('发送请求到后端:', {
      url: '/sec/listLogs',
      method: 'GET',
      params: params,
      headers: headers
    });
    
    const response = await axios.get('/sec/listLogs', { 
      params,
      headers
    });
    
    const requestDuration = Date.now() - requestStartTime;
    console.log(`✅ 请求成功，耗时: ${requestDuration}ms`);
    console.log('后端返回的完整响应数据:', response);
    console.log('后端响应数据类型:', typeof response);
    console.log('后端响应数据结构:', Object.keys(response));
    
    // 检查响应结构
    if (!checkResponseStructure(response)) {
      return;
    }
    
    // 验证日志数据结构的辅助函数
    const validateLogDataStructure = (data) => {
      // 检查是否为对象
      if (typeof data !== 'object' || data === null) {
        console.error('日志数据不是有效的对象');
        return false;
      }
      
      // 检查必要字段
      const requiredFields = ['list', 'total'];
      const missingFields = requiredFields.filter(field => !(field in data));
      
      if (missingFields.length > 0) {
        console.error(`日志数据缺少必要字段: ${missingFields.join(', ')}`);
        return false;
      }
      
      // 检查list是否为数组
      if (!Array.isArray(data.list)) {
        console.error('日志数据的list不是数组');
        return false;
      }
      
      // 检查total是否为数字
      if (typeof data.total !== 'number') {
        console.error('日志数据的total不是数字');
        return false;
      }
      
      return true;
    };
    
    if (response.data && response.data.data) {
      const data = response.data.data;
      console.log('从响应中提取的业务数据:', data);
      console.log('业务数据类型:', typeof data);
      console.log('业务数据包含的字段:', data ? Object.keys(data) : '无数据');
      
      // 先检查是否为数组（后端直接返回数组的情况）
      if (Array.isArray(data)) {
        console.log('检测到后端返回数组结构，进行兼容处理');
        
        // 直接使用数组作为列表数据
        logsData.value = data || [];
        // 数组长度作为总条数
        pagination.value.total = data.length || 0;
        // 分页信息使用前端传入的参数
        pagination.value.page = filter.value.page || 1;
        pagination.value.size = filter.value.size || 10;
        
        // 统计数据使用默认值（因数组结构可能不包含这些信息）
        todayPending.value = 0;
        weekApproved.value = 0;
        weekRejected.value = 0;
        todayPendingChange.value = 0;
        weekApprovedChange.value = 0;
        weekRejectedChange.value = 0;
        
        console.log('数组结构处理结果:', {
          数据量: logsData.value.length,
          总条数: pagination.value.total
        });
      }
      // 再检查是否为预期的对象结构
      else if (typeof data === 'object' && data !== null) {
        // 验证数据结构
        if (!validateLogDataStructure(data)) {
          console.error('日志数据结构验证失败，使用默认空数据');
          logsData.value = [];
          pagination.value.total = 0;
          return;
        }
        
        logsData.value = data.list || [];
        pagination.value.total = data.total || 0;
        pagination.value.page = data.page || 1;
        pagination.value.size = data.size || 10;
        
        console.log('分页信息:', {
          总条数: data.total,
          当前页: pagination.value.page,
          每页条数: pagination.value.size,
          总页数: Math.ceil(data.total / pagination.value.size)
        });
        
        // 验证统计数据
        if (typeof data.today_pending !== 'number') {
          console.warn('today_pending不是有效的数字，使用默认值0');
          todayPending.value = 0;
        } else {
          todayPending.value = data.today_pending;
        }
        
        if (typeof data.week_approved !== 'number') {
          console.warn('week_approved不是有效的数字，使用默认值0');
          weekApproved.value = 0;
        } else {
          weekApproved.value = data.week_approved;
        }
        
        if (typeof data.week_rejected !== 'number') {
          console.warn('week_rejected不是有效的数字，使用默认值0');
          weekRejected.value = 0;
        } else {
          weekRejected.value = data.week_rejected;
        }
        
        // 验证趋势数据
        if (typeof data.today_pending_change !== 'number') {
          console.warn('today_pending_change不是有效的数字，使用默认值0');
          todayPendingChange.value = 0;
        } else {
          todayPendingChange.value = data.today_pending_change;
        }
        
        if (typeof data.week_approved_change !== 'number') {
          console.warn('week_approved_change不是有效的数字，使用默认值0');
          weekApprovedChange.value = 0;
        } else {
          weekApprovedChange.value = data.week_approved_change;
        }
        
        if (typeof data.week_rejected_change !== 'number') {
          console.warn('week_rejected_change不是有效的数字，使用默认值0');
          weekRejectedChange.value = 0;
        } else {
          weekRejectedChange.value = data.week_rejected_change;
        }
        
        console.log('对象结构处理结果:', {
          数据量: logsData.value.length,
          总条数: pagination.value.total,
          统计数据: {
            todayPending: todayPending.value,
            weekApproved: weekApproved.value,
            weekRejected: weekRejected.value
          }
        });
        
        // 打印第一条数据结构，方便检查字段匹配
        if (logsData.value.length > 0) {
          console.log('第一条申请数据的结构:', logsData.value[0]);
          console.log('申请数据包含的字段:', Object.keys(logsData.value[0]));
        }
      }
      // 既不是数组也不是对象的情况
      else {
        console.error('日志数据既不是数组也不是有效的对象');
        logsData.value = [];
        pagination.value.total = 0;
        return;
      }
      
      console.log(`📊 后端返回数据数量: ${logsData.value.length}`);
      if (logsData.value.length > 0) {
        console.log('第一条数据详情:', logsData.value[0]);
      } else {
        console.log('💡 后端返回空数组，可能没有匹配的数据');
        ElMessage.info('没有找到匹配的申请数据');
      }
    } else {
      console.warn('响应数据结构不符合预期');
      logsData.value = [];
      pagination.value.total = 0;
      ElMessage.warning('获取数据格式异常，请联系管理员');
    }
  } catch (error) {
    console.error('❌ 请求发生错误:', error);
    
    if (error.response) {
      console.error('错误响应详情:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      if (error.response.status === 401) {
        console.warn('⚠️ 可能是未登录或Token失效');
        ElMessage.error('登录已过期，请重新登录');
      } else if (error.response.status === 403) {
        console.warn('⚠️ 没有查询权限');
        ElMessage.error('您没有权限查询该数据');
      } else if (error.response.status === 404) {
        console.warn('⚠️ 接口地址不存在');
        ElMessage.error('查询接口不存在');
      } else {
        ElMessage.error(`查询失败: ${error.response.data?.msg || '服务器错误'}`);
      }
    } else if (error.request) {
      console.error('⚠️ 没有收到后端响应:', error.request);
      ElMessage.error('未收到服务器响应，请检查网络');
    } else {
      console.error('⚠️ 请求准备阶段出错:', error.message);
      ElMessage.error(`查询失败: ${error.message}`);
    }
    
    logsData.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
    console.groupEnd();
  }
};


// 查看详情
const viewDetails = async (applyId) => {
  console.log('👀 查看申请详情，ID:', applyId);
  
  try {
    const headers = getRequestHeaders();
    const response = await axios.get('/sec/viewLogs', {
      params: { apply_id: applyId },
      headers
    });
    
    console.log('获取详情响应:', response);
    console.log('详情响应结构:', response ? Object.keys(response) : '无数据');
    
    if (response.data && response.data.data) {
      console.log('详情数据:', response.data.data);
      console.log('详情数据字段:', Object.keys(response.data.data));
      currentDetail.value = response.data.data;
      showDetails.value = true;
      console.log('详情数据加载成功');
    } else {
      console.warn('未获取到有效详情数据');
      ElMessage.error('获取详情失败');
    }
  } catch (error) {
    console.error('获取详情失败:', error);
    ElMessage.error('获取详情失败，请重试');
  }
};

// 关闭详情
const closeDetails = () => {
  showDetails.value = false;
  currentDetail.value = {};
};

// 处理通过
const handleApprove = async (applyId) => {
  console.log('📌 处理通过申请，ID:', applyId);
  
  ElMessageBox.confirm('确定要通过该申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      const headers = getRequestHeaders();
      const response = await axios.post('/sec/approve', 
        { apply_id: applyId },
        { headers }
      );
      
      console.log('审核通过响应:', response);
      
      if (response.data && (response.data.code === 200 || response.data.code === 0)) {
        ElMessage.success('操作成功');
        fetchLogs(); // 刷新列表
      } else {
        console.warn('审核通过失败，后端返回非成功状态');
        ElMessage.error(response.data?.msg || '操作失败');
      }
    } catch (error) {
      console.error('审核通过失败:', error);
      ElMessage.error('操作失败，请重试');
    }
  }).catch(() => {
    // 取消操作
    console.log('已取消审核通过操作');
  });
};

// 处理驳回
const handleReject = (applyId) => {
  console.log('📌 准备驳回申请，ID:', applyId);
  currentApplyId.value = applyId;
  rejectReason.value = '';
  showRejectReason.value = true;
};

// 取消驳回
const cancelReject = () => {
  console.log('已取消驳回操作');
  showRejectReason.value = false;
  currentApplyId.value = '';
  rejectReason.value = '';
};

// 确认驳回
const confirmReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入驳回原因');
    return;
  }
  
  console.log('📌 确认驳回申请，ID:', currentApplyId.value, '原因:', rejectReason.value);
  
  try {
    const headers = getRequestHeaders();
    const response = await axios.post('/sec/reject', {
      apply_id: currentApplyId.value,
      reject_reason: rejectReason.value.trim()
    }, { headers });
    
    console.log('驳回操作响应:', response);
    
    if (response.data && (response.data.code === 200 || response.data.code === 0)) {
      ElMessage.success('驳回成功');
      showRejectReason.value = false;
      currentApplyId.value = '';
      rejectReason.value = '';
      fetchLogs(); // 刷新列表
    } else {
      console.warn('驳回操作失败，后端返回非成功状态');
      ElMessage.error(response.data?.msg || '操作失败');
    }
  } catch (error) {
    console.error('驳回失败:', error);
    ElMessage.error('操作失败，请重试');
  }
};

// 重置筛选条件
const resetFilter = () => {
  console.log('🔄 重置查询表单');
  
  filter.value = {
    apply_status: '',
    building_id: '',
    user_name: '',
    date_start: '',
    date_end: '',
    page: 1,
    size: 10
  };
  fetchLogs();
};

// 改变页码
const changePage = (page) => {
  if (page === '...') return; // 跳过省略号
  console.log(`📄 页码变更为: ${page}`);
  filter.value.page = page;
  fetchLogs();
};

// 改变每页条数
const changePageSize = () => {
  console.log(`📏 每页条数变更为: ${pagination.value.size}`);
  filter.value.size = pagination.value.size;
  filter.value.page = 1; // 重置到第一页
  fetchLogs();
};

// 切换侧边栏
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 调用退出接口
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('退出登录接口调用失败:', error);
    } finally {
      // 清除本地存储的用户信息
      localStorage.removeItem('currentUser');
      // 跳转到登录页并刷新
      router.push('/login').then(() => {
        window.location.reload();
      });
      ElMessage.success('退出登录成功');
    }
  }).catch(() => {
    // 取消退出
    ElMessage.info('已取消退出');
  });
};

// 计算可见页码
const visiblePages = computed(() => {
  const totalPages = Math.ceil(pagination.value.total / pagination.value.size);
  const currentPage = pagination.value.page;
  const pages = [];

  // 总页数小于等于5时，显示所有页码
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // 当前页在前面几页时
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } 
    // 当前页在后面几页时
    else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } 
    // 当前页在中间时
    else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }

  return pages;
});

// 生命周期
onMounted(() => {
  console.log('SecretaryListLogs组件已挂载');
  
  // 获取用户信息
  const user = localStorage.getItem('currentUser');
  if (user) {
    const userData = JSON.parse(user);
    user_name.value = userData.name || '教秘用户';
    console.log('当前登录用户:', user_name.value);
  }
  
  // 加载数据
  fetchBuildings().then(() => {
    fetchLogs();
  });
  
  // 监听滚动事件
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 10;
  };
  window.addEventListener('scroll', handleScroll);
  
  // 监听窗口大小变化
  const handleResize = () => {
    isMobile.value = window.innerWidth < 768;
    sidebarOpen.value = !isMobile.value; // 移动端默认收起侧边栏
  };
  window.addEventListener('resize', handleResize);
  handleResize(); // 初始化
});

// 清理事件监听
onUnmounted(() => {
  window.removeEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 10;
  });
  window.removeEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768;
    sidebarOpen.value = !isMobile.value;
  });
  
  if (searchTimer.value) {
    clearTimeout(searchTimer.value);
  }
});

// 监听路由变化
watch(route, () => {
  // 路由变化时刷新数据
  console.log('路由发生变化，刷新数据');
  fetchLogs();
});
</script>

<style scoped>
/* 基础样式变量 */
:root {
  --primary: #3b82f6;
  --success: #10b981;
  --warning: #fbbd23;
  --danger: #ef4444;
  --yellow-50: #fffbeb;
  --yellow-500: #f59e0b;
  --green-50: #ecfdf5;
  --green-500: #10b981;
  --red-50: #fee2e2;
  --red-500: #ef4444;
  --gray-50: #f5f7fa;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --white: #ffffff;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.app-wrapper {
  min-height: 100vh;
  background-color: var(--gray-50);
}

/* 顶部导航 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 100;
  transition: background-color 0.3s ease;
}

.header-scrolled {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 3rem;
}

.logo-text {
  font-size: 1rem;
  font-weight: bold;
  color: var(--primary);
  text-decoration: none;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user_name {
  font-size: 0.875rem;
  color: var(--gray-700);
}

.logout-btn {
  color: var(--danger);
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.logout-btn:hover {
  color: #dc2626;
}

.mobile-menu-btn button {
  background: none;
  border: none;
  color: var(--gray-700);
  cursor: pointer;
}

/* 主体容器 */
.app-container {
  display: flex;
  margin-top: 3rem;
  min-height: calc(100vh - 3rem);
}

/* 侧边栏 */
.sidebar {
  width: 10rem;
  background-color: white;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  height: calc(100vh - 3rem);
  position: sticky;
  top: 3rem;
  overflow-y: auto;
}

.sidebar-hidden {
  display: none;
}

.sidebar-nav {
  padding: 1rem 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  color: var(--gray-600);
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.85rem;
}

.sidebar-item:hover {
  background-color: var(--blue-50);
  color: var(--primary);
}

.sidebar-item.active {
  background-color: var(--blue-50);
  color: var(--primary);
  font-weight: 500;
}



/* 主内容区 */
.main-content {
  margin-left: 0.5rem;
  padding: 1.5rem 1rem;
  transition: margin-left 0.3s ease;
  flex: 1;
}

.main-content.sidebar-collapsed {
  margin-left: 0;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
}

.page-description {
  color: var(--gray-600);
  font-size: 0.875rem;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: var(--shadow);
  padding: 1rem;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--gray-500);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
}

.stat-trend {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 筛选区域 */
.filter-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.filter-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--gray-200);
}

.filter-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0;
}

.filter-content {
  padding: 1.25rem;
}

.filter-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 150px;
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

.form-select,
.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

/* 按钮样式 */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: none;
}

.reset-btn {
  background-color: var(--gray-200);
  color: var(--gray-700);
}

.reset-btn:hover {
  background-color: var(--gray-300);
}

.search-btn {
  background-color: var(--primary);
  color: white;
}

.search-btn:hover {
  background-color: #2563eb;
}

/* 表格样式 */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--gray-200);
}

.data-table th {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-row:hover {
  background-color: var(--gray-50);
}

.status-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-tag.pending {
  background-color: var(--yellow-50);
  color: var(--yellow-500);
}

.status-tag.approved {
  background-color: var(--green-50);
  color: var(--green-500);
}

.status-tag.rejected {
  background-color: var(--red-50);
  color: var(--red-500);
}

.view-btn {
  background-color: var(--primary);
  color: white;
  margin-right: 0.5rem;
}

.view-btn:hover {
  background-color: #2563eb;
}

.approve-btn {
  background-color: var(--success);
  color: white;
  margin-right: 0.5rem;
}

.approve-btn:hover {
  background-color: #059669;
}

.reject-btn {
  background-color: var(--danger);
  color: white;
}

.reject-btn:hover {
  background-color: #dc2626;
}

/* 分页样式 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pagination-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.375rem;
  border: 1px solid var(--gray-200);
  background-color: white;
  color: var(--gray-700);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.pagination-btn.active {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: var(--gray-200);
  color: var(--gray-400);
  background-color: white;
}

.pagination-info {
  margin-left: 1rem;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.page-size-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.25rem;
  margin: 0 0.25rem;
}

/* 弹窗样式 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.reject-modal {
  max-width: 400px;
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--gray-500);
  transition: color 0.2s ease;
}

.modal-close:hover {
  color: var(--gray-800);
}

.modal-body {
  padding: 1.5rem;
}

.detail-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gray-100);
}

.detail-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: var(--gray-700);
  display: inline-block;
  width: 80px;
}

.detail-value {
  color: var(--gray-800);
}

.reason-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.375rem;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
}

.reason-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.textarea-hint {
  font-size: 0.75rem;
  color: var(--gray-500);
  margin-top: 0.5rem;
  text-align: right;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.close-btn,
.cancel-btn {
  background-color: var(--gray-100);
  color: var(--gray-700);
}

.close-btn:hover,
.cancel-btn:hover {
  background-color: var(--gray-200);
}

.confirm-reject-btn {
  background-color: var(--danger);
  color: white;
}

.confirm-reject-btn:hover {
  background-color: #ea5858;
}

/* 动画效果 */
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式工具类 */
.hidden-md {
  display: none;
}

@media (min-width: 768px) {
  .hidden-md {
    display: block;
  }
  .md-hidden {
    display: none;
  }
}
</style>
