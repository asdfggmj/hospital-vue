<template>
  <!-- 第一行 -->
  <el-row>
    <el-col :span="24" style="text-align: right">
      <el-card shadow="always">
        <el-row justify="space-between">
          <!-- 左侧 -->
          <el-col :span="5">
            <el-form>
              <el-form-item label="所属科室">
                <el-select
                  v-model="selectedDeptValue"
                  @click="getDepts"
                  @change="selectByDoctorId"
                  placeholder="请选择所属科室"
                  clearable
                >
                  <el-option
                    v-for="item in deptData"
                    :key="item.deptId"
                    :label="item.deptName"
                    :value="item.deptId"
                  />
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="5" class="ml-10px">
            <el-form>
              <el-form-item label="医生名字">
                <el-select
                  v-model="selectedDoctorValue"
                  @click="getUsers"
                  @change="selectByDoctorId"
                  placeholder="请选择医生名字"
                  clearable
                >
                  <el-option
                    v-for="item in doctorData"
                    :key="item.userId"
                    :label="item.userName"
                    :value="item.userId"
                  />
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="1">
            <el-button type="danger" @click="clearQueryCondition">清空条件</el-button>
          </el-col>
          <!-- 右侧 -->
          <el-col :span="12">
            <el-button type="primary" @click="lastWeek">
              <el-icon><ArrowLeftBold /></el-icon>
              <span>上一周</span>
            </el-button>
            <el-button type="success" @click="thisWeek">当前周</el-button>
            <el-button type="primary" @click="nextWeek">
              <el-icon><ArrowRightBold /></el-icon>
              <span>下一周</span>
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
  <!-- 第二行 -->
  <el-row class="mt-10px">
    <el-col>
      <el-card shadow="always">
        <el-row>
          <el-col :span="24" style="text-align: center">
            <el-text>{{ weekDates[0] + '(周一)' + '到' + weekDates[6] + '(周日)' }}</el-text>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
  <!-- 第三行 -->
  <el-row class="mt-10px">
    <el-col>
      <el-card shadow="always" v-loading="loading">
        <el-row>
          <el-col :span="24">
            <el-table
              border
              :data="schedulingData"
              :span-method="objectSpanMethod"
              row-key="userId"
              max-height="500"
            >
              <el-table-column
                label="医生"
                prop="userName"
                align="center"
                width="120"
                fixed="left"
              />
              <el-table-column
                label="科室"
                prop="deptName"
                align="center"
                width="120"
                fixed="left"
              />
              <el-table-column
                label="时间段"
                prop="subsectionType"
                align="center"
                width="120"
                fixed="left"
              >
                <template #default="scope">
                  <span>{{ timesDataMap[scope.row.subsectionType] }}</span>
                </template>
              </el-table-column>
              <el-table-column
                v-for="(date, index) in weekDates"
                :key="index"
                :label="`${date}(周${['一', '二', '三', '四', '五', '六', '日'][index]}) `"
                width="160"
              >
                <template #default="{ row }">
                  <span v-if="row.schedulingType[index]">
                    {{ schedulingTypeMap[row.schedulingType[index]] || row.schedulingType[index] }}
                  </span>
                  <span v-else>--</span>
                </template>
              </el-table-column>
              <!-- 操作列 -->
              <el-table-column label="操作" align="center" width="120" fixed="right">
                <template #default="scope">
                  <el-button
                    size="small"
                    type="primary"
                    @click="editScheduling(scope.row)"
                    :disabled="weekToAdd < 0"
                  >
                    <el-icon><Edit /></el-icon>
                    <span>排班</span>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>

  <!-- 医生排班对话框 -->
  <el-dialog
    v-model="dialogVisible"
    :title="schedulingEditTitle"
    style="min-width: 1200px; max-width: 1800px"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-row>
      <el-col :span="24">
        <!-- 数据表格 -->
        <el-table :data="aScheduleData">
          <el-table-column label="时间段" prop="subsectionType" align="center">
            <template #default="scope">
              <span>{{ timesDataMap[scope.row.subsectionType] }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-for="(date, index) in weekDates"
            :key="index"
            :label="`${date}(周${['一', '二', '三', '四', '五', '六', '日'][index]}) `"
          >
            <template #default="{ row }">
              <el-select
                v-model="row.schedulingType[index]"
                @focus="getAllShiftTypeDataFetch"
                placeholder="请选择排班类型"
                clearable
              >
                <el-option
                  v-for="item in shiftTypeData"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitShiftTypeData"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import http from '@/http'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'

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
const loading = ref(false)

onMounted(() => {
  getDoctorFetch()
  getSchedulingType()
  getTimesData()
})

//获取上周排班信息
const lastWeek = () => {
  weekToAdd.value = weekToAdd.value - 1
  getDoctorFetch()
  ElMessage.success(`时间已往前偏移${weekToAdd.value}周`)
}
//获取本周排班信息
const thisWeek = () => {
  if (weekToAdd.value === 0) {
    ElMessage.warning('当前日期已经是本周日期了！')
    return
  }
  weekToAdd.value = 0
  getDoctorFetch()
}
//获取下周排班信息
const nextWeek = () => {
  weekToAdd.value = weekToAdd.value + 1
  getDoctorFetch()
  ElMessage.success(`时间已往后偏移${weekToAdd.value}周`)
}

//清空查询条件
const clearQueryCondition = () => {
  //判断医生排班数据如果>0则清空数组
  if (schedulingData.value.length !== 0) {
    //清空排班医生数据
    schedulingData.value = []
  }
  //清空查询条件
  selectedDoctorValue.value = selectedDeptValue.value = ''
  //再查询一遍医生排版数据
  getDoctorFetch()
}

//根据医生名字查询排班
const selectByDoctorId = () => {
  schedulingData.value = []
  getDoctorFetch()
}

//获取排班时间段数据
const getTimesData = () => {
  http.get('/dictData/get/his_subsection_type').then((res) => {
    const dictData = res.data.data || []
    timesDataMap.value = dictData.reduce((map, item) => {
      map[Number(item.dictValue)] = item.dictLabel
      return map
    }, {})
  })
}

//获取排班类型数据
const getSchedulingType = () => {
  http.get('/dictData/get/his_scheduling_type').then((res) => {
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
    .post('/doctors/updateSchedule', formattedData)
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
  if (shiftTypeData.value.length === 0) {
    http.get('/dictData/get/his_scheduling_type').then((res) => {
      shiftTypeData.value = res.data.data
    })
  }
}

//获取所有医生用户信息
const getUsers = () => {
  if (doctorData.value.length === 0) {
    http.get('/user/getNormal').then((res) => {
      doctorData.value = res.data.data
    })
  }
}

//获取所有部门信息
const getDepts = () => {
  if (deptData.value.length === 0) {
    http.get('/dept/getAll').then((res) => {
      deptData.value = res.data.data
    })
  }
}

//获取所有医生信息
const getDoctorFetch = () => {
  loading.value = true
  http
    .get('/doctors/ScheduleList', {
      params: {
        userId: selectedDoctorValue.value,
        deptId: selectedDeptValue.value,
        weekToAdd: weekToAdd.value,
      },
    })
    .then((res) => {
      if (res.data && res.data.data && res.data.data.length > 0) {
        schedulingData.value = res.data.data // 存储医生排班数据
        weekDates.value = res.data.data[0].dates // 获取排班日期
        setTimeout(() => {
          loading.value = false
        }, 500)
      } else {
        console.error('排班数据为空')
      }
    })
    .catch((error) => {
      console.error('获取排班数据失败:', error)
    })
}

// 跨行合并
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
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

//编辑医生排班
const editScheduling = (row) => {
  //判断如果aScheduleData的数组长度>0则清空
  if (aScheduleData.value.length !== 0) {
    //清空一个医生的排班数据数组
    aScheduleData.value = []
  }
  //判断周数是否正常，如果不正常给予提示并且不给发送后端
  if (weekToAdd.value < 0) return ElMessage.warning('当前不允许修改排班信息')
  //打开对话框
  dialogVisible.value = true
  // 获取用户名
  const user_name = row.userName
  //设置对话框标题
  schedulingEditTitle.value = `修改${user_name}的排班信息`
  //给选中的医生变量ID赋值
  selectedDoctorId.value = row.userId
  //根据用户编号获取排班数据
  console.log('医生ID', selectedDoctorId.value)

  http
    .get('/doctors/ScheduleList', {
      params: {
        userId: row.userId,
        weekToAdd: weekToAdd.value,
      },
    })
    .then((res) => {
      //为医生排班赋值
      aScheduleData.value = res.data.data
    })
}
</script>

<style>
.mr-20px {
  margin-right: 20px;
}
.mt-10px {
  margin-top: 10px;
}
.mb-10px {
  margin-bottom: 10px;
}
.ml-10px {
  margin-left: 10px;
}
.text-center {
  text-align: center;
}
</style>
