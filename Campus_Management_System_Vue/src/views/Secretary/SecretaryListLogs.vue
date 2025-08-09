<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="header" :class="{ 'header-scrolled': isScrolled }">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <a href="#" class="logo-text">教室预约管理系统————教秘界面</a>
          </div>
          
          <div class="header-right hidden-md">
            <button class="icon-btn">
              <i class="fa fa-bell-o text-lg"></i>
            </button>
            <div class="user-menu">
              <div class="user-info">
                <img class="avatar" src="https://picsum.photos/200/200" alt="用户头像">
                <span class="username">李老师</span>
                <i class="fa fa-chevron-down text-xs"></i>
              </div>
              <div class="dropdown-menu">
                <a href="#" class="dropdown-item">个人资料</a>
                <a href="#" class="dropdown-item">退出登录</a>
              </div>
            </div>
          </div>
          
          <div class="mobile-menu-btn md-hidden">
            <button type="button" @click="mobileMenuOpen = !mobileMenuOpen">
              <i class="fa fa-bars text-lg"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  
    <!-- 侧边导航栏 -->
    <aside class="sidebar" :class="{ 'sidebar-hidden': !sidebarOpen }">
      <nav class="sidebar-nav">
        <a href="#" class="sidebar-item active">
          <i class="fa fa-clipboard-check mr-3 text-base"></i>
          <span>审核教室申请</span>
        </a>
       
        <a href="#" class="sidebar-item">
          <i class="fa fa-bar-chart mr-3 text-base"></i>
          <span>教室使用率统计</span>
        </a>
      </nav>
    </aside>

    <!-- 侧边栏遮罩层 -->
    <div class="sidebar-mask" :class="{ 'hidden': !sidebarOpen }" @click="sidebarOpen = false"></div>
  
    <!-- 主体内容 -->
    <main class="main-content">
      <div class="page-header">
        <h1 class="page-title">教秘审核工作台</h1>
      </div>
      
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card animate-fade-in">
          <div class="stat-content">
            <div>
              <p class="stat-label">本周待审核</p>
              <h3 class="stat-value">{{ weekPending }}</h3>
              <p class="stat-trend text-primary">
                <i class="fa fa-arrow-up mr-1"></i> 较上周增加 3 条
              </p>
            </div>
            <div class="stat-icon bg-blue-50">
              <i class="fa fa-clock-o text-primary text-base"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card animate-fade-in" style="animation-delay: 0.2s">
          <div class="stat-content">
            <div>
              <p class="stat-label">本周通过</p>
              <h3 class="stat-value">{{ weekApproved }}</h3>
              <p class="stat-trend text-success">
                <i class="fa fa-arrow-up mr-1"></i> 较上周增加 8 条
              </p>
            </div>
            <div class="stat-icon bg-green-50">
              <i class="fa fa-check-circle text-success text-base"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card animate-fade-in" style="animation-delay: 0.3s">
          <div class="stat-content">
            <div>
              <p class="stat-label">本周驳回</p>
              <h3 class="stat-value">{{ weekRejected }}</h3>
              <p class="stat-trend text-danger">
                <i class="fa fa-arrow-up mr-1"></i> 较上周增加 5 条
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
          
          <div class="filter-actions">
            <button class="btn btn-outline" @click="selectAll = !selectAll; handleSelectAll()">
              <i class="fa fa-check-square-o mr-2"></i>
              {{ selectAll ? '取消全选' : '全选' }}
            </button>
          </div>
        </div>
        
        <div class="filter-content">
          <div class="filter-form">
            <div class="form-group">
              <label class="form-label">按楼栋筛选</label>
              <select 
                v-model="filter.building_id" 
                class="form-select"
                @change="handleFilterChange"
              >
                <option value="">全部楼栋</option>
                <option value="1">第一教学楼</option>
                <option value="2">第二教学楼</option>
                <option value="3">第三教学楼</option>
                <option value="4">第四教学楼</option>
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
            
            <div class="form-group">
              <label class="form-label">按日期筛选</label>
              <input 
                type="date" 
                v-model="filter.date"
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
                <th>
                  <input 
                    type="checkbox" 
                    class="checkbox"
                    v-model="selectAll"
                    @change="handleSelectAll"
                  >
                </th>
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
              <tr v-for="application in filteredApplications" :key="application.id" class="table-row">
                <td>
                  <input 
                    type="checkbox" 
                    class="checkbox"
                    v-model="application.selected"
                    @change="updateSelectedCount"
                  >
                </td>
                <td>
                  <div class="user-info">
                    <img class="avatar" :src="`https://picsum.photos/200/200?random=${application.id}`" alt="申请人头像">
                    <div class="user-details">
                      <div class="username">{{ application.username }}</div>
                      <div class="department">{{ application.department }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ application.phone }}</td>
                <td>
                  <div class="time-info">
                    <div class="date">{{ application.applyDate }}</div>
                    <div class="time">{{ application.applyTime }}</div>
                  </div>
                </td>
                <td>{{ application.classroom }}</td>
                <td>
                  <div class="time-info">
                    <div class="date">{{ application.useDate }}</div>
                    <div class="time">{{ application.useTimeRange }}</div>
                  </div>
                </td>
                <td>{{ application.purpose }}</td>
                <td>{{ application.peopleCount }}人</td>
                <td>
                  <span class="status-tag" :class="{
                    'status-pending': application.status === '待审核',
                    'status-approved': application.status === '已通过',
                    'status-rejected': application.status === '已驳回'
                  }">
                    {{ application.status }}
                  </span>
                </td>
                <td class="action-buttons">
                  <a href="#" class="text-primary" @click.prevent="openViewModal(application)">查看</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 分页 -->
        <div class="pagination">
          <button class="pagination-btn" :disabled="currentPage === 1" @click="currentPage--">
            <i class="fa fa-chevron-left"></i>
          </button>
          
          <button class="pagination-btn" :class="{ 'active': currentPage === 1 }" @click="currentPage = 1">1</button>
          <button class="pagination-btn" :class="{ 'active': currentPage === 2 }" @click="currentPage = 2">2</button>
          <button class="pagination-btn" :class="{ 'active': currentPage === 3 }" @click="currentPage = 3">3</button>
          
          <button class="pagination-btn" :disabled="currentPage === totalPages" @click="currentPage++">
            <i class="fa fa-chevron-right"></i>
          </button>
          
          <span class="pagination-info">
            共 {{ totalItems }} 条记录，当前第 {{ currentPage }}/{{ totalPages }} 页
          </span>
        </div>
      </div>
      
      <!-- 模态框 - 查看详情 -->
      <div class="modal-backdrop" :class="{ 'hidden': !viewModalOpen }">
        <div class="modal">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title">申请详情</h3>
            </div>
            <div class="modal-body">
              <div class="detail-item" v-if="currentApplication">
                <p class="detail-label">申请人</p>
                <p class="detail-value">{{ currentApplication.username }}</p>
              </div>
              
              <div class="detail-item" v-if="currentApplication">
                <p class="detail-label">联系电话</p>
                <p class="detail-value">{{ currentApplication.phone }}</p>
              </div>
              
              <div class="detail-item" v-if="currentApplication">
                <p class="detail-label">所属部门</p>
                <p class="detail-value">{{ currentApplication.department }}</p>
              </div>
              
              <div class="detail-item" v-if="currentApplication">
                <p class="detail-label">申请时间</p>
                <p class="detail-value">{{ currentApplication.applyDate }} {{ currentApplication.applyTime }}</p>
              </div>
              
              <div class="detail-item" v-if="currentApplication">
                <p class="detail-label">使用时间</p>
                <p class="detail-value">{{ currentApplication.useDate }} {{ currentApplication.useTimeRange }}</p>
              </div>
              
              <div class="detail-item" v-if="currentApplication">
                <p class="detail-label">申请用途</p>
                <p class="detail-value">{{ currentApplication.purpose }}</p>
              </div>
              
              <div class="detail-item" v-if="currentApplication && currentApplication.rejectReason">
                <p class="detail-label">驳回申请说明</p>
                <p class="detail-value">{{ currentApplication.rejectReason }}</p>
              </div>
              
              <div class="detail-grid" v-if="currentApplication">
                <div class="detail-item">
                  <p class="detail-label">申请教室</p>
                  <p class="detail-value">{{ currentApplication.classroom }}</p>
                </div>
                <div class="detail-item">
                  <p class="detail-label">审核状态</p>
                  <p class="detail-value">{{ currentApplication.status }}</p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-default" @click="closeViewModal">
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      // 页面状态
      isScrolled: false,
      sidebarOpen: true,
      mobileMenuOpen: false,
      
      // 统计数据
      weekPending: 12,
      weekApproved: 35,
      weekRejected: 8,
      
      // 筛选条件
      filter: {
        username: '',
        phone: '',
        building_id: '',
        apply_status: '',
        date: ''
      },
      
      // 表格数据
      applications: [
        {
          id: 1,
          username: '张三',
          department: '计算机学院',
          phone: '13800138000',
          applyDate: '2023-10-15',
          applyTime: '09:30',
          classroom: '第一教学楼 101',
          useDate: '2023-10-20',
          useTimeRange: '08:00-10:00',
          purpose: '课程设计答辩',
          peopleCount: 30,
          status: '待审核',
          selected: false
        },
        {
          id: 2,
          username: '李四',
          department: '电子信息学院',
          phone: '13900139000',
          applyDate: '2023-10-14',
          applyTime: '14:20',
          classroom: '第二教学楼 202',
          useDate: '2023-10-21',
          useTimeRange: '13:30-15:30',
          purpose: '学术研讨会',
          peopleCount: 25,
          status: '已通过',
          selected: false
        },
        {
          id: 3,
          username: '王五',
          department: '商学院',
          phone: '13700137000',
          applyDate: '2023-10-14',
          applyTime: '10:15',
          classroom: '第三教学楼 303',
          useDate: '2023-10-22',
          useTimeRange: '09:00-11:00',
          purpose: '学生社团活动',
          peopleCount: 40,
          status: '已驳回',
          rejectReason: '该时间段教室已被占用',
          selected: false
        }
      ],
      
      // 分页相关
      currentPage: 1,
      pageSize: 10,
      totalItems: 3,
      
      // 选择相关
      selectAll: false,
      selectedCount: 0,
      
      // 模态框相关
      viewModalOpen: false,
      currentApplication: null
    };
  },
  computed: {
    // 筛选后的申请列表
    filteredApplications() {
      return this.applications.filter(app => {
        // 楼栋筛选
        if (this.filter.building_id && !app.classroom.includes(`第${this.getBuildingNumber(this.filter.building_id)}教学楼`)) {
          return false;
        }
        
        // 审核状态筛选
        if (this.filter.apply_status && app.status !== this.filter.apply_status) {
          return false;
        }
        
        // 日期筛选
        if (this.filter.date && app.applyDate !== this.filter.date) {
          return false;
        }
        
        return true;
      });
    },
    
    // 总页数
    totalPages() {
      return Math.ceil(this.totalItems / this.pageSize);
    }
  },
  methods: {
    // 获取楼栋数字（用于筛选）
    getBuildingNumber(id) {
      const map = {
        '1': '一',
        '2': '二',
        '3': '三',
        '4': '四'
      };
      return map[id] || '';
    },
    
    // 处理筛选条件变化
    handleFilterChange() {
      this.currentPage = 1; // 筛选条件变化时重置到第一页
    },
    
    // 全选/取消全选
    handleSelectAll() {
      this.applications.forEach(app => {
        app.selected = this.selectAll;
      });
      this.updateSelectedCount();
    },
    
    // 更新选中数量
    updateSelectedCount() {
      this.selectedCount = this.applications.filter(app => app.selected).length;
    },
    
    // 打开查看详情模态框
    openViewModal(application) {
      this.currentApplication = { ...application };
      this.viewModalOpen = true;
    },
    
    // 关闭查看详情模态框
    closeViewModal() {
      this.viewModalOpen = false;
      this.currentApplication = null;
    }
  },
  mounted() {
    // 监听滚动事件
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 10;
    });
    
    // 初始化选中数量
    this.updateSelectedCount();
  },
  beforeUnmount() {
    // 移除滚动监听
    window.removeEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 10;
    });
  }
};
</script>

