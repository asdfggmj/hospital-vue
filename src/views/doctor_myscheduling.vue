<template>
  <el-empty v-if="!needScheduling" :image-size="200" description="您不需要参与排班" />
  <div v-else class="scheduling-container">
    <!-- 顶部操作区 -->
    <div class="header-section">
      <!-- 右侧周切换 -->
      <div class="week-control">
        <el-button-group>
          <el-button text @click="lastWeek">
            <el-icon><ArrowLeftBold /></el-icon>
          </el-button>
          <el-button type="primary" text @click="thisWeek">本周</el-button>
          <el-button text @click="nextWeek">
            <el-icon><ArrowRightBold /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 日期显示 -->
    <div class="date-display">
      {{ weekDates[0] + ' ~ ' + weekDates[6] }}
    </div>

    <!-- 排班表格 -->
    <div class="table-section" v-loading="loading">
      <template v-if="aScheduleData.length === 0">
        <el-empty :image-size="200" description="本周暂无排班信息">
          <template #description>
            <p>本周期间暂无排班信息</p>
            <p class="empty-tip">您可以切换到其他周查看</p>
          </template>
        </el-empty>
      </template>
      <el-table
        v-else
        :data="aScheduleData"
        :span-method="objectSpanMethod"
        row-key="userId"
        border
        class="schedule-table"
      >
        <el-table-column label="医生" prop="userName" align="center" width="100" fixed="left" />
        <el-table-column label="科室" prop="deptName" align="center" width="120" fixed="left" />
        <el-table-column label="时段" prop="subsectionType" align="center" width="80" fixed="left">
          <template #default="scope">
            <el-tag size="small" :type="getTimeTagType(scope.row.subsectionType)">
              {{ timesDataMap[scope.row.subsectionType] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          v-for="(date, index) in weekDates"
          :key="index"
          :label="getWeekDayLabel(date, index)"
          min-width="140"
        >
          <template #default="{ row }">
            <el-tag
              v-if="row.schedulingType[index]"
              :type="getScheduleTagType(row.schedulingType[index])"
              size="small"
              effect="plain"
            >
              {{ schedulingTypeMap[row.schedulingType[index]] || row.schedulingType[index] }}
            </el-tag>
            <span v-else class="no-schedule">--</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import http from '@/http'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

interface QueryParams {
  userId: number | null
  weekToAdd: number
}

//排班医生数据
const userStore = useUserStore()
const aScheduleData = ref([])
const weekDates = ref([])
const timesDataMap = ref({})
const schedulingTypeMap = ref({})
const weekToAdd = ref(0)
const loading = ref(true)
const needScheduling = ref(true)

//查询我的排班数据参数
const queryMySchedulingData = reactive<QueryParams>({
  userId: null,
  weekToAdd: 0,
})

onMounted(() => {
  getMySchedulingData()
  getTimesData()
  getSchedulingType()
})

//获取排班时间段数据
const getTimesData = () => {
  http.get('/dict/dict/getDictByType/his_subsection_type').then((res) => {
    const dictData = res.data.data || []
    timesDataMap.value = dictData.reduce((map, item) => {
      map[Number(item.dictValue)] = item.dictLabel
      return map
    }, {})
  })
}

//获取排班类型数据
const getSchedulingType = () => {
  http.get('/dict/dict/getDictByType/his_scheduling_type').then((res) => {
    const dictData = res.data.data || []
    schedulingTypeMap.value = dictData.reduce((map, item) => {
      map[Number(item.dictValue)] = item.dictLabel
      return map
    }, {})
  })
}

//获取上周排班信息
const lastWeek = () => {
  weekToAdd.value--
  getMySchedulingData()
  ElMessage.success(`时间已往前偏移${weekToAdd.value}周`)
}

//获取本周排班信息
const thisWeek = () => {
  if (weekToAdd.value === 0) {
    ElMessage.warning('当前日期已经是本周日期了！')
    return
  }
  weekToAdd.value = 0
  getMySchedulingData()
}

//获取下周排班信息
const nextWeek = () => {
  weekToAdd.value++
  getMySchedulingData()
  ElMessage.success(`时间已往后偏移${weekToAdd.value}周`)
}

//获取我的排班信息
const getMySchedulingData = () => {
  loading.value = true
  //获取用户编号
  const user = userStore.getUser
  if (!user || !user.userId) {
    loading.value = false
    ElMessage.error('获取用户信息失败')
    return
  }

  queryMySchedulingData.userId = user.userId
  queryMySchedulingData.weekToAdd = weekToAdd.value

  //根据编号获取排班信息
  http
    .post('/doctors/doctors/ScheduleList', queryMySchedulingData)
    .then((res) => {
      if (res.data.code === '00000') {
        // 判断是否需要参与排班
        if (weekToAdd.value === 0 && res.data.data.total === 0) {
          needScheduling.value = false
          return
        }

        needScheduling.value = true
        if (res.data.data.list?.length > 0) {
          aScheduleData.value = res.data.data.list
          weekDates.value = res.data.data.list[0].dates
        } else {
          aScheduleData.value = []
          weekDates.value = []
        }
      }
    })
    .catch((error) => {
      console.error('获取排班数据失败:', error)
      ElMessage.error('获取排班数据失败')
      aScheduleData.value = []
      weekDates.value = []
      needScheduling.value = true
    })
    .finally(() => {
      loading.value = false
    })
}

// 跨行合并
const objectSpanMethod = ({ rowIndex, columnIndex }) => {
  // 需要合并的列（第一列、第二列、最后一列）
  if (columnIndex === 0 || columnIndex === 1 || columnIndex === 10) {
    if (rowIndex % 3 === 0) {
      return [3, 1] // 纵向合并3行
    } else {
      return [0, 0] // 不显示该单元格
    }
  }
  return [1, 1] // 默认单元格
}

//新增方法
const getTimeTagType = (type) => {
  const types = {
    1: 'success', // 上午
    2: 'warning', // 下午
    3: 'info', // 晚上
  }
  return types[type] || ''
}

const getScheduleTagType = (type) => {
  const types = {
    1: 'success', // 门诊
    2: 'danger', // 急诊
  }
  return types[type] || 'info'
}

const getWeekDayLabel = (date, index) => {
  const weekDays = ['一', '二', '三', '四', '五', '六', '日']
  return `${date.slice(-5)}\n周${weekDays[index]}`
}
</script>

<style scoped>
.scheduling-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header-section {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 8px;
}

.week-control {
  display: flex;
  align-items: center;
}

.date-display {
  font-size: 20px;
  color: var(--el-text-color-primary);
  text-align: center;
  margin-bottom: 24px;
  font-weight: 500;
}

.table-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.schedule-table {
  margin-bottom: 20px;
}

:deep(.el-table) {
  --el-table-border-color: #ebeef5;
  --el-table-header-bg-color: #f8f9fa;
}

:deep(.el-table th) {
  font-weight: 600;
  color: var(--el-text-color-regular);
}

:deep(.el-table td) {
  padding: 8px 0;
}

.no-schedule {
  color: var(--el-text-color-placeholder);
}

.empty-tip {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-top: 8px;
}
</style>
