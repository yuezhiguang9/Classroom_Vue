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
          <div v-if="item.title === '当月预约总数'" class="stat-change" :class="item.isIncrease ? 'stat-increase' : 'stat-decrease'">
            <el-icon :size="14">
              <CaretTop v-if="item.isIncrease" />
              <CaretBottom v-else />
            </el-icon>
            {{ item.change > 0 ? '+' : '' }}{{ item.change }}
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 热门教室排行榜 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">热门教室排行榜</h3>
          <p class="chart-subtitle">当月预约次数前五的教室</p>
        </div>
        <div class="chart-content">
          <div class="vertical-chart">
            <div class="vertical-bars">
              <div v-for="(item, index) in [...data.hotClassrooms].sort((a, b) => b.value - a.value)" :key="index" class="vertical-bar-item">
                <div class="vertical-bar-container">
                  <div class="vertical-bar" :style="{ height: (item.value / Math.max(...data.hotClassrooms.map(h => h.value)) * 200) + 'px', backgroundColor: '#409EFF' }">
                    <span class="vertical-bar-value">{{ item.value }}</span>
                  </div>
                </div>
                <div class="vertical-bar-label">{{ item.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 楼栋预约分布 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">楼栋预约分布</h3>
          <p class="chart-subtitle">各楼栋当月预约次数</p>
        </div>
        <div class="chart-content">
          <div class="vertical-chart">
            <div class="vertical-bars">
              <div v-for="(item, index) in [...data.buildingDistribution].sort((a, b) => b.value - a.value)" :key="index" class="vertical-bar-item">
                <div class="vertical-bar-container">
                  <div class="vertical-bar" :style="{ height: (item.value / Math.max(...data.buildingDistribution.map(b => b.value)) * 200) + 'px', backgroundColor: '#67C23A' }">
                    <span class="vertical-bar-value">{{ item.value }}</span>
                  </div>
                </div>
                <div class="vertical-bar-label">{{ item.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 教室类型分布 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">教室类型分布</h3>
          <p class="chart-subtitle">当月各类型教室预约占比</p>
        </div>
        <div class="chart-content">
          <div class="pie-chart">
            <div class="pie-container">
              <svg viewBox="0 0 200 200" class="pie-svg">
                <g transform="translate(100,100)">
                  <path v-for="(item, index) in data.classroomTypeDistribution" 
                        :key="index"
                        :d="getPiePath(index)"
                        :fill="['#409EFF', '#67C23A', '#F56C6C', '#E6A23C', '#909399'][index]"
                        class="pie-slice">
                  </path>
                </g>
              </svg>
            </div>
            <div class="pie-legend">
              <div v-for="(item, index) in data.classroomTypeDistribution" :key="index" class="legend-item">
                <span class="legend-color" :style="{ backgroundColor: ['#409EFF', '#67C23A', '#F56C6C', '#E6A23C', '#909399'][index] }"></span>
                <span class="legend-text">{{ item.name }} {{ ((item.value / data.classroomTypeDistribution.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import request from '@/utils/request';
import { ElMessage } from 'element-plus';
import { 
  User, Medal, Finished, Search, CircleCheck, CaretTop, CaretBottom
} from '@element-plus/icons-vue';


// 响应式数据 - 使用模拟数据
const data = reactive({
  // 统计卡片数据
  statsCards: [
    {
      title: '总用户数',
      value: 0,
      icon: User,
      bgColor: '#409EFF'
    },
    {
      title: '总教秘数',
      value: 0,
      icon: Medal,
      bgColor: '#67C23A'
    },
    {
      title: '总教室管理员数',
      value: 0,
      icon: CircleCheck,
      bgColor: '#F56C6C'
    },
    {
      title: '当月活跃用户数',
      value: 0,
      icon: Search,
      bgColor: '#E6A23C'
    },
    {
      title: '当月预约总数',
      value: 0,
      icon: Finished,
      bgColor: '#909399',
      change: 0,
      isIncrease: true
    }
  ],
  // 图表数据
  hotClassrooms: [],
  buildingDistribution: [],
  classroomTypeDistribution: [],
  page: 1,
  size: 5,
  total: 5
});


// 计算饼图路径
const getPiePath = (index) => {
  const total = data.classroomTypeDistribution.reduce((sum, item) => sum + item.value, 0);
  const startAngle = data.classroomTypeDistribution.slice(0, index).reduce((sum, item) => sum + item.value, 0) / total * 2 * Math.PI;
  const endAngle = startAngle + (data.classroomTypeDistribution[index].value / total) * 2 * Math.PI;
  
  const x1 = Math.cos(startAngle) * 80;
  const y1 = Math.sin(startAngle) * 80;
  const x2 = Math.cos(endAngle) * 80;
  const y2 = Math.sin(endAngle) * 80;
  
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
  
  return `M 0 0 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};

// 加载统计和图表数据（保持原有单接口结构）
const load = async () => {
  try {
    const res = await request.get('/admin/analyzeData');
    // 为调试保留关键信息
    console.log('分析数据响应：', res);

    if (res && res.code === 200 && res.data && Array.isArray(res.data) && res.data[0]) {
      const d = res.data[0];
      // 统计卡片
      data.statsCards[0].value = d.total_users || 0;
      data.statsCards[1].value = d.total_teach_secs || 0;
      data.statsCards[2].value = d.total_classroom_mgrs || 0;
      data.statsCards[3].value = d.active_users || 0;
      data.statsCards[4].value = d.total_applies || 0;
      data.statsCards[4].change = d.mom_appt_comparison || 0;

      // 热门教室排行榜（active_classroom）
      data.hotClassrooms = (d.active_classroom || []).map(item => ({
        name: `${item.building_name || ''} ${item.room_num || ''}`.trim(),
        value: item.userAccount || 0
      }));

      // 楼栋预约分布（total_of_building）
      data.buildingDistribution = (d.total_of_building || []).map(item => ({
        name: item.building_name || '',
        value: item.apply_count || 0
      }));

      // 教室类型分布（active_classroom_type）
      data.classroomTypeDistribution = (d.active_classroom_type || []).map(item => ({
        name: item.room_type || '',
        value: item.user_count || 0
      }));

      ElMessage.success('数据加载成功');
    } else {
      ElMessage.error(res?.message || '数据加载失败：返回结构异常');
    }
  } catch (e) {
    console.error('加载分析数据失败:', e);
    ElMessage.error(e.response?.data?.message || e.message || '网络错误');
  }
};

onMounted(() => {
  load();
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
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

/* 图表区域样式 */
.charts-container {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.chart-subtitle {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.chart-content {
  height: 300px;
}

/* 适配中等屏幕 */
@media (min-width: 768px) {
  .charts-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 适配大屏幕 */
@media (min-width: 1200px) {
  .charts-container {
    grid-template-columns: repeat(3, 1fr);
  }
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
  position: relative;
}

.stat-change {
  position: absolute;
  right: 0;
  bottom: 0;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.stat-increase {
  color: #F56C6C;
}

.stat-decrease {
  color: #67C23A;
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

.user-table {
  margin-bottom: 20px;
  border-radius: 6px;
  overflow: hidden;
}

.code-text {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #606266;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 适配小屏幕 */
@media (max-width: 1200px) {
  .stats-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
}

/* 图表样式 */
.bar-chart, .horizontal-bar-chart {
  height: 100%;
  padding: 10px;
}

.bar-item, .h-bar-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.bar-label, .h-bar-label {
  width: 80px;
  font-size: 12px;
  color: #666;
  margin-right: 10px;
  text-align: right;
}

.bar-container, .h-bar-container {
  flex: 1;
  height: 25px;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.bar, .h-bar {
  height: 100%;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 5px;
  transition: width 0.3s ease;
}

.bar-value, .h-bar-value {
  font-size: 12px;
  color: white;
  font-weight: bold;
}

/* 垂直柱状图样式 */
.vertical-chart {
  height: 100%;
  padding: 20px 10px;
}

.vertical-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 250px;
  padding: 0 20px;
}

.vertical-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
}

.vertical-bar-container {
  height: 200px;
  display: flex;
  align-items: flex-end;
  margin-bottom: 10px;
}

.vertical-bar {
  width: 40px;
  border-radius: 4px 4px 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 5px;
  transition: height 0.3s ease;
  position: relative;
}

.vertical-bar-value {
    font-size: 11px;
    color: #333;
    font-weight: bold;
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
  }

.vertical-bar-label {
  font-size: 12px;
  color: #666;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60px;
  margin-top: 5px;
}

@media (max-width: 768px) {
  .vertical-bars {
    padding: 0 10px;
  }
  
  .vertical-bar-item {
    width: 50px;
  }
  
  .vertical-bar {
    width: 30px;
  }
}

.pie-chart {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: space-around;
}

.pie-container {
  width: 200px;
  height: 200px;
}

.pie-svg {
  width: 100%;
  height: 100%;
}

.pie-slice {
  transition: transform 0.3s ease;
}

.pie-slice:hover {
  transform: scale(1.05);
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 8px;
}

.legend-text {
  color: #666;
}.bar-chart, .horizontal-bar-chart {
  height: 100%;
  padding: 10px;
}

.bar-item, .h-bar-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.bar-label, .h-bar-label {
  width: 80px;
  font-size: 12px;
  color: #666;
  margin-right: 10px;
  text-align: right;
}

.bar-container, .h-bar-container {
  flex: 1;
  height: 25px;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.bar, .h-bar {
  height: 100%;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 5px;
  transition: width 0.3s ease;
}

.bar-value, .h-bar-value {
  font-size: 12px;
  color: white;
  font-weight: bold;
}

.pie-chart {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: space-around;
}

.pie-container {
  width: 200px;
  height: 200px;
}

.pie-svg {
  width: 100%;
  height: 100%;
}

.pie-slice {
  transition: transform 0.3s ease;
}

.pie-slice:hover {
  transform: scale(1.05);
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 8px;
}

.legend-text {
  color: #666;
}
</style>
