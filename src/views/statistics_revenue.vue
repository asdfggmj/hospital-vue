<!-- 收支统计 -->
<template>
  <el-row style="text-align: center">
    <el-col :span="24">
      <el-text type="danger">
        *注意: 默认只查询当天的数据，如果需要查询其他的，请选择范围查询
      </el-text>
      <el-divider />
    </el-col>
  </el-row>
  <!-- 第一行 -->
  <el-row>
    <el-col>
      <!-- 卡片 -->
      <el-card shadow="hover">
        <!-- 第一行 -->
        <el-row>
          <el-col :span="10">
            <el-form-item label="选择时间">
              <div class="demo-date-picker">
                <div class="block">
                  <el-date-picker
                    v-model="valueDate"
                    :shortcuts="shortcuts"
                    type="daterange"
                    style="width: 100%"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    unlink-panels="false"
                  >
                  </el-date-picker>
                </div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="17" style="margin-left: 10px">
            <el-button type="primary" @click="searchByDate">搜索</el-button>
            <el-button type="info" @click="reset">重置</el-button>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
  <!-- 第二行 -->
  <el-row style="margin-top: 10px">
    <el-col>
      <el-card shadow="hover">
        <el-row justify="space-evenly">
          <el-col :span="7">合计收入: ￥{{ statisticsData.income.toFixed(2) }}</el-col>
          <el-col :span="7">合计退费: ￥{{ statisticsData.refund.toFixed(2) }}</el-col>
          <el-col :span="7">剩余收入: ￥{{ statisticsData.netIncome.toFixed(2) }}</el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
  <!-- 第三行 -->
  <el-row style="margin-top: 10px">
    <el-col>
      <el-card shadow="hover">
        <el-row>
          <el-col>
            <el-text>收入概况: </el-text>
          </el-col>
        </el-row>
        <el-row justify="space-evenly" style="margin-top: 10px">
          <el-col :span="8"
            >现金: ￥{{ statisticsData.incomeByChannel[0].value.toFixed(2) }}</el-col
          >
          <!-- <el-col :span="6">微信: 999￥</el-col> -->
          <el-col :span="16"
            >支付宝:￥{{ statisticsData.incomeByChannel[1].value.toFixed(2) }}
          </el-col>
          <!-- <el-col :span="6">其他银联: 999￥</el-col> -->
        </el-row>
        <el-row style="margin-top: 20px">
          <el-col>
            <el-text>退费概况: </el-text>
          </el-col>
        </el-row>
        <el-row justify="space-evenly" style="margin-top: 10px">
          <el-col :span="8"
            >现金: ￥{{ statisticsData.refundByChannel[0].value.toFixed(2) }}</el-col
          >
          <!-- <el-col :span="6">微信: 999￥</el-col> -->
          <el-col :span="16"
            >支付宝: ￥{{ statisticsData.refundByChannel[1].value.toFixed(2) }}</el-col
          >
          <!-- <el-col :span="6">其他银联: 999￥</el-col> -->
        </el-row>
      </el-card>
    </el-col>
  </el-row>
  <el-row style="margin-top: 20px" justify="space-evenly">
    <el-col :span="7">
      <PieChart :chartData="pieData1" title="收支概览" />
    </el-col>
    <el-col :span="7">
      <PieChart :chartData="pieData2" title="收入渠道" />
    </el-col>
    <el-col :span="7">
      <PieChart :chartData="pieData3" title="退款概览" />
    </el-col>
    <!-- 这是图表容器的唯一根元素 -->
    <div ref="chartRef" class="pie-chart"></div>
  </el-row>
</template>

<script setup lang="ts">
import PieChart from '@/components/pie_chart.vue'
import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { formatDate } from '@/utils/dateUtils'
import http from '@/http'
import * as echarts from 'echarts'
import { format } from 'date-fns'

//快速选择日期范围
const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      return [start, end]
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      return [start, end]
    },
  },
]

//统计数据
const statisticsData = ref({
  income: 0, //总收入
  refund: 0, //总退费
  netIncome: 0, //净收入
  //不同渠道收入金额 0：现金 1：支付宝
  incomeByChannel: [
    { name: '0', value: 0 },
    { name: '1', value: 0 },
  ],
  //不同渠道退费金额  0：现金 1：支付宝
  refundByChannel: [
    { name: '0', value: 0 },
    { name: '1', value: 0 },
  ],
})

const valueDate = ref([]) //日期范围数组
const pickdata = reactive({
  //开始日期和结束日期
  startDate: '',
  endDate: '',
})

const pieData1 = computed(() => {
  const total = statisticsData.value.income + statisticsData.value.refund
  return [
    {
      value: statisticsData.value.income,
      name: `收费金额(${total === 0 ? '%' : ((statisticsData.value.income / total) * 100).toFixed(1) + '%'})`,
    },
    {
      value: statisticsData.value.refund,
      name: `退费金额(${total === 0 ? '%' : ((statisticsData.value.refund / total) * 100).toFixed(1) + '%'})`,
    },
  ]
})

// 修改后的 pieData2
const pieData2 = computed(() => {
  const total = statisticsData.value.incomeByChannel.reduce((sum, item) => sum + item.value, 0)
  return statisticsData.value.incomeByChannel.map((item) => ({
    value: item.value,
    name: `${item.name === '0' ? '现金' : '支付宝'}(${total === 0 ? '%' : ((item.value / total) * 100).toFixed(1) + '%'})`,
  }))
})

// 修改后的 pieData3
const pieData3 = computed(() => {
  const total = statisticsData.value.refundByChannel.reduce((sum, item) => sum + item.value, 0)
  return statisticsData.value.refundByChannel.map((item) => ({
    value: item.value,
    name: `${item.name === '0' ? '现金' : '支付宝'}(${total === 0 ? '%' : ((item.value / total) * 100).toFixed(1) + '%'})`,
  }))
})

const props = defineProps({
  chartData: Array,
  title: String,
})

const chartRef = ref<HTMLElement>() // 绑定到模板中的 div
let chartInstance: echarts.ECharts | null = null

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    updateChart()
  }
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance) return
  const option = {
    title: { text: props.title },
    tooltip: {
      formatter: ({ data }) => {
        // 将 (0%) 替换为 (%)
        return `${data.name.replace('(0%)', '(%)')}`
      },
    },
    series: [
      {
        type: 'pie',
        data: props.chartData,
        label: {
          /* ... */
        },
      },
    ],
  }
  chartInstance.setOption(option)
}

// 监听数据变化
watch(() => props.chartData, updateChart, { deep: true })

// 重置按钮，清空数据
const reset = () => {
  valueDate.value = []
  pickdata.startDate = ''
  pickdata.endDate = ''
  // 手动重置 statisticsData.value 的每一个字段，确保响应式更新
  statisticsData.value.income = 0.0
  statisticsData.value.refund = 0.0
  statisticsData.value.netIncome = 0.0
  statisticsData.value.incomeByChannel = [
    { name: '0', value: 0.0 },
    { name: '1', value: 0.0 },
  ]
  statisticsData.value.refundByChannel = [
    { name: '0', value: 0.0 },
    { name: '1', value: 0.0 },
  ]

  // 重置后重新请求默认数据（即使当天数据为空，也会覆盖旧数据）
  getData()
}

// 获取开始和结束日期
const searchByDate = () => {
  // if (valueDate.value.length === 0) {
  //   ElMessage({
  //     message: '请输入要查询的日期！',
  //     type: 'warning',
  //     duration: 3000
  //   })
  // } else {
  if (valueDate.value.length !== 0) {
    // 格式化日期为 yyyy-MM-dd
    pickdata.startDate = format(new Date(valueDate.value[0]), 'yyyy-MM-dd')
    pickdata.endDate = format(new Date(valueDate.value[1]), 'yyyy-MM-dd')
  }
  //刷新
  getData()
}

//页面挂载
onMounted(() => {
  initChart()
  //获取统计数据
  getData()
})
onBeforeUnmount(() => chartInstance?.dispose())

// 获取统计数据
const getData = () => {
  //发送后端异步请求
  http
    .get('statistics/statistics/getStatistics', {
      params: {
        startDate: pickdata.startDate,
        endDate: pickdata.endDate,
      },
    })
    .then((res) => {
      // 补全 refundByChannel（确保始终包含现金和支付宝）
      const refundChannels = ['0', '1'] // 0: 现金, 1: 支付宝
      const refundByChannel = refundChannels.map((channel) => {
        const existing = res.data.data.refundByChannel?.find((item) => item.name === channel)
        return existing || { name: channel, value: 0 } // 不存在则填充默认值
      })
      // 补全 incomeByChannel（确保始终包含现金和支付宝）
      const incomeByChannels = ['0', '1'] // 0: 现金, 1: 支付宝
      const incomeByChannel = incomeByChannels.map((channel) => {
        const existing = res.data.data.incomeByChannel?.find((item) => item.name === channel)
        return existing || { name: channel, value: 0 } // 不存在则填充默认值
      })
      // 更新数据（强制替换整个对象）
      statisticsData.value = {
        income: res.data.data.income || 0,
        refund: res.data.data.refund || 0,
        netIncome: res.data.data.netIncome || 0,
        incomeByChannel: incomeByChannel,
        refundByChannel: refundByChannel,
      }

      //console.log(statisticsData.value)
      //更新饼图数据
      pieData1.value = pieData1.value.map((item) => ({
        ...item,
      }))

      pieData2.value = pieData2.value.map((item) => ({
        ...item,
      }))

      pieData3.value = pieData3.value.map((item) => ({
        ...item,
      }))
    })
}
</script>
<style></style>
