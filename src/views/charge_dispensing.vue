<!-- 处方收费 -->
<template>
  <!-- 卡片1 -->
  <el-card shadow="always">
    <el-row>
      <el-col :span="6">
        <el-form-item label="挂单号ID">
          <el-input placeholder="请输入挂单号" v-model="regId" />
        </el-form-item>
      </el-col>
      <el-col :span="4" style="margin-left: 6px">
        <el-button type="primary" @click="get">
          <el-icon><Search /></el-icon>
          <span>查询</span>
        </el-button>
        <el-button type="primary">
          <el-icon><Search /></el-icon>
          <span>读取IC卡</span>
        </el-button>
      </el-col>
    </el-row>
  </el-card>
  <!-- 卡片2 -->
  <el-card class="mt-10px" shadow="always" v-if="msg === true">
    <el-row>
      <el-col :span="24">
        <el-text size="large" type="primary">基本信息：</el-text>
      </el-col>
    </el-row>
    <el-row justify="space-evenly">
      <el-col :span="9">
        <el-row class="mt-10px">
          <el-col>挂号单号：{{ infoData.regId }}</el-col>
        </el-row>
        <el-row class="mt-10px">
          <el-col>科室名称：{{ infoData.deptName }}</el-col>
        </el-row>
        <el-row class="mt-10px">
          <el-col>就诊时间：{{ infoData.careTime.replace('T', ' ') }}</el-col>
        </el-row>
        <el-row class="mt-10px">
          <el-col>诊断信息：{{ infoData.caseResult }}</el-col>
        </el-row>
      </el-col>
      <el-col :span="9">
        <el-row class="mt-10px">
          <el-col>医生姓名：{{ infoData.doctorName }}</el-col>
        </el-row>
        <el-row class="mt-10px">
          <el-col>患者姓名：{{ infoData.patientName }}</el-col>
        </el-row>
        <el-row class="mt-10px">
          <el-col>主诉：{{ infoData.caseTitle }}</el-col>
        </el-row>
        <el-row class="mt-10px">
          <el-col>医生建议：{{ infoData.doctorTips }}</el-col>
        </el-row>
      </el-col>
    </el-row>
  </el-card>
  <!-- 卡片3 -->
  <el-card shadow="always" class="mt-10px" v-if="msg === true">
    <el-row class="mt-10px">
      <el-col :span="24">
        <el-button @click="toggleAllSelection" :type="`${isAllSelected ? 'success' : 'primary'}`">
          {{ isAllSelected ? '取消全选' : '全选' }}
        </el-button>
        <el-button type="danger" @click="dispensing">
          <el-icon style="margin-right: 6px"><CreditCard /></el-icon>
          <span>确定发药</span>
        </el-button>
      </el-col>
    </el-row>
  </el-card>
  <!-- 卡片4 -->
  <el-card shadow="always" class="mt-10px" v-if="msg === true">
    <el-row>
      <el-col :span="12">
        <el-text size="large" type="primary">订单明细：</el-text>
      </el-col>
    </el-row>
    <el-row class="mt-10px">
      <el-col :span="24">
        <el-collapse accordion>
          <el-collapse-item
            :title="`【药品处方】&nbsp;&nbsp;[1]&nbsp;&nbsp;【处方总金额】：￥${totalmedicinesAmount.toFixed(2)}`"
            name="3"
          >
            <div>
              <el-table
                :data="medicinesList"
                style="width: 100%"
                row-key="itemId"
                ref="medicinesTableRef"
                @selection-change="handleMedicinesSelectionChange"
              >
                <el-table-column type="selection" width="100" :selected="medicinesSelected" />
                <el-table-column label="序号" width="120">
                  <template #default="scope">{{ scope.$index + 1 }}</template>
                </el-table-column>
                <el-table-column label="药品名称" prop="itemName" width="200" />
                <el-table-column label="数量" prop="num" width="200" />
                <el-table-column label="单价(元)" prop="price" width="200" />
                <el-table-column label="金额(元)" prop="amount" width="200" />
                <el-table-column label="备注" prop="remark" width="200" />
                <el-table-column label="状态" prop="status" width="150">
                  <template #default="scope">
                    {{ scope.row.status == 1 ? '已支付' : '状态有误' }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-col>
    </el-row>
  </el-card>
  <el-row class="mt-10px" v-else style="text-align: center">
    <el-col>
      <el-text type="primary">暂无数据</el-text>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import http from '@/http'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

const msg = ref(false) //显示数据
const regId = ref('') //挂号编号
let infoData = reactive({
  regId: '',
  regName: '',
  deptName: '',
  doctorName: '',
  chId: '',
  patientName: '',
  careTime: '',
  caseTitle: '',
  caseResult: '',
  doctorTips: '',
}) //基本病例信息
const medicinesList = reactive([]) //药品处方
const isAllSelected = ref(false) // 全选状态
const medicinesSelected = ref([]) // 药品处方的选中项
const medicinesTableRef = ref() // 药品处方表格ref

//确定发药
const dispensing = () => {
  if (medicinesSelected.value.length == 0) {
    ElMessage.warning('请先选中要支付的项目!')
    return
  }
  //发送请求
  http
    .post('orderItem/dispensing', medicinesSelected.value)
    .then((res) => {
      if (res) {
        ElMessage.success('发药成功!')
        //判断是否没有可发药的药品,如果没有则清空挂号编号重新查询
        if (medicinesList.length == 0) {
          regId.value = ''
        }
        //刷新
        get()
      }
    })
    .catch((error) => {
      ElMessage.error('发药失败!' + error.message)
    })
}

// 全选/取消全选
const toggleAllSelection = () => {
  if (isAllSelected.value) {
    // 取消全选
    medicinesTableRef.value.clearSelection()
  } else {
    // 全选
    medicinesTableRef.value.toggleAllSelection()
  }
  isAllSelected.value = !isAllSelected.value
}

// 药品处方选中项变化
const handleMedicinesSelectionChange = (items) => {
  medicinesSelected.value = items
  console.log(medicinesSelected.value)
}

//计算药品处方金额总和
const totalmedicinesAmount = computed(() => {
  //遍历medicinesList集合
  return medicinesList.reduce((sum, item) => {
    return sum + (Number(item.amount) || 0)
  }, 0)
})

// 查询处方信息
const get = () => {
  msg.value = false
  if (!regId.value) {
    ElMessage.warning('挂单号ID不能为空！')
    return
  }

  http
    .get('orderCharge/prescription', { params: { regId: regId.value, status: '1' } })
    .then((res) => {
      if (res.data.code !== 200) {
        throw new Error(res.data.message)
      }

      const data = res.data.data
      if (data) {
        // 清空
        medicinesList.splice(0, medicinesList.length, ...data.medicinesList)
        // 解构字段，并设置默认值
        const { medicinesList: resMedicines = [], ...responseData } = data

        // 更新基本信息
        infoData = responseData

        // 清空并更新药品处方
        medicinesList.splice(0, medicinesList.length, ...resMedicines)

        msg.value = true // 显示数据
      }
    })
    .catch((error) => {
      console.error('请求失败:', error) // 输出错误详情
      ElMessage.warning('请输入正确的挂单号ID！')
      msg.value = false
    })
}
</script>

<style>
@import url('https://at.alicdn.com/t/c/font_4844128_4azmggyqmzg.css');
.mt-10px {
  margin-top: 10px;
}
</style>