<style scoped>
/* 基础动画 */
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 布局容器 */
.app-container {
  font-family: 'Inter', system-ui, sans-serif;
  background-color: var(--gray-50);
  color: var(--gray-800);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 0.5rem; /* 减小内边距 */
}

/* 头部导航 */
.header {
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 50;
  transition: all 0.3s ease;
}

.header-scrolled {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 3rem; /* 减小高度 */
}

.logo-text {
  color: var(--primary);
  font-weight: bold;
  font-size: 1rem; /* 减小字体 */
  text-decoration: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* 减小间距 */
}

.icon-btn {
  background: none;
  border: none;
  color: var(--gray-700);
  cursor: pointer;
  transition: color 0.2s ease;
}

.icon-btn:hover {
  color: var(--primary);
}

.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.avatar {
  width: 1.75rem; /* 减小头像 */
  height: 1.75rem;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  margin-left: 0.4rem; /* 减小间距 */
  font-size: 0.8rem; /* 减小字体 */
  font-weight: 500;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.2rem; /* 减小间距 */
  width: 9rem; /* 减小宽度 */
  background-color: white;
  border-radius: 0.4rem; /* 减小圆角 */
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 0.2rem 0; /* 减小内边距 */
  z-index: 100;
  display: none;
}

.user-menu:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  display: block;
  padding: 0.3rem 0.7rem; /* 减小内边距 */
  color: var(--gray-600);
  text-decoration: none;
  font-size: 0.75rem; /* 减小字体 */
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: var(--blue-50);
  color: var(--primary);
}

