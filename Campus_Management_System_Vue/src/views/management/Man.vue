<template>
  <div class="common-layout">
    <el-container>
      <el-main>
        <!-- 卡片布局区域，实现类似截图效果 -->
        <div class="card-container">
          <el-card class="custom-card">
            <template #header>
              <h2>教室预约管理系统</h2>
            </template>
            <div>实时掌握教室使用情况，高效调度资源。</div>
          </el-card>
          <!-- <el-card class="custom-card">
            <template #header>
              <h2>今日预约概览</h2>
            </template>
            <div>实时掌握教室使用情况，高效调度资源。</div> -->
          <!-- </el-card> -->
          <el-card class="custom-card">
            <template #header>
              <h2>信息通知</h2>
            </template>
            <div>系统消息、预约变更通知等。</div>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
// 若需要额外的逻辑可在此处添加，当前示例主要是布局，无需复杂逻辑
</script>

<style scoped>
/* 主要内容区域样式 */
.el-main {
  padding: 20px;
  background-color: #f9fafb;
}

/* 卡片容器样式，实现多卡片布局 */
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px; /* 卡片之间的间距 */
}

/* 自定义卡片样式，让卡片外观更贴近需求 */
.custom-card {
  border: none; /* 去掉默认边框，可根据喜好保留或调整 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 初始阴影，增强层次感 */
  transition: all 0.3s ease; /* 过渡动画，让变化更平滑 */
}
.custom-card >>> .el-card__header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}
.custom-card >>> .el-card__body {
  padding: 16px;
  color: #666;
}

/* 卡片悬浮（浮动）效果：鼠标悬停时 */
.custom-card:hover {
  transform: translateY(-5px); /* 向上移动 5px，产生“浮起”感 */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15); /* 增强阴影，突出悬浮状态 */
}
</style>