// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import SecretaryListLogs from "../views/Secretary/SecretaryListLogs.vue";
import ClassroomUsage from "../views/Secretary/ClassroomUsage.vue";
import { ElMessage } from 'element-plus'; 
import { getToken, getUserInfo } from '@/utils/auth.js';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/auth/login",
      name: "Login",
      component: Login,
    },
    {
      path: "/",
      redirect: "/auth/login",
    },
    {
      path: "/sec/listLogs",
      name: "SecretaryListLogs",
      component: SecretaryListLogs,
      meta: { 
        requiresAuth: true,
        user_type: 'teach_sec'
      },
    },
    {
      path: "/sec/classroomUsage",
      name: "ClassroomUsage",
      component: ClassroomUsage,
      meta: { 
        requiresAuth: true,
        user_type: 'teach_sec'
      },
    },
    {
      path: "/test/tests",
      component: () => import("../views/test.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/auth/login",
    },
  ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 1. 验证是否需要登录
  if (!to.meta.requiresAuth) { next(); return; }

  // 2. 验证是否有登录信息
  const token = getToken();
  const userInfo = getUserInfo();
  
  if (!token || !userInfo) { 
    next('/auth/login'); 
    return; 
  }
  
  // 3. 验证角色是否匹配
  if (to.meta.user_type && to.meta.user_type !== userInfo.identity) {
    ElMessage.error('没有访问权限');
    next('/auth/login');
    return;
  }

  next();
});

export default router;