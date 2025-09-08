/**
 * 认证工具模块
 * 统一管理用户token的存储、获取和清除
 */

const TOKEN_KEY = "auth_token";
const USER_INFO_KEY = "currentUser";
const REMEMBER_ME_KEY = "remember_me"; // 统一rememberMe的键名

/**
 * 设置token到localStorage或sessionStorage
 * @param {string} token - JWT token
 * @param {boolean} rememberMe - 是否记住（true使用localStorage，false使用sessionStorage）
 */
export const setToken = (token, rememberMe) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(REMEMBER_ME_KEY, rememberMe.toString()); // 存储到对应的storage中
};

/**
 * 清除token及rememberMe状态
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
  sessionStorage.removeItem(REMEMBER_ME_KEY);
};

/**
 * 判断是否已登录
 * @returns {boolean} - 是否登录
 */
export const isLoggedIn = () => {
  const token = getToken();
  // 实际项目中建议补充token过期判断
  return !!token;
};

/**
 * 获取token
 * @returns {string|null} - 返回token或null
 */
export const getToken = () => {
  // 先检查localStorage中是否有remember_me=true（持久化登录）
  const isLocalRemember = localStorage.getItem(REMEMBER_ME_KEY) === "true";
  if (isLocalRemember) {
    return localStorage.getItem(TOKEN_KEY);
  }
  
  // 否则检查sessionStorage（会话级登录）
  const isSessionRemember = sessionStorage.getItem(REMEMBER_ME_KEY) === "false";
  if (isSessionRemember) {
    return sessionStorage.getItem(TOKEN_KEY);
  }
  
  // 都没有则返回null
  return null;
};

/**
 * 设置用户信息
 * @param {Object} userInfo - 用户信息对象
 * @param {boolean} rememberMe - 是否持久化存储（建议与setToken的rememberMe保持一致）
 */
export function setUserInfo(userInfo, rememberMe) {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
}

/**
 * 获取用户信息
 * @returns {Object|null} 用户信息对象或null
 */
export function getUserInfo() {
  // 优先从当前登录对应的storage中读取
  const isLocalRemember = localStorage.getItem(REMEMBER_ME_KEY) === "true";
  const storage = isLocalRemember ? localStorage : sessionStorage;
  
  const info = storage.getItem(USER_INFO_KEY);
  return info ? JSON.parse(info) : null;
}

/**
 * 清除所有认证信息（token+用户信息+rememberMe状态）
 */
export function clearAuthInfo() {
  // 直接调用removeToken清除token和rememberMe
  removeToken();
  // 清除用户信息
  localStorage.removeItem(USER_INFO_KEY);
  sessionStorage.removeItem(USER_INFO_KEY);
}
