<template>
  <button @click="fetchData">通过实例获取数据（推荐）</button>
  <button @click="fetchData1">手动配置获取数据</button>
  <button @click="fetchData2">使用fetch API获取数据</button>
</template>

<script setup>
  import request from "../utils/axios"; // 导入配置好的axios实例
  import axios from "axios"; // 导入原始axios（方式二需要）
  import { ElMessage } from "element-plus";
  import { getToken } from "../utils/auth";

  // 方式一：使用配置好的axios实例（自动携带token）
  const fetchData = async () => {
    try {
      // 注意：如果axios实例配置了baseURL，这里应该用相对路径
      // 例如baseURL是'/api'，则请求地址应为'/getId'（配合代理转发）
      const response = await request.get("http://localhost:8081/getId");
      console.log("方式一返回数据：", response.data);
      ElMessage.success("方式一：请求成功");
    } catch (error) {
      console.error("方式一请求失败：", error);
      ElMessage.error("方式一：请求失败，请重试");
    }
  };

  // 方式二：手动配置axios（不使用实例，手动添加headers）
  const fetchData1 = async () => {
    // 必须声明为async才能使用await
    try {
      // 1. 获取token
      const token = getToken();
      // 2. 手动构建headers（注意格式：通常是Bearer + 空格 + token）
      const headers = token ? { Authorization: `${token}` } : {};

      // 3. 发送请求（需导入原始axios）
      const response = await axios.get("http://localhost:8081/getId", {
        headers: headers,
      });
      console.log("方式二返回数据：", response.data);
      ElMessage.success("方式二：请求成功");
    } catch (error) {
      console.error("方式二请求失败：", error);
      ElMessage.error("方式二：请求失败");
    }
  };

  // 方式三：使用原生fetch API（手动处理headers）
  const fetchData2 = async () => {
    try {
      const token = getToken();
      const response = await fetch("http://localhost:8081/getId", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // 手动添加token到请求头
          ...(token && { Authorization: `${token}` }),
        },
      });

      if (!response.ok) throw new Error("网络请求失败");
      const data = await response.text;
      console.log("方式三返回数据：", data);
      ElMessage.success("方式三：请求成功");
    } catch (error) {
      console.error("方式三请求失败：", error);
      ElMessage.error("方式三：请求失败");
    }
  };
</script>
