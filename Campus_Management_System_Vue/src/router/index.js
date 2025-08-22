import { createRouter, createWebHistory } from 'vue-router';
import AdminUser from '../views/admin/AdminUser.vue';
import AdminLog from '../views/admin/AdminLog.vue';
import AdminAnalyze from '../views/admin/AdminAnalyze.vue';
import { isLoggedIn } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/admin',
      component: () => import('@/components/Container.vue'),
      children: [
        // 超级管理员路由
        { path: 'users', component: () => import('@/views/admin/AdminUser.vue')},
        { path: 'log', component: () => import('@/views/admin/AdminLog.vue')},
        { path: 'analyze', component: () => import('@/views/admin/AdminAnalyze.vue')},
      ]
    },
    
    // 登录路由
    { path: '/login', component: () => import('@/views/Login.vue')},
  ]
})

// 全局前置守卫：未登录访问受保护页面时跳转登录
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    if (isLoggedIn()) {
      // 已登录访问登录页，跳转到默认首页
      return next('/admin/users');
    }
    return next();
  }
  // 其他路由需要登录
  if (!isLoggedIn()) {
    return next('/login');
  }
  next();
});
  
export default router;
