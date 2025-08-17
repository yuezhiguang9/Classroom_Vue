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
                <span class="username">{{ userInfo.name || '李老师' }}</span>
                <img class="avatar" :src="userAvatar" alt="用户头像">
              </div>
              <div class="dropdown-menu">
                <a href="#" class="dropdown-item" @click.prevent="handleLogout">退出登录</a>
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
            :class="{ active: $route.path === '/sec/listLogs' }"
          >
            <i class="fa fa-clipboard-check mr-3 text-base"></i>
            <span>审核教室申请</span>
          </router-link>
        
          <router-link 
          to="/sec/classroomUsage" 
          class="sidebar-item" 
          :class="{ active: $route.path === '/sec/classroomUsage' }"
          @click.prevent="handleClassroomUsageClick" 
        >    
          <i class="fa fa-bar-chart mr-3 text-base"></i>
          <span>教室使用率统计</span>
        </router-link>
        </nav>
      </aside>

      <!-- 主体内容 -->
      <main class="main-content" :class="{ 'sidebar-collapsed': !sidebarOpen }">
        <div class="content-wrapper">
          <div class="page-header">
            <h1 class="page-title">教秘审核工作台</h1>
          </div>
          
          <!-- 统计卡片 -->
          <div class="stats-grid">
            <!-- 今日待审核卡片 -->
            <div class="stat-card animate-fade-in">
              <div class="stat-content">
                <div>
                  <p class="stat-label">今日待审核</p>
                  <h3 class="stat-value">{{ todayPending }}</h3>
                  
                  <p class="stat-trend" :class="{ 'text-success': pendingTrend > 0, 'text-danger': pendingTrend < 0 }">
                    <i class="fa" :class="pendingTrend > 0 ? 'fa-arrow-up' : pendingTrend < 0 ? 'fa-arrow-down' : 'fa-minus'"></i>
                    {{ formatTrendText(pendingTrend, '昨日') }}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- 本周通过卡片 -->
            <div class="stat-card animate-fade-in" style="animation-delay: 0.2s">
              <div class="stat-content">
                <div>
                  <p class="stat-label">本周通过</p>
                  <h3 class="stat-value">{{ weekApproved }}</h3>
                  
                  <p class="stat-trend" :class="{ 'text-success': approvedTrend > 0, 'text-danger': approvedTrend < 0 }">
                    <i class="fa" :class="approvedTrend > 0 ? 'fa-arrow-up' : approvedTrend < 0 ? 'fa-arrow-down' : 'fa-minus'"></i>
                    {{ formatTrendText(approvedTrend, '上周') }}
                  </p>
                </div>
                <div class="stat-icon bg-green-50">
                  <i class="fa fa-check-circle text-success text-base"></i>
                </div>
              </div>
            </div>
            
            <!-- 本周驳回卡片 -->
            <div class="stat-card animate-fade-in" style="animation-delay: 0.3s">
              <div class="stat-content">
                <div>
                  <p class="stat-label">本周驳回</p>
                  <h3 class="stat-value">{{ weekRejected }}</h3>
                  
                  <p class="stat-trend" :class="{ 'text-success': rejectedTrend > 0, 'text-danger': rejectedTrend < 0 }">
                    <i class="fa" :class="rejectedTrend > 0 ? 'fa-arrow-up' : rejectedTrend < 0 ? 'fa-arrow-down' : 'fa-minus'"></i>
                    {{ formatTrendText(rejectedTrend, '上周') }}
                  </p>
                </div>
                <div class="stat-icon bg-red-50">
                  <i class="fa fa-times-circle text-danger text-base"></i>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 筛选和批量操作 -->
          <div class="card filter-card animate-fade-in" style="animation-delay: 0.4s">
            <div class="filter-header">
              <h2 class="filter-title">申请列表</h2>
            </div>
            
            <div class="filter-content">
              <div class="filter-form-row-1">
                <div class="form-group">
                  <label class="form-label">申请人</label>
                  <input 
                    type="text" 
                    v-model="filter.user_name"
                    class="form-input"
                    placeholder="输入申请人姓名"
                    @input="handleFilterChange"
                  >
                </div>
                
                <div class="form-group">
                  <label class="form-label">按楼栋筛选</label>
                  <select 
                    v-model="filter.building_id" 
                    class="form-select"
                    @change="handleFilterChange"
                  >
                    <option value="">全部楼栋</option>
                    <option v-for="building in buildings" :value="building.id" :key="building.id">
                      {{ building.name }}
                    </option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label">审核状态</label>
                  <select 
                    v-model="filter.apply_status" 
                    class="form-select"
                    @change="handleFilterChange"
                  >
                    <option value="">全部状态</option>
                    <option value="待审核">待审核</option>
                    <option value="已通过">已通过</option>
                    <option value="已驳回">已驳回</option>
                  </select>
                </div>
              </div>
              
              <div class="filter-form-row-2">
                <div class="form-group">
                  <label class="form-label">开始日期</label>
                  <input 
                    type="date" 
                    v-model="filter.date_start"
                    class="form-input"
                    @change="handleFilterChange"
                  >
                </div>
                
                <div class="form-group">
                  <label class="form-label">结束日期</label>
                  <input 
                    type="date" 
                    v-model="filter.date_end"
                    class="form-input"
                    @change="handleFilterChange"
                  >
                </div>
              </div>
            </div>
          </div>
          
          <!-- 数据表格 -->
          <div class="card table-card animate-fade-in" style="animation-delay: 0.5s">
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>申请人</th>
                    <th>联系电话</th>
                    <th>申请时间</th>
                    <th>申请教室</th>
                    <th>使用时间</th>
                    <th>申请用途</th>
                    <th>使用人数</th>
                    <th>审核状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="application in filteredApplications" :key="application.book_time + application.user_name" class="table-row">
                    <td>
                      <div class="user-info">
                        <img class="avatar" :src="`https://picsum.photos/200/200?random=${application.book_time}`" alt="申请人头像">
                        <div class="user-details">
                          <div class="username">{{ application.user_name }}</div>
                        </div>
                      </div>
                    </td>
                    <td>{{ application.phone }}</td>
                    <td>
                      <div class="time-info">
                        <div class="date">{{ formatDate(application.book_time) }}</div>
                        <div class="time">{{ formatTime(application.book_time) }}</div>
                      </div>
                    </td>
                    <td>{{ application.building_name }}-{{ application.room_num }}</td>
                    <td>
                      <div class="time-info">
                        <div class="date">{{ application.date }}</div>
                        <div class="time">第{{ application.week }}周 {{ application.day_of_week }} {{ application.period }}</div>
                      </div>
                    </td>
                    <td>{{ application.purpose }}</td>
                    <td>{{ application.person_count }}人</td>
                    <td>
                      <span class="status-tag" :class="{
                        'status-pending': application.apply_status === '待审核',
                        'status-approved': application.apply_status === '已通过',
                        'status-rejected': application.apply_status === '已驳回'
                      }">
                        {{ application.apply_status }}
                      </span>
                    </td>
                    <td>
                      <button 
                        class="btn btn-primary btn-sm" 
                        @click="openViewModal(application)"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                  <tr v-if="filteredApplications.length === 0">
                    <td colspan="9" class="text-center">暂无数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- 分页 -->
            <div class="pagination-container">
              <div class="pagination">
                <button 
                  class="pagination-btn" 
                  @click="changePage(page - 1)" 
                  :disabled="page === 1"
                >
                  上一页
                </button>
                
                <button 
                  v-for="p in visiblePages" 
                  :key="p" 
                  class="pagination-btn" 
                  :class="{ active: p === page }"
                  @click="changePage(p)"
                >
                  {{ p }}
                </button>
                
                <button 
                  class="pagination-btn" 
                  @click="changePage(page + 1)" 
                  :disabled="page === totalPages"
                >
                  下一页
                </button>
              </div>
              
              <div class="pagination-info">
                <p>显示第 {{ Math.min((page - 1) * pageSize + 1, total) }}-{{ Math.min(page * pageSize, total) }} 条，共 {{ total }} 条</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <!-- 查看详情模态框 -->
    <div class="modal-backdrop" v-if="viewModalOpen">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">申请详情</h3>
          <button class="close-btn" @click="closeViewModal">
            <i class="fa fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body" v-if="currentApplication">
          <div class="detail-item">
            <p class="detail-label">申请人</p>
            <p class="detail-value">{{ currentApplication.user_name }}</p>
          </div>
          
          <div class="detail-item">
            <p class="detail-label">联系电话</p>
            <p class="detail-value">{{ currentApplication.phone }}</p>
          </div>
          
          <div class="detail-item">
            <p class="detail-label">申请时间</p>
            <p class="detail-value">{{ formatDateTime(currentApplication.book_time) }}</p>
          </div>
          
          <div class="detail-item">
            <p class="detail-label">申请教室</p>
            <p class="detail-value">{{ currentApplication.building_name }}-{{ currentApplication.room_num }}</p>
          </div>
          
          <div class="detail-item">
            <p class="detail-label">使用时间</p>
            <p class="detail-value">
              {{ currentApplication.date }} 第{{ currentApplication.week }}周 {{ currentApplication.day_of_week }} {{ currentApplication.period }}
            </p>
          </div>
          
          <div class="detail-item">
            <p class="detail-label">使用人数</p>
            <p class="detail-value">{{ currentApplication.person_count }}人</p>
          </div>
          
          <div class="detail-item">
            <p class="detail-label">申请用途</p>
            <p class="detail-value">{{ currentApplication.purpose }}</p>
          </div>
          
          <div class="detail-item" v-if="currentApplication.reject_reason">
            <p class="detail-label">驳回原因</p>
            <p class="detail-value">{{ currentApplication.reject_reason }}</p>
          </div>

          <!-- 驳回原因输入框（仅待审核状态显示） -->
          <div class="detail-item" v-if="currentApplication.apply_status === '待审核'">
            <p class="detail-label">驳回原因（如适用）</p>
            <textarea 
              v-model="rejectReason" 
              class="form-input" 
              rows="3"
              placeholder="请输入驳回原因"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-default" @click="closeViewModal">关闭</button>
          
          <!-- 仅待审核状态显示操作按钮 -->
          <template v-if="currentApplication?.apply_status === '待审核'">
            <button class="btn btn-success" @click="handleApprove">通过申请</button>
            <button class="btn btn-danger" @click="handleReject">驳回申请</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getToken, removeToken, getUserInfo, removeUserInfo } from '../../utils/auth';

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN');
};

