/**
 * 认证工具模块
 * 统一管理用户token的存储、获取和清除
 */

const TOKEN_KEY = 'jwtToken';

/**
 * 设置token到localStorage或sessionStorage
 * @param {string} token - JWT token
 * @param {boolean} remember - 是否记住（true使用localStorage，false使用sessionStorage）
 */
export function setToken(token, remember = false) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
}

/**
 * 获取token
 * @returns {string|null} - 返回token或null
 */
export function getToken() {
  // 优先从sessionStorage获取，再从localStorage获取
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

/**
 * 移除token
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
export function isLoggedIn() {
  return !!getToken();
}