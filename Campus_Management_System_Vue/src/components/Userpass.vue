<template>
	<div class="common-layout">
		<el-container>
			<!-- 侧边导航栏 -->
			<el-aside width="220px" class="aside-container">
				<el-menu
					router
					style="border: none; background-color: transparent"
					:default-active="router.currentRoute.value.path"
					class="custom-menu"
					text-color="#b0bec5"
					active-text-color="#ffffff">
					<el-menu-item index="/user/users" class="menu-item">
						<el-icon><User /></el-icon>
						<span>用户系统</span>
					</el-menu-item>

					<el-menu-item index="/user/select" class="menu-item">
						<el-icon><RefreshLeft /></el-icon>
						<span>教室查询及预约</span>
					</el-menu-item>

					<el-menu-item index="/user/apply" class="menu-item">
						<el-icon><CirclePlus /></el-icon>
						<span>我的预约</span>
					</el-menu-item>
				</el-menu>
			</el-aside>

			<el-container>
				<!-- 头部导航栏 -->
				<el-header height="60px" class="header-container">
					<div style="flex: 1">
						<div style="padding-left: 20px; display: flex; align-items: center">
							<div class="logo-container">
								<el-icon class="logo-icon"><School /></el-icon>
							</div>
							<div
								style="
									font-weight: bold;
									font-size: 22px;
									margin-left: 10px;
									color: white;
									text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
								">
								智慧教室预约管理系统
							</div>
						</div>
					</div>
					<div
						style="
							width: fit-content;
							padding-right: 20px;
							display: flex;
							align-items: center;
						">
						<el-dropdown trigger="click">
							<div style="display: flex; align-items: center; cursor: pointer">
								<span
									style="
										color: white;
										font-weight: 500;
										text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
									"
									>{{ data.user.name }}</span
								>
								<el-icon style="margin-left: 5px; color: white"
									><arrow-down
								/></el-icon>
							</div>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item @click="logout">
										<el-icon><SwitchButton /></el-icon><span>退出系统</span>
									</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
					</div>
				</el-header>

				<!-- 主要内容区 -->
				<el-main class="main-container">
					<router-view @updateUser="updateUser" />
				</el-main>
			</el-container>
		</el-container>
	</div>
</template>

<script setup>
	import { reactive } from "vue";
	import router from "@/router";
	import { ElMessage } from "element-plus";
	import { ArrowDown } from "@element-plus/icons-vue";
	import { removeToken, clearAuthInfo } from "@/utils/auth";

	const data = reactive({
		user: JSON.parse(
			localStorage.getItem("currentUser") ||
				sessionStorage.getItem("currentUser") ||
				"{}"
		),
	});
	// 移除以下代码（退出后不应自动创建用户）
	// if (!data.user?.id) {
	// 	data.user = { id: 2, name: "用户", role: "USER" };
	// 	localStorage.setItem("user", JSON.stringify(data.user));
	// }

	const updateUser = () => {
		data.user = JSON.parse(localStorage.getItem("user") || "{}");
	};

	const logout = () => {
		try {
			// 1. 彻底清除所有认证信息（token + currentUser + remember_me）
			clearAuthInfo();
			// 2. 额外清除侧边栏组件用到的"user"键（避免残留）
			localStorage.removeItem("currentUser");
			sessionStorage.removeItem("currentUser");

			// 3. 强制跳转登录页，并刷新路由
			router
				.push("/login")
				.then(() => {
					ElMessage.success("退出成功");
					// 可选：强制刷新页面，确保所有组件状态重置
					window.location.reload();
				})
				.catch((err) => {
					console.error("跳转登录页失败：", err);
				});
		} catch (error) {
			console.error("退出过程出错：", error);
			ElMessage.error("退出失败，请重试");
		}
	};
</script>

<style scoped>
	.common-layout {
		height: 100vh;
	}

	.header-container {
		background: linear-gradient(90deg, #1565c0, #1976d2);
		display: flex;
		align-items: center;
		border-bottom: 1px solid #0d47a1;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
		padding: 0;
	}

	.aside-container {
		background-color: #263238;
		box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
		padding: 0;
	}

	.main-container {
		background-color: #f5f5f5;
		padding: 15px;
		overflow: auto;
	}

	.logo-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.logo-icon {
		font-size: 24px;
		color: #1565c0;
	}

	.menu-divider {
		height: 1px;
		background-color: rgba(176, 190, 197, 0.2);
		margin: 10px 15px;
	}

	.menu-item {
		margin: 4px 8px;
		border-radius: 6px;
		transition: all 0.3s;
		height: 50px;
	}

	.custom-menu {
		padding: 5px;
	}

	:deep(.el-menu) {
		background-color: transparent !important;
	}

	.el-menu-item.is-active {
		background-color: #1e88e5 !important;
		color: white !important;
		font-weight: bold;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	}

	.el-menu-item:hover {
		background-color: rgba(30, 136, 229, 0.15) !important;
		color: white !important;
	}

	:deep(.el-menu-item) {
		height: 50px;
		line-height: 50px;
	}

	:deep(.el-menu-item .el-icon) {
		font-size: 18px;
		margin-right: 5px;
		color: inherit;
	}

	:deep(th) {
		color: #333;
	}
</style>