// 格式化时间
const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(',', '');
};

// 路由与导航相关
const router = useRouter();
const route = useRoute();

// 页面状态数据
const logsData = ref([]);
const total = ref(0); // 总记录数
const loading = ref(false);
const page = ref(1); // 当前页码
const pageSize = ref(10); // 每页条数
const isRefreshing = ref(false);
const sidebarOpen = ref(true); // 侧边栏状态
const isScrolled = ref(false); // 头部滚动状态
const userInfo = ref(getUserInfo() || {}); // 用户信息
const userAvatar = ref('https://picsum.photos/200/200?random=1'); // 默认头像

// 统计数据
const todayPending = ref(0);
const weekApproved = ref(0);
const weekRejected = ref(0);
const pendingTrend = ref(0);
const approvedTrend = ref(0);
const rejectedTrend = ref(0);

// 筛选条件
const filter = reactive({
  user_name: '',
  building_id: '',
  apply_status: '',
  date_start: '',
  date_end: ''
});

// 模态框相关
const viewModalOpen = ref(false);
const currentApplication = ref(null);
const rejectReason = ref('');

// 教室与楼栋数据
const buildings = ref([]); // 楼栋列表（从教室数据中提取）
const classrooms = ref([]); // 教室列表

// 计算过滤后的申请列表（分页处理）
const filteredApplications = computed(() => {
  // 先过滤
  let filtered = logsData.value.filter(item => {
    if (filter.user_name && !item.user_name.includes(filter.user_name)) return false;
    if (filter.building_id && item.building_id !== filter.building_id) return false;
    if (filter.apply_status && item.apply_status !== filter.apply_status) return false;
    if (filter.date_start && new Date(item.date) < new Date(filter.date_start)) return false;
    if (filter.date_end && new Date(item.date) > new Date(filter.date_end)) return false;
    return true;
  });
  
  // 再分页
  const startIndex = (page.value - 1) * pageSize.value;
  return filtered.slice(startIndex, startIndex + pageSize.value);
});

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value) || 1;
});

