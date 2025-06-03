<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- 第一行：用户信息和系统信息 -->
  <el-row :gutter="20">
    <!-- 左侧：用户信息卡片 -->
    <el-col :span="6">
      <el-card shadow="hover" class="user-card">
        <el-skeleton :loading="loading" animated>
          <template #default>
            <div class="user-info">
              <el-avatar :size="100" :src="userObject.picture" class="user-avatar" />
              <h3 class="user-name">{{ userObject.userName }}</h3>
              <p class="user-welcome">{{ timeText }}</p>
              <el-divider />
              <div class="quick-actions">
                <el-tooltip content="个人设置" placement="top">
                  <el-button circle @click="handleProfile"
                    ><el-icon><Setting /></el-icon
                  ></el-button>
                </el-tooltip>
                <el-tooltip content="消息" placement="top">
                  <el-button circle
                    ><el-icon><Bell /></el-icon
                  ></el-button>
                </el-tooltip>
                <el-tooltip content="帮助" placement="top">
                  <el-button circle
                    ><el-icon><QuestionFilled /></el-icon
                  ></el-button>
                </el-tooltip>
              </div>
            </div>
          </template>
          <template #template>
            <div style="text-align: center">
              <el-skeleton-item
                variant="circle"
                style="width: 100px; height: 100px; margin: 0 auto"
              />
              <el-skeleton-item variant="h3" style="width: 50%; margin: 16px auto" />
              <el-skeleton-item variant="text" style="width: 70%; margin: 16px auto" />
            </div>
          </template>
        </el-skeleton>
      </el-card>
    </el-col>

    <!-- 中间：系统信息和链接 -->
    <el-col :span="10">
      <el-row :gutter="20" style="height: 100%">
        <!-- 时间和天气 -->
        <el-col :span="24" style="height: 46%">
          <el-card shadow="hover" class="time-weather-card">
            <el-skeleton :loading="loading" animated>
              <template #default>
                <div class="time-info">
                  <div class="current-time">
                    <div class="time-display">
                      <h2>{{ timeObject.currentTime }}</h2>
                      <div class="date-info">
                        <el-icon><Calendar /></el-icon>
                        <span
                          >{{ timeObject.year }}年{{ timeObject.month + 1 }}月{{
                            timeObject.day
                          }}日</span
                        >
                      </div>
                    </div>
                  </div>
                  <el-divider direction="vertical" class="time-divider" />
                  <div class="weather-info">
                    <div class="weather-content">
                      <div class="weather-location">
                        <el-icon><Location /></el-icon>
                        <span>北京市朝阳区</span>
                      </div>
                      <div class="weather-data">
                        <div class="temperature">
                          <span class="temp-value">23°C</span>
                          <span class="weather-desc">晴</span>
                        </div>
                        <div class="weather-details">
                          <div class="detail-item">
                            <i class="iconfont icon-humidity"></i>
                            <span>湿度 45%</span>
                          </div>
                          <div class="detail-item">
                            <i class="iconfont icon-wind"></i>
                            <span>东北风 2级</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <template #template>
                <div class="flex-between">
                  <el-skeleton-item variant="h3" style="width: 40%" />
                  <el-skeleton-item variant="text" style="width: 30%" />
                </div>
              </template>
            </el-skeleton>
          </el-card>
        </el-col>
        <!-- 项目链接 -->
        <el-col :span="24" style="height: 46%; margin-top: 4%">
          <el-card shadow="hover" class="links-card">
            <el-skeleton :loading="loading" animated>
              <template #default>
                <h3 class="card-title">项目导航</h3>
                <div class="link-list">
                  <el-button type="primary" class="link-btn" @click="goToFrontend">
                    <el-icon
                      ><svg viewBox="0 0 1024 1024" width="16" height="16">
                        <path
                          fill="currentColor"
                          d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0 1 38.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"
                        /></svg
                    ></el-icon>
                    前端仓库
                  </el-button>
                  <el-button type="success" class="link-btn" @click="goToBackend">
                    <el-icon
                      ><svg viewBox="0 0 1024 1024" width="16" height="16">
                        <path
                          fill="currentColor"
                          d="M512 992C246.912 992 32 777.088 32 512 32 246.912 246.912 32 512 32c265.088 0 480 214.912 480 480 0 265.088-214.912 480-480 480zM456.192 387.2l-1.504-1.504c-3.072-3.072-7.2-4.8-11.52-4.8h-53.792c-9.088 0-16.448 7.36-16.448 16.448v228.704c0 9.088 7.36 16.448 16.448 16.448h53.792c9.088 0 16.448-7.36 16.448-16.448V387.2h-3.424zm168.32-6.304h-53.792c-9.088 0-16.448 7.36-16.448 16.448v228.704c0 9.088 7.36 16.448 16.448 16.448h53.792c9.088 0 16.448-7.36 16.448-16.448V397.344c0-9.088-7.36-16.448-16.448-16.448z"
                        /></svg
                    ></el-icon>
                    后端仓库
                  </el-button>
                  <el-button type="warning" class="link-btn" @click="goToApi">
                    <el-icon><Document /></el-icon>
                    接口文档
                  </el-button>
                </div>
              </template>
              <template #template>
                <el-skeleton-item variant="h3" style="width: 30%; margin-bottom: 16px" />
                <div style="display: flex; justify-content: space-between">
                  <el-skeleton-item variant="text" style="width: 25%" />
                  <el-skeleton-item variant="text" style="width: 25%" />
                  <el-skeleton-item variant="text" style="width: 25%" />
                </div>
              </template>
            </el-skeleton>
          </el-card>
        </el-col>
      </el-row>
    </el-col>

    <!-- 右侧：公告栏 -->
    <el-col :span="8">
      <el-card shadow="hover" class="notice-card">
        <template #header>
          <div class="card-header">
            <span>最新公告</span>
            <el-button type="primary" link>更多</el-button>
          </div>
        </template>
        <div class="notice-list">
          <div v-for="(item, index) in notices" :key="index" class="notice-item">
            <el-icon><Bell /></el-icon>
            <span class="notice-title">{{ item.title }}</span>
            <span class="notice-time">{{ item.time }}</span>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>

  <!-- 第二行：数据概览卡片 -->
  <el-row :gutter="20" class="mt-20">
    <el-col :span="6" v-for="(item, index) in dataCards" :key="index">
      <el-card shadow="hover" :class="['data-card', item.type]">
        <el-skeleton :loading="loading" animated>
          <template #default>
            <div class="data-header">
              <i :class="item.icon"></i>
              <span>{{ item.title }}</span>
            </div>
            <div class="data-content">
              {{ item.value }}
              <span class="unit">{{ item.unit }}</span>
            </div>
            <div class="data-footer">
              <span>{{ item.footerLabel }}</span>
              <span :class="item.trend">{{ item.footerValue }}</span>
            </div>
          </template>
          <template #template>
            <div class="data-skeleton">
              <el-skeleton-item variant="h3" style="width: 50%" />
              <el-skeleton-item variant="text" style="width: 70%" />
              <el-skeleton-item variant="text" style="width: 40%" />
            </div>
          </template>
        </el-skeleton>
      </el-card>
    </el-col>
  </el-row>

  <!-- 第三行：图表展示 -->
  <el-row :gutter="20" class="mt-20">
    <el-col :span="16">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>收入统计</span>
            <el-radio-group v-model="chartTimeRange" size="small">
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
              <el-radio-button label="year">全年</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="incomeChart" style="height: 300px"></div>
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>科室工作量</span>
          </div>
        </template>
        <div ref="deptChart" style="height: 300px"></div>
      </el-card>
    </el-col>
  </el-row>

  <!-- 第四行：通知公告和待办事项 -->
  <el-row :gutter="20" class="mt-20">
    <el-col :span="12">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>待办事项</span>
            <el-button type="primary" link>更多</el-button>
          </div>
        </template>
        <div class="todo-list">
          <div v-for="(item, index) in todos" :key="index" class="todo-item">
            <el-tag :type="item.type" size="small">{{ item.tag }}</el-tag>
            <span class="todo-title">{{ item.title }}</span>
            <span class="todo-time">{{ item.time }}</span>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import * as echarts from 'echarts'
import { useTransition } from '@vueuse/core'
import {
  Bell,
  Document,
  Setting,
  QuestionFilled,
  Calendar,
  Location,
} from '@element-plus/icons-vue'
import router from '@/router'
const userStore = useUserStore()
const userObject = ref({
  picture: '',
  userName: '',
  id: null,
})

// 用于存储当前时间
const timeObject = ref({
  year: 0,
  month: 0,
  day: 0,
  hourse: 0,
  currentTime: '',
})

//计算早中晚
const timeText = ref('')
const loading = ref(true)

// 图表相关
const incomeChart = ref(null)
const deptChart = ref(null)
const chartTimeRange = ref('month')

// 数字动画
const outpatientCount = ref(0)
const inpatientCount = ref(0)
const surgeryCount = ref(0)
const medicineCount = ref(0)

const transOutpatient = useTransition(outpatientCount, {
  duration: 2000,
  transition: 'ease-out',
})
const transInpatient = useTransition(inpatientCount, {
  duration: 2000,
  transition: 'ease-out',
})
const transSurgery = useTransition(surgeryCount, {
  duration: 2000,
  transition: 'ease-out',
})
const transMedicine = useTransition(medicineCount, {
  duration: 2000,
  transition: 'ease-out',
})

// 个人信息
const handleProfile = () => {
  router.push('/user/profile')
}

// 跳转前端仓库
const goToFrontend = () => {
  window.open('https://github.com/asdfggmj/-vue-', '_blank')
}

// 跳转后端仓库
const goToBackend = () => {
  window.open('https://gitee.com/asdfggmj12/history-manage-by-cloud/tree/dev/', '_blank')
}

// 跳转接口文档
const goToApi = () => {
  window.open('http://localhost:8500/doc.html', '_blank')
}

// 模拟数据
const notices = ref([
  { title: '关于开展新冠疫苗接种工作的通知', time: '2024-03-20' },
  { title: '医院信息系统升级维护通知', time: '2024-03-19' },
  { title: '关于加强医疗质量管理的通知', time: '2024-03-18' },
  { title: '2024年度医师资格考试报名通知', time: '2024-03-17' },
])

const todos = ref([
  { title: '待审核入院申请', time: '10:30', type: 'warning', tag: '急需' },
  { title: '药品库存盘点', time: '14:00', type: 'info', tag: '待办' },
  { title: '科室会议', time: '15:30', type: 'success', tag: '日常' },
  { title: '手术室消毒检查', time: '16:00', type: 'danger', tag: '重要' },
])

// 在 script setup 部分添加数据卡片数据
const dataCards = ref([
  {
    icon: 'iconfont icon-menzhen',
    title: '今日门诊量',
    value: Math.round(transOutpatient.value),
    unit: '人次',
    footerLabel: '同比增长',
    footerValue: '+15.6%',
    trend: 'up',
    type: 'primary',
  },
  {
    icon: 'iconfont icon-zhuyuan',
    title: '在院人数',
    value: Math.round(transInpatient.value),
    unit: '人',
    footerLabel: '床位使用率',
    footerValue: '85.3%',
    trend: 'normal',
    type: 'success',
  },
  {
    icon: 'iconfont icon-shoushu',
    title: '手术台数',
    value: Math.round(transSurgery.value),
    unit: '台',
    footerLabel: '手术完成率',
    footerValue: '98.2%',
    trend: 'up',
    type: 'warning',
  },
  {
    icon: 'iconfont icon-yaopin',
    title: '药品库存预警',
    value: Math.round(transMedicine.value),
    unit: '种',
    footerLabel: '需要补货',
    footerValue: '待处理',
    trend: 'warning',
    type: 'danger',
  },
])

// 初始化收入统计图表
const initIncomeChart = () => {
  const chart = echarts.init(incomeChart.value)
  const option = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['门诊收入', '住院收入', '药品收入'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '门诊收入',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210],
        smooth: true,
        areaStyle: {
          opacity: 0.1,
        },
      },
      {
        name: '住院收入',
        type: 'line',
        data: [220, 182, 191, 234, 290, 330, 310],
        smooth: true,
        areaStyle: {
          opacity: 0.1,
        },
      },
      {
        name: '药品收入',
        type: 'line',
        data: [150, 232, 201, 154, 190, 330, 410],
        smooth: true,
        areaStyle: {
          opacity: 0.1,
        },
      },
    ],
  }
  chart.setOption(option)
}

// 初始化科室工作量图表
const initDeptChart = () => {
  const chart = echarts.init(deptChart.value)
  const option = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '科室工作量',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: '内科' },
          { value: 735, name: '外科' },
          { value: 580, name: '儿科' },
          { value: 484, name: '妇产科' },
          { value: 300, name: '急诊科' },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }
  chart.setOption(option)
}

// 更新当前时间的函数
const updateTime = () => {
  const now = new Date()
  timeObject.value.year = now.getFullYear()
  timeObject.value.month = now.getMonth()
  timeObject.value.day = now.getDate()
  timeObject.value.hourse = now.getHours()
  if (timeObject.value.hourse >= 0 && timeObject.value.hourse < 6) {
    timeText.value = '凌晨了,忙碌的同时要合理的休息,'
  } else if (timeObject.value.hourse >= 6 && timeObject.value.hourse < 10) {
    timeText.value = '早上好！开始新的一天 '
  } else if (timeObject.value.hourse >= 10 && timeObject.value.hourse < 14) {
    timeText.value = '中午好！注意休息 '
  } else if (timeObject.value.hourse >= 14 && timeObject.value.hourse < 20) {
    timeText.value = '下午好！继续加油 '
  } else {
    timeText.value = '晚上好！辛苦了'
  }

  timeObject.value.currentTime = now.toLocaleTimeString()
}

let intervalId
// 组件挂载
onMounted(() => {
  const user = userStore.getUser || {}
  userObject.value = {
    picture: user?.picture || '',
    userName: user?.userName || '',
    id: user?.userId || null,
  }
  if (user?.userId) {
    loading.value = false
  }

  updateTime()
  intervalId = setInterval(updateTime, 1000)

  // 初始化图表
  initIncomeChart()
  initDeptChart()

  // 设置数字动画目标值
  outpatientCount.value = 156
  inpatientCount.value = 328
  surgeryCount.value = 42
  medicineCount.value = 15

  // 监听窗口大小变化，重绘图表
  window.addEventListener('resize', () => {
    incomeChart.value && echarts.getInstanceByDom(incomeChart.value)?.resize()
    deptChart.value && echarts.getInstanceByDom(deptChart.value)?.resize()
  })
})

// 组件卸载
onUnmounted(() => {
  clearInterval(intervalId)
  // 销毁图表实例
  incomeChart.value && echarts.getInstanceByDom(incomeChart.value)?.dispose()
  deptChart.value && echarts.getInstanceByDom(deptChart.value)?.dispose()
  window.removeEventListener('resize', () => {})
})
</script>

<style scoped>
@import url('https://at.alicdn.com/t/c/font_4844128_go2jbgovf.css');
.mt-4px {
  margin-top: 4px;
}
.mt-10px {
  margin-top: 10px;
}
.el-card {
  border-radius: 12px !important;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}
.el-row {
  margin-bottom: 16px;
}
.el-statistic {
  background: linear-gradient(to right, #66ccff, #ff99cc);
  -webkit-background-clip: text;
  color: transparent;
}
.el-statistic .el-statistic__value {
  font-size: 24px;
  font-weight: bold;
  color: #ff5733;
}
.stat-card {
  background: linear-gradient(to right, #f9f9f9, #e3f2fd);
  border-left: 5px solid #42b983;
}
body {
  background: linear-gradient(to right, #f8f9fa, #e3f2fd);
}
.dark-mode {
  background-color: #121212;
  color: white;
}
.el-image {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}
.el-avatar:hover {
  transform: scale(1.1);
  transition: 0.3s;
}
.el-statistic:hover {
  color: #ff9900;
}
.mt-20 {
  margin-top: 20px;
}
.user-card {
  height: 100%;
  .user-info {
    text-align: center;
    .user-avatar {
      margin: 20px auto;
      border: 4px solid var(--el-color-primary-light-3);
      transition: all 0.3s;
      &:hover {
        transform: scale(1.05);
        border-color: var(--el-color-primary);
      }
    }
    .user-name {
      font-size: 20px;
      margin: 16px 0 8px;
      color: var(--el-text-color-primary);
    }
    .user-welcome {
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
    .quick-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 16px;
    }
  }
}
.time-weather-card,
.links-card {
  height: 100%;
  .time-info {
    height: calc(100% - 32px);
    display: flex;
    align-items: center;
  }
}
.links-card {
  .card-title {
    margin: 0 0 20px;
    font-size: 18px;
    color: var(--el-text-color-primary);
  }
  .link-list {
    display: flex;
    gap: 12px;
    .link-btn {
      flex: 1;
      .el-icon {
        margin-right: 4px;
      }
    }
  }
}
.data-card {
  height: 180px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
  }
  &:hover {
    transform: translateY(-5px);
  }
  &.primary::before {
    background-color: var(--el-color-primary);
  }
  &.success::before {
    background-color: var(--el-color-success);
  }
  &.warning::before {
    background-color: var(--el-color-warning);
  }
  &.danger::before {
    background-color: var(--el-color-danger);
  }
}
.data-skeleton {
  padding: 20px;
  > * {
    margin-bottom: 16px;
  }
}
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.data-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.data-header i {
  font-size: 24px;
  margin-right: 8px;
  color: var(--el-color-primary);
}
.data-content {
  font-size: 28px;
  font-weight: bold;
  color: var(--el-color-primary);
  margin-bottom: 20px;
}
.unit {
  font-size: 14px;
  margin-left: 4px;
  color: var(--el-text-color-secondary);
}
.data-footer {
  display: flex;
  justify-content: space-between;
  color: var(--el-text-color-secondary);
}
.up {
  color: #67c23a;
}
.down {
  color: #f56c6c;
}
.warning {
  color: #e6a23c;
}
.normal {
  color: #409eff;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.notice-list,
.todo-list {
  .notice-item,
  .todo-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    &:last-child {
      border-bottom: none;
    }
  }
}
.notice-title,
.todo-title {
  flex: 1;
  margin: 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.notice-time,
.todo-time {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.el-tag {
  width: 48px;
  text-align: center;
}
.notice-card {
  height: 100%;
  .notice-list {
    height: calc(100% - 60px); /* 减去header的高度 */
    overflow-y: auto;
  }
}
.time-weather-card {
  height: 100%;
  .time-info {
    height: calc(100% - 32px);
    display: flex;
    align-items: center;
    padding: 0 20px;

    .current-time {
      flex: 1;
      .time-display {
        h2 {
          font-size: 42px;
          font-weight: 600;
          margin: 0;
          background: linear-gradient(45deg, var(--el-color-primary), #409eff);
          -webkit-background-clip: text;
          color: transparent;
          letter-spacing: 2px;
        }

        .date-info {
          display: flex;
          align-items: center;
          margin-top: 16px;
          color: var(--el-text-color-regular);
          font-size: 16px;

          .el-icon {
            margin-right: 8px;
            color: var(--el-color-primary);
          }
        }
      }
    }

    .time-divider {
      height: 80%;
      margin: 0 30px;
    }

    .weather-info {
      flex: 1;
      .weather-content {
        .weather-location {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          color: var(--el-text-color-regular);
          font-size: 16px;

          .el-icon {
            margin-right: 8px;
            color: var(--el-color-primary);
          }
        }

        .weather-data {
          .temperature {
            margin-bottom: 16px;

            .temp-value {
              font-size: 36px;
              font-weight: 600;
              color: var(--el-color-primary);
              margin-right: 12px;
            }

            .weather-desc {
              font-size: 18px;
              color: var(--el-text-color-regular);
            }
          }

          .weather-details {
            display: flex;
            gap: 20px;

            .detail-item {
              display: flex;
              align-items: center;
              color: var(--el-text-color-regular);

              .el-icon {
                margin-right: 8px;
                color: var(--el-color-primary);
              }
            }
          }
        }
      }
    }
  }
}
</style>
