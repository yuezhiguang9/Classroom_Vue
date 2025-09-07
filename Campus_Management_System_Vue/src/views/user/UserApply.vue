<template>
  <div class="common-layout">
    <!-- 标题及描述 -->
    <div class="page-header">
      <h2>教室预约</h2>
      <p>查找并预约合适的教室用于教学、会议或活动</p>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-card-container">
      <el-card class="stats-card" v-loading="statsLoading">
        <div class="stats-item">
          <span class="stats-label">本周我的预约</span>
          <span class="stats-value">{{ week_total }}</span>
          <span class="status-tag yu">
            <el-icon><ChatDotSquare /></el-icon>
            {{ week_total > 0 ? "安排有序" : "暂无预约" }}
          </span>
          <i class="el-icon-calendar-check"></i>
        </div>
      </el-card>
      <el-card class="stats-card" v-loading="statsLoading">
        <div class="stats-item">
          <span class="stats-label">待审批预约</span>
          <span class="stats-value">{{ my_pending }}</span>
          <span class="status-tag pending">
            <el-icon><Loading /></el-icon>等待处理
          </span>
          <i class="el-icon-loading"></i>
        </div>
      </el-card>
    </div>

    <!-- 我的预约记录表格（带分页） -->
    <div class="reservation-table-container">
      <h3>我的预约记录 (共 {{ total }} 条)</h3>

      <!-- 表格 -->
      <el-table
        :data="reservationList"
        border
        style="width: 100%"
        v-loading="tableLoading"
        empty-text="暂无预约记录"
        :key="tableKey"
      >
        <el-table-column prop="apply_id" label="申请编号" />
        <el-table-column prop="classroom" label="教室">
          <template #default="scope">
            {{ `${scope.row.building_name} ${scope.row.room_num}` }}
          </template>
        </el-table-column>

        <el-table-column prop="date" label="日期" />
        <el-table-column prop="week" label="周次" />
        <el-table-column prop="period" label="节次">
          <template #default="scope">
            <div v-html="scope.row.period"></div>
          </template>
        </el-table-column>
        <el-table-column prop="purpose" label="用途" />
        <el-table-column prop="book_time" label="申请时间" align="center" />
        <el-table-column prop="apply_status" label="状态">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.apply_status)">
              {{ scope.row.apply_status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <!-- 根据can_cancel参数显示不同操作状态 -->
            <el-button
              type="text"
              danger
              @click="handleCancel(scope.row)"
              :disabled="isLoading[scope.row.apply_id]"
              v-if="scope.row.can_cancel === 0"
            >
              取消
            </el-button>

            <span class="disabled-text" v-else-if="scope.row.can_cancel === 1"> 不可取消 </span>

            <span class="canceled-text" v-else-if="scope.row.can_cancel === 2"> 已取消 </span>

            <span v-else>&nbsp;</span>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页控件 -->
      <div class="pagination-container" style="margin-top: 16px; text-align: right">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="page"
          :page-sizes="[5, 10, 15]"
          :page-size="size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, reactive } from "vue";
  import { ElMessage, ElMessageBox, ElTag, ElIcon } from "element-plus";
  import { ChatDotSquare, Loading } from "@element-plus/icons-vue";
  import axios from "axios";
  // 正确示例（按需导入需要的函数）
  import { getToken } from "@/utils/auth.js";

  // 分页参数
  const page = ref(1);
  const size = ref(10);
  const total = ref(0); // 这个变量将存储所有预约记录的总和

  // 表格重新渲染的key
  const tableKey = ref(1);

  // 统计数据
  const week_total = ref(0);
  const my_pending = ref(0);

  // 表格数据
  const reservationList = ref([]);

  // 加载状态
  const statsLoading = ref(false);
  const tableLoading = ref(false);
  const isLoading = reactive({});

  // 从localStorage获取Token

  // 构建请求头
  const getHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `${token}` } : {};
  };

  // 从Token解析用户ID
  const getUserIdFromToken = () => {
    try {
      const token = getToken();
      if (!token) return "";

      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);
      return payload.sub || payload.userId || "";
    } catch (error) {
      console.error("解析Token失败:", error);
      return "";
    }
  };

  // 加载预约数据
  const loadReservationData = () => {
    if (!getToken()) {
      ElMessage.error("未检测到登录状态，请重新登录");
      return;
    }

    statsLoading.value = true;
    tableLoading.value = true;

    axios
      .get("http://localhost:8080/user/myReservations", {
        headers: getHeaders(),
        params: {
          user_id: getUserIdFromToken(),
          page: page.value,
          size: size.value,
        },
      })
      .then((res) => {
        if (res.data.code === 200 && res.data.data) {
          week_total.value = res.data.data.week_total || 0;
          my_pending.value = res.data.data.my_pending || 0;

          // 获取分页数据和总记录数
          const paginationData = res.data.data.myReservationsVoPage || {};
          reservationList.value = paginationData.records || [];

          // 确保total是所有记录的总和
          total.value = paginationData.total || 0;

          ElMessage.success("获取预约记录成功");

          // 重置加载状态
          Object.keys(isLoading).forEach((key) => {
            isLoading[key] = false;
          });
        } else {
          ElMessage.error(res.data.message || "数据加载失败：后端返回非成功状态");
        }
      })
      .catch((err) => {
        console.error("请求失败详情：", err);
        if (err.response?.status === 401) {
          ElMessage.error("登录状态已过期，请重新登录");
          localStorage.removeItem("auth_token");
        } else {
          ElMessage.error(`请求失败：${err.message || "网络错误"}`);
        }
      })
      .finally(() => {
        statsLoading.value = false;
        tableLoading.value = false;
      });
  };

  // 取消预约
  const handleCancel = (row) => {
    if (row.can_cancel !== 0) {
      ElMessage.warning("该预约不可取消");
      return;
    }

    if (!getToken()) {
      ElMessage.error("未检测到登录状态，请重新登录");
      return;
    }

    ElMessageBox.confirm("确定要取消该预约吗？取消后不可恢复", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        isLoading[row.apply_id] = true;

        axios
          .post(
            "http://localhost:8080/user/cancelReservation",
            {},
            {
              headers: getHeaders(),
              params: { apply_id: row.apply_id },
            }
          )
          .then((res) => {
            console.log("取消预约响应：", res);
            if (res.data.code === 200) {
              ElMessage.success("取消预约成功");

              // 重新加载数据以获取最新的总记录数
              loadReservationData();
            } else {
              ElMessage.error(res.data.message || "取消失败");
              isLoading[row.apply_id] = false;
            }
          })
          .catch((err) => {
            console.error("取消预约失败：", err);
            if (err.response?.status === 401) {
              ElMessage.error("登录状态已过期，请重新登录");
              localStorage.removeItem("auth_token");
            } else {
              ElMessage.error(`取消失败：${err.message}`);
            }
            isLoading[row.apply_id] = false;
          });
      })
      .catch(() => {
        console.log("用户取消操作");
      });
  };

  // 状态标签类型
  const getStatusTagType = (apply_status) => {
    switch (apply_status) {
      case "已通过":
      case "已批准":
        return "success";
      case "待审核":
        return "warning";
      case "已驳回":
      case "已拒绝":
        return "danger";
      case "已取消":
        return "info";
      default:
        return "";
    }
  };

  // 分页处理
  const handleSizeChange = (val) => {
    size.value = val;
    page.value = 1;
    loadReservationData();
  };

  const handleCurrentChange = (val) => {
    page.value = val;
    loadReservationData();
  };

  // 页面挂载时加载数据
  onMounted(() => {
    loadReservationData();
  });
</script>

<style scoped>
  /* 样式保持不变 */
  .common-layout {
    padding: 20px;
  }
  .page-header {
    margin-bottom: 20px;
  }
  .stats-card-container {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    justify-content: flex-start;
  }
  .stats-card {
    width: 200px;
    border-radius: 8px;
    padding: 16px;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  .stats-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
  .stats-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: column;
    align-items: flex-start;
  }
  .stats-label {
    font-size: 14px;
    color: #666;
  }
  .stats-value {
    font-size: 24px;
    font-weight: bold;
    margin: 8px 0;
    color: #333;
  }
  .status-tag {
    padding: 4px 8px;
    border-radius: 4px;
    color: #fff;
    font-size: 12px;
    margin-top: 4px;
  }
  p {
    color: #666;
    font-size: 14px;
    line-height: 1.6;
    margin: 0 0 10px 0;
  }
  .status-tag.yu {
    background-color: #909399;
  }
  .status-tag.pending {
    background-color: #ffb800;
  }
  .reservation-table-container {
    margin-top: 20px;
  }
  .el-table {
    --el-table-header-text-color: #333;
    --el-table-row-hover-bg-color: #f0f7ff;
  }
  .el-table tr:hover > td {
    transition: all 0.2s ease;
    transform: translateX(3px);
  }
  .el-button--text {
    transition: all 0.2s ease;
    padding: 5px 10px;
    border-radius: 4px;
  }
  .el-button--text:hover {
    background-color: rgba(255, 73, 73, 0.1);
    transform: scale(1.05);
  }
  .disabled-text {
    font-size: 12px;
    color: #909399;
    cursor: not-allowed;
  }
  .canceled-text {
    font-size: 12px;
    color: #6b7280;
    cursor: not-allowed;
  }
  .pagination-container {
    margin-bottom: 10px;
  }
</style>
