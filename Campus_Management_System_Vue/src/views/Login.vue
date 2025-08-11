<template>
  <div class="font-inter bg-gray-50 min-h-screen flex flex-col">
    <!-- 登录界面 -->
    <main class="flex-grow flex items-center justify-center px-4 py-8">
      <div
        class="login-card w-full max-w-md transform transform transition-all duration-300 hover:shadow-lg"
      >
        <!-- 标题与图标水平排列 -->
        <div class="text-center mb-6 flex items-center justify-center">
          <div class="icon-container mr-3">
            <i class="fa fa-university text-primary text-3xl"></i>
          </div>
          <p class="text-2xl font-bold text-gray-800">教室预约管理系统</p>
        </div>

        <p class="subtitle text-gray-500 text-center mt-1 mb-8">请选择身份并输入账号密码</p>

        <!-- 身份选择 -->
        <div class="identity-grid mb-8">
          <div
            class="identity-option scale-hover"
            :class="{ 'identity-active': selectedIdentity === 'student' }"
            @click="selectIdentity('user')"
          >
            <i
              class="fa fa-user-circle-o text-xl mb-1"
              :class="selectedIdentity === 'student' ? 'text-primary' : 'text-gray-500'"
            ></i>
            <span class="text-sm font-medium">学生</span>
          </div>
          <div
            class="identity-option scale-hover"
            :class="{ 'identity-active': selectedIdentity === 'secretary' }"
            @click="selectIdentity('teach_sec')"
          >
            <i
              class="fa fa-briefcase text-xl mb-1"
              :class="selectedIdentity === 'secretary' ? 'text-primary' : 'text-gray-500'"
            ></i>
            <span class="text-sm font-medium">教秘</span>
          </div>
          <div
            class="identity-option scale-hover"
            :class="{ 'identity-active': selectedIdentity === 'classroomAdmin' }"
            @click="selectIdentity('class_mgr')"
          >
            <i
              class="fa fa-cog text-xl mb-1"
              :class="selectedIdentity === 'classroomAdmin' ? 'text-primary' : 'text-gray-500'"
            ></i>
            <span class="text-sm font-medium">教室管理员</span>
          </div>
          <div
            class="identity-option scale-hover"
            :class="{ 'identity-active': selectedIdentity === 'superAdmin' }"
            @click="selectIdentity('super_admin')"
          >
            <i
              class="fa fa-shield text-xl mb-1"
              :class="selectedIdentity === 'superAdmin' ? 'text-primary' : 'text-gray-500'"
            ></i>
            <span class="text-sm font-medium">超级管理员</span>
          </div>
        </div>

        <form class="form-space" @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label"> </label>
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
                autocomplete="new-password"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label"> </label>
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
                autocomplete="new-password"
              />
            </div>
          </div>

          <div class="flex items-center justify-between mt-2 mb-4">
            <div class="flex items-center">
              <input type="checkbox" id="remember-me" v-model="rememberMe" class="checkbox" />
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

<script>
  import axios from "axios";
  import { ElMessage } from "element-plus";

  export default {
    data() {
      return {
        selectedIdentity: "user",
        username: "",
        password: "",
        rememberMe: false,
        isLoading: false,
      };
    },
    methods: {
      selectIdentity(identity) {
        this.selectedIdentity = identity;
        // 切换身份时清空输入框
        this.username = "";
        this.password = "";
      },
      // 填充测试账号
      fillTestAccount(account, pwd) {
        this.username = account;
        this.password = pwd;
      },
      async handleLogin() {
        // 表单验证
        if (!this.username.trim()) {
          ElMessage.warning("请输入用户编号");
          return;
        }

        if (!this.password.trim()) {
          ElMessage.warning("请输入密码");
          return;
        }
        // 临时测试账号逻辑（联调时需移除）
        // 临时测试账号：教秘身份的测试账号，无需后端验证直接登录
        // if (this.selectedIdentity === 'secretary' && this.username === 'a' && this.password === '123456') {
        //   this.isLoading = true;
        //   try {
        //     // 模拟登录成功
        //     const storage = this.rememberMe ? localStorage : sessionStorage;
        //     storage.setItem('jwtToken', 'test_secretary_token');

        //     // 存储用户信息
        //     storage.setItem('currentUser', JSON.stringify({
        //       username: this.username,
        //       identity: this.selectedIdentity,
        //       name: '测试教秘',
        //       college: '计算机学院'
        //     }));

        //     ElMessage.success('登录成功');
        //     this.$router.push('/sec/listLogs');
        //   } catch (error) {
        //     ElMessage.error('登录失败');
        //   } finally {
        //     this.isLoading = false;
        //   }
        //   return;
        // }

        // 正常登录流程
        this.isLoading = true;
        console.log("user_type:", this.mapIdentityToApiType());
        console.log("account:", this.username);
        console.log("password:", this.password);
        try {
          // 调用登录接口
          const response = await axios.post("http://localhost:8080/auth/login", {
            user_type: this.mapIdentityToApiType(),
            account: this.username,
            password: this.password,
          });
          console.log("response:", response.data);
          const code = response.data.code;
          const message = response.data.msg;
          const data = response.data.data;

          if (code === 200) {
            // 存储JWT令牌
            const storage = this.rememberMe ? localStorage : sessionStorage;
            storage.setItem("jwtToken", data.token); // 确保与后端token字段名一致
            storage.setItem(
              "currentUser",
              JSON.stringify({
                username: data.name, // 从后端返回的userInfo中获取
                identity: this.selectedIdentity,
                name: data.name, // 匹配后端返回的姓名字段
                college: data.college || "", // 兼容可能不存在的字段
              })
            );

            ElMessage.success(message || "登录成功");

            // 根据身份跳转对应页面

            const redirectMap = {
              secretary: "/sec/listLogs", // 教秘跳转到审核工作台接口对应的页面
              classroomAdmin: "/mgr/selectClassroom", // 教室管理员跳转到教室分页筛选接口对应的页面
              superAdmin: "/admin/listUsers", // 超级管理员跳转到用户列表接口对应的页面
              student: "/user/selectClassroom", // 学生跳转到查询教室接口对应的页面
            };
            // 确保路由存在再跳转
            const targetRoute = redirectMap[this.selectedIdentity];
            if (this.$router.resolve(targetRoute).route) {
              this.$router.push(targetRoute);
            } else {
              ElMessage.error("未配置该角色的跳转页面");
            }
          } else {
            ElMessage.error(message || "登录失败，请检查账号密码");
          }
        } catch (error) {
          console.error("登录请求失败:", error);
          const errorMsg = error.response?.data?.message || "网络错误，请稍后重试";
          ElMessage.error(errorMsg);
        } finally {
          this.isLoading = false;
        }
      },
      // 映射前端身份值到接口要求的user_type
      mapIdentityToApiType() {
        const mapping = {
          student: "user",
          secretary: "teach_sec",
          classroomAdmin: "class_mgr",
          superAdmin: "super_admin",
        };
        return mapping[this.selectedIdentity] || "user";
      },
    },
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
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
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

  .text-xs {
    font-size: 0.75rem;
  }

  .text-xl {
    font-size: 1.25rem;
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

  .mt-1 {
    margin-top: 0.25rem;
  }
  .mt-2 {
    margin-top: 0.5rem;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
  .mt-8 {
    margin-top: 2rem;
  }
  .mb-1 {
    margin-bottom: 0.25rem;
  }
  .mb-2 {
    margin-bottom: 0.5rem;
  }
  .mb-3 {
    margin-bottom: 0.75rem;
  }
  .mb-4 {
    margin-bottom: 1rem;
  }
  .mb-6 {
    margin-bottom: 1.5rem;
  }
  .mb-8 {
    margin-bottom: 2rem;
  }
  .mr-1 {
    margin-right: 0.25rem;
  }
  .mr-2 {
    margin-right: 0.5rem;
  }
  .mr-3 {
    margin-right: 0.75rem;
  }
  .px-2 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .px-3 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .py-1 {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }
  .py-2 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  .py-3 {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
  .py-4 {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
  .py-8 {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }

  .login-card {
    background-color: var(--white);
    border-radius: 0.75rem;
    box-shadow: var(--shadow);
    padding: 2rem;
    width: 100%;
    max-width: 400px; /* 固定最大宽度 */
  }

  .title {
    font-weight: 700;
    color: var(--gray-800);
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

  /* 动画和交互效果 */
  .scale-hover {
    transition: transform 0.2s ease;
  }
  .scale-hover:hover {
    transform: scale(1.02);
  }

  /* 导入字体 */
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
</style>
