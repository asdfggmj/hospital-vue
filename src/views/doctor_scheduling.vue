<template>
  <div class="scheduling-container">
    <!-- 顶部操作区 -->
    <div class="header-section">
      <!-- 左侧筛选 -->
      <div class="filter-section">
        <el-select
          v-model="selectedDeptValue"
          @click="getDepts"
          placeholder="选择科室"
          clearable
          class="filter-select"
        >
          <el-option
            v-for="item in deptData"
            :key="item.deptId"
            :label="item.deptName"
            :value="item.deptId"
          />
        </el-select>

        <el-select
          v-model="selectedDoctorValue"
          @click="getUsers"
          placeholder="选择医生"
          clearable
          class="filter-select"
        >
          <el-option
            v-for="item in doctorData"
            :key="item.userId"
            :label="item.userName"
            :value="item.userId"
          />
        </el-select>

        <el-button text type="danger" @click="clearQueryCondition" class="clear-btn">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>

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
      <el-table
        :data="schedulingData"
        :span-method="objectSpanMethod"
        row-key="userId"
        border
        class="schedule-table"
        max-height="calc(90vh - 300px)"
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

        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="scope">
            <el-button
              link
              type="primary"
              :disabled="weekToAdd < 0"
              @click="editScheduling(scope.row)"
            >
              <el-icon><Edit /></el-icon>
              <el-text>编辑</el-text>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="pageTotal"
          :page-size="pageSize"
          :current-page="pageNum"
          @current-change="currentChange"
        />
      </div>
    </div>

    <!-- 排班编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="schedulingEditTitle"
      width="90%"
      class="schedule-dialog"
      destroy-on-close
    >
      <el-table :data="aScheduleData" class="edit-table">
        <el-table-column label="时段" prop="subsectionType" width="100" align="center">
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
        >
          <template #default="{ row }">
            <el-select
              v-model="row.schedulingType[index]"
              placeholder="选择排班"
              clearable
              class="schedule-select"
            >
              <el-option
                v-for="item in shiftTypeData"
                :key="item.dictValue"
                :label="schedulingTypeMap[Number(item.dictValue)]"
                :value="item.dictValue"
              />
            </el-select>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button link @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitShiftTypeData">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import http from '@/http'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'

const timesDataMap = ref({}) //存储排班时间类型字典
const schedulingTypeMap = ref({}) //存储排班类型字典
const dialogVisible = ref(false) //对话框控制显示
const schedulingData = ref([]) //排班医生数据
const aScheduleData = ref([]) //一个排班医生数据
const selectedDoctorId = ref('') //点击排班后选中的医生ID
const shiftTypeData = ref([]) //排班信息数据
const deptData = ref([]) //部门数据
const doctorData = ref([]) //医生(用户)数据
const selectedDeptValue = ref('') //选中的部门值
const selectedDoctorValue = ref('') //选中的医生值
const schedulingEditTitle = ref('') //编辑标题
const weekDates = ref([]) // 本周日期
const weekToAdd = ref(0) //周位移  -1代表上周 0本周 1下周
const loading = ref(false) //表格加载动画
const pageNum = ref(1) //当前页
const pageSize = ref(27) //每页显示的数据
const pageTotal = ref(0) //总个数

//组件挂载时执行的方法
onMounted(() => {
  getDoctorFetch()
  getSchedulingType()
  getTimesData()
})

// 1. 首先修改查询参数的处理方式
const queryParams = reactive({
  userId: null,
  deptId: null,
  weekToAdd: 0,
  pageNum: 1,
  pageSize: 27,
})

// 监听各个参数的变化
watch([selectedDoctorValue, selectedDeptValue, weekToAdd], ([doctorVal, deptVal, weekVal]) => {
  queryParams.userId = doctorVal
  queryParams.deptId = deptVal
  queryParams.weekToAdd = weekVal
  getDoctorFetch()
})

const currentChange = (newPage) => {
  queryParams.pageNum = newPage
  pageNum.value = newPage // 同步页码状态
  getDoctorFetch()
}

// 修改获取数据的方法
const getDoctorFetch = () => {
  loading.value = true
  http
    .post('/doctors/doctors/ScheduleList', queryParams)
    .then((res) => {
      if (res.data.data.list?.length > 0) {
        pageTotal.value = res.data.data.total
        schedulingData.value = res.data.data.list
        weekDates.value = res.data.data.list[0].dates
      } else {
        ElMessage.warning('暂无排班数据')
        schedulingData.value = []
        weekDates.value = []
      }
    })
    .catch((error) => {
      console.error('获取排班数据失败:', error)
      ElMessage.error('获取排班数据失败，请稍后重试')
      schedulingData.value = []
      weekDates.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

// 2. 修改跨行合并方法，删除未使用的参数
const objectSpanMethod = ({ rowIndex, columnIndex }) => {
  // 需要合并的列（医生姓名、科室、操作列）
  if (columnIndex === 0 || columnIndex === 1 || columnIndex === 10) {
    // 由于每个医生固定有3个时段，所以每3行合并
    const rowGroup = Math.floor(rowIndex / 3)
    const firstRowInGroup = rowGroup * 3

    // 确保是同一个医生的数据
    if (rowIndex === firstRowInGroup) {
      // 检查是否和下一行是同一个医生
      if (
        rowIndex + 1 < schedulingData.value.length &&
        schedulingData.value[rowIndex].userId === schedulingData.value[rowIndex + 1].userId
      ) {
        return [3, 1] // 合并3行
      } else {
        return [1, 1] // 不合并
      }
    } else if (
      rowIndex > 0 &&
      schedulingData.value[rowIndex].userId === schedulingData.value[rowIndex - 1].userId
    ) {
      return [0, 0] // 被合并的行不显示
    } else {
      return [1, 1] // 不合并
    }
  }
  return [1, 1] // 其他列不合并
}

// 3. 修改清空条件的方法
const clearQueryCondition = () => {
  // 重置所有查询参数
  Object.assign(queryParams, {
    userId: null,
    deptId: null,
    weekToAdd: 0,
    pageNum: 1,
    pageSize: 27,
  })

  // 清空选择的值
  selectedDoctorValue.value = ''
  selectedDeptValue.value = ''
  weekToAdd.value = 0

  // 清空数据
  schedulingData.value = []

  // 重新查询
  getDoctorFetch()
}

// 4. 修改周数相关的方法
const lastWeek = () => {
  weekToAdd.value--
  ElMessage.success(`时间已往前偏移${weekToAdd.value}周`)
}

const thisWeek = () => {
  if (weekToAdd.value === 0) {
    ElMessage.warning('当前日期已经是本周日期了！')
    return
  }
  weekToAdd.value = 0
}

const nextWeek = () => {
  weekToAdd.value++
  ElMessage.success(`时间已往后偏移${weekToAdd.value}周`)
}

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

//提交排班数据
const submitShiftTypeData = () => {
  // 组装编辑后的排班数据
  const formattedData = aScheduleData.value.map((row) => ({
    userId: row.userId, //用户编号
    deptId: row.deptId, //部门编号
    subsectionType: row.subsectionType, // 1=上午，2=下午，3=晚上
    schedulingType: row.schedulingType, // 排班类型，1.门诊，2.急诊
    dates: row.dates, // 对应日期
  }))
  //发送请求
  http
    .put('/doctors/doctors/updateSchedule', formattedData)
    .then(() => {
      ElMessage.success('排班信息更新成功')
      dialogVisible.value = false
      getDoctorFetch()
    })
    .catch(() => {
      ElMessage.error('更新失败，请重试')
    })
}

//获取所有排班信息数据
const getAllShiftTypeDataFetch = () => {
  http.get('/dict/dict/getDictByType/his_scheduling_type').then((res) => {
    shiftTypeData.value = res.data.data
  })
}

//获取所有医生用户信息
const getUsers = () => {
  if (doctorData.value.length === 0) {
    http.get('/user/user/getActiveDoctors').then((res) => {
      doctorData.value = res.data.data
    })
  }
}

//获取所有部门信息
const getDepts = () => {
  if (deptData.value.length === 0) {
    http.get('/dept/dept/getNormalDept').then((res) => {
      deptData.value = res.data.data
    })
  }
}

//关闭对话框前执行的方法
const handleClose = () => {
  ElMessageBox.confirm('你确定要关闭吗?所作的内容还没有保存呢', '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    dialogVisible.value = false
  })
}

//编辑医生排班查询条件
const editDoctorSchedulingQueryData = reactive({
  userId: null,
  weekToAdd: 0,
})

//编辑医生排班
const editScheduling = (row) => {
  //判断如果aScheduleData的数组长度>0则清空
  if (aScheduleData.value.length !== 0) {
    //清空一个医生的排班数据数组
    aScheduleData.value = []
  }
  //判断周数是否正常，如果不正常给予提示并且不给发送后端
  if (weekToAdd.value < 0) return ElMessage.warning('当前不允许修改排班信息')

  // 先获取排班类型数据
  getAllShiftTypeDataFetch()

  //打开对话框
  dialogVisible.value = true
  // 获取用户名
  const user_name = row.userName
  //设置对话框标题
  schedulingEditTitle.value = `修改${user_name}的排班信息`
  //给选中的医生变量ID赋值
  selectedDoctorId.value = row.userId

  //根据用户编号获取排班数据
  editDoctorSchedulingQueryData.userId = row.userId
  editDoctorSchedulingQueryData.weekToAdd = weekToAdd.value
  http.post('/doctors/doctors/ScheduleList', editDoctorSchedulingQueryData).then((res) => {
    //为医生排班赋值
    aScheduleData.value = res.data.data.list
  })
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 8px;
}

.filter-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  width: 160px;
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

/* 自定义滚动条样式 */
:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background: #dcdfe6;
  border-radius: 4px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background: #f5f7fa;
}

/* 确保分页器在底部 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-bottom: 20px;
}

.schedule-dialog {
  :deep(.el-dialog__header) {
    margin: 0;
    padding: 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.schedule-select {
  width: 100%;
}

.edit-table {
  :deep(.el-select) {
    width: 100%;
  }
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 16px;
  }

  .filter-section {
    width: 100%;
  }

  .filter-select {
    flex: 1;
  }
}
</style>