/* 移动端菜单 */
.mobile-menu-btn {
  background: none;
  border: none;
  color: var(--gray-700);
  cursor: pointer;
}

.mobile-menu {
  background-color: white;
  border-top: 1px solid var(--gray-200);
  padding: 0.75rem; /* 减小内边距 */
}

.mobile-menu-item {
  display: block;
  padding: 0.6rem 0; /* 减小内边距 */
  color: var(--gray-600);
  text-decoration: none;
  border-bottom: 1px solid var(--gray-100);
}

.mobile-menu-item:last-child {
  border-bottom: none;
}

.mobile-menu-item.active {
  color: var(--primary);
  font-weight: 500;
}

/* 侧边栏 */
.sidebar {
  width: 12rem; /* 减小宽度 */
  background-color: white;
  box-shadow: 1px 0 3px rgba(0,0,0,0.05);
  position: fixed;
  top: 3rem; /* 对应头部高度 */
  left: 0;
  bottom: 0;
  z-index: 40;
}

.sidebar-hidden {
  /* 注释掉隐藏逻辑 */
}

.sidebar-header {
  padding: 0.75rem; /* 减小内边距 */
  border-bottom: 1px solid var(--gray-200);
}

.sidebar-title {
  font-size: 0.9rem; /* 减小字体 */
  font-weight: 600;
  color: var(--gray-800);
}

.sidebar-nav {
  padding: 0.5rem 0; /* 减小内边距 */
  overflow-y: auto;
  height: calc(100% - 5rem); /* 调整高度 */
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem; /* 减小内边距 */
  color: var(--gray-600);
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.85rem; /* 减小字体 */
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

.sidebar-footer {
  padding: 0.75rem; /* 减小内边距 */
  border-top: 1px solid var(--gray-200);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: none;
}

.close-sidebar-btn {
  width: 100%;
  padding: 0.4rem 0.75rem; /* 减小内边距 */
  background-color: var(--gray-100);
  border: none;
  border-radius: 0.4rem; /* 减小圆角 */
  color: var(--gray-700);
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.close-sidebar-btn:hover {
  background-color: var(--gray-200);
}

.sidebar-mask {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.5);
  z-index: 30;
  display: none;
}

/* 主体内容 */
.main-content {
  flex: 1;
  margin-top: 3rem; /* 对应头部高度 */
  padding: 1rem 0.5rem; /* 减小内边距 */
  margin-left: 12rem; /* 对应侧边栏宽度 */
  transition: margin-left 0.3s ease;
}

@media (min-width: 768px) {
  .main-content {
    margin-left: 12rem; /* 对应侧边栏宽度 */
  }
}

.page-header {
  margin-bottom: 1rem; /* 减小间距 */
}

.page-title {
  font-size: 1.1rem; /* 减小字体 */
  font-weight: bold;
  color: var(--gray-800);
  margin-bottom: 0.2rem; /* 减小间距 */
}

.page-desc {
  color: var(--gray-500);
  font-size: 0.85rem; /* 减小字体 */
}

/* 统计卡片 */
.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* 减小间距 */
  margin-bottom: 1rem; /* 减小间距 */
}

