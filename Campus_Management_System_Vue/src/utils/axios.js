// src/utils/axios.js
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { getToken } from './auth'; // 引入统一的 token 获取工具

// 创建 axios 实例，明确后端端口
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
  timeout: 5000 // 请求超时时间
});

// 请求拦截器 - 手动配置 token（参考 test.vue 方式二）
service.interceptors.request.use(
  config => {
    // 使用 auth.js 中的 getToken 统一获取 token（与方式二逻辑一致）
    const token = getToken();
    if (token) {
      // 严格按照 Bearer 认证格式设置（空格不可省略）
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    console.log('后端响应:', res);
    // 建议恢复状态码校验，否则无法捕获业务错误
    if (res.code !== 200) {
      ElMessage.error(res.message || '操作失败');
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res;
  },
  error => {
    console.error('响应错误:', error);
    
    // 处理401未授权错误（登录过期）
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录');
      // 清除认证信息（建议使用 auth.js 的 clearAuthInfo 方法统一处理）
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