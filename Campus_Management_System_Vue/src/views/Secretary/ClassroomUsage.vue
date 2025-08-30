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
            <!-- 本周平均使用率卡片 -->
            <div class="stat-card animate-fade-in">
              <div class="stat-content">
                <div>
                  <p class="stat-label">本时段平均使用率</p>
                  <h3 class="stat-value">{{ avgUsageRate || '加载中...' }}</h3>
                  
                  <p class="stat-trend" :class="trendClass">
                    <i class="fa" :class="trendIcon"></i>
                    {{ trendText || '计算中...' }}
                  </p>
                </div>
                <div class="stat-icon bg-blue-50">
                  <i class="fa fa-percent text-primary text-base"></i>
                </div>
              </div>
            </div>
            
            <!-- 使用最频繁教室卡片 -->
            <div class="stat-card animate-fade-in" style="animation-delay: 0.2s">
              <div class="stat-content">
                <div>
                  <p class="stat-label">使用最频繁教室</p>
                  <h3 class="stat-value">{{ mostUsedClassroom || '加载中...' }}</h3>
                  
                  <p class="stat-trend text-gray-500">
                    使用次数: {{ mostUsedCount || '0' }}次
                  </p>
                </div>
                <div class="stat-icon bg-green-50">
                  <i class="fa fa-building-o text-success text-base"></i>
                </div>
              </div>
            </div>
            
            <!-- 使用最少教室卡片 -->
            <div class="stat-card animate-fade-in" style="animation-delay: 0.3s">
              <div class="stat-content">
                <div>
                  <p class="stat-label">使用最少教室</p>
                  <h3 class="stat-value">{{ leastUsedClassroom || '加载中...' }}</h3>
                  
                  <p class="stat-trend text-gray-500">
                    使用次数: {{ leastUsedCount || '0' }}次
                  </p>
                </div>
                <div class="stat-icon bg-red-50">
                  <i class="fa fa-building-o text-danger text-base"></i>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 筛选 -->
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
                    v-model="filter.building_id" 
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
                  <select class="form-select" v-model="filter.room_type" @change="handleFilterChange">
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
                    v-model="filter.date_start"
                    @change="handleFilterChange"
                  >
                </div>
                
                <!-- 结束日期 -->
                <div class="form-group">
                  <label class="form-label">结束日期</label>
                  <input 
                    type="date" 
                    class="form-input" 
                    v-model="filter.date_end"
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
                  <button 
                    type="button" 
                    class="btn search-btn" 
                    @click="fetchUsageData"
                  >
                    查询
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 教室使用率表格 -->
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
                  <tr v-if="loading">
                    <td colspan="5" class="text-center py-4">加载中...</td>
                  </tr>
                  <!-- 修复：移除了错误的v-else-if="item"条件 -->
                  <tr v-for="(item, index) in usageData" :key="index" class="table-row">
                    <td>{{ item.classroom }}</td>
                    <td>{{ item.room_type || '未知类型' }}</td>
                    <td>{{ item.usage_count }}次</td>
                    <td>{{ item.usage_rate }}</td>
                    <td>
                      <span class="status-tag" :class="{
                        'text-success': item.change_rate?.startsWith('+'),
                        'text-danger': item.change_rate && !item.change_rate.startsWith('+') && item.change_rate !== '0%'
                      }">
                        <i class="fa" :class="item.change_rate?.startsWith('+') ? 'fa-arrow-up mr-1' : item.change_rate?.startsWith('-') ? 'fa-arrow-down mr-1' : ''"></i> 
                        {{ item.change_rate || '0%' }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="!loading && usageData.length === 0">
                    <td colspan="5" class="text-center py-4">暂无数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- 分页 -->
            <div class="pagination" v-if="!loading && pagination.total > 0">
              <button class="pagination-btn" :disabled="pagination.page === 1" @click="changePage(pagination.page - 1)">
                <i class="fa fa-chevron-left"></i>
              </button>
              
              <!-- 动态生成页码按钮 -->
              <template v-for="pageNum in visiblePages" :key="pageNum">
                <button 
                  class="pagination-btn" 
                  :class="{ 'active': pagination.page === pageNum }" 
                  @click="changePage(pageNum)"
                >
                  {{ pageNum }}
                </button>
              </template>
              
              <button class="pagination-btn" :disabled="pagination.page === Math.ceil(pagination.total / pagination.size)" @click="changePage(pagination.page + 1)">
                <i class="fa fa-chevron-right"></i>
              </button>
              
              <div class="pagination-info hidden-sm">
                <p class="text-sm text-gray-700">
                  显示第 <span class="font-medium">{{ (pagination.page - 1) * pagination.size + 1 }}</span> 到 
                  <span class="font-medium">{{ Math.min(pagination.page * pagination.size, pagination.total) }}</span> 条，
                  共 <span class="font-medium">{{ pagination.total }}</span> 条记录
                </p>
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

    // 统计数据
    const avgUsageRate = ref('');
    const mostUsedClassroom = ref('');
    const mostUsedCount = ref(0);
    const leastUsedClassroom = ref('');
    const leastUsedCount = ref(0);
    const trendClass = ref('');
    const trendIcon = ref('');
    const trendText = ref('');

    // 时间范围
    const timeRange = ref('week'); // 默认周统计

    // 筛选条件
    const filter = ref({
      building_id: '',
      room_type: '',
      date_start: null,
      date_end: null,
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
      // 只过滤掉null和undefined，避免误删有效数据
      return buildings.value.filter(building => 
        building !== null && building !== undefined
      );
    });

    // 教室类型
    const roomTypes = ref([]);

    // 使用率数据列表
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

      // 总页数小于等于5时，显示所有页码
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 当前页在前面几页时
        if (currentPage <= 3) {
          pages.push(1, 2, 3, 4, 5);
        } 
        // 当前页在后面几页时
        else if (currentPage >= totalPages - 2) {
          pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } 
        // 当前页在中间时
        else {
          pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
        }
      }

      return pages;
    });

    // 获取楼栋数据
    const fetchBuildings = async () => {
      try {
        console.log('开始获取楼栋数据，请求地址:', '/common/getBuildings');
        
        const response = await axios.get('/common/getBuildings');
        
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
            
            // 显示实际接收的字段结构，帮助调试
            console.log('楼栋数据字段结构:', Object.keys(buildingData[0]));
            
            // 验证数据结构并给出明确提示
            const firstBuilding = buildingData[0];
            if (!firstBuilding.buildingId) {
              console.warn('楼栋数据缺少buildingId字段');
            }
            if (!firstBuilding.buildingName) {
              console.warn('楼栋数据缺少buildingName字段');
            }
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
        if (error.response) {
          console.error('错误状态码:', error.response.status);
          console.error('错误响应内容:', error.response.data);
        }
        ElMessage.error('网络错误，无法获取楼栋数据');
      }
    };

    // 获取教室类型数据 - 修复了404错误，修改了接口地址
    const fetchRoomTypes = async () => {
  try {
    // 修改接口地址为正确的路径，例如：
    const response = await axios.get('/common/getRoomTypes'); 
    if (response.data?.code === 200) {
      roomTypes.value = response.data.data;
    } else {
      console.warn('获取教室类型失败，使用默认类型列表');
      roomTypes.value = ['没成功传数据先顶替'];
    }
  } catch (error) {
    console.error('加载教室类型失败:', error);
    ElMessage.warning('无法加载教室类型列表，使用默认类型');
    roomTypes.value = ['没成功传数据先顶替'];
  }
};


    // 获取使用率数据
    const fetchUsageData = async () => {
      // 确保filter存在且有必要属性
      if (!filter.value) {
        filter.value = {
          building_id: '',
          room_type: '',
          date_start: null,
          date_end: null,
          page: 1,
          size: 10
        };
      }
      
      loading.value = true;
      
      try {
        // 构建查询参数
        const params = {
          time_range: timeRange.value,
          building_id: filter.value.building_id || undefined,
          room_type: filter.value.room_type || undefined,
          date_start: filter.value.date_start || undefined,
          date_end: filter.value.date_end || undefined,
          page: filter.value.page || 1,
          size: filter.value.size || 10
        };
        
        console.log('发送请求参数:', params);
        
        const response = await axios.get('/sec/classroomUsage', { params });
        
        console.log('教室使用率接口响应:', response);
        
        if (response.data?.code === 200) {
          const data = response.data;
          
          // 更新统计数据
          avgUsageRate.value = data.data?.avg_usage_rate || '0%';
          mostUsedClassroom.value = data.data?.most_used || '暂无数据';
          mostUsedCount.value = data.data?.most_usage_count || 0;
          leastUsedClassroom.value = data.data?.least_used || '暂无数据';
          leastUsedCount.value = data.data?.least_usage_count || 0;
          
          // 处理趋势数据
          const changeRate = data.data?.change_rate || '0%';
          if (changeRate.startsWith('+')) {
            trendClass.value = 'text-success';
            trendIcon.value = 'fa-arrow-up';
            trendText.value = `较上周上升 ${changeRate}`;
          } else if (changeRate.startsWith('-')) {
            trendClass.value = 'text-danger';
            trendIcon.value = 'fa-arrow-down';
            trendText.value = `较上周下降 ${changeRate}`;
          } else {
            trendClass.value = 'text-gray-500';
            trendIcon.value = 'fa-minus';
            trendText.value = '与上周持平';
          }

          // 更新表格数据
          usageData.value = data.data?.list || [];
          
          // 更新分页数据
          pagination.value.page = data.data?.page || 1;
          pagination.value.size = data.data?.size || 10;
          pagination.value.total = data.data?.total || 0;

        } else {
          // 接口返回错误状态
          ElMessage.error(`获取数据失败: ${response.data?.msg || '请重试'}`);
          usageData.value = [];
          pagination.value.total = 0;
        }

      } catch (error) {
        console.error('获取使用率数据失败:', error);
        console.error('错误响应内容:', error.response?.data);
        
        // 错误状态重置
        usageData.value = [];
        avgUsageRate.value = '获取失败';
        mostUsedClassroom.value = '获取失败';
        mostUsedCount.value = 0;
        leastUsedClassroom.value = '获取失败';
        leastUsedCount.value = 0;
        trendText.value = '数据获取失败';
        pagination.value.total = 0;
        
        ElMessage.error(`请求错误: ${error.response?.data?.msg || error.message}`);
      } finally {
        loading.value = false;
      }
    };

    // 退出登录
    const handleLogout = () => {
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          // 调用退出接口（如果有）
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

    // 处理筛选条件变化
    const handleFilterChange = () => {
      // 保持原有的筛选变化逻辑，不自动查询
    };

    // 重置筛选条件
    const resetFilter = () => {
      filter.value = {
        building_id: '',
        room_type: '',
        date_start: null,
        date_end: null,
        page: 1,
        size: 10
      };
      timeRange.value = 'week'; // 重置时间范围
      pagination.value.page = 1;
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
      
      // 先加载基础数据，再加载统计数据
      Promise.all([fetchBuildings(), fetchRoomTypes()]).then(() => {
        fetchUsageData();
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
      () => [filter.value.building_id, filter.value.room_type, filter.value.date_start, filter.value.date_end, timeRange.value],
      () => {
        filter.value.page = 1;
        pagination.value.page = 1;
        // 注释掉自动查询，改为通过按钮触发
        // fetchUsageData();
      }
    );

    // 导出模板需要使用的变量和方法
    return {
      userName,
      sidebarOpen,
      isScrolled,
      isMobile,
      loading,
      avgUsageRate,
      mostUsedClassroom,
      mostUsedCount,
      leastUsedClassroom,
      leastUsedCount,
      trendClass,
      trendIcon,
      trendText,
      timeRange,
      roomTypes,
      filter,
      pagination,
      visiblePages,
      validBuildings,
      usageData,
      route,
      toggleSidebar,
      changePage,
      fetchUsageData,
      handleLogout,
      resetFilter,
      handleFilterChange
    };
  }
};
</script>

<style scoped>
/* 基础样式变量 */
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

/* 教室使用率导航项固定蓝色背景 */
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
