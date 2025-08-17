/**
 * 认证相关工具函数
 * 统一处理Token和用户信息的存储、获取和删除
 */

// Token存储键名
const TOKEN_KEY = 'token';
// 用户信息存储键名
const USER_INFO_KEY = 'userInfo';

/**
 * 设置Token
 * @param {string} token - 要存储的Token
 * @param {boolean} remember - 是否持久化存储（true: localStorage, false: sessionStorage）
 */
export function setToken(token, remember = false) {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * 获取Token
 * @returns {string|null} - 存储的Token或null
 */
export function getToken() {
  // 先查sessionStorage，再查localStorage
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || null;
}

/**
 * 移除Token
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

/**
 * 设置用户信息
 * @param {object} userInfo - 用户信息对象
 * @param {boolean} remember - 是否持久化存储
 */
export function setUserInfo(userInfo, remember = false) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
}

/**
 * 获取用户信息
 * @returns {object|null} - 用户信息对象或null
 */
export function getUserInfo() {
  const userStr = sessionStorage.getItem(USER_INFO_KEY) || localStorage.getItem(USER_INFO_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('解析用户信息失败:', e);
      return null;
    }
  }
  return null;
}

/**
 * 移除用户信息
 */
export function removeUserInfo() {
  localStorage.removeItem(USER_INFO_KEY);
  sessionStorage.removeItem(USER_INFO_KEY);
}

/**
 * 清除所有认证信息（退出登录用）
 */
export function clearAuthInfo() {
  removeToken();
  removeUserInfo();
}
    