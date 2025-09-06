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
            <h1 class="page-title">教室使用率统计</h1>
            <p class="page-description">查看本学院各教室的使用情况统计</p>
          </div>
          
          <!-- 统计卡片 -->
          <div class="stats-grid">
            <!-- 🔥 关键修改1：绑定全局平均使用率变量（不再依赖筛选数据） -->
            <div class="stat-card animate-fade-in">
              <div class="stat-content">
                <div>
                  <p class="stat-label">整体平均使用率</p>
                  <h3 class="stat-value">{{ globalAvgUsageRate || '加载中...' }}</h3>
                  
                  <p class="stat-trend" :class="globalTrendClass">
                    <i class="fa" :class="globalTrendIcon"></i>
                    {{ globalTrendText || '计算中...' }}
                  </p>
                </div>
                <div class="stat-icon bg-blue-50">
                  <i class="fa fa-percent text-primary text-base"></i>
                </div>
              </div>
            </div>
            
            <!-- 使用最频繁教室卡片（全局数据，不受筛选影响） -->
            <div class="stat-card animate-fade-in" style="animation-delay: 0.2s">
              <div class="stat-content">
                <div>
                  <p class="stat-label">使用最频繁教室</p>
                  <h3 class="stat-value">{{ globalMostUsedClassroom || '加载中...' }}</h3>
                  
                  <p class="stat-trend text-gray-500">
                    使用次数: {{ globalMostUsedCount || '0' }}次
                  </p>
                </div>
                <div class="stat-icon bg-green-50">
                  <i class="fa fa-building-o text-success text-base"></i>
                </div>
              </div>
            </div>
            
            <!-- 使用最少教室卡片（全局数据，不受筛选影响） -->
            <div class="stat-card animate-fade-in" style="animation-delay: 0.3s">
              <div class="stat-content">
                <div>
                  <p class="stat-label">使用最少教室</p>
                  <h3 class="stat-value">{{ globalLeastUsedClassroom || '加载中...' }}</h3>
                  
                  <p class="stat-trend text-gray-500">
                    使用次数: {{ globalLeastUsedCount || '0' }}次
                  </p>
                </div>
                <div class="stat-icon bg-red-50">
                  <i class="fa fa-building-o text-danger text-base"></i>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 筛选区域（保持不变） -->
          <div class="card filter-card animate-fade-in" style="animation-delay: 0.4s">
            <div class="filter-header">
              <h2 class="filter-title">按条件筛选</h2>
            </div>
            
            <div class="filter-content">
              <div class="filter-form">
                <!-- 楼栋筛选 -->
                <div class="form-group">
                  <label class="form-label">按楼栋筛选</label>
                  <select 
                    class="form-select" 
                    v-model="filter.buildingId" 
                    @change="handleFilterChange"
                    v-if="filter" 
                  >
                    <option value="">全部楼栋</option>
                    <option 
                      v-for="building in validBuildings" 
                      :value="building.buildingId" 
                      :key="building.buildingId"
                    >
                      {{ building.buildingName || '未知楼栋' }}
                    </option>
                  </select>
                  <select 
                    class="form-select" 
                    disabled
                    v-else
                  >
                    <option value="">加载中...</option>
                  </select>
                </div>
                
                <!-- 教室类型筛选 -->
                <div class="form-group">
                  <label class="form-label">教室类型</label>
                  <select class="form-select" v-model="filter.roomType" @change="handleFilterChange">
                    <option value="">全部类型</option>
                    <option v-for="(type, index) in roomTypes" :value="type" :key="index">
                      {{ type }}
                    </option>
                  </select>
                </div>
                
                <!-- 开始日期 -->
                <div class="form-group">
                  <label class="form-label">开始日期</label>
                  <input 
                    type="date" 
                    class="form-input" 
                    v-model="filter.dateStart"
                    @change="handleFilterChange"
                  >
                </div>
                
                <!-- 结束日期 -->
                <div class="form-group">
                  <label class="form-label">结束日期</label>
                  <input 
                    type="date" 
                    class="form-input" 
                    v-model="filter.dateEnd"
                    @change="handleFilterChange"
                  >
                </div>

                <!-- 按钮组 -->
                <div class="form-group form-actions">
                  <button 
                    type="button" 
                    class="btn reset-btn" 
                    @click="resetFilter"
                  >
                    重置
                  </button>
                  <button type="button" class="btn search-btn" @click="handleQuery">
                    查询
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 教室使用率表格（保持不变） -->
          <div class="card table-card animate-fade-in" style="animation-delay: 0.5s">
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>教室</th>
                    <th>教室类型</th>
                    <th>本时段使用次数</th>
                    <th>本时段使用率</th>
                    <th>较上周变化</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- 加载状态 -->
                  <tr v-if="loading">
                    <td colspan="5" class="text-center py-4">加载中...</td>
                  </tr>
                  <!-- 实际数据渲染 -->
                  <tr v-for="(item, index) in usageData" :key="index" class="table-row">
                    <td>{{ item.classroom }}</td>
                    <td>{{ item.roomType || '未知类型' }}</td>
                    <td>{{ item.usageCount }}次</td>
                    <td>{{ item.usageRate }}</td>
                    <td>
                      <span class="status-tag" :class="{
                        'text-success': item.changeRate?.startsWith('+'),
                        'text-danger': item.changeRate && !item.changeRate.startsWith('+') && item.changeRate !== '0%'
                      }">
                        <i class="fa" :class="item.changeRate?.startsWith('+') ? 'fa-arrow-up mr-1' : item.changeRate?.startsWith('-') ? 'fa-arrow-down mr-1' : ''"></i> 
                        {{ item.changeRate || '0%' }}
                      </span>
                    </td>
                  </tr>
                  <!-- 无数据状态 -->
                  <tr v-if="!loading && usageData.length === 0">
                    <td colspan="5" class="text-center py-4">暂无数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- 分页控件 -->
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
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '@/utils/axios';
import { ElMessageBox, ElMessage } from 'element-plus';

export default {
  setup() {
    // 引入路由实例
    const route = useRoute();
    const router = useRouter();
    
    // 状态管理
    const userName = ref('');
    const sidebarOpen = ref(true);
    const isScrolled = ref(false);
    const isMobile = ref(window.innerWidth < 768);
    const loading = ref(false); // 加载状态

    // 🔥 关键修改2：新增全局平均使用率及趋势变量（替代原筛选后变量）
    const globalAvgUsageRate = ref(''); // 全局整体平均使用率
    const globalTrendClass = ref('');   // 全局趋势样式
    const globalTrendIcon = ref('');   // 全局趋势图标
    const globalTrendText = ref('');   // 全局趋势文本

    // 全局统计数据（不受筛选影响）
    const globalMostUsedClassroom = ref('');
    const globalMostUsedCount = ref(0);
    const globalLeastUsedClassroom = ref('');
    const globalLeastUsedCount = ref(0);

    // 筛选条件
    const filter = ref({
      buildingId: '',
      roomType: '',
      dateStart: null,
      dateEnd: null,
      page: 1,
      size: 10
    });

    // 分页数据
    const pagination = ref({
      page: 1,
      size: 10,
      total: 0
    });

    // 楼栋数据
    const buildings = ref([]);
    const validBuildings = computed(() => {
      return buildings.value.filter(building => building !== null && building !== undefined);
    });

    // 教室类型
    const roomTypes = ref([]);

    // 使用率数据列表（受筛选影响）
    const usageData = ref([]);

    // 切换侧边栏
    const toggleSidebar = () => {
      sidebarOpen.value = !sidebarOpen.value;
    };

    // 切换页码
    const changePage = (pageNum) => {
      if (pageNum < 1 || pageNum > Math.ceil(pagination.value.total / pagination.value.size)) {
        return;
      }
      pagination.value.page = pageNum;
      filter.value.page = pageNum;
      fetchUsageData();
    };

    // 计算可见页码
    const visiblePages = computed(() => {
      const totalPages = Math.ceil(pagination.value.total / pagination.value.size);
      const currentPage = pagination.value.page;
      const pages = [];

      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          pages.push(1, 2, 3, 4, 5);
        } else if (currentPage >= totalPages - 2) {
          pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
        }
      }

      return pages;
    });

    // 每页显示条数变更方法
    const changePageSize = () => {
      filter.value.size = pagination.value.size;
      filter.value.page = 1;
      pagination.value.page = 1;
      fetchUsageData();
    };
    
    // 获取楼栋数据
    const fetchBuildings = async () => {
      try {
        const response = await axios.get('/common/getBuildings');
        if (response && response.code === 200) {
          let buildingData = null;
          if (Array.isArray(response.data)) {
            buildingData = response.data;
          } else if (response.data && response.data.data) {
            buildingData = response.data.data;
          }
          buildings.value = Array.isArray(buildingData) ? buildingData : [];
        } else {
          ElMessage.error(`获取楼栋信息失败: ${response?.msg || '未知错误'}`);
        }
      } catch (error) {
        console.error('获取楼栋数据失败:', error);
        ElMessage.error('网络错误，无法获取楼栋数据');
      }
    };

    // 获取教室类型数据
    const fetchRoomTypes = async () => {
      try {
        const response = await axios.get('/common/getRoomTypes');
        if (response.code === 200) {
          if (Array.isArray(response.data)) {
            const types = response.data.map(item => item.room_type).filter(Boolean);
            roomTypes.value = types.length > 0 ? types : ['无可用类型'];
          } else {
            roomTypes.value = ['数据格式错误'];
          }
        } else {
          roomTypes.value = ['获取失败'];
        }
      } catch (error) {
        console.error('加载教室类型失败:', error);
        ElMessage.warning('无法加载教室类型列表');
        roomTypes.value = ['加载失败'];
      }
    };

    // 🔥 关键修改3：简化查询逻辑（仅更新表格数据，不影响全局平均使用率）
    const handleQuery = () => {
      if (!filter.value.dateStart || !filter.value.dateEnd) {
        ElMessage.warning('请选择开始日期和结束日期');
        return;
      }
      if (new Date(filter.value.dateStart) > new Date(filter.value.dateEnd)) {
        ElMessage.warning('开始日期不能晚于结束日期');
        return;
      }
      // 仅请求筛选后的表格数据，不再更新平均使用率
      fetchUsageData();
    };

    // 🔥 关键修改4：扩展全局数据接口（新增全局平均使用率和趋势获取）
    const fetchGlobalClassroomStats = async () => {
      try {
        // 不传递任何筛选参数，确保获取全量数据
        const response = await axios.get('/sec/calculateClassroomMetrics', { params: {} });
        if (response.code === 200 && response.data) {
          const metrics = response.data;
          // 原有全局数据
          globalMostUsedClassroom.value = metrics.mostUsedClassroom || '暂无数据';
          globalMostUsedCount.value = metrics.mostUsedCount ? Number(metrics.mostUsedCount) : 0;
          globalLeastUsedClassroom.value = metrics.leastUsedClassroom || '暂无数据';
          globalLeastUsedCount.value = metrics.leastUsedCount ? Number(metrics.leastUsedCount) : 0;
          // 新增：全局平均使用率
          globalAvgUsageRate.value = metrics.averageUsageRate ? `${metrics.averageUsageRate}%` : '0%';
          // 新增：计算全局趋势
          calculateGlobalTrend(metrics.weeklyComparison);
        }
      } catch (error) {
        console.error('获取全局教室统计数据失败:', error);
        globalMostUsedClassroom.value = '获取失败';
        globalLeastUsedClassroom.value = '获取失败';
        globalAvgUsageRate.value = '获取失败';
      }
    };

    // 🔥 关键修改5：新增全局趋势计算方法（独立于筛选趋势）
    const calculateGlobalTrend = (weeklyComparison) => {
      if (!weeklyComparison) {
        globalTrendText.value = '无历史数据';
        globalTrendClass.value = 'text-gray-500';
        globalTrendIcon.value = '';
        return;
      }
      
      switch (weeklyComparison) {
        case '上升':
          globalTrendText.value = '较上周上升';
          globalTrendClass.value = 'text-success';
          globalTrendIcon.value = 'fa-arrow-up';
          break;
        case '下降':
          globalTrendText.value = '较上周下降';
          globalTrendClass.value = 'text-danger';
          globalTrendIcon.value = 'fa-arrow-down';
          break;
        case '持平':
          globalTrendText.value = '与上周持平';
          globalTrendClass.value = 'text-gray-500';
          globalTrendIcon.value = 'fa-minus';
          break;
        default:
          globalTrendText.value = '数据异常';
          globalTrendClass.value = 'text-gray-500';
          globalTrendIcon.value = '';
      }
    };

    // 🔥 关键修改6：移除表格数据接口中对平均使用率的更新
    const fetchUsageData = async () => {
      loading.value = true;
      try {
        const params = {
          buildingId: filter.value.buildingId || undefined,
          roomType: filter.value.roomType || undefined,
          dateStart: filter.value.dateStart || undefined,
          dateEnd: filter.value.dateEnd || undefined,
          page: filter.value.page || 1,
          size: filter.value.size || 10
        };

        const response = await axios.get('/sec/classroomUsage', { params });

        if (response.code === 200) {
          const { current, pages, size, total, records } = response.data;
          
          pagination.value = {
            page: current || 1,
            size: filter.value.size || 10,
            total: total || 0,
            pages: pages || 0
          };
          
          // 🔥 移除：原筛选后平均使用率更新逻辑（不再影响全局卡片）
          // const statData = response.data.statistics || {};
          // avgUsageRate.value = statData.averageUsageRate ? `${statData.averageUsageRate}%` : '0%';
          // calculateTrend(statData.weeklyComparison);

          // 仅处理表格列表数据
          usageData.value = records.map(item => ({
            ...item,
            usageRate: item.usageRate ? `${item.usageRate}%` : '0%'
          }));
        } else {
          usageData.value = [];
          pagination.value = { page: 1, size: 10, total: 0, pages: 0 };
          ElMessage.error(`查询失败: ${response?.msg || '未知错误'}`);
        }
      } catch (error) {
        console.error('【请求异常】获取数据失败:', error);
        usageData.value = [];
        pagination.value = { page: 1, size: 10, total: 0, pages: 0 };
        ElMessage.error('网络错误，无法获取数据');
      } finally {
        loading.value = false;
      }
    };

    // 🔥 关键修改7：移除原筛选后趋势计算（仅保留全局趋势）
    // const calculateTrend = (weeklyComparison) => { ... } // 可删除

    // 退出登录
    const handleLogout = () => {
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await axios.post('/auth/logout');
        } catch (error) {
          console.error('退出登录接口调用失败:', error);
        } finally {
          localStorage.removeItem('currentUser');
          router.push('/login').then(() => {
            window.location.reload();
          });
          ElMessage.success('退出登录成功');
        }
      }).catch(() => {
        ElMessage.info('已取消退出');
      });
    };

    // 处理筛选条件变化
    const handleFilterChange = () => {
      // 保持原有逻辑（仅触发表格数据更新前的准备）
    };

    // 🔥 关键修改8：简化重置逻辑（仅重置表格，不影响全局平均使用率）
    const resetFilter = () => {
      filter.value = {
        buildingId: '',
        roomType: '',
        dateStart: null,
        dateEnd: null,
        page: 1,
        size: 10
      };
      pagination.value.page = 1;
      // 仅重置表格数据，不再更新平均使用率
      fetchUsageData();
    };

    // 生命周期
    onMounted(() => {
      // 获取用户信息
      const user = localStorage.getItem('currentUser');
      if (user) {
        const userData = JSON.parse(user);
        userName.value = userData.name || '教秘用户';
      }
      
      // 1. 🔥 优先加载全局数据（仅一次，不受筛选影响）
      fetchGlobalClassroomStats();
      
      // 2. 加载筛选相关的数据（仅用于表格）
      Promise.all([fetchBuildings(), fetchRoomTypes()]).then(() => {
        fetchUsageData(); // 仅加载初始表格数据
      });
      
      // 监听滚动事件
      const handleScroll = () => {
        isScrolled.value = window.scrollY > 10;
      };
      window.addEventListener('scroll', handleScroll);
      
      // 监听窗口大小变化
      const handleResize = () => {
        isMobile.value = window.innerWidth < 768;
        sidebarOpen.value = !isMobile.value;
      };
      window.addEventListener('resize', handleResize);
      handleResize();
    });

    // 清理事件监听
    onUnmounted(() => {
      const handleScroll = () => {
        isScrolled.value = window.scrollY > 10;
      };
      const handleResize = () => {
        isMobile.value = window.innerWidth < 768;
        sidebarOpen.value = !isMobile.value;
      };
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    });

    // 筛选条件变化时重置分页
    watch(
      () => [filter.value.buildingId, filter.value.roomType, filter.value.dateStart, filter.value.dateEnd],
      () => {
        filter.value.page = 1;
        pagination.value.page = 1;
      }
    );

    // 🔥 关键修改9：导出全局变量（供模板使用）
    return {
      userName,
      sidebarOpen,
      isScrolled,
      isMobile,
      loading,
      // 全局平均使用率及趋势（新增）
      globalAvgUsageRate,
      globalTrendClass,
      globalTrendIcon,
      globalTrendText,
      // 原有全局数据
      globalMostUsedClassroom,
      globalMostUsedCount,
      globalLeastUsedClassroom,
      globalLeastUsedCount,
      // 其他变量
      roomTypes,
      filter,
      pagination,
      visiblePages,
      validBuildings,
      usageData,
      route,
      // 方法
      toggleSidebar,
      changePage,
      fetchUsageData,
      handleLogout,
      resetFilter,
      handleFilterChange,
      changePageSize,
      handleQuery
    };
  }
};
</script>

<style scoped>
/* 样式保持不变，无需修改 */
:root {
  --primary: #3b82f6;
  --success: #10b981;
  --danger: #ef4444;
  --gray-50: #f9fafb;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --blue-50: #eff6ff;
  --green-50: #ecfdf5;
  --red-50: #fee2e2;
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
  font-size: 0.875rem;
  color: red;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
}

.logout-btn:hover {
  background-color: var(--blue-50);
}

.mobile-menu-btn button {
  background: none;
  border: none;
  color: var(--gray-700);
  cursor: pointer;
}

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

.classroom-usage-item {
  background-color: var(--blue-50);
  color: var(--primary);
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
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
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
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: var(--gray-800);
  background-color: white;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.table-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

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
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
  background-color: var(--gray-50);
}

.table-row:hover {
  background-color: var(--gray-50);
}

.status-tag {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
}

.text-success {
  color: var(--success);
}

.text-danger {
  color: var(--danger);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  gap: 0.5rem;
}

.pagination-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.25rem;
  background-color: white;
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.15s ease;
}

.pagination-btn:hover {
  background-color: var(--gray-50);
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
  margin-left: 1rem;
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

.form-actions {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

/* 响应式样式 */
.hidden-md {
  display: flex;
}

.md-hidden {
  display: none;
}

@media (max-width: 768px) {
  .hidden-md {
    display: none;
  }
  
  .md-hidden {
    display: block;
  }
  
  .main-content {
    padding: 1rem 0.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>