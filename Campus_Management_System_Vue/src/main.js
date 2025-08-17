


import { createApp } from "vue";
import "./style.css"; // 确保这个路径正确
import App from "./App.vue";
import router from "./router";
import 'font-awesome/css/font-awesome.min.css';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
createApp(App).use(router).mount("#app");

//import axios from 'axios';
import axios from "./utils/axios";
// 设置请求拦截器添加token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器处理401（登录过期）
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('currentUser');
      router.push('/login'); // 跳回登录页
    }
    return Promise.reject(error);
  }
);
// main.js 中添加
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });