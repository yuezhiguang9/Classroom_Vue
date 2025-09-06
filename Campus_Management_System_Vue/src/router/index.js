import { createRouter, createWebHistory } from 'vue-router';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/user',
      //component: () => import('@/components/Userpass.vue'),
      children: [
        // 用户路由
        { path: 'users', component: () => import('@/views/user/Users.vue') },
        { path: 'select', component: () => import('@/views/user/UserSelect.vue')},
        { path: 'apply', component: () => import('@/views/user/UserApply.vue')},
       
        
      ]
    },
    {
       path: '/mgr',
      //component: () => import('@/components/Managements.vue'),
      children: [
       
        //教室管理员路由
        { path: 'man', component: () => import('@/views/management/Man.vue')},
        { path: 'state', component: () => import('@/views/management/State.vue')},
        { path: 'audit', component: () => import('@/views/management/Audit.vue')},
      ]
    }
   
   
    // 登录路由
    // { path: '/login', component: () => import('@/views/Login.vue')},
  ]
})
  
export default router;
