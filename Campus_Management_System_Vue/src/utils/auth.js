// src/utils/auth.js
const TOKEN_KEY = "token";
const USER_INFO_KEY = "userInfo";

/**
 * 设置Token
 * @param {string} token - 要存储的Token
 * @param {boolean} remember - 是否持久化存储（true: localStorage, false: sessionStorage）
 */

/**
 * 获取Token
 * @returns {string|null} Token值或null
 */
// src/utils/auth.js 示例代码
export const setToken = (token, rememberMe) => {
  if (rememberMe) {
    // 勾选"记住我"，存到localStorage（持久化）
    localStorage.setItem("auth_token", token);
    // 同时存储rememberMe状态，供getToken判断
    localStorage.setItem("remember_me", "true");
  } else {
    // 不勾选，存到sessionStorage（会话级，关闭标签页失效）
    sessionStorage.setItem("auth_token", token);
    sessionStorage.setItem("remember_me", "false");
  }
};

export const getToken = () => {
  // 先判断登录时的rememberMe状态，决定从哪里读取token
  const rememberMe =
    localStorage.getItem("remember_me") === "true" ||
    sessionStorage.getItem("remember_me") === "true";

  return rememberMe ? localStorage.getItem("auth_token") : sessionStorage.getItem("auth_token");
};

/**
 * 设置用户信息
 * @param {Object} userInfo - 用户信息对象
 * @param {boolean} remember - 是否持久化存储
 */
export function setUserInfo(userInfo, remember = false) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
}

/**
 * 获取用户信息
 * @returns {Object|null} 用户信息对象或null
 */
export function getUserInfo() {
  const info = localStorage.getItem(USER_INFO_KEY) || sessionStorage.getItem(USER_INFO_KEY);
  return info ? JSON.parse(info) : null;
}

/**
 * 清除认证信息
 */
export function clearAuthInfo() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
  sessionStorage.removeItem(USER_INFO_KEY);
}