// 计算可见页码
const visiblePages = computed(() => {
  const pages = [];
  const maxShow = 5; // 最多显示5个页码
  let start = Math.max(1, page.value - Math.floor(maxShow / 2));
  let end = start + maxShow - 1;
  
  if (end > totalPages.value) {
    end = totalPages.value;
    start = Math.max(1, end - maxShow + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// 初始化页面
onMounted(async () => {
  // 监听滚动事件（控制头部样式）
  window.addEventListener('scroll', handleScroll);
  
  // 验证登录状态
  const token = getToken();
  if (!token) {
    ElMessage.error('您尚未登录，请先登录');
    router.push('/auth/login');
    return;
  }

  // 验证用户身份
  const info = getUserInfo();
  if (!info || info.identity !== 'teach_sec') {
    ElMessage.error('您没有访问该页面的权限');
    removeToken();
    removeUserInfo();
    router.push('/auth/login');
    return;
  }
  userInfo.value = info;

  // 加载数据
  await Promise.all([
    loadClassrooms(),
    fetchLogs()
  ]);
  
  // 计算统计数据
  calculateStats();
  
  // 设置自动刷新定时器
  window.logsTimer = setInterval(async () => {
    if (!isRefreshing.value) {
      await fetchLogs();
      calculateStats();
    }
  }, 30000); // 每30秒刷新一次
});

// 页面卸载前清理
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
  if (window.logsTimer) {
    clearInterval(window.logsTimer);
    window.logsTimer = null;
  }
});

// 监听路由变化
watch(
  () => route.query,
  () => {
    page.value = 1;
    fetchLogs();
  }
);

// 处理滚动事件
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

// 切换侧边栏
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

// 处理切换到教室使用率统计页面
const handleClassroomUsageClick = () => {
  // 导航完成后刷新页面
  router.push('/sec/classroomUsage').then(() => {
    window.location.reload();
  });
};

// 加载教室列表（提取楼栋信息）
const loadClassrooms = async () => {
  try {
    // 假设正确的教室列表接口地址
    const response = await axios.get('/classroom/listAll');
    if (response.data?.code === 200 && Array.isArray(response.data.data)) {
      classrooms.value = response.data.data;
      // 提取唯一楼栋
      const buildingSet = new Set();
      response.data.data.forEach(room => {
        if (!buildingSet.has(room.building_id)) {
          buildingSet.add(room.building_id);
          buildings.value.push({
            id: room.building_id,
            name: room.building_name
          });
        }
      });
    } else {
      ElMessage.warning('获取教室列表失败');
    }
  } catch (error) {
    console.error('加载教室列表错误:', error);
    ElMessage.error('加载教室列表时发生错误');
  }
};

// 获取申请日志数据
const fetchLogs = async () => {
  loading.value = true;
  isRefreshing.value = true;
  try {
    // 确保参数格式正确，只传递有值的参数
    const params = {
      page: page.value,
      size: pageSize.value,
      ...(filter.user_name && { user_name: filter.user_name }),
      ...(filter.building_id && { building_id: filter.building_id }),
      ...(filter.apply_status && { apply_status: filter.apply_status }),
      ...(filter.date_start && { date_start: filter.date_start }),
      ...(filter.date_end && { date_end: filter.date_end })
    };

    const response = await axios.get('/sec/listLogs', { params });
    
    if (response.data?.code === 200) {
      logsData.value = response.data.data?.records || [];
      total.value = response.data.data?.total || 0;
    } else {
      ElMessage.warning(response.data?.msg || '获取申请数据失败');
      logsData.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取申请数据错误:', error);
    ElMessage.error('获取申请数据时发生错误');
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
};

// 获取申请详情（根据接口文档补充）
const fetchApplicationDetail = async (applyId) => {
  try {
    const response = await axios.get('/sec/viewLogs', {
      params: { apply_id: applyId }
    });
    
    if (response.data?.code === 200) {
      return response.data.data;
    } else {
      ElMessage.warning(response.data?.msg || '获取申请详情失败');
      return null;
    }
  } catch (error) {
    console.error('获取申请详情错误:', error);
    ElMessage.error('获取申请详情时发生错误');
    return null;
  }
};

// 计算统计数据
const calculateStats = () => {
  const today = new Date().toISOString().split('T')[0];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // 本周一
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7); // 上周一
  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekEnd.getDate() + 6); // 上周日

  // 今日待审核
  todayPending.value = logsData.value.filter(item => 
    formatDate(item.book_time) === today && item.apply_status === '待审核'
  ).length;

  // 本周通过/驳回
  weekApproved.value = logsData.value.filter(item => {
    const itemDate = new Date(item.book_time);
    return itemDate >= weekStart && item.apply_status === '已通过';
  }).length;
  
  weekRejected.value = logsData.value.filter(item => {
    const itemDate = new Date(item.book_time);
    return itemDate >= weekStart && item.apply_status === '已驳回';
  }).length;

  // 环比上周（趋势计算）
  const lastWeekApproved = logsData.value.filter(item => {
    const itemDate = new Date(item.book_time);
    return itemDate >= lastWeekStart && itemDate <= lastWeekEnd && item.apply_status === '已通过';
  }).length;
  
  const lastWeekRejected = logsData.value.filter(item => {
    const itemDate = new Date(item.book_time);
    return itemDate >= lastWeekStart && itemDate <= lastWeekEnd && item.apply_status === '已驳回';
  }).length;

  approvedTrend.value = weekApproved.value - lastWeekApproved;
  rejectedTrend.value = weekRejected.value - lastWeekRejected;
  pendingTrend.value = 0; // 简化处理：实际应对比昨日待审核数
};

// 格式化趋势文本
const formatTrendText = (trend, compared) => {
  if (trend === 0) return `与${compared}持平`;
  return `${trend > 0 ? '增加' : '减少'} ${Math.abs(trend)} 条`;
};

// 筛选条件变化
const handleFilterChange = () => {
  page.value = 1; // 重置到第一页
  fetchLogs();
};

// 分页切换
const changePage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  page.value = newPage;
  fetchLogs();
  window.scrollTo(0, 0);
};

// 打开详情模态框
const openViewModal = async (application) => {
  // 调用详情接口获取完整信息
  const detailData = await fetchApplicationDetail(application.apply_id);
  currentApplication.value = detailData || { ...application };
  rejectReason.value = ''; // 重置驳回原因
  viewModalOpen.value = true;
};

// 关闭详情模态框
const closeViewModal = () => {
  viewModalOpen.value = false;
  currentApplication.value = null;
  rejectReason.value = '';
};

// 审核通过
const handleApprove = async () => {
  if (!currentApplication.value) return;
  
  try {
    const response = await axios.post('/sec/updateStatus', {
      apply_id: currentApplication.value.apply_id,
      apply_status: '已通过'
    });
    
    if (response.data?.code === 200) {
      ElMessage.success('审核通过成功');
      closeViewModal();
      fetchLogs();
      calculateStats();
    } else {
      ElMessage.error(response.data?.msg || '审核通过失败');
    }
  } catch (error) {
    console.error('审核通过错误:', error);
    ElMessage.error('审核操作失败');
  }
};

// 审核驳回
const handleReject = async () => {
  if (!currentApplication.value) return;
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入驳回原因');
    return;
  }
  
  try {
    const response = await axios.post('/sec/updateStatus', {
      apply_id: currentApplication.value.apply_id,
      apply_status: '已驳回',
      reject_reason: rejectReason.value
    });
    
    if (response.data?.code === 200) {
      ElMessage.success('驳回成功');
      closeViewModal();
      fetchLogs();
      calculateStats();
    } else {
      ElMessage.error(response.data?.msg || '驳回失败');
    }
  } catch (error) {
    console.error('驳回错误:', error);
    ElMessage.error('驳回操作失败');
  }
};

// 退出登录
const handleLogout = async () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 调用退出登录API
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('退出登录API调用失败:', error);
    } finally {
      // 清除本地存储
      removeToken();
      removeUserInfo();
      // 跳转到登录页并刷新
      router.push('/auth/login').then(() => {
        window.location.reload();
      });
      ElMessage.success('退出登录成功');
    }
  }).catch(() => {
    // 取消退出
    ElMessage.info('已取消退出');
  });
};
</script>
<style scoped>
/* 引入与ClassroomUsage.vue一致的样式变量 */
:root {
  --primary: #165dff;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --blue-50: #eff6ff;
  --green-50: #ecfdf5;
  --red-50: #fee2e2;
  --success: #10b981;
  --danger: #ef4444;
}

/* 基础动画 */
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 最外层容器 - 确保页面占满全屏 */
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-container {
  display: flex;
  flex: 1;
  background-color: var(--gray-50);
}

/* 头部导航 */
.header {
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  transition: all 0.3s ease;
  height: 3rem;
}

.header-scrolled {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  cursor: pointer;
}

.username {
  margin-right: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-700);
}

.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border-radius: 0.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 10rem;
  z-index: 100;
  display: none;
}

.user-menu:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  display: block;
  padding: 0.5rem 1rem;
  color: var(--gray-700);
  text-decoration: none;
  font-size: 0.875rem;
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background-color: var(--gray-50);
}

