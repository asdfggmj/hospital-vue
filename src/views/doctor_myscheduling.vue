<template>
  <el-empty v-if="aScheduleData.length === 0" :image-size="200" description="您不需要参与排班" />
  <div v-else>
    <el-row>
      <el-col :span="24" style="text-align: right">
        <el-card shadow="always">
          <el-button type="primary" @click="lastWeek">
            <el-icon><ArrowLeftBold /></el-icon>
            <span>上一周</span>
          </el-button>
          <el-button type="success" @click="thisWeek">当前周</el-button>
          <el-button type="primary" @click="nextWeek">
            <el-icon><ArrowRightBold /></el-icon>
            <span>下一周</span>
          </el-button>
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
                :data="aScheduleData"
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
                      {{
                        schedulingTypeMap[row.schedulingType[index]] || row.schedulingType[index]
                      }}
                    </span>
                    <span v-else>--</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import http from '@/http'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'

//排班医生数据
const userStore = useUserStore()
const aScheduleData = ref([]) //一个排班医生数据
const weekDates = ref([]) // 本周日期
const timesDataMap = ref({}) //存储排班时间类型字典
const schedulingTypeMap = ref({}) //存储排班类型字典
const weekToAdd = ref(0) //周位移  -1代表上周 0本周 1下周
const loading = ref(true)

onMounted(() => {
  getMySchedulingData()
  getTimesData()
  getSchedulingType()
})

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

//获取上周排班信息
const lastWeek = () => {
  weekToAdd.value = weekToAdd.value - 1
  getMySchedulingData()
  ElMessage.success(`时间已往前偏移${weekToAdd.value}周`)
}
//获取本周排班信息
const thisWeek = () => {
  if (weekToAdd.value === 0) {
    ElMessage.warning('当前日期已经是本周日期了哦！')
    return
  }
  weekToAdd.value = 0
  getMySchedulingData()
}
//获取下周排班信息
const nextWeek = () => {
  weekToAdd.value = weekToAdd.value + 1
  getMySchedulingData()
  ElMessage.success(`时间已往后偏移${weekToAdd.value}周`)
}

//获取我的排班信息
const getMySchedulingData = () => {
  loading.value = true
  //获取用户编号
  let userId = userStore.getUser.data.data.userId
  //根据编号获取排班信息
  http
    .get('/doctors/ScheduleList', {
      params: {
        userId: userId,
        weekToAdd: weekToAdd.value,
      },
    })
    .then((res) => {
      if (res.data && res.data.data && res.data.data.length > 0) {
        aScheduleData.value = res.data.data // 存储医生排班数据
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
