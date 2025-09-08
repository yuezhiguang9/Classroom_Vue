import { ElMessage } from "element-plus";
import router from "../router";
import axios from "axios";
import { getToken } from "./auth";

const request = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 30000, // 后台接口超时时间设置
});

// request 拦截器
// 可以自请求发送前对请求做一些处理
request.interceptors.request.use(
  (config) => {
    config.headers["Content-Type"] = "application/json;charset=utf-8";
    // 统一添加token
    const token = getToken();
    if (token) {
      // 如果后端需要Bearer，可改为 `Bearer ${token}`
      config.headers["Authorization"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// response 拦截器
// 可以在接口响应后统一处理结果
request.interceptors.response.use(
  (response) => {
    // 兼容服务端返回的字符串数据
    let res = response.data;
    if (response.config.responseType === "blob") {
      return res;
    }
    if (typeof res === "string") {
      res = res ? JSON.parse(res) : res;
    }
    // 当权限验证不通过的时候给出提示
    if (res && (res.code === 401 || res.code === "401")) {
      ElMessage.error(res.msg || "登录已过期，请重新登录");
      removeToken();
      router.push("/login");
      return Promise.reject(new Error(res.msg || "Unauthorized"));
    }
    return res;
  },
  (error) => {
    // 处理HTTP状态码401/403等
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      ElMessage.error("登录已过期或无权限，请重新登录");
      removeToken();
      router.push("/login");
    } else {
      console.log("err", error);
    }
    return Promise.reject(error);
  }
);

export default request;
