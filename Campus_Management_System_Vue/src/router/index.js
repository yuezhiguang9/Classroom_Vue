import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import SecretaryListLogs from "../views/Secretary/SecretaryListLogs.vue";
import ClassroomUsage from "../views/Secretary/ClassroomUsage.vue";
import { ElMessage } from "element-plus";
import { getToken, getUserInfo } from "@/utils/auth.js";
import { isLoggedIn } from "@/utils/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登录路由（核心：恢复并正确配置登录页）
    {
      path: "/login",
      component: Login,
      meta: {
        requiresAuth: false, // 明确标记：登录页无需验证
      },
    },

    // 用户路由（移除重复定义）
    {
      path: "/user",
      component: () => import("@/components/Userpass.vue"),
      children: [
        { path: "users", component: () => import("@/views/user/Users.vue") },
        { path: "select", component: () => import("@/views/user/UserSelect.vue") },
        { path: "apply", component: () => import("@/views/user/UserApply.vue") },
      ],
    },

    // 教室管理员路由（移除重复定义）
    {
      path: "/mgr",
      // component: () => import('@/components/Managements.vue'), // 若需要可取消注释
      children: [
        { path: "man", component: () => import("@/views/management/Man.vue") },
        { path: "state", component: () => import("@/views/management/State.vue") },
        { path: "audit", component: () => import("@/views/management/Audit.vue") },
      ],
    },

    // 首页重定向到登录页
    {
      path: "/",
      redirect: "/login",
    },

    // 秘书路由
    {
      path: "/sec/listLogs",
      name: "SecretaryListLogs",
      component: SecretaryListLogs,
      meta: {
        requiresAuth: true, // 需要登录
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

    // 测试路由
    {
      path: "/test/tests",
      component: () => import("../views/test.vue"),
    },

    // 管理员路由
    {
      path: "/admin",
      component: () => import("@/components/Container.vue"),
      children: [
        { path: "users", component: () => import("@/views/admin/AdminUser.vue") },
        { path: "log", component: () => import("@/views/admin/AdminLog.vue") },
        { path: "analyze", component: () => import("@/views/admin/AdminAnalyze.vue") },
      ],
    },

    // 通配符路由：未匹配的路径重定向到登录页（使用已配置的/login）
    {
      path: "/:pathMatch(.*)*",
      redirect: "/login",
    },
  ],
});

// 路由守卫（修复跳转逻辑）
router.beforeEach((to, from, next) => {
  // 1. 如果是无需登录的页面（如登录页），直接放行
  if (!to.meta.requiresAuth) {
    next();
    return;
  }

  // 2. 需要登录的页面：检查登录状态
  const token = getToken();
  const userInfo = getUserInfo();

  if (!token || !userInfo) {
    // 未登录：跳转到已配置的登录页（/login），避免无效路径
    next("/login");
    return;
  }

  // 3. 验证角色权限
  if (to.meta.user_type && to.meta.user_type !== userInfo.identity) {
    ElMessage.error("没有访问权限");
    next("/login"); // 权限不符也跳登录页
    return;
  }

  // 全部验证通过，放行
  next();
});

export default router;