.mobile-menu-btn button {
  background: none;
  border: none;
  color: var(--gray-700);
  cursor: pointer;
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

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--gray-500);
  margin: 0 0 0.25rem 0;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0 0 0.25rem 0;
}

.stat-trend {
  font-size: 0.75rem;
  margin: 0;
  display: flex;
  align-items: center;
}

.stat-trend i {
  margin-right: 0.25rem;
  font-size: 0.875rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 卡片样式 */
.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--gray-100);
}

.filter-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.filter-content {
  padding: 1rem 1.25rem;
}

.filter-form-row-1,
.filter-form-row-2 {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 200px;
  margin: 0;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-700);
  font-weight: 500;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.25rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.2);
}

/* 表格样式 */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th,
.data-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--gray-200);
}

.data-table th {
  background-color: var(--gray-50);
  font-weight: 600;
  color: var(--gray-700);
}

.table-row:hover {
  background-color: var(--gray-50);
}

.time-info {
  display: flex;
  flex-direction: column;
}

.time-info .date {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.time-info .time {
  font-size: 0.875rem;
  color: var(--gray-800);
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-details .username {
  font-weight: 500;
  color: var(--gray-800);
  margin: 0;
}

.user-details .department {
  font-size: 0.75rem;
  color: var(--gray-500);
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  background-color: #0d47a1;
}

.btn-default {
  background-color: var(--gray-100);
  color: var(--gray-700);
}

.btn-default:hover {
  background-color: var(--gray-200);
}

.btn-success {
  background-color: var(--success);
  color: white;
}

.btn-success:hover {
  background-color: #059669;
}

.btn-danger {
  background-color: var(--danger);
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

/* 工具类 */
.text-primary {
  color: var(--primary);
  text-decoration: none;
}

.text-primary:hover {
  text-decoration: underline;
}

.text-success {
  color: var(--success);
}

.text-danger {
  color: var(--danger);
}

.font-medium {
  font-weight: 500;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid var(--gray-200);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  gap: 0.5rem;
}

.pagination-btn {
  background-color: white;
  border: 1px solid var(--gray-300);
  border-radius: 0.25rem;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover {
  background-color: var(--gray-50);
  border-color: var(--gray-400);
}

.pagination-btn.active {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.75rem;
  color: var(--gray-500);
  margin-left: 1rem;
}

/* 状态标签 */
.status-tag {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-pending {
  background-color: var(--blue-50);
  color: var(--primary);
}

.status-approved {
  background-color: var(--green-50);
  color: var(--success);
}

.status-rejected {
  background-color: var(--red-50);
  color: var(--danger);
}

/* 模态框 */
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
  z-index: 100;
  padding: 1rem;
}

.modal {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--gray-200);
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--gray-500);
  cursor: pointer;
  font-size: 1.25rem;
}

.close-btn:hover {
  color: var(--gray-800);
}

.modal-body {
  padding: 1.25rem;
}

.detail-item {
  margin-bottom: 1rem;
}

.detail-label {
  font-size: 0.875rem;
  color: var(--gray-500);
  margin: 0 0 0.25rem 0;
  font-weight: 500;
}

.detail-value {
  font-size: 0.9375rem;
  color: var(--gray-800);
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--gray-200);
}

/* 响应式调整 */
@media (max-width: 767px) {
  .main-content {
    margin-left: 0;
    padding: 1rem 0.5rem;
  }
  
  .content-wrapper {
    padding: 0 0.75rem;
  }
  
  .hidden-md {
    display: none !important;
  }
  .sidebar-hidden {
    transform: translateX(-100%);
  }
  .md-hidden {
    display: block !important;
  }
  
  .sidebar {
    transition: transform 0.3s ease;
    position: fixed;
    z-index: 40;
  }
  
  .filter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .filter-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .filter-actions .btn {
    flex: 1;
    min-width: 100px;
  }
}


@media (min-width: 768px) {
  .md-hidden {
    display: none !important;
  }
}
</style>