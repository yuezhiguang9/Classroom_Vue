// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import SecretaryListLogs from "../views/Secretary/SecretaryListLogs.vue";
// import StudentHome from '../views/Student/StudentHome.vue'; // 假设存在
// import ClassroomAdminWorkbench from '../views/ClassroomAdmin/ClassroomAdminWorkbench.vue'; // 假设存在
// import SuperAdminDashboard from '../views/SuperAdmin/SuperAdminDashboard.vue'; // 假设存在

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
      component: () => import("../views/Secretary/SecretaryListLogs.vue"),
      meta: { requiresAuth: true },
    },
    {
      //测试文件路径
      path: "/test/tests",
      component: () => import("../views/test.vue"),
    },
    // {
    //   path: '/mgr/selectClassroom',
    //   name: 'ClassroomAdminSelect',
    //   component: () => import('../views/ClassroomAdmin/SelectClassroom.vue'),
    //   meta: { requiresAuth: true }
    // },
    // {
    //   path: '/admin/listUsers',
    //   name: 'SuperAdminListUsers',
    //   component: () => import('../views/SuperAdmin/ListUsers.vue'),
    //   meta: { requiresAuth: true }
    // },
    // {
    //   path: '/user/selectClassroom',
    //   name: 'StudentSelectClassroom',
    //   component: () => import('../views/Student/SelectClassroom.vue'),
    //   meta: { requiresAuth: true }
    // },

    {
      path: "/:pathMatch(.*)*",
      redirect: "/auth/login",
    },
  ],
});

export default router;
