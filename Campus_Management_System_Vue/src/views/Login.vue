<template>
  <div class="font-inter bg-gray-50 min-h-screen flex flex-col">
    <!-- 登录界面 -->
    <main class="flex-grow flex items-center justify-center px-4 py-8">
      <div
        class="login-card w-full max-w-md transform transition-all duration-300 hover:shadow-lg"
      >
        <!-- 标题与图标水平排列 -->
        <div class="text-center mb-6 flex items-center justify-center">
          <div class="icon-container mr-3">
            <i class="fa fa-university text-primary text-3xl"></i>
          </div>
          <p class="text-2xl font-bold text-gray-800">教室预约预约管理系统</p>
        </div>

        <p class="subtitle text-gray-500 text-center mt-1 mb-8">请选择身份并输入账号密码</p>

        <!-- 身份选择 -->
        <div class="identity-grid mb-8">
          <div
            class="identity-option scale-hover"
            :class="{ 'identity-active': selectedIdentity === 'user' }"
            @click="selectIdentity('user')"
            role="button"
            tabindex="0"
          >
            <i
              class="fa fa-user-circle-o text-xl mb-1"
              :class="selectedIdentity === 'user' ? 'text-primary' : 'text-gray-500'"
            ></i>
            <span class="text-sm font-medium">普通用户</span>
          </div>
          <div
            class="identity-option scale-hover"
            :class="{ 'identity-active': selectedIdentity === 'teach_sec' }"
            @click="selectIdentity('teach_sec')"
            role="button"
            tabindex="0"
          >
            <i
              class="fa fa-briefcase text-xl mb-1"
              :class="selectedIdentity === 'teach_sec' ? 'text-primary' : 'text-gray-500'"
            ></i>
            <span class="text-sm font-medium">教秘</span>
          </div>
          <div
            class="identity-option scale-hover"
            :class="{ 'identity-active': selectedIdentity === 'class_mgr' }"
            @click="selectIdentity('class_mgr')"
            role="button"
            tabindex="0"
          >
            <i
              class="fa fa-cog text-xl mb-1"
              :class="selectedIdentity === 'class_mgr' ? 'text-primary' : 'text-gray-500'"
            ></i>
            <span class="text-sm font-medium">教室管理员</span>
          </div>
          <div
            class="identity-option scale-hover"
            :class="{ 'identity-active': selectedIdentity === 'super_admin' }"
            @click="selectIdentity('super_admin')"
            role="button"
            tabindex="0"
          >
            <i
              class="fa fa-shield text-xl mb-1"
              :class="selectedIdentity === 'super_admin' ? 'text-primary' : 'text-gray-500'"
            ></i>
            <span class="text-sm font-medium">超级管理员</span>
          </div>
        </div>

        <form class="form-space" @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label sr-only">用户编号</label>
            <div class="input-wrapper">
              <div class="input-icon">
                <i class="fa fa-user text-gray-400"></i>
              </div>
              <input
                type="text"
                v-model="username"
                class="form-input"
                placeholder="请输入用户编号"
                required
                :disabled="isLoading"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label sr-only">密码</label>
            <div class="input-wrapper">
              <div class="input-icon">
                <i class="fa fa-lock text-gray-400"></i>
              </div>
              <input
                type="password"
                v-model="password"
                class="form-input"
                placeholder="请输入密码"
                required
                :disabled="isLoading"
              />
            </div>
          </div>

          <div class="flex items-center justify-between mt-2 mb-4">
            <div class="flex items-center">
              <input 
                type="checkbox" 
                id="remember-me" 
                v-model="rememberMe" 
                class="checkbox"
                :disabled="isLoading"
              />
              <label for="remember-me" class="checkbox-label">记住我</label>
            </div>
          </div>

          <button type="submit" class="login-btn mt-4 scale-hover" :disabled="isLoading">
            <span v-if="!isLoading">登录系统</span>
            <span v-if="isLoading"> <i class="fa fa-spinner fa-spin mr-1"></i>登录中... </span>
          </button>
        </form>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="py-4 px-4 text-center text-gray-500 text-sm">
      <p>© 2025 教室预约管理系统 版权所有</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from '@/utils/axios';
import { setToken, setUserInfo, getToken } from '@/utils/auth.js';

// 路由实例
const router = useRouter();

// 响应式状态
const selectedIdentity = ref('user');
const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const isLoading = ref(false);

// 身份映射为API所需类型
const mapIdentityToApiType = computed(() => {
  const identityMap = {
    'user': 'user',
    'teach_sec': 'teach_sec',
    'class_mgr': 'class_mgr',
    'super_admin': 'super_admin'
  };
  return identityMap[selectedIdentity.value] || '';
});

// 表单验证规则
const validateForm = () => {
  // 验证身份选择
  if (!mapIdentityToApiType.value) {
    ElMessage.warning('请选择有效的用户身份');
    return false;
  }

  // 验证用户名
  if (!username.value.trim()) {
    ElMessage.warning('请输入用户编号');
    return false;
  }
  if (username.value.length < 3) {
    ElMessage.warning('用户编号长度不能少于3位');
    return false;
  }

  // 验证密码
  if (!password.value.trim()) {
    ElMessage.warning('请输入密码');
    return false;
  }
  if (password.value.length < 6) {
    ElMessage.warning('密码长度不能少于6位');
    return false;
  }

  return true;
};

// 响应数据验证规则 - 兼容多种后端格式
const validateResponse = (response) => {
  // 验证响应存在性
  if (!response) {
    throw new Error('未获取到服务器响应');
  }

  // 验证响应数据存在性（兼容不同格式）
  const responseData = response.data || response;
  if (typeof responseData !== 'object' || responseData === null) {
    throw new Error('服务器返回数据格式错误，预期为对象');
  }

  // 灵活验证状态标识（处理不同后端格式）
  let isSuccess = false;
  let codeValue = null;
  
  // 检查可能的状态码字段
  if (responseData.code !== undefined) {
    codeValue = responseData.code;
    isSuccess = codeValue === 200 || codeValue === '200';
  } else if (responseData.success !== undefined) {
    // 兼容success: true/false格式
    isSuccess = responseData.success;
    codeValue = isSuccess ? 200 : 500;
  } else if (responseData.status !== undefined) {
    // 兼容status字段格式
    codeValue = responseData.status;
    isSuccess = codeValue === 200 || codeValue === 'success';
  } else {
    // 如果没有任何状态标识，尝试通过是否存在token判断
    isSuccess = !!responseData.token || !!responseData.data?.token;
    codeValue = isSuccess ? 200 : 500;
  }

  // 验证成功状态
  if (!isSuccess) {
    throw new Error(`服务器返回非成功状态：code=${codeValue}, msg=${responseData.msg || responseData.message || '无消息'}`);
  }

  // 统一数据路径（兼容不同格式）
  const data = responseData.data || responseData;

  // 验证token存在性
  if (!data.token) {
    throw new Error('服务器返回数据中缺少token字段');
  }

  // 验证账号信息存在性
  if (!data.account && !data.username) {
    throw new Error('服务器返回数据中缺少账号信息（account或username）');
  }

  // 返回标准化的数据结构，便于后续处理
  return {
    code: codeValue,
    msg: responseData.msg || responseData.message || '操作成功',
    data: data
  };
};

// 存储验证规则
const validateStorage = (tokenKey = 'token', userInfoKey = 'userInfo') => {
  const storageType = rememberMe.value ? localStorage : sessionStorage;
  
  // 验证Token存储
  const storedToken = storageType.getItem(tokenKey);
  if (!storedToken) {
    throw new Error(`Token存储失败，${rememberMe.value ? 'localStorage' : 'sessionStorage'}中未找到${tokenKey}`);
  }
  
  // 验证用户信息存储
  const storedUserInfo = storageType.getItem(userInfoKey);
  if (!storedUserInfo) {
    throw new Error(`用户信息存储失败，${rememberMe.value ? 'localStorage' : 'sessionStorage'}中未找到${userInfoKey}`);
  }
  
  // 验证用户信息格式
  try {
    const userInfo = JSON.parse(storedUserInfo);
    if (!userInfo.username || !userInfo.identity) {
      throw new Error('用户信息缺少必要字段');
    }
  } catch (e) {
    throw new Error(`用户信息解析失败：${e.message}`);
  }
  
  return true;
};

// 登录处理函数
const handleLogin = async () => {
  console.log('=== 开始登录流程 ===');
  isLoading.value = true;

  try {
    // 1. 表单验证
    console.log('开始表单验证');
    if (!validateForm()) {
      console.log('表单验证失败，终止登录流程');
      return;
    }
    console.log('表单验证通过');

    

    // 3. 真实接口请求
    console.log('发起登录请求：', {
      url: '/auth/login',
      params: {
        user_type: mapIdentityToApiType.value,
        account: username.value,
        password: '******' // 密码脱敏
      }
    });

    const response = await axios.post('/auth/login', {
      user_type: mapIdentityToApiType.value,
      account: username.value,
      password: password.value,
    });

    // 打印原始响应，便于调试格式问题
    console.log('服务器原始响应:', response);

    // 4. 响应数据验证
    console.log('开始响应数据验证');
    const normalizedResponse = validateResponse(response);
    console.log('响应数据验证通过，标准化后的数据:', normalizedResponse);

    // 5. 存储Token和用户信息（使用标准化后的数据）
    console.log('开始存储认证信息');
    setToken(normalizedResponse.data.token, rememberMe.value);
    setUserInfo({
      username: normalizedResponse.data.account || normalizedResponse.data.username,
      identity: mapIdentityToApiType.value,
      name: normalizedResponse.data.name || '未知用户',
      college: normalizedResponse.data.college || '未知学院'
    }, rememberMe.value);

    // 6. 存储结果验证
    console.log('开始存储结果验证');
    validateStorage();
    console.log('存储结果验证通过');

    // 7. 执行跳转
    const redirectPath = {
      'user': '/user/dashboard',
      'teach_sec': '/sec/listLogs',
      'class_mgr': '/mgr/classrooms',
      'super_admin': '/admin/system'
    };
    const targetPath = redirectPath[mapIdentityToApiType.value] || '/';
    console.log('准备跳转到：', targetPath);

    // 验证目标路径有效性
    if (!targetPath || typeof targetPath !== 'string' || targetPath.trim() === '') {
      throw new Error(`无效的跳转路径：${targetPath}`);
    }

    await router.push(targetPath);
    ElMessage.success('登录成功');
    console.log('跳转完成，登录流程结束');

  } catch (error) {
    console.error('登录流程错误：', error);
    let errorMsg = '登录失败，请重试';

    // 精细化错误处理
    if (error.message.includes('服务器返回')) {
      errorMsg = error.message;
    } else if (error.message.includes('表单验证')) {
      errorMsg = error.message;
    } else if (error.message.includes('存储失败') || error.message.includes('解析失败')) {
      errorMsg = `数据处理错误：${error.message}`;
    } else if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMsg = '账号或密码错误';
          break;
        case 404:
          errorMsg = '登录接口不存在，请检查服务';
          break;
        case 500:
          errorMsg = '服务器内部错误，请联系管理员';
          break;
        default:
          errorMsg = `服务器错误 (状态码: ${error.response.status})`;
      }
    } else if (error.request) {
      errorMsg = '网络异常，无法连接服务器';
    } else {
      errorMsg = `登录失败: ${error.message || '未知错误'}`;
    }

    ElMessage.error(errorMsg);
  } finally {
    isLoading.value = false;
    console.log('=== 登录流程结束 ===');
  }
};

// 选择身份方法
const selectIdentity = (identity) => {
  if (isLoading.value) return;
  selectedIdentity.value = identity;
  username.value = '';
  password.value = '';
};
</script>
    
<style>
:root {
  --primary: #165dff;
  --gray-50: #f5f7fa;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --white: #ffffff;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--gray-50);
}

.font-inter {
  font-family: "Inter", system-ui, sans-serif;
}

.bg-gray-50 {
  background-color: var(--gray-50);
  min-height: 100vh;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-grow {
  flex-grow: 1;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.text-center {
  text-align: center;
}

.icon-container {
  width: 4rem;
  height: 4rem;
  background-color: rgba(22, 93, 255, 0.1);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-sm {
  font-size: 0.875rem;
}

.text-2xl {
  font-size: 1.5rem;
}

.font-bold {
  font-weight: 700;
}

.font-medium {
  font-weight: 500;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mr-3 {
  margin-right: 0.75rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.login-card {
  background-color: var(--white);
  border-radius: 0.75rem;
  box-shadow: var(--shadow);
  padding: 2rem;
}

.subtitle {
  color: var(--gray-500);
}

.identity-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.identity-option {
  border: 2px solid var(--gray-200);
  border-radius: 0.5rem;
  padding: 0.75rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.identity-option:hover {
  border-color: rgba(22, 93, 255, 0.3);
}

.identity-active {
  border-color: var(--primary);
  background-color: rgba(22, 93, 255, 0.1);
}

.text-primary {
  color: var(--primary);
}

.text-gray-500 {
  color: var(--gray-500);
}

.text-gray-800 {
  color: var(--gray-800);
}

.form-space {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  margin-bottom: 0.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 0.25rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:disabled {
  background-color: var(--gray-50);
  cursor: not-allowed;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

.checkbox {
  width: 1rem;
  height: 1rem;
  color: var(--primary);
  border-color: var(--gray-300);
  border-radius: 0.25rem;
}

.checkbox-label {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-700);
}

.login-btn {
  width: 100%;
  background-color: var(--primary);
  color: white;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.login-btn:hover {
  background-color: #0e4bdb;
}

.login-btn:disabled {
  background-color: #94bfff;
  cursor: not-allowed;
}

.scale-hover {
  transition: transform 0.2s ease;
}

.scale-hover:hover {
  transform: scale(1.02);
}

@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
</style>
    