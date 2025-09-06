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
                <span class="username">{{ userName || '教秘用户' }}</span>
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
                  
                  <!-- <p class="stat-trend">
                      <i class="fa" :class="[
                        todayPendingTrendIcon,
                        {
                          'text-danger': todayPendingChange > 0,
                          'text-success': todayPendingChange < 0,
                          'text-gray-500': todayPendingChange === 0
                        }
                      ]"></i>
                    {{ todayPendingTrendText || '无数据' }}
                  </p> -->
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
                        'text-success': weekApprovedChange > 0,
                        'text-danger': weekApprovedChange < 0,
                        'text-gray-500': weekApprovedChange === 0
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
                          'text-danger': weekRejectedChange > 0,
                          'text-success': weekRejectedChange < 0,
                          'text-gray-500': weekRejectedChange === 0
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
                      v-model="filter.applyStatus" 
                      @change="fetchLogs"
                    >
                      <option value="">全部状态</option>
                      <option value="待审核">待审核</option>
                      <option value="已通过">已通过</option>
                      <option value="已驳回">已驳回</option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">楼栋</label>
                    <select 
                      class="form-select" 
                      v-model="filter.buildingId" 
                      @change="fetchLogs"
                    >
                      <option value="">全部楼栋</option>
                      <option 
                        v-for="building in buildings" 
                        :value="building.buildingId" 
                        :key="building.buildingId"
                      >
                        {{ building.buildingName }}
                      </option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">申请人</label>
                    <input 
                      type="text" 
                      class="form-input" 
                      v-model="filter.userName" 
                      placeholder="输入申请人姓名"
                      @input="handleSearchInput"
                    >
                  </div>
                </div>
                
                <div class="filter-row">
                  <div class="form-group">
                    <label class="form-label">开始日期</label>
                    <input 
                      type="date" 
                      class="form-input" 
                      v-model="filter.dateStart"
                      @change="fetchLogs"
                    >
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">结束日期</label>
                    <input 
                      type="date" 
                      class="form-input" 
                      v-model="filter.dateEnd"
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
                    <td>{{ item.userName }}</td>
                    <td>{{ item.phone }}</td>
                    <td>{{ item.bookTime }}</td>
                    <td>{{ item.roomNum }}</td>
                    <td>{{ item.date }}</td>
                    <td>{{ item.purpose }}</td>
                    <td>{{ item.personCount }}</td>
                    <td>
                      <span class="status-tag" :class="{
                        'pending': item.applyStatus === '待审核',
                        'approved': item.applyStatus === '已通过',
                        'rejected': item.applyStatus === '已驳回'
                      }">
                        {{ item.applyStatus }}
                      </span>
                    </td>
                    <td>
                      <button 
                        class="btn view-btn" 
                        @click="viewDetails(item.applyid)"
                      >
                        查看详情
                      </button>
                      <button 
                        class="btn approve-btn" 
                        @click="handleApprove(item.applyid)"
                        v-if="item.applyStatus === '待审核'"
                      >
                        通过
                      </button>
                      <button 
                        class="btn reject-btn" 
                        @click="handleReject(item.applyid)"
                        v-if="item.applyStatus === '待审核'"
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
                <span v-if="page === '...'" class="pagination-ellipsis">...</span>
                <button 
                  v-else
                  class="pagination-btn" 
                  :class="{ 'active': pagination.page === page }" 
                  @click="changePage(page)"
                >
                  {{ page }}
                </button>
              </template>
              
              <button 
                class="pagination-btn" 
                :disabled="pagination.page >= Math.ceil(pagination.total / pagination.size)" 
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
                  <option value="5">5</option>
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
    
    <!-- 详情弹窗 - 展示所有后端返回字段 -->
    <div class="modal-backdrop" v-if="showDetails">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">预约详情</h3>
          <button class="modal-close" @click="closeDetails">×</button>
        </div>
        <div class="modal-body">
          <!-- 所有后端返回的字段都在这里展示 -->
          <div class="detail-item">
            <span class="detail-label">申请状态：</span>
            <span class="detail-value">{{ currentDetail.applyStatus || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">申请人：</span>
            <span class="detail-value">{{ currentDetail.userName || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">联系电话：</span>
            <span class="detail-value">{{ currentDetail.phone || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">预约时间：</span>
            <span class="detail-value">{{ currentDetail.bookTime || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">楼栋：</span>
            <span class="detail-value">{{ currentDetail.buildingName || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">学院：</span>
            <span class="detail-value">{{ currentDetail.collegeName || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">教室：</span>
            <span class="detail-value">{{ currentDetail.roomNum || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">使用日期：</span>
            <span class="detail-value">{{ currentDetail.date || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">星期：</span>
            <span class="detail-value">{{ currentDetail.dayOfWeek || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">周次：</span>
            <span class="detail-value">{{ currentDetail.week || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">节次：</span>
            <span class="detail-value">{{ currentDetail.period || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">人数：</span>
            <span class="detail-value">{{ currentDetail.personCount || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">用途：</span>
            <span class="detail-value">{{ currentDetail.purpose || '-' }}</span>
          </div>
          <!-- 处理时间展示 -->      
          <!-- <div class="detail-item" v-if="currentDetail.applyStatus === '已通过'">        
            <span class="detail-label">通过时间：</span>        
            <span class="detail-value">{{ formatDateTime(currentDetail.processingTime) || '-' }}</span>      
          </div>            
          <div class="detail-item" v-if="currentDetail.applyStatus === '已驳回'">        
            <span class="detail-label">驳回时间：</span>        
            <span class="detail-value">{{ formatDateTime(currentDetail.processingTime) || '-' }}</span>      
          </div> -->
          <div class="detail-item" v-if="currentDetail.applyStatus !== '待审核'">        
  <span class="detail-label">处理时间：</span>        
  <span class="detail-value">{{ formatDateTime(currentDetail.processingTime) || '-' }}</span>      
</div>
          <div class="detail-item" v-if="currentDetail.applyStatus === '已驳回' && currentDetail.rejectReason">
            <span class="detail-label">驳回原因：</span>
            <span class="detail-value">{{ currentDetail.rejectReason }}</span>
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
const userName = ref('');
const isScrolled = ref(false);
const sidebarOpen = ref(true);
const isMobile = ref(false);

// 筛选参数
const filter = ref({
  page: 1,
  size: 5,
  applyStatus: '',
  userName: '',
  buildingId: '',
  dateStart: '',
  dateEnd: ''
});

// 列表数据
const logsData = ref([]);
const loading = ref(false);
const todayPending = ref(0);
const weekApproved = ref(0);
const weekRejected = ref(0);

// 统计趋势数据
const todayPendingChange = ref(0);
const weekApprovedChange = ref(0);
const weekRejectedChange = ref(0);

// 趋势文本
const todayPendingTrendText = ref('无数据');
const weekApprovedTrendText = ref('无数据');
const weekRejectedTrendText = ref('无数据');

// 趋势图标计算属性
const todayPendingTrendIcon = computed(() => {
  if (todayPendingChange.value > 0) return 'fa-arrow-up';
  if (todayPendingChange.value < 0) return 'fa-arrow-down';
  return 'fa-minus';
});

const weekApprovedTrendIcon = computed(() => {
  if (weekApprovedChange.value > 0) return 'fa-arrow-up';
  if (weekApprovedChange.value < 0) return 'fa-arrow-down';
  return 'fa-minus';
});

const weekRejectedTrendIcon = computed(() => {
  if (weekRejectedChange.value > 0) return 'fa-arrow-up';
  if (weekRejectedChange.value < 0) return 'fa-arrow-down';
  return 'fa-minus';
});

// 分页数据
const pagination = ref({
  page: 1,
  size: 5,
  total: 0,
  pages: 0
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

// 处理搜索输入防抖
const handleSearchInput = () => {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value);
  }
  searchTimer.value = setTimeout(() => {
    filter.value.page = 1;
    fetchLogs();
  }, 500);
};

// 获取请求头（统一添加token）
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': token } : {};
};

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(',', ' ');
  } catch (error) {
    console.error('日期格式化失败:', error);
    return dateString;
  }
};

// 获取本周的起始和结束日期（周一至周日）
const getCurrentWeekRange = () => {
  const now = new Date();
  const day = now.getDay() || 7; // 将周日的0转为7
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - day + 7);
  
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0]
  };
};

// 获取统计数据
const fetchStats = async () => {
  try {
    // 获取本周范围用于调试显示
    const weekRange = getCurrentWeekRange();
    console.log(`当前统计周范围: ${weekRange.start} 至 ${weekRange.end}`);
    
    const response = await axios.get('/sec/getClassroomUsageStats', {
      headers: getAuthHeaders()
    });
    
    if (response.code === 200 && response.data) {
      const stats = response.data;
      
      // 处理字段名映射（下划线转驼峰）
      const formattedStats = {
        todayPending: stats.todayPending || 0,
        thisWeekApproved: stats.thisWeekApproved || 0,
        thisWeekRejected: stats.thisWeekRejected || 0,
        approvedVsYesterday: stats.approvedVsYesterday || '无数据',
        rejectedVsLastWeek: stats.rejectedVsLastWeek || '无数据',
        pendingVsLastWeek: stats.pendingVsLastWeek || '无数据'
      };
        
      
      // 更新统计数值
      todayPending.value = formattedStats.todayPending;
      weekApproved.value = formattedStats.thisWeekApproved;
      weekRejected.value = formattedStats.thisWeekRejected;
      
      // 更新趋势文本
      todayPendingTrendText.value = formattedStats.approvedVsYesterday;
      weekApprovedTrendText.value = formattedStats.rejectedVsLastWeek;
      weekRejectedTrendText.value = formattedStats.pendingVsLastWeek;
      
      // 解析趋势变化数值
      parseTrendChanges(
        formattedStats.approvedVsYesterday,
        formattedStats.rejectedVsLastWeek,
        formattedStats.pendingVsLastWeek
      );
    } else {
      ElMessage.error('获取统计数据失败');
    }
  } catch (error) {
    console.error('统计接口调用失败:', error);
    const errorMsg = error.response?.data?.msg || `服务器错误 (${error.response?.status || '未知'})`;
    ElMessage.error(`获取统计数据失败: ${errorMsg}`);
  }
};

// 解析趋势变化数值
const parseTrendChanges = (todayPendingTrend, weekApprovedTrend, weekRejectedTrend) => {
  // 解析今日待审核趋势
  if (todayPendingTrend.includes('增长')) {
    todayPendingChange.value = parseInt(todayPendingTrend.match(/-?\d+/)[0]) || 0;
  } else if (todayPendingTrend.includes('减少')) {
    todayPendingChange.value = -parseInt(todayPendingTrend.match(/\d+/)[0]) || 0;
  } else {
    todayPendingChange.value = 0;
  }
  
  // 解析本周通过趋势
  if (weekApprovedTrend.includes('增长')) {
    weekApprovedChange.value = parseInt(weekApprovedTrend.match(/-?\d+/)[0]) || 0;
  } else if (weekApprovedTrend.includes('减少')) {
    weekApprovedChange.value = -parseInt(weekApprovedTrend.match(/\d+/)[0]) || 0;
  } else {
    weekApprovedChange.value = 0;
  }
  
  // 解析本周驳回趋势
  if (weekRejectedTrend.includes('增长')) {
    weekRejectedChange.value = parseInt(weekRejectedTrend.match(/-?\d+/)[0]) || 0;
  } else if (weekRejectedTrend.includes('减少')) {
    weekRejectedChange.value = -parseInt(weekRejectedTrend.match(/\d+/)[0]) || 0;
  } else {
    weekRejectedChange.value = 0;
  }
};

// 获取楼栋数据
const fetchBuildings = async () => {
  try {
    console.log('开始获取楼栋数据，请求地址:', '/common/getBuildings');
    
    const response = await axios.get('/common/getBuildings', {
      headers: getAuthHeaders()
    });
    
    console.log('楼栋接口响应:', response);
    
    if (response && response.code === 200) {
      console.log('请求成功，状态码:', response.code);
      
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
      } else {
        console.warn('未获取到有效楼栋数据或数据为空数组');
        buildings.value = [];
      }
    } else {
      console.error('获取楼栋数据失败，后端返回状态:', response?.code, '消息:', response?.msg);
      ElMessage.error(`获取楼栋信息失败: ${response?.msg || '未知错误'}`);
    }
  } catch (error) {
    console.error('获取楼栋数据失败:', error);
    ElMessage.error('获取楼栋信息失败');
  }
};

// 获取日志列表数据
const fetchLogs = async () => {
  loading.value = true;
  try {
    const params = { 
      page: filter.value.page,
      size: filter.value.size,
      applyStatus: filter.value.applyStatus,
      userName: filter.value.userName,
      buildingId: filter.value.buildingId,
      dateStart: filter.value.dateStart,
      dateEnd: filter.value.dateEnd
    };
    console.log('分页参数:', `第${params.page}页, 每页${params.size}条`);
    const response = await axios.get('/sec/listLogs', { 
      params,
      headers: getAuthHeaders()
    });
    
    console.log('接口返回数据:', response);
    
    if (response && (response.code === 200 || response.status === 200)) {
      const responseData = response.data || {};
      
      logsData.value = responseData.records || [];
      
      // pagination.value = {
      //   page: responseData.current || filter.value.page,
      //   size: responseData.size || filter.value.size,
      //   total: responseData.total || 0,
      //   pages: responseData.pages || 0
      // };
      // 调整分页数据
      pagination.value = {
        page: filter.value.page,
        size: filter.value.size,
        total: logsData.value.length,
        pages: logsData.value.length > 0 ? 1 : 0
      };
      console.log('数据加载成功，记录数:', logsData.value.length, 
                 '总记录数:', pagination.value.total,
                 '当前页:', pagination.value.page,
                 '总页数:', pagination.value.pages);
    } else {
      ElMessage.error(response.msg || '获取数据失败');
      logsData.value = [];
      pagination.value.total = 0;
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    ElMessage.error('获取数据失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 查看详情 - 确保获取完整数据
const viewDetails = async (applyId) => {
  console.log('传递的applyId:', applyId);
  if (!applyId) {
    ElMessage.error('申请ID无效');
    return;
  }
  
  const token = localStorage.getItem('token');
  if (!token) {
    ElMessage.error('未登录，请重新登录');
    return;
  }

  try {
    console.log('请求详情的applyId:', applyId);
    
    // 使用后端要求的参数名apply_id
    const response = await axios.get('/sec/viewLogs', {
      params: { apply_id: applyId },
      headers: getAuthHeaders()
    });

    if ([200, 0].includes(response.code) || response.status === 200) {
      // 直接使用后端返回的完整数据对象
      currentDetail.value = response.data || {};
      console.log('获取到的完整详情数据:', currentDetail.value);
      showDetails.value = true;
    } else {
      ElMessage.error(response.msg || '获取详情失败');
    }
  } catch (error) {
    console.error('获取详情失败:', error);
    const errorMsg = error.response?.data?.msg 
      || `服务器错误 (${error.response?.status || '未知状态'})`
      || error.message;
    ElMessage.error(`获取详情失败: ${errorMsg}`);
  }
};

// 关闭详情
const closeDetails = () => {
  showDetails.value = false;
  currentDetail.value = {};
};

// 处理通过
const handleApprove = async (applyId) => {
  ElMessageBox.confirm('确定要通过该申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      console.log('通过操作的applyId:', applyId);
      await axios.post('/sec/updateStatus', 
        { 
          apply_id: applyId,
          apply_status: "已通过"
        },
        { 
          headers: getAuthHeaders()
        }
      );
      ElMessage.success('操作成功');
      fetchLogs(); // 刷新列表
      fetchStats(); // 刷新统计数据
    } catch (error) {
      console.error('审核通过失败:', error);
      ElMessage.error(`操作失败: ${error.response?.data?.msg || error.message}`);
    }
  });
};

// 处理驳回
const handleReject = (applyId) => {
  console.log('驳回操作的applyId:', applyId);
  currentApplyId.value = applyId;
  rejectReason.value = '';
  showRejectReason.value = true;
};

// 取消驳回
const cancelReject = () => {
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
  
  try {
    await axios.post('/sec/updateStatus', 
      {
        apply_id: currentApplyId.value,
        apply_status: "已驳回",
        reject_reason: rejectReason.value.trim()
      },
      { 
        headers: getAuthHeaders()
      }
    );
    ElMessage.success('驳回成功');
    showRejectReason.value = false;
    currentApplyId.value = '';
    rejectReason.value = '';
    fetchLogs(); // 刷新列表
    fetchStats(); // 刷新统计数据
  } catch (error) {
    console.error('驳回失败:', error);
    ElMessage.error(`操作失败: ${error.response?.data?.msg || error.message}`);
  }
};

// 重置筛选条件
const resetFilter = () => {
  filter.value = {
    applyStatus: '',
    buildingId: '',
    userName: '',
    dateStart: '',
    dateEnd: '',
    page: 1,
    size: 5
  };
  fetchLogs();
};

const changePage = (page) => {
  if (page === '...') return;
  const totalPages = pagination.value.pages || Math.ceil(pagination.value.total / pagination.value.size);
  
  if (page >= 1 && page <= totalPages) {
    filter.value.page = page;
    logsData.value = [];
    fetchLogs();
  }
};

const changePageSize = () => {
  const validSizes = [5, 10, 20, 50];
  if (!validSizes.includes(Number(pagination.value.size))) {
    pagination.value.size = 5;
  }
  filter.value.size = pagination.value.size;
  filter.value.page = 1;
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
      await axios.post('/auth/logout', {}, { headers: getAuthHeaders() });
    } catch (error) {
      console.error('退出登录接口调用失败:', error);
    } finally {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      router.push('/login').then(() => {
        window.location.reload();
      });
      ElMessage.success('退出登录成功');
    }
  }).catch(() => {
    ElMessage.info('已取消退出');
  });
};

// 计算可见页码
const visiblePages = computed(() => {
  const totalPages = pagination.value.pages || Math.ceil(pagination.value.total / pagination.value.size);
  const currentPage = pagination.value.page;
  const pages = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }

  return pages;
});

// 生命周期
onMounted(() => {
  // 事件监听
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 10;
  };
  const handleResize = () => {
    isMobile.value = window.innerWidth < 768;
    sidebarOpen.value = !isMobile.value;
  };
  
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleResize);
  handleResize(); // 初始化窗口状态
  
  // 数据获取
  fetchBuildings().then(() => {
    fetchLogs(); // 获取列表数据
  });
  fetchStats(); // 获取统计卡片数据
  
  // 设置定时刷新统计数据（每5分钟）
  const statsInterval = setInterval(fetchStats, 5 * 60 * 1000);
  
  // 清理事件监听
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
    if (searchTimer.value) clearTimeout(searchTimer.value);
    clearInterval(statsInterval);
  });
});

// 监听路由变化
watch(route, () => {
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

.username {
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
  white-space: nowrap;
  min-width: 4em;
  display: inline-block;
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
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.reject-modal {
  max-width: 400px;
  max-height: auto;
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
  width: 100px;
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

.pagination-ellipsis {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-400);
  cursor: default;
}
</style>
