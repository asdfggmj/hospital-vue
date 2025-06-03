<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- 第一行 -->
  <el-row>
    <el-col :span="24">
      <el-card shadow="always" class="mb-10px">
        <el-row justify="space-between">
          <el-col :span="12">
            <el-button type="primary" @click="viewArchives">
              <i class="iconfont icon-chakan" style="margin-right: 6px"></i>
              <span>查看档案</span>
            </el-button>
            <el-button type="primary" @click="viewMedicalCases">
              <i class="iconfont icon-chakan" style="margin-right: 6px"></i>
              <span>查看就诊病例</span>
            </el-button>
          </el-col>
          <!-- 模糊查询 -->
          <el-col :span="5">
            <el-input
              v-model="keyWord"
              @change="searchRegistrationFee"
              placeholder="请输入关键字回车以查询"
              clearable
              size=""
            />
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
  <!-- 第二行 -->
  <el-row>
    <el-col :span="24">
      <el-card shadow="always" v-loading="loading">
        <!-- 表格 -->
        <el-row class="mt-10px">
          <el-col>
            <el-table
              :data="registrationFeeData"
              border
              style="width: 100%"
              max-height="500"
              row-key="patientId"
              highlight-current-row
              @current-change="handleCurrentChange"
            >
              <el-table-column label="姓名" prop="name" width="180" />
              <el-table-column label="电话" prop="phone" width="180" />
              <el-table-column label="身份证号" prop="idCard" width="180" />
              <el-table-column label="出生日期" prop="birthDay" width="200" />
              <el-table-column label="年龄" prop="age" width="120">
                <template #default="scope">
                  <span>{{ calculateAge(scope.row.birthDay) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="性别" prop="sex" width="120">
                <template #default="scope">
                  <span>{{ sexDataMap[scope.row.sex] }}</span>
                </template>
              </el-table-column>
              <el-table-column label="信息状态" prop="isFinal" width="200">
                <template #default="scope">
                  <span>{{ messageStatusMap[scope.row.isFinal] }}</span>
                </template>
              </el-table-column>
              <el-table-column label="创建时间" prop="createTime">
                <template #default="scope">
                  <span>{{ formatDate(scope.row.createTime) }}</span>
                </template>
              </el-table-column>
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
              :page-sizes="[10, 20, 50]"
              :current-page="pageNum"
              @size-change="sizeChange"
              @current-change="currentChange"
            />
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>

  <!-- 查看档案抽屉-->
  <el-drawer
    v-model="patientFileDrawerVisible"
    :title="'查看【' + patientFileData.name + '】患者档案'"
  >
    <el-card shadow="always">
      <el-row>
        <el-col>档案信息：</el-col>
      </el-row>
      <el-card shadow="always" class="mt-10px">
        <el-row>
          <el-col>
            <el-descriptions border :column="1">
              <el-descriptions-item label="编号">{{
                patientFileData.patientId
              }}</el-descriptions-item>
              <el-descriptions-item label="姓名">{{ patientFileData.name }}</el-descriptions-item>
              <el-descriptions-item label="身份证">{{
                patientFileData.idCard
              }}</el-descriptions-item>
              <el-descriptions-item label="电话">{{ patientFileData.phone }}</el-descriptions-item>
              <el-descriptions-item label="性别"
                ><span>{{ sexDataMap[patientFileData.sex] }}</span></el-descriptions-item
              >
              <el-descriptions-item label="出生日期">{{
                patientFileData.birthDay
              }}</el-descriptions-item>
              <el-descriptions-item label="地址">{{
                patientFileData.address
              }}</el-descriptions-item>
              <el-descriptions-item label="过敏信息">{{
                patientFileData.allergyInfo || '无'
              }}</el-descriptions-item>
              <el-descriptions-item label="是否完善信息">{{
                patientFileData.isFinal == 0 ? '未完善' : '已完善'
              }}</el-descriptions-item>
              <el-descriptions-item label="最后登录IP">{{
                patientFileData.lastLoginIp || '无'
              }}</el-descriptions-item>
              <el-descriptions-item label="最后登录时间">{{
                patientFileData.lastLoginTime || '无'
              }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{
                formatDate(patientFileData.createTime)
              }}</el-descriptions-item>
              <el-descriptions-item label="最后一次更新时间">{{
                formatDate(patientFileData.updateTime)
              }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </el-card>
    </el-card>
    <el-card shadow="always" class="mt-10px">
      <el-row>
        <el-col>档案信息：</el-col>
      </el-row>
      <el-card shadow="always" class="mt-10px">
        <el-row>
          <el-col>
            <el-descriptions
              border
              :column="1"
              v-for="(file, index) in patientFileData.patientFileList"
              :key="index"
            >
              <el-descriptions-item label="紧急联系人">{{
                file.emergencyContactName || '无'
              }}</el-descriptions-item>
              <el-descriptions-item label="紧急联系人电话">{{
                file.emergencyContactPhone || '无'
              }}</el-descriptions-item>
              <el-descriptions-item label="关系">{{
                file.emergencyContactRelation || '无'
              }}</el-descriptions-item>
              <el-descriptions-item label="左耳听力">{{
                file.leftEarHearing || '无'
              }}</el-descriptions-item>
              <el-descriptions-item label="右耳听力">{{
                file.rightEarHearing || '无'
              }}</el-descriptions-item>
              <el-descriptions-item label="左眼视力">{{
                file.leftVision || '无'
              }}</el-descriptions-item>
              <el-descriptions-item label="右眼视力">{{
                file.rightVision || '无'
              }}</el-descriptions-item>
              <el-descriptions-item label="身高">{{ file.height || '无' }}</el-descriptions-item>
              <el-descriptions-item label="体重">{{ file.weight || '无' }}</el-descriptions-item>
              <el-descriptions-item label="血型">{{ file.bloodType || '无' }}</el-descriptions-item>
              <el-descriptions-item label="个人史">{{
                file.personalInfo || '无'
              }}</el-descriptions-item>
              <el-descriptions-item label="家族史">{{
                file.familyInfo || '无'
              }}</el-descriptions-item>
              <el-descriptions-item label="档案创建时间">{{
                formatDate(file.createTime) || '无'
              }}</el-descriptions-item>
              <el-descriptions-item label="档案更新时间">{{
                formatDate(file.updateTime) || '无'
              }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </el-card>
    </el-card>
  </el-drawer>

  <!-- 查看就诊病例抽屉 -->
  <el-drawer
    v-model="medicalCasesDrawerVisible"
    :title="'查看【' + patientMedicalCasesData.name + '】就诊病例'"
    size="50%"
  >
    <el-card shadow="always" class="mt-10px">
      <el-collapse v-model="activeName" accordion>
        <!-- 基本信息 -->
        <el-collapse-item title="基本信息" name="1">
          <el-descriptions border :column="1">
            <el-descriptions-item label="编号">{{
              patientMedicalCasesData.patientId
            }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{
              patientMedicalCasesData.name
            }}</el-descriptions-item>
            <el-descriptions-item label="身份证">{{
              patientMedicalCasesData.idCard
            }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{
              patientMedicalCasesData.phone
            }}</el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>
        <!-- 就诊信息 -->
        <el-collapse-item title="就诊信息" name="2">
          <el-collapse accordion>
            <!-- 循环输出就诊信息 -->
            <el-collapse-item
              v-for="(item, index) in patientMedicalCasesData.careHistoryList"
              :key="index"
              :title="'科室【' + item.deptId + '】-就诊时间【' + formatDate(item.careDate) + '】'"
              name="1"
            >
              <el-descriptions border :column="1">
                <el-descriptions-item label="主诉">{{ item.caseTitle }}</el-descriptions-item>
                <el-descriptions-item label="诊断信息">{{ item.caseResult }}</el-descriptions-item>
                <el-descriptions-item label="医生建议">{{ item.doctorTips }}</el-descriptions-item>
                <el-descriptions-item label="备注">{{ item.remark }}</el-descriptions-item>
              </el-descriptions>
            </el-collapse-item>
          </el-collapse>
        </el-collapse-item>
        <!-- 药用处方信息 -->
        <el-collapse-item title="药用处方信息" name="3">
          <el-collapse accordion>
            <!-- 循环输出药用处方 -->
            <el-collapse-item
              v-for="(item, index) in patientMedicalCasesData.careOrderList"
              :key="index"
              :title="'【药用处方】【' + (index + 1) + '】【处方总额：￥' + item.allAmount + '】'"
              :name="index"
              @click="getCareOrderItem(item.coId)"
            >
              <el-table border :data="careOrderList">
                <el-table-column width="55" />
                <el-table-column label="药品名称" prop="itemName" width="120" />
                <el-table-column label="数量" prop="num" />
                <el-table-column label="单价(元)" prop="price" />
                <el-table-column label="金额(元)" prop="amount" />
                <el-table-column label="备注" prop="remark" />
                <el-table-column label="状态" prop="status" />
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </el-collapse-item>
        <!-- 检查处方信息 -->
        <el-collapse-item title="检查处方信息" name="4">
          <!-- 手风琴2 -->
          <el-collapse accordion>
            <!-- 循环输出检查处方 -->
            <el-collapse-item
              v-for="(item, index) in patientMedicalCasesData.careOrderList"
              :key="index"
              :title="'检查处方【' + (index + 1) + '】【处方总额：' + item.price + '】'"
              :name="index"
              @click="getCheckOrderItem(item.coId)"
            >
              <el-table border :data="checkOrderList">
                <el-table-column width="55">
                  <template #default="scope">
                    {{ scope.$index + 1 }}
                  </template>
                </el-table-column>
                <el-table-column label="检查项目" prop="itemName" width="120" />
                <!-- <el-table-column label="数量" />
                <el-table-column label="单价(元)" />
                <el-table-column label="金额(元)" />
                <el-table-column label="备注" />
                <el-table-column label="状态" /> -->
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </el-drawer>
</template>

<script setup lang="ts">
import http from '@/http'
import { dayjs, ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

const pageNum = ref(1) //当前页
const pageSize = ref(10) //每页显示的数据
const pageTotal = ref(0) //总个数
const keyWord = ref('') //关键字
const registrationFeeData = reactive([]) //科室数据
const selectPatientId = ref('') //选中的患者编号
const sexDataMap = ref({}) //存储性别类型字典
const messageStatusMap = ref({}) //存储信息状态字典
const patientFileDrawerVisible = ref(false) //查看档案控制抽屉显示
const medicalCasesDrawerVisible = ref(false) //查看就诊病例控制抽屉显示
const patientFileData = ref([]) //患者档案数据
const patientMedicalCasesData = ref([]) //患者就诊病例数据
const activeName = ref('1') //手风琴默认展开的页面
const deptData = ref([]) //部门数据
const coId = ref('') //用药详细ID
const careOrderList = ref([]) //用药详细数据
const checkOrderList = ref([]) //检查详细数据
const loading = ref(true)

//根据ID查询用药详细
const getCareOrderItem = (id) => {
  coId.value = id
  http.get(`/orderItem/getCareOrderItem/${coId.value}`).then((res) => {
    careOrderList.value = res.data.data
    console.log(careOrderList.value)
  })
}

//根据ID查询检查详细
const getCheckOrderItem = (id) => {
  coId.value = id
  http.get(`/orderItem/getCheckOrderItem/${coId.value}`).then((res) => {
    checkOrderList.value = res.data.data
    console.log(checkOrderList.value)
  })
}

//获取所有部门信息
const getDepts = () => {
  if (deptData.value.length === 0) {
    http.get('/dept/getAll').then((res) => {
      deptData.value = res.data
    })
  }
}

//使用dayjs计算年龄
const calculateAge = (birthDay) => {
  if (!birthDay) return '--'
  return dayjs().diff(dayjs(birthDay), 'year')
}

//使用dayjs序列化时间
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '--'
}

//页面加载时挂载
onMounted(() => {
  getPatientFetch()
  getSexData()
  getMessageStatusData()
  getDepts()
})

//查看档案
const viewArchives = () => {
  patientFileData.value = []
  if (selectPatientId.value === '') {
    ElMessage.warning('请选择需要查看档案的人')
    return
  }
  http.get(`/patient/getFile/${selectPatientId.value}`).then((res) => {
    patientFileData.value = res.data.data
  })
  patientFileDrawerVisible.value = true
}

//查看就诊病例
const viewMedicalCases = () => {
  patientMedicalCasesData.value = []
  if (selectPatientId.value === '') {
    ElMessage.warning('请选择需要查看就诊病例的人')
    return
  }
  medicalCasesDrawerVisible.value = true
  http.get(`/patient/getMedicalCases/${selectPatientId.value}`).then((res) => {
    patientMedicalCasesData.value = res.data.data
    console.log(patientMedicalCasesData.value)
  })
}

//获取患者信息状态数据
const getMessageStatusData = () => {
  http.get('/dictData/get/his_patient_msg_final').then((res) => {
    const statusData = res.data.data || []
    messageStatusMap.value = statusData.reduce((map, item) => {
      map[Number(item.dictValue)] = item.dictLabel
      return map
    }, {})
  })
}

//获取性别数据
const getSexData = () => {
  http.get('/dictData/get/sys_user_sex').then((res) => {
    const sexData = res.data.data || []
    sexDataMap.value = sexData.reduce((map, item) => {
      map[Number(item.dictValue)] = item.dictLabel
      return map
    }, {})
  })
}

//单选改变事件
const handleCurrentChange = (selectedRow) => {
  if (selectedRow) {
    selectPatientId.value = selectedRow.patientId
    // ElMessage.success('选中的 ID:' + selectPatientId.value)
  } else {
    selectPatientId.value = ''
  }
}

//模糊查询
const searchRegistrationFee = (keyWordInput) => {
  keyWord.value = keyWordInput
  ElMessage.info(keyWord.value)
  getPatientFetch()
}

//上一页
const sizeChange = (newPageSize) => {
  pageSize.value = newPageSize
  getPatientFetch()
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
  getPatientFetch()
}

const getPatientFetch = () => {
  loading.value = true
  //获取患者信息
  http
    .get('/patient/list', {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        keyWord: keyWord.value,
      },
    })
    .then((res) => {
      const list = Array.isArray(res.data.list) ? res.data.list : []
      registrationFeeData.splice(0, registrationFeeData.length, ...list)
      pageTotal.value = res.data?.total || 0
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}
</script>

<style>
@import url('https://at.alicdn.com/t/c/font_4844128_bktal3kxbw.css');
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
