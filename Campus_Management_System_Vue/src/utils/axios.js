// src/utils/axios.js（若不存在需创建）
import axios from "axios";
import { ElMessage } from "element-plus";
import router from "../router";

// 配置后端接口基础地址（与后端一致）
const instance = axios.create({
  baseURL: "/api", // 或从环境变量获取：import.meta.env.VITE_API_BASE_URL
  timeout: 5000,
});

// 请求拦截器：自动添加JWT令牌
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
  if (token) {
    config.headers.Authorization = `${token}`; // 与后端约定的令牌格式
  }
  return config;
});

// 响应拦截器：处理令牌失效
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      ElMessage.error("登录已过期，请重新登录");
      // 清除失效的令牌和用户信息
      localStorage.removeItem("jwtToken");
      sessionStorage.removeItem("jwtToken");
      router.push("/auth/login");
    }
    return Promise.reject(error);
  }
);

export default instance;
