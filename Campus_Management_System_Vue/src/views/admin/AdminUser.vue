<template>
  <div class="admin-user-container">
    <!-- 统计卡片区域 -->
    <div class="stats-container">
      <div class="stat-card" v-for="(item, index) in data.statsCards" :key="index">
        <div class="stat-icon" :style="{ backgroundColor: item.bgColor }">
          <el-icon :size="24" :color="'white'">
            <component :is="item.icon"></component>
          </el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-title">{{ item.title }}</div>
        </div>
      </div>
    </div>

    <!-- 用户管理区域 -->
    <div class="user-management-container">
      <!-- 搜索区域 -->
      <div class="search-card">
        <el-form :model="data.searchForm" inline>
          <el-form-item label="角色" style="width: 200px">
            <el-select
              v-model="data.selectedRole"
              placeholder="请选择角色"
              @change="filterByRole"
              clearable
            >
              <el-option label="教秘" value="teach_sec"></el-option>
              <el-option label="教室管理员" value="class_mgr"></el-option>
              <el-option label="用户" value="user"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="学院名称" style="width: 200px">
            <el-select
              v-model="data.searchForm.college_id"
              placeholder="请选择学院"
              clearable
              :disabled="data.selectedRole === 'class_mgr'"
            >
              <el-option
                v-for="item in data.collegeData"
                :key="item.collegeId"
                :label="item.collegeName"
                :value="item.collegeId"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="用户名" style="width: 200px">
            <el-input v-model="data.searchForm.user_name" placeholder="请输入姓名"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <div class="content-card">
        <div class="table-header">
          <h3 class="table-title">用户管理</h3>
          <el-button type="primary" @click="handleAdd" :icon="Plus" class="add-button"
            >新增</el-button
          >
        </div>

        <el-table :data="data.tableData" stripe border highlight-current-row class="user-table">
          <el-table-column label="姓名" prop="name" align="center"></el-table-column>
          <el-table-column label="角色" prop="user_type" align="center">
            <template #default="scope">
              <el-tag type="warning" v-if="scope.row.user_type === 'teach_sec'">教秘</el-tag>
              <el-tag type="success" v-else-if="scope.row.user_type === 'class_mgr'"
                >教室管理员</el-tag
              >
              <el-tag type="primary" v-else>用户</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-if="data.selectedRole !== 'class_mgr'"
            label="所属学院"
            prop="college"
          ></el-table-column>
          <el-table-column
            v-if="data.selectedRole === 'class_mgr'"
            label="所管楼栋"
            prop="building_name"
          ></el-table-column>

          <el-table-column label="电话" prop="phone">
            <template #default="scope">
              <span class="code-text">{{ scope.row.phone }}</span>
            </template>
          </el-table-column>
          <el-table-column label="账号" prop="user_account">
            <template #default="scope">
              <span class="code-text">{{ scope.row.user_account }}</span>
            </template>
          </el-table-column>
          <el-table-column label="密码" prop="password">
            <template #default="scope">
              <span class="code-text">{{ scope.row.password }}</span>
            </template>
          </el-table-column>
          <el-table-column label="最后登录时间" prop="last_login"></el-table-column>

          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(scope.row)"
                >编辑</el-button
              >
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                @click="handleDelete(scope.row.user_account)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            v-model:page-size="data.size"
            :page-sizes="[5, 10, 20, 50]"
            v-model:current-page="data.page"
            :total="data.total"
            @size-change="handleSizeChange"
            @current-change="changePage"
          />
        </div>
      </div>

      <!-- 表单对话框 -->
      <el-dialog
        v-model="data.formVisible"
        :title="data.isEdit ? '编辑用户信息' : '新增用户信息'"
        width="500px"
        :close-on-click-modal="false"
        destroy-on-close
        center
      >
        <el-form
          :model="data.form"
          :rules="rules"
          ref="formRef"
          label-width="100px"
          class="user-form"
        >
          <!-- 只有当账号已有值（编辑状态）时才禁用账号输入框 -->
          <el-form-item label="账号" prop="account" required>
            <el-input
              v-model="data.form.account"
              placeholder="请输入账号"
              :disabled="data.isEdit"
            />
          </el-form-item>

          <el-form-item label="姓名" prop="name" required>
            <el-input v-model="data.form.name" placeholder="请输入姓名" />
          </el-form-item>

          <el-form-item label="密码" prop="password" required>
            <el-input
              v-model="data.form.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>

          <el-form-item label="手机号" prop="phone" required>
            <el-input v-model="data.form.phone" placeholder="请输入手机号" />
          </el-form-item>

          <el-form-item
            label="所属学院"
            prop="college_id"
            :required="data.form.user_type === 'teach_sec' || data.form.user_type === 'user'"
            v-if="data.form.user_type === 'teach_sec' || data.form.user_type === 'user'"
          >
            <el-select v-model="data.form.college_id" placeholder="请选择学院" style="width: 100%">
              <el-option
                v-for="item in data.collegeData"
                :key="item.collegeId"
                :label="item.collegeName"
                :value="item.collegeId"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item
            label="管理楼栋"
            prop="building_id"
            :required="data.form.user_type === 'class_mgr'"
            v-if="data.form.user_type === 'class_mgr'"
          >
            <el-select v-model="data.form.building_id" placeholder="请选择楼栋" style="width: 100%">
              <el-option
                v-for="item in data.buildingData"
                :key="item.buildingId"
                :label="item.buildingName"
                :value="item.buildingId"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="角色" prop="user_type" required>
            <el-select
              v-model="data.form.user_type"
              placeholder="请选择角色"
              style="width: 100%"
              @change="handleRoleChange"
            >
              <el-option label="教秘" value="teach_sec"></el-option>
              <el-option label="教室管理员" value="class_mgr"></el-option>
              <el-option label="用户" value="user"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="data.formVisible = false">取 消</el-button>
            <el-button type="primary" @click="save">保 存</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
  import { reactive, onMounted, ref } from "vue";
  import request from "@/utils/request";
  import { ElMessageBox, ElMessage } from "element-plus";
  import { User, Medal, Search, RefreshRight, Plus, Edit, Delete } from "@element-plus/icons-vue";

  // 响应式数据
  const data = reactive({
    // 统计卡片数据
    statsCards: [
      {
        title: "总用户数",
        value: 0,
        icon: User,
        bgColor: "#409EFF",
      },
      {
        title: "活跃用户数",
        value: 0,
        icon: Medal,
        bgColor: "#67C23A",
      },
    ],

    // 搜索表单
    searchForm: {
      college_id: "",
      user_name: "",
    },

    // 用户管理数据
    formVisible: false,
    form: {
      college_id: "",
      building_id: "",
    },
    isEdit: false, // 新增此行：区分新增/编辑模式的标志
    tableData: [],
    page: 1,
    size: 5,
    total: 0,
    selectedRole: null,
    collegeData: [],
    buildingData: [],
  });

  const rules = {
    user_type: [{ required: true, message: "请选择角色", trigger: "change" }],
    account: [{ required: true, message: "请输入账号", trigger: "blur" }],
    name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
    password: [
      {
        required: !data.isEdit,
        message: "请输入密码",
        trigger: "blur",
      },
      // {
      //   min: 6,
      //   message: '密码长度不能少于6位',
      //   trigger: 'blur'
      // }
    ],
    phone: [
      { required: true, message: "请输入手机号", trigger: "blur" },
      // {
      //   pattern: /^1[3-9]\d{9}$/,
      //   message: '请输入正确的手机号',
      //   trigger: 'blur'
      // }
    ],
    college_id: [
      {
        required: data.form.user_type === "teach_sec" || data.form.user_type === "user",
        message: "请选择学院",
        trigger: "change",
      },
    ],
    building_id: [
      {
        required: data.form.user_type === "class_mgr",
        message: "请选择楼栋",
        trigger: "change",
      },
    ],
  };
  // 获取学院列表
  const getColleges = async () => {
    try {
      console.log("开始请求学院列表...");
      const res = await request.get("/common/getColleges");
      console.log("学院列表请求响应:", res);
      if (res && res.code === 200) {
        if (res.data && Array.isArray(res.data)) {
          data.collegeData = res.data;
          console.log("学院列表数据更新成功:", data.collegeData);
        } else {
          console.error("学院数据格式不正确，应为数组:", res.data);
          ElMessage.error("获取学院列表数据格式错误");
        }
      } else {
        console.error("获取学院列表失败，状态码:", res?.code);
        ElMessage.error(`获取学院列表失败: ${res?.message || "未知错误"}`);
      }
    } catch (e) {
      console.error("获取学院列表异常:", e);
      ElMessage.error(`网络错误，获取学院列表失败: ${e.message}`);
    }
  };

  // 获取楼栋列表
  const getBuildings = async () => {
    try {
      console.log("开始请求楼栋列表...");
      const res = await request.get("/common/getBuildings");
      console.log("楼栋列表请求响应:", res);
      if (res && res.code === 200) {
        if (res.data && Array.isArray(res.data)) {
          data.buildingData = res.data;
          console.log("楼栋列表数据更新成功:", data.buildingData);
        } else {
          console.error("楼栋数据格式不正确，应为数组:", res.data);
          ElMessage.error("获取楼栋列表数据格式错误");
        }
      } else {
        console.error("获取楼栋列表失败，状态码:", res?.code);
        ElMessage.error(`获取楼栋列表失败: ${res?.message || "未知错误"}`);
      }
    } catch (e) {
      console.error("获取楼栋列表异常:", e);
      ElMessage.error(`网络错误，获取楼栋列表失败: ${e.message}`);
    }
  };

  // 监听学院选择变化，过滤对应的楼栋（如果需要）
  const handleCollegeChange = (collegeId) => {
    // 如果需要根据学院过滤楼栋，可以在这里实现
    // 目前保持简单实现
    console.log("学院选择已变更:", collegeId);
  };

  // 删除用户
  const handleDelete = (userAccount) => {
    // 参数名改为userAccount，明确含义
    ElMessageBox.confirm("删除后数据无法恢复，您确定删除吗?", "删除确认", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    })
      .then(async () => {
        try {
          const userType = data.selectedRole; // 角色类型（如teach_sec、user等）

          // 发送删除请求，参数名使用后端需要的user_id，值为userAccount（即表格中的user_account）
          const res = await request.get("/admin/deleteUsers", {
            params: {
              account: userAccount, // 关键修改：参数名改为user_id，值为用户账号
              user_type: userType, // 角色类型参数（保持不变，需与后端一致）
            },
          });

          if (res.code === 200) {
            ElMessage.success("删除成功");
            load(); // 刷新用户列表
          } else {
            ElMessage.error(res.message || "删除失败");
          }
        } catch (error) {
          console.error("删除用户出错:", error);
          ElMessage.error(error.response?.data?.message || "删除操作失败");
        }
      })
      .catch(() => {
        ElMessage.info("已取消删除");
      });
  };

  // 新增和编辑用户
  const save = async () => {
    try {
      // 表单验证
      await formRef.value.validate();

      // 准备请求数据
      const userData = {
        account: data.form.account,
        name: data.form.name,
        password: data.form.password,
        phone: data.form.phone,
        user_type: data.form.user_type,
        college_id: data.form.college_id,
        building_id: data.form.building_id,
      };
      // 新增时必传密码，编辑时仅在输入新密码时传递
      if (!data.isEdit) {
        userData.password = data.form.password; // 新增必传
      } else if (data.form.password) {
        userData.password = data.form.password; // 编辑时输入了新密码才传递
      }
      console.log("请求参数：", userData);

      // 发送请求
      let res;
      if (data.isEdit) {
        // 编辑操作
        res = await request.post("/admin/updateUsers", userData);
      } else {
        // 新增操作
        res = await request.post("/admin/addUsers", userData);
      }

      console.log("后端响应数据：", res);

      if (res.code === 200) {
        ElMessage.success(data.isEdit ? "更新用户成功" : "添加用户成功");
        data.formVisible = false;
        load(); // 刷新用户列表
      } else {
        console.log("后端返回失败（非200状态）：", res.message);
        ElMessage.error(res.message || (data.isEdit ? "更新用户失败" : "添加用户失败"));
      }
    } catch (error) {
      if (error.name === "ValidationError") {
        console.log("前端表单验证失败：", error.message);
        ElMessage.error("表单填写有误，请检查后重试");
      } else if (error.response) {
        console.log("后端接口返回错误：", error.response.data);
        ElMessage.error(
          "后端接口错误：" +
            (error.response.data.message || (data.isEdit ? "更新失败" : "添加失败"))
        );
      } else {
        const errorMsg = error?.message || "未知网络错误";
        console.log("请求发送失败：", errorMsg);
        ElMessage.error("请求失败: " + errorMsg);
      }
    }
  };

  // 用户列表
  const load = () => {
    // 传递必要的查询参数
    const params = {
      page: data.page,
      size: data.size,
      user_type: data.selectedRole || undefined,
      college_id: data.searchForm.college_id || undefined,
      user_name: data.searchForm.user_name || undefined,
      user_id: data.form.user_id || undefined,
    };

    console.log("发送请求到后端，参数:", params);

    request
      .get("/admin/listUsers", {
        params: params,
      })
      .then((res) => {
        console.log("完整响应数据：", res);

        if (res && res.code === 200 && res.data) {
          // 确保数据结构存在

          // 设置默认值防止undefined
          data.statsCards[0].value = res.data.totalUsers;
          data.statsCards[1].value = res.data.activeUsers;
          data.tableData = res.data.userListVO;
          // data.total = res.data.userListVO.length;
          data.total = res.data.total;
          data.page = res.data.page;
          data.size = res.data.size;

          // 调试日志
          console.log("表格数据加载成功:", {
            tableData: data.tableData,
            total: data.total,
            page: data.page,
            size: data.size,
          });
        } else {
          console.error("数据格式异常:", res);
          ElMessage.error(res?.message || "数据格式异常");
          data.tableData = []; // 确保表格结构显示
        }
      })
      .catch((err) => {
        console.error("请求失败:", err);
        ElMessage.error("请求失败: " + (err.response?.data?.message || err.message));
        data.tableData = []; // 确保表格结构显示
      });
  };

  // 角色筛选
  const filterByRole = (role) => {
    data.selectedRole = role;
    if (role === "class_mgr") {
      data.searchForm.college_id = "";
    }
    data.page = 1;
    load();
  };

  // 新增用户
  const handleAdd = () => {
    data.isEdit = false;
    data.form = {
      account: "",
      name: "",
      password: "",
      phone: "",
      user_type: "",
      college_id: "",
      building_id: "",
    };
    data.formVisible = true;
    console.log("新增用户表单已打开", data.form);
  };

  // 编辑用户
  const handleEdit = (row) => {
    console.log("编辑的行数据：", row);
    data.isEdit = true; // 编辑模式
    data.form = {
      account: row.user_account, // 账号
      name: row.name, // 姓名
      phone: row.phone, // 手机号
      user_type: row.user_type,
      college_id: row.college_id, // 学院
      building_id: row.building_id, // 楼栋
      password: row.password,
    };
    data.formVisible = true;
    console.log("编辑用户表单已打开", data.form);
  };
  // 搜索按钮
  const handleSearch = () => {
    data.page = 1;
    load();
  };

  // 重置按钮
  const resetSearch = () => {
    data.searchForm = {
      college_id: "",
      user_name: "",
    };
    data.selectedRole = "user";
    handleSearch();
  };

  // 每页条数变化事件
  const handleSizeChange = (newSize) => {
    data.size = newSize; // 同步参数名
    data.page = 1; // 切换每页条数时，建议重置为第1页
    load();
  };
  // 新增页码变化事件
  const changePage = (newPage) => {
    data.page = newPage; // 同步参数名
    load();
  };

  // 定义表单引用
  const formRef = ref(null);

  // 生命周期钩子：挂载后
  onMounted(async () => {
    // 默认加载用户类型为用户(user)
    data.selectedRole = "user";

    // 并行获取学院数据、楼栋数据和加载用户列表
    await Promise.all([getColleges(), getBuildings(), load()]);
  });
</script>

<style scoped>
  .admin-user-container {
    padding: 15px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 100px);
  }

  /* 统计卡片样式 */
  .stats-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin-bottom: 20px;
  }

  .stat-card {
    background: white;
    border-radius: 10px;
    padding: 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .stat-title {
    font-size: 14px;
    color: #666;
  }

  /* 用户管理区域样式 */
  .search-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 15px 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }

  .role-filter-container {
    width: 150px;
  }

  .filter-btn {
    min-width: 120px;
    height: 40px;
    font-weight: 500;
    border-radius: 6px;
    transition: all 0.3s;
  }

  .filter-btn:not(.el-button--primary) {
    background-color: #f5f7fa;
    border-color: #dcdfe6;
    color: #606266;
  }

  .filter-btn:not(.el-button--primary):hover {
    background-color: #ecf5ff;
    border-color: #409eff;
    color: #409eff;
  }

  .content-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #ebeef5;
  }

  .table-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }

  .add-button {
    font-weight: 500;
  }

  .user-table {
    margin-bottom: 20px;
    border-radius: 6px;
    overflow: hidden;
  }

  .code-text {
    font-family: "Courier New", monospace;
    font-weight: 600;
    color: #606266;
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .user-form {
    margin: 0 auto;
    max-width: 400px;
  }

  .dialog-footer {
    text-align: right;
    margin-top: 20px;
  }

  /* 适配小屏幕 */
  @media (max-width: 1200px) {
    .stats-container {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .stats-container {
      grid-template-columns: 1fr;
    }
  }
</style>
