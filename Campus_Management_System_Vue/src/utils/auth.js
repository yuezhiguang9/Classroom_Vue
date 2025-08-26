// src/utils/auth.js
const TOKEN_KEY = 'token';
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
 * @returns {string|null} Token值或null
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

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