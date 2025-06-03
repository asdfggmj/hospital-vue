<template>
  <el-card shadow="hover">
    <div ref="chartRef" class="chart"></div>
  </el-card>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// ⭐️ 接收 props 传入的动态数据
const props = defineProps({
  chartData: {
    type: Array,
    required: true,
    default: () => [],
  },
  title: {
    type: String,
    default: '数据统计',
  },
})

const chartRef = ref(null) // 绑定 DOM
let myChart = null // 存储 ECharts 实例

// 初始化 ECharts
const initChart = () => {
  if (!chartRef.value) return

  myChart = echarts.init(chartRef.value)
  updateChart() // 🔥 初始化时调用 updateChart
  window.addEventListener('resize', () => myChart.resize())
}

// 更新 ECharts 图表
const updateChart = () => {
  if (!myChart) return
  myChart.setOption({
    title: {
      text: props.title,
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      bottom: 10,
      left: 'center',
    },
    series: [
      {
        name: '数量',
        type: 'pie',
        radius: '50%',
        data: props.chartData, // ⭐️ 绑定动态数据
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  })
}

// 监听 props 数据变化，动态更新图表
watch(() => props.chartData, updateChart, { deep: true })

// 组件挂载后初始化图表
onMounted(() => {
  nextTick(() => initChart())
})

// 组件卸载时，移除 resize 监听
onUnmounted(() => {
  window.removeEventListener('resize', () => myChart?.resize())
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 400px;
}
</style>
