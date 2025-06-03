<!-- 工作量统计 -->
<template>
  <el-row style="text-align: center">
    <el-col :span="24">
      <el-text type="danger">
        *注意：默认只查询当天的数据，如果需要查询其他的，请选择范围查询
      </el-text>
      <el-divider />
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="24">
      <el-card shadow="always">
        <el-tabs v-model="activeName" class="demo-tabs">
          <el-tab-pane label="医生工作量统计列表" name="first">
            <el-row>
              <el-col :span="7">
                <span>医生姓名：</span>
                <el-input
                  placeholder="请输入医生名称"
                  v-model="doctorName"
                  style="width: 240px"
                ></el-input>
              </el-col>
              <el-col :span="10">
                <el-form-item label="就诊时间：">
                  <div class="demo-date-picker">
                    <div class="block">
                      <el-date-picker
                        v-model="valueDate"
                        type="daterange"
                        style="width: 100%"
                        :shortcuts="shortcuts"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        unlink-panels="false"
                      >
                      </el-date-picker>
                    </div>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="17" style="margin-left: 10px; margin-bottom: 20px">
                <el-button type="primary" @click="searchByDate">搜索</el-button>
                <el-button type="info" @click="reset">重置</el-button>
              </el-col>
            </el-row>

            <el-row>
              <el-col>
                <el-table :data="doctorData" border :summary-method="getDoctorItem" show-summary>
                  <el-table-column label="挂号ID" prop="regId" />
                  <el-table-column label="医生编号" prop="userId" />
                  <el-table-column label="医生姓名" prop="userName" />
                  <el-table-column label="挂号费用" prop="regItemAmount" />
                  <el-table-column label="患者姓名" prop="patientName" />
                  <el-table-column label="就诊时间">
                    <template #default="scope">
                      {{ scope.row.visitDate.replace('T', ' ') }}
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="总体工作量统计列表" name="second">
            <el-row>
              <el-col :span="7">
                <span>医生姓名：</span>
                <el-input
                  placeholder="请输入医生名称"
                  v-model="doctorName"
                  style="width: 240px"
                ></el-input>
              </el-col>
              <el-col :span="10">
                <el-form-item label="就诊时间：">
                  <div class="demo-date-picker">
                    <div class="block">
                      <el-date-picker
                        v-model="valueDate"
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
              <el-col :span="17" style="margin-left: 10px; margin-bottom: 20px">
                <el-button type="primary" @click="searchByDate">搜索</el-button>
                <el-button type="info" @click="reset">重置</el-button>
              </el-col>
            </el-row>
            <el-divider />
            <el-row>
              <el-col>
                <el-table :data="allData" border :summary-method="getTotalItem" show-summary>
                  <el-table-column label="医生编号" prop="userId" />
                  <el-table-column label="医生姓名" prop="userName" />
                  <el-table-column label="挂号总额" prop="totalRegNumber" />
                  <el-table-column label="接诊数量" prop="totalNumber" />
                </el-table>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </el-col>
    <!-- 分页行 -->
    <el-row class="mt-10px">
      <el-col :span="24">
        <el-pagination
          background
          layout="total,sizes,prev, pager, next,jumper"
          :total="pageTotal"
          :pager-count="11"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :current-page="pageNum"
          @size-change="sizeChange"
          @current-change="currentChange"
        />
      </el-col>
    </el-row>
  </el-row>
</template>

<script setup lang="ts">
import http from '@/http'
import { formatDate } from '@/utils/dateUtils'
import { format } from 'date-fns'
import { onMounted, reactive, ref } from 'vue'

const doctorData = ref([]) //医生工作量统计
const allData = ref([]) //总体工作量统计
const pageNum = ref(1) //当前页
const pageSize = ref(10) //每页显示的数据
const pageTotal = ref(0) //总个数
const valueDate = ref([]) //日期范围数组
const pickdata = reactive({
  //开始日期和结束日期
  startDate: '',
  endDate: '',
})
const doctorName = ref('') //医生名称
const activeName = ref('first')
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
//上一页
const sizeChange = (newPageSize) => {
  pageSize.value = newPageSize
  getData()
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
  getData()
}

// 搜索按钮，获取日期选择器
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
  //}
}

// 重置按钮，清空数据
const reset = () => {
  ;(valueDate.value = []),
    (pickdata.startDate = ''),
    (pickdata.endDate = ''),
    (doctorName.value = '')

  // 重置后重新请求默认数据（即使当天数据为空，也会覆盖旧数据）
  getData()
}

//页面挂载
onMounted(() => {
  //获取页面数据
  getData()
})

//获取检查列表页面数据
const getData = () => {
  //发送后端异步请求
  http
    .get('statistics/doctorWorkloadItem', {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        startDate: pickdata.startDate,
        endDate: pickdata.endDate,
        doctorName: doctorName.value,
      },
    })
    .then((res) => {
      doctorData.value = res.data.data.list
      pageTotal.value = res.data.data?.total || 0
    })
  //发送后端异步请求
  http
    .get('statistics/totalWorkloadItem', {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        startDate: pickdata.startDate,
        endDate: pickdata.endDate,
        doctorName: doctorName.value,
      },
    })
    .then((res) => {
      allData.value = res.data.data.list
      pageTotal.value = res.data.data?.total || 0
    })
}

//计算医生工作量统计列表合计
const getDoctorItem = (param) => {
  const { columns, data } = param
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (column.property === 'regItemAmount') {
      // 处理空数据：如果 data 为空，返回 0
      const values = data.length > 0 ? data.map((item) => Number(item[column.property])) : [0]
      sums[index] = values.reduce((prev, curr) => prev + curr, 0)
    } else {
      sums[index] = ''
    }
  })
  return sums
}

//计算检查总工作量合计
const getTotalItem = (param) => {
  const { columns, data } = param
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (column.property === 'totalRegNumber' || column.property === 'totalNumber') {
      // 处理空数据：如果 data 为空，返回 0
      const values = data.length > 0 ? data.map((item) => Number(item[column.property])) : [0]
      sums[index] = values.reduce((prev, curr) => prev + curr, 0)
    } else {
      sums[index] = ''
    }
  })
  return sums
}
</script>
