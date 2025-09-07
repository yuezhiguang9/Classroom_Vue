// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import SecretaryListLogs from "../views/Secretary/SecretaryListLogs.vue";
import ClassroomUsage from "../views/Secretary/ClassroomUsage.vue";
import { ElMessage } from "element-plus";
import { getToken, getUserInfo } from "@/utils/auth.js";
import AdminUser from '../views/admin/AdminUser.vue';
import AdminLog from '../views/admin/AdminLog.vue';
import AdminAnalyze from '../views/admin/AdminAnalyze.vue';
import { isLoggedIn } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/user",
      component: () => import("@/components/Userpass.vue"),
      children: [
        // 用户路由
        { path: "users", component: () => import("@/views/user/Users.vue") },
        { path: "select", component: () => import("@/views/user/UserSelect.vue") },
        { path: "apply", component: () => import("@/views/user/UserApply.vue") },
      ],
    },
    {
      path: "/mgr",
      //component: () => import('@/components/Managements.vue'),
      children: [
        //教室管理员路由
        { path: "man", component: () => import("@/views/management/Man.vue") },
        { path: "state", component: () => import("@/views/management/State.vue") },
        { path: "audit", component: () => import("@/views/management/Audit.vue") },
      ],
    },
    {
      path: "/user",
      component: () => import("@/components/Userpass.vue"),
      children: [
        // 用户路由
        { path: "users", component: () => import("@/views/user/Users.vue") },
        { path: "select", component: () => import("@/views/user/UserSelect.vue") },
        { path: "apply", component: () => import("@/views/user/UserApply.vue") },
      ],
    },
    {
      path: "/mgr",
      //component: () => import('@/components/Managements.vue'),
      children: [
        //教室管理员路由
        { path: "man", component: () => import("@/views/management/Man.vue") },
        { path: "state", component: () => import("@/views/management/State.vue") },
        { path: "audit", component: () => import("@/views/management/Audit.vue") },
      ],
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: "/sec/listLogs",
      name: "SecretaryListLogs",
      component: SecretaryListLogs,
      meta: {
        requiresAuth: true,
        user_type: "teach_sec",
      },
    },
    {
      path: "/sec/listLogs",
      name: "SecretaryListLogs",
      component: SecretaryListLogs,
      meta: {
        requiresAuth: true,
        user_type: "teach_sec",
      },
    },
    {
      path: "/sec/classroomUsage",
      name: "ClassroomUsage",
      component: ClassroomUsage,
      meta: {
        requiresAuth: true,
        user_type: "teach_sec",
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
    // { path: '/login', component: () => import('@/views/Login.vue')},
  ],
});
// 路由守卫
router.beforeEach((to, from, next) => {
  // 1. 验证是否需要登录
  if (!to.meta.requiresAuth) {
    next();
    return;
  }

  // 2. 验证是否有登录信息
  const token = getToken();
  const userInfo = getUserInfo();

  if (!token || !userInfo) {
    next("/auth/login");
    return;
  }

  // 3. 验证角色是否匹配
  if (to.meta.user_type && to.meta.user_type !== userInfo.identity) {
    ElMessage.error("没有访问权限");
    next("/auth/login");
    return;
  }

  next();
});
  
export default router;
