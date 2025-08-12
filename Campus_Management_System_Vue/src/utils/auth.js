// src/utils/auth.js

/**
 * 获取存储的 JWT Token
 * 优先从 localStorage 获取（记住我），再从 sessionStorage 获取（临时登录）
 * @returns {string|null} token值或null
 */
export function getToken() {
    // 先检查localStorage
    const localToken = localStorage.getItem('jwtToken')
    if (localToken) {
      return localToken
    }
    
    // 再检查sessionStorage
    const sessionToken = sessionStorage.getItem('jwtToken')
    if (sessionToken) {
      return sessionToken
    }
    
    // 都没有则返回null
    return null
  }
  
  /**
   * 清除存储的 Token
   */
  export function removeToken() {
    localStorage.removeItem('jwtToken')
    sessionStorage.removeItem('jwtToken')
  }
  
  /**
   * 存储 Token
   * @param {string} token - JWT令牌
   * @param {boolean} remember - 是否持久化存储（true存localStorage，false存sessionStorage）
   */
  export function setToken(token, remember = false) {
    if (remember) {
      localStorage.setItem('jwtToken', token)
      sessionStorage.removeItem('jwtToken') // 清除可能存在的临时存储
    } else {
      sessionStorage.setItem('jwtToken', token)
      localStorage.removeItem('jwtToken') // 清除可能存在的持久化存储
    }
  }