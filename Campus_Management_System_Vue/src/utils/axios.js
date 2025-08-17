// src/axios.js
import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建 axios 实例，明确后端端口
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081', // 增加8081端口
  
  timeout: 5000 // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从本地存储获取token
    
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    if (token) {
      // 设置Authorization请求头
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // 处理请求错误
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
  const res = response.data;
  console.log('后端响应:', res); // 打印完整响应
  // 临时注释状态码校验
  // if (res.code !== 200) {
  //   ElMessage.error(res.message || '操作失败');
  //   return Promise.reject(new Error(res.message || 'Error'));
  // } else {
    return res;
  // }
},
  error => {
    // 处理响应错误
    console.error('响应错误:', error);
    
    // 处理401未授权错误（登录过期）
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录');
      // 清除本地存储的登录信息
      localStorage.removeItem('jwtToken');
      sessionStorage.removeItem('jwtToken');
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');
      // 跳转到登录页
      window.location.href = '/auth/login';
    } else {
      ElMessage.error(error.message || '网络错误，请稍后重试');
    }
    
    return Promise.reject(error);
  }
);

export default service;