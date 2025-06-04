<!-- 看病就诊 -->
<template>
  <!-- 第一行 -->
  <el-row>
    <el-col>
      <el-card shadow="always" class="mb-10px">
        <el-row style="line-height: 50px">
          <el-col :span="8">
            <div class="flex gap-4 mb-4">
              <span>身份证号</span>
              <el-input
                clearable
                v-model="idCard"
                style="width: 320px; margin-left: 20px"
                placeholder="请输入身份证号"
              />
            </div>
          </el-col>
          <el-col :span="8" style="margin-left: 40px">
            <el-button type="primary" @click="getPatientFetch">
              <el-icon><Search /></el-icon>
              <span>加载身份证号</span>
            </el-button>
            <el-button type="primary" @click="addPatientFetch">
              <el-icon><Search /></el-icon>
              <span>加载患者信息</span>
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
  <!-- 第二行 -->
  <el-row>
    <el-col>
      <el-card shadow="always" class="mb-10px">
        <el-form :rules="rules" :model="hisPatient" ref="ruleFormRef" label-width="auto">
          <el-row>
            <el-col :span="5">
              <el-form-item label="身份证号" prop="idCard">
                <el-input
                  v-model="hisPatient.idCard"
                  placeholder="输入或导入身份证"
                  @input="handleIdCardInput"
                />
              </el-form-item>
              <el-form-item label="患者姓名" prop="name">
                <el-input v-model="hisPatient.name" placeholder="输入或导入名字" />
              </el-form-item>
            </el-col>
            <el-col :span="5" class="ml-20px">
              <el-form-item label="患者电话" prop="phone">
                <el-input v-model="hisPatient.phone" placeholder="输入或导入电话" />
              </el-form-item>
              <el-form-item label="出生日期" prop="birthDay">
                <el-date-picker
                  v-model="hisPatient.birthDay"
                  type="date"
                  placeholder="选择或导入出生日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="5" class="ml-20px">
              <el-form-item label="患者年龄">
                <el-input-number v-model="hisPatient.age" disabled :min="1" :max="200" />
              </el-form-item>
              <el-form-item label="患者性别">
                <el-radio-group v-model="hisPatient.sex">
                  <el-radio value="0">男</el-radio>
                  <el-radio value="1">女</el-radio>
                  <el-radio value="2">未知</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="患者地址">
                <el-cascader :options="pcaTextArr" v-model="selectedOptions" />
                <el-input
                  v-model="hisPatient.address"
                  :rows="4"
                  type="textarea"
                  placeholder="请输入患者详细地址"
                  resize="none"
                  class="mt-10px"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </el-col>
  </el-row>
  <!-- 第三行 -->
  <el-row>
    <el-col :span="24">
      <el-card shadow="always" class="mb-10px">
        <el-row justify="space-between">
          <el-col :span="10">
            <el-radio-group v-model="hisRegistration.regItemId">
              <el-radio-button
                v-for="item in registeredItems"
                :key="item.regItemId"
                :label="item.regItemName"
                :value="item.regItemId"
              >
                {{ item.regItemName }}
              </el-radio-button>
            </el-radio-group>
          </el-col>
          <el-col :span="5">
            <span class="mr-20px">挂号费：{{ getSelectedItemFee }}￥</span>
            <el-button type="danger" @click="joinFeeFetch">
              <el-icon><Pointer /></el-icon>
              <span>挂号收费</span>
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
  <!-- 第四行 -->
  <el-row>
    <el-col>
      <el-card shadow="always" class="mb-10px">
        <el-form ref="queryFormRef" :model="queryForm" :rules="rules" label-width="auto">
          <el-row>
            <!-- 所属科室 -->
            <el-col :span="4" class="mr-20px">
              <el-form-item label="所属科室">
                <el-select
                  clearable
                  v-model="queryForm.selectedDeptId"
                  @focus="getAllDeptDataFetch"
                  @change="getTodaySchedulingFetch"
                  placeholder="请选择所属科室"
                  style="width: 240px"
                >
                  <el-option
                    v-for="item in deptData"
                    :key="item.deptId"
                    :label="item.deptName"
                    :value="item.deptId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <!-- 挂号类型 -->
            <el-col :span="4" class="mr-20px">
              <el-form-item label="挂号类型" prop="querySelectedItemId">
                <el-select
                  clearable
                  v-model="queryForm.querySelectedItemId"
                  placeholder="请选择挂号类型"
                  style="width: 240px"
                  @change="getTodaySchedulingFetch"
                >
                  <el-option
                    v-for="item in regTypeMap"
                    :key="item.dictValue"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <!-- 挂号时段 -->
            <el-col :span="4" class="mr-20px">
              <el-form-item label="挂号时段" prop="selectedTimeDataId">
                <el-select
                  clearable
                  v-model="queryForm.selectedTimeDataId"
                  @focus="getAllTimesDataFetch"
                  @change="getTodaySchedulingFetch"
                  placeholder="请选择挂号时段"
                  style="width: 240px"
                >
                  <el-option
                    v-for="item in timeData"
                    :key="item.dictValue"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <!-- 挂号时间 -->
            <el-col :span="4" class="mr-20px">
              <el-form-item label="挂号时间" prop="queryRegTime">
                <el-date-picker
                  clearable
                  v-model="queryForm.queryRegTime"
                  :disabled-date="disabledDate"
                  @change="getTodaySchedulingFetch"
                  type="date"
                  placeholder="挂号时间"
                >
                </el-date-picker>
              </el-form-item>
            </el-col>

            <!-- 按钮组 -->
            <el-col :span="4">
              <el-form-item>
                <el-button type="primary" @click="getTodaySchedulingFetch()">
                  <el-icon><Search /></el-icon>
                  <span>搜索</span>
                </el-button>
                <el-button type="primary" @click="resetQuery">
                  <el-icon><Refresh /></el-icon>
                  <span>重置</span>
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <!-- 表格行 -->
        <el-row>
          <el-col>
            <el-table
              :data="registeredData"
              border
              style="height: 260px; max-height: 300px"
              highlight-current-row
              @current-change="handleRowClickByDeptId"
              :ref="registeredData.deptId"
              row-key="deptId"
            >
              <el-table-column prop="deptId" label="部门编号" />
              <el-table-column prop="deptName" label="部门名称" />
              <el-table-column prop="visitCount" label="当前已挂号数" />
              <template #empty>
                <el-empty description="当日没有数据" :image-size="100" />
              </template>
            </el-table>
          </el-col>
        </el-row>
        <!-- 分页行 -->
        <el-row class="mt-10px">
          <el-col :span="24">
            <el-pagination
              background
              layout="total,sizes,prev, pager, next,jumper"
              :total="pageTotal"
              :pager-count="11"
              :page-size="pageSize"
              :page-sizes="[5, 10, 20]"
              :current-page="pageNum"
              @size-change="sizeChange"
              @current-change="currentChange"
            />
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>

  <!-- 加载患者信息抽屉 -->
  <el-drawer
    v-model="loadPatientDrawerVisible"
    title="从数据库中添加患者信息"
    :before-close="handlePatientDrawerClose"
  >
    <el-card shadow="always">
      <el-row>
        <el-col>
          <el-table
            :data="patientData"
            border
            style="height: 500px; max-height: 500px"
            highlight-current-row
            :ref="patientData.patientId"
            row-key="idCard"
            @row-click="handleRowClick"
          >
            <el-table-column prop="name" label="名字" width="160" />
            <el-table-column prop="idCard" label="身份证" />
            <!-- 空数据时显示 -->
            <template #empty>
              <el-empty description="没有找到任何患者呢？！？" />
            </template>
          </el-table>
        </el-col>
      </el-row>
      <!-- 分页行 -->
      <el-row class="mt-10px">
        <el-col :span="24">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="patientPageTotal"
            :pager-count="11"
            :page-size="patientPageSize"
            :current-page="patientPageNum"
            @current-change="patientCurrentChange"
            size="small"
          />
        </el-col>
      </el-row>
      <!-- 按钮 -->
      <el-row class="mt-10px" style="text-align: right">
        <el-col>
          <el-button type="primary" @click="selectedPatientFetch">确定</el-button>
        </el-col>
      </el-row>
    </el-card>
  </el-drawer>
</template>

<script setup lang="ts">
import http from '@/http'
import {
  dayjs,
  ElMessage,
  ElMessageBox,
  ElNotification,
  FormInstance,
  FormRules,
} from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { pcaTextArr } from 'element-china-area-data'

const queryTypeKeyword = ref('') //搜索关键词
const timeData = ref([]) //时段ID
const deptData = ref([]) //科室数据
const queryRegisteredItemsData = ref([]) //搜索挂号数据类型
const registeredItems = ref([])
const pageNum = ref(1) //当前页
const pageSize = ref(5) //每页显示的数据
const pageTotal = ref(0) //总个数
const idCard = ref('') //身份证号
const hisPatient = reactive({
  idCard: '',
  name: '',
  phone: '',
  age: 0,
  sex: '0',
  birthDay: '',
  address: '',
}) // 患者信息
const loadPatientDrawerVisible = ref(false) //加载患者信息抽屉显示控制
const patientData = ref([]) //加载的患者信息
const selectedPatientIdCode = ref('') //加载患者信息的选中身份证号
const selectedPatient = ref(null) // 选中的患者信息
const registeredData = ref([]) //当天挂号数据
const regTypeMap = ref([]) //挂号类型MAP
//挂号信息对象
const hisRegistration = reactive({
  deptId: '',
  regItemId: 1,
  regItemAmount: '',
  schedulingType: '',
  subsectionType: '',
})
const ruleFormRef = ref<FormInstance | null>(null)
const queryFormRef = ref(null) // 绑定表单的 ref
const queryForm = reactive({
  selectedDeptId: '', //所属科室
  querySelectedItemId: '', //挂号类型
  selectedTimeDataId: '', //挂号时段
  queryRegTime: '', //挂号时间
})
const selectedOptions = ref([]) //选中的地址
const patientPageTotal = ref(0)
const patientPageSize = ref(10)
const patientPageNum = ref(1)

const handleIdCardInput = () => {
  const { birthday, age } = getBirthdayAndAgeFromIdCard(hisPatient.idCard)
  hisPatient.birthDay = birthday
  hisPatient.age = age
}

//患者规则验证
const rules = reactive<FormRules>({
  // hisPatient 的表单验证规则
  idCard: [
    { required: true, message: '身份证号不能为空', trigger: 'blur' },
    {
      pattern: /^(^[1-9]\d{5}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}(\d|X|x)?$)$/,
      message: '身份证号码格式不正确',
      trigger: 'blur',
    },
  ],
  name: [{ required: true, message: '患者姓名不能为空', trigger: 'blur' }],
  phone: [
    { required: true, message: '电话不能为空', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的11位手机号码',
      trigger: 'blur',
    },
  ],

  // hisRegistration 的表单验证规则
  selectedDeptId: [{ required: true, message: '请选择所属科室', trigger: 'change' }],
  querySelectedItemId: [{ required: true, message: '请选择挂号类型', trigger: 'change' }],
  selectedTimeDataId: [{ required: true, message: '请选择挂号时段', trigger: 'change' }],
  queryRegTime: [{ required: true, message: '请选择挂号时间', trigger: 'change' }],
})
//挂号选项规则验证

//挂号收费点击事件
const joinFeeFetch = async () => {
  if (!ruleFormRef.value || !queryFormRef.value) return

  // 同时校验两个表单
  try {
    await ruleFormRef.value.validate()
    await queryFormRef.value.validate()

    hisRegistration.regItemAmount = getSelectedItemFee.value || 0
    hisRegistration.schedulingType = queryForm.querySelectedItemId
    hisRegistration.subsectionType = queryForm.selectedTimeDataId

    if (selectedOptions.value && selectedOptions.value.length > 0) {
      hisPatient.address =
        selectedOptions.value.join(' ') + (hisPatient.address ? ' ' + hisPatient.address : '')
    }

    const requestData = {
      hisRegistration: { ...hisRegistration },
      hisPatient: { ...hisPatient },
    }

    const res = await http.post('/regList/regList/add', requestData)

    if (res.data.code === '00000') {
      ElNotification({
        title: '挂号成功！',
        message: `请通知患者前往缴费`,
        type: 'success',
        offset: 50,
        duration: 3000,
      })

      // **然后重置数据**
      resetRegistration()
      resetPatient()
      getTodaySchedulingFetch()
      resetQueryForm()
      selectedOptions.value = []
    }
  } catch (error) {
    ElMessage.error('表单校验失败，请检查输入')
    console.log(error)
  }
}

//重置患者对象
const resetPatient = () => {
  Object.assign(hisPatient, {
    idCard: '',
    name: '',
    phone: '',
    age: 0,
    sex: '0',
    birthDay: '',
    address: '',
  })
}

//重置挂号对象
const resetRegistration = () => {
  Object.assign(hisRegistration, {
    deptId: '',
    regItemId: 1,
    regItemAmount: '',
    schedulingType: '',
    subsectionType: '',
  })
}

//重置挂号对象
const resetQueryForm = () => {
  Object.assign(queryForm, {
    selectedDeptId: '',
    querySelectedItemId: '',
    selectedTimeDataId: '',
    queryRegTime: '',
  })
}

// 禁用今天之前的日期
const disabledDate = (time) => {
  return dayjs(time).isBefore(dayjs().startOf('day'))
}
//使用dayjs序列化时间
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD') : ''
}

//获取当天的所有排班信息
const getTodaySchedulingFetch = () => {
  //获取当天的所有排班信息查询条件
  let getSchedultQueryData = reactive({
    deptId: queryForm.selectedDeptId || null,
    regTypeId: queryForm.querySelectedItemId || null,
    timePeriod: queryForm.selectedTimeDataId || null,
    date: formatDate(queryForm.queryRegTime),
    pageNum: pageNum.value,
    pageSize: pageSize.value,
  })

  http.post('/doctors/doctors/getScheduleData', getSchedultQueryData).then((res) => {
    console.log('返回的数据：', res.data)
    registeredData.value = res.data.data?.list || [] // 防止 list 为空时报错
    pageNum.value = res.data.data?.pageNum || 1
    pageSize.value = res.data.data?.pageSize || 5
    pageTotal.value = res.data.data?.total || 0
  })
}

// 点击某行时，记录选中的身份证号
const handleRowClick = (row) => {
  selectedPatientIdCode.value = ''
  selectedPatientIdCode.value = row.idCard
}
//点击某行时，记录选中的部门编号
const handleRowClickByDeptId = (row) => {
  //清空
  hisRegistration.deptId = ''
  //赋值
  hisRegistration.deptId = row.deptId
}

// 验证身份证号是否合法
const validateIdCard = (idCard) => {
  const idCardPattern =
    /^(^[1-9]\d{5}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}(\d|X|x)?$)$/
  return idCardPattern.test(idCard)
}

//根据身份证号计算出生日期和年龄的方法
const getBirthdayAndAgeFromIdCard = (idCard) => {
  // 先验证身份证号
  if (!idCard || idCard.length !== 18 || !validateIdCard(idCard)) {
    return { birthday: '', age: 0, isValid: false }
  }

  // 提取出生日期 (身份证 6-14 位)
  const year = idCard.substring(6, 10)
  const month = idCard.substring(10, 12)
  const day = idCard.substring(12, 14)
  const birthday = `${year}-${month}-${day}`

  // 计算年龄
  const birthDate = new Date(year, month - 1, day)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()

  // 判断是否过了生日
  const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
  if (today < thisYearBirthday) {
    age--
  }

  return { birthday, age }
}

//根据身份证查询赋值患者信息
const selectedPatientFetch = () => {
  selectedPatient.value = null // 重置为 null，而不是空数组

  if (!selectedPatientIdCode.value) {
    return ElMessage.warning('你还没有选择患者啊！')
  }

  // 在 patientData 中查找身份证匹配的患者
  const foundPatient = patientData.value.find((p) => p.idCard === selectedPatientIdCode.value)

  if (!foundPatient) {
    return ElMessage.warning('未找到该患者信息!')
  }

  const { birthday, age } = getBirthdayAndAgeFromIdCard(foundPatient.idCard)

  // 将患者信息填充到表单
  Object.assign(hisPatient, {
    ...foundPatient,
    birthDay: birthday,
    age: age,
  })

  selectedPatient.value = foundPatient
  loadPatientDrawerVisible.value = false
  patientData.value = []
}

const queryPatientDataObj = reactive({
  pageNum: patientPageNum.value,
  pageSize: patientPageSize.value,
})

//加载患者
const addPatientFetch = () => {
  loadPatientDrawerVisible.value = true

  http
    .post('/patient/patient/list', queryPatientDataObj)
    .then((res) => {
      // 确保数据存在，防止 undefined 报错
      const patientResData = res.data || {}

      patientData.value = patientResData.data.list || [] // 确保 patientData.value 是数组
      patientPageNum.value = patientResData.data.pageNum || 1
      patientPageSize.value = patientResData.data.pageSize || 10
      patientPageTotal.value = patientResData.data.total || 0
    })
    .catch((error) => {
      ElMessage.error('患者数据加载失败，请稍后重试')
      console.error('获取患者列表失败:', error)
    })
}

const handlePatientDrawerClose = () => {
  ElMessageBox.confirm('你确定要关闭吗?', '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    loadPatientDrawerVisible.value = false
  })
}

//获取所有时段
const getAllTimesDataFetch = () => {
  if (timeData.value.length === 0) {
    queryTypeKeyword.value = 'his_subsection_type'
    http.get(`/dict/dict/getDictByType/${queryTypeKeyword.value}`).then((res) => {
      timeData.value = res.data.data
    })
  }
}

//重置查询条件
const resetQuery = () => {
  queryForm.selectedDeptId = null
  //挂号时段和挂号类型
  queryForm.selectedTimeDataId = queryForm.querySelectedItemId = ''
  getTodaySchedulingFetch()
}

//获取所有科室
const getAllDeptDataFetch = () => {
  if (deptData.value.length === 0) {
    http.get('/dept/dept/getNormalDept').then((res) => {
      deptData.value = res.data
    })
  }
}

//计算选中的挂号费用
const getSelectedItemFee = computed(() => {
  const selectedItem = registeredItems.value.find(
    (item) => item.regItemId === hisRegistration.regItemId,
  )
  return selectedItem ? selectedItem.regItemFee : 0
})

onMounted(() => {
  getRegItemFetch()
  getTodaySchedulingFetch()
  queryForm.queryRegTime = formatDate(Date.now())
  getScheduleRegItemFetch()
})

//获取排班挂号类型
const getScheduleRegItemFetch = () => {
  http.get('/dict/dict/getDictByType/his_scheduling_type').then((res) => {
    regTypeMap.value = res.data.data
  })
}

const queryRegisteredItems = reactive({
  keyword: '',
})

//获取展示挂号类型
const getRegItemFetch = () => {
  http.post('/registeredItem/registeredItem/list', queryRegisteredItems).then((res) => {
    registeredItems.value = res.data.data.list
    queryRegisteredItemsData.value = res.data.data.list
  })
}

// 根据身份证号获取患者信息
const getPatientFetch = async () => {
  if (!idCard.value) {
    return ElMessage.warning('身份证不可为空')
  }

  // 调用 validateIdCard 进行校验
  if (!validateIdCard(idCard.value)) {
    return ElMessage.error('身份证格式不正确!')
  }

  try {
    const res = await http.get(`/patient/patient/get/${idCard.value}`)
    const patientData = res.data.data

    if (!patientData) {
      //解构序列化对象
      Object.assign(hisPatient, {
        idCard: '',
        name: '',
        phone: '',
        age: 0,
        sex: '0',
        birthDay: '',
        address: '',
      })

      //赋值
      hisPatient.idCard = idCard.value
      idCard.value = ''

      // 计算生日和年龄并赋值
      const { birthday, age } = getBirthdayAndAgeFromIdCard(hisPatient.idCard)
      hisPatient.birthDay = birthday
      hisPatient.age = age

      //返回
      return ElMessage.warning('未查询到该患者，请手动添加信息')
    }

    const { birthday, age } = getBirthdayAndAgeFromIdCard(patientData.idCard)

    Object.assign(hisPatient, {
      ...patientData,
      birthDay: birthday,
      age: age,
    })

    ElMessage.success(`查询到 1 个患者`)
  } catch (error) {
    ElMessage.error('查询失败，请稍后重试')
  }
}

//上一页
const sizeChange = (newPageSize) => {
  pageSize.value = newPageSize
  getTodaySchedulingFetch()
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
  getTodaySchedulingFetch()
}

//上一页
const patientSizeChange = (newPageSize) => {
  patientPageSize.value = newPageSize
  addPatientFetch()
}

//下一页
const patientCurrentChange = (newPage) => {
  patientPageNum.value = newPage
  addPatientFetch()
}
</script>

<style lang="css" scoped>
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
.ml-20px {
  margin-left: 20px;
}
.text-center {
  text-align: center;
}
</style>