@media (min-width: 768px) {
  .stats-grid {
    flex-direction: row;
  }
}

.stat-card {
  background-color: white;
  border-radius: 0.5rem; /* 减小圆角 */
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  padding: 0.75rem; /* 减小内边距 */
  flex: 1;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.75rem; /* 减小字体 */
  color: var(--gray-500);
  margin-bottom: 0.2rem; /* 减小间距 */
}

.stat-value {
  font-size: 1.25rem; /* 减小字体 */
  font-weight: bold;
  color: var(--gray-800);
  margin-bottom: 0.2rem; /* 减小间距 */
}

.stat-trend {
  font-size: 0.65rem; /* 减小字体 */
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 2.5rem; /* 减小图标容器 */
  height: 2.5rem;
  border-radius: 0.5rem; /* 减小圆角 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-blue-50 {
  background-color: var(--blue-50);
}

.bg-green-50 {
  background-color: rgba(0, 180, 42, 0.1);
}

.bg-red-50 {
  background-color: rgba(245, 63, 63, 0.1);
}

.text-success {
  color: var(--success);
}

.text-danger {
  color: var(--danger);
}

/* 卡片样式 */
.card {
  background-color: white;
  border-radius: 0.5rem; /* 减小圆角 */
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  margin-bottom: 1rem; /* 减小间距 */
  overflow: hidden;
}

.filter-card .filter-header {
  padding: 0.75rem 1rem; /* 减小内边距 */
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-title {
  font-size: 0.9rem; /* 减小字体 */
  font-weight: 600;
  color: var(--gray-800);
}

.filter-actions {
  display: flex;
  gap: 0.5rem; /* 减小间距 */
}

.filter-content {
  padding: 0.75rem 1rem; /* 减小内边距 */
}

.filter-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* 减小间距 */
}

@media (min-width: 768px) {
  .filter-form {
    flex-direction: row;
  }
}

.form-group {
  flex: 1;
  min-width: 140px; /* 减小最小宽度 */
}

.form-label {
  display: block;
  font-size: 0.75rem; /* 减小字体 */
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 0.25rem; /* 减小间距 */
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 0.45rem; /* 减小内边距 */
  border: 1px solid var(--gray-300);
  border-radius: 0.3rem; /* 减小圆角 */
  font-family: inherit;
  font-size: 0.8rem; /* 减小字体 */
  transition: all 0.2s ease;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

.form-textarea {
  resize: vertical;
}

/* 表格样式 */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 0.5rem 0.75rem; /* 减小内边距 */
  text-align: left;
  font-size: 0.8rem; /* 减小字体 */
}

.data-table th {
  background-color: var(--gray-50);
  font-size: 0.65rem; /* 减小字体 */
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-row {
  border-bottom: 1px solid var(--gray-200);
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: var(--gray-50);
}

.checkbox {
  width: 0.9rem; /* 减小复选框 */
  height: 0.9rem;
  color: var(--primary);
  border-color: var(--gray-300);
  border-radius: 0.2rem; /* 减小圆角 */
}

.user-info {
  display: flex;
  align-items: center;
}

.user-details {
  margin-left: 0.5rem; /* 减小间距 */
}

.department {
  font-size: 0.65rem; /* 减小字体 */
  color: var(--gray-500);
}

.time-info {
  display: flex;
  flex-direction: column;
}

.time {
  font-size: 0.65rem; /* 减小字体 */
  color: var(--gray-500);
}

.action-buttons {
  display: flex;
  gap: 0.5rem; /* 减小间距 */
  font-size: 0.75rem; /* 减小字体 */
}

/* 状态标签样式 */
.status-tag {
  padding: 0.15rem 0.3rem; /* 减小内边距 */
  border-radius: 999px;
  font-size: 0.65rem; /* 减小字体 */
  font-weight: 500;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-approved {
  background-color: #d4edda;
  color: #155724;
}

.status-rejected {
  background-color: #f8d7da;
  color: #721c24;
}

/* 分页样式 */
.pagination {
  padding: 0.5rem 0.75rem; /* 减小内边距 */
  display: flex;
  align-items: center;
  gap: 0.3rem; /* 减小间距 */
  justify-content: center;
}

.pagination-btn {
  padding: 0.3rem 0.6rem; /* 减小内边距 */
  border: 1px solid var(--gray-300);
  border-radius: 0.3rem; /* 减小圆角 */
  background-color: white;
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem; /* 减小字体 */
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
  pointer-events: none;
}

.pagination-btn.ellipsis {
  border: none;
  background: none;
  cursor: default;
}

.pagination-btn.ellipsis:hover {
  background: none;
}

.pagination-info {
  margin-left: 0.5rem; /* 减小间距 */
  font-size: 0.75rem; /* 减小字体 */
  color: var(--gray-500);
}

/* 模态框样式 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem; /* 减小内边距 */
}

.modal {
  width: 100%;
  max-width: 25rem; /* 减小最大宽度 */
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem; /* 减小圆角 */
  overflow: hidden;
}

.modal-header {
  padding: 0.75rem 1rem; /* 减小内边距 */
  border-bottom: 1px solid var(--gray-200);
}

.modal-title {
  font-size: 0.9rem; /* 减小字体 */
  font-weight: 600;
  color: var(--gray-900);
}

.modal-body {
  padding: 0.75rem 1rem; /* 减小内边距 */
}

.detail-item {
  margin-bottom: 0.75rem; /* 减小间距 */
}

.detail-label {
  font-size: 0.75rem; /* 减小字体 */
  color: var(--gray-500);
  margin-bottom: 0.2rem; /* 减小间距 */
}

.detail-value {
  font-size: 0.85rem; /* 减小字体 */
  color: var(--gray-900);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem; /* 减小间距 */
}

.modal-footer {
  padding: 0.5rem 1rem; /* 减小内边距 */
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem; /* 减小间距 */
  flex-wrap: wrap;
}

/* 按钮样式 */
.btn {
  padding: 0.4rem 0.8rem; /* 减小内边距 */
  border-radius: 0.3rem; /* 减小圆角 */
  font-weight: 500;
  font-size: 0.75rem; /* 减小字体 */
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  border: 1px solid var(--primary);
}

.btn-primary:hover {
  background-color: #0E4CD1;
  border-color: #0E4CD1;
}

.btn-outline {
  background-color: white;
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}

.btn-outline:hover {
  background-color: var(--gray-50);
  border-color: var(--gray-400);
}

.btn-default {
  background-color: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}

.btn-default:hover {
  background-color: var(--gray-200);
  border-color: var(--gray-400);
}

.btn-danger {
  background-color: var(--danger);
  color: white;
  border: 1px solid var(--danger);
}

.btn-danger:hover {
  background-color: #E02020;
  border-color: #E02020;
}

/* 工具类 */
.hidden {
  display: none !important;
}

.text-primary {
  color: var(--primary);
  text-decoration: none;
}

.text-primary:hover {
  text-decoration: underline;
}

/* 响应式调整 */
@media (max-width: 767px) {
  .hidden-md {
    display: none !important;
  }
  
  .md-hidden {
    display: block !important;
  }
  
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    width: 10rem; /* 减小移动端侧边栏宽度 */
  }
  
  .sidebar:not(.sidebar-hidden) {
    transform: translateX(0);
  }
  
  .sidebar-mask:not(.hidden) {
    display: block;
  }
  
  .main-content {
    margin-left: 0;
    padding: 0.75rem 0.5rem; /* 减小内边距 */
  }
  
  .stats-grid {
    flex-direction: column;
  }
  
  .filter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem; /* 减小间距 */
  }
  
  .filter-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .filter-actions .btn {
    flex: 1;
    min-width: 100px; /* 减小最小宽度 */
  }
}

@media (min-width: 768px) {
  .md-hidden {
    display: none !important;
  }
}
</style>