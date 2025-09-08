// 项目常量定义
export const APP_NAME = 'Campus Management System';
export const VERSION = '0.0.0';
// 扩展 ImportMeta.env 接口，添加 VITE_API_BASE_URL 属性
declare global {
  interface ImportMeta {
    env: {
      MODE: string;
      VITE_API_BASE_URL: string;
    };
  }
}
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Vite构建常量
export const BUILD_DATE = new Date().toISOString();
declare global {
  interface ImportMeta {
    env: {
      MODE: string;
      VITE_API_BASE_URL: string;
    };
      MODE: string;
    }
  }

export const NODE_ENV = import.meta.env.MODE || 'development';

// 用户角色常量
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  TEACH_SEC: 'teach_sec'
} as const;

// 路由常量
export const ROUTE_NAMES = {
  LOGIN: 'Login',
  HOME: 'Home',
  USER_SYSTEM: 'UserSystem',
  CLASSROOM_QUERY: 'ClassroomQuery',
  MY_APPOINTMENTS: 'MyAppointments'
} as const;