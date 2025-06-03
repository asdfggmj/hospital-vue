<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- 第一行 -->
  <el-card>
    <el-form :model="queryForm">
      <el-row justify="space-between">
        <el-col :span="5">
          <el-form-item label="供应商">
            <el-select
              v-model="queryForm.providerId"
              placeholder="请选择"
              @change="debouncedGetProviderFetch"
              clearable
            >
              <el-option
                v-for="item in providerDataMap"
                :key="item.providerId"
                :label="item.providerName"
                :value="item.providerId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="申请人">
            <el-input
              placeholder="请输入申请人"
              @input="debouncedGetProviderFetch"
              v-model="queryForm.applyUserName"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-button-group>
            <el-button type="primary" @click="getPurchaseFetch">
              <el-icon><Search /></el-icon>
              <span>搜索</span>
            </el-button>
            <el-button type="danger" @click="resetQueryFetch">
              <el-icon><Refresh /></el-icon>
              <span>重置</span>
            </el-button>
          </el-button-group>
        </el-col>
      </el-row>
    </el-form>
  </el-card>

  <!-- 第二行 -->
  <el-card shadow="always" class="mt-10px">
    <el-row justify="space-between">
      <el-col :span="12">
        <el-button-group>
          <el-button type="primary" @click="pass" :disabled="purchaseIds.length === 0">
            <el-icon><Select /></el-icon>
            <span>通过</span>
          </el-button>
          <el-button type="danger" @click="unpass" :disabled="purchaseIds.length === 0">
            <el-icon><CloseBold /></el-icon>
            <span>不通过</span>
          </el-button>
        </el-button-group>
      </el-col>
    </el-row>
  </el-card>

  <!-- 第三行 -->
  <el-card shadow="always" class="mt-10px" v-loading="loading">
    <!-- 表格 -->
    <el-row class="mt-10px">
      <el-col>
        <el-table
          :data="purchaseData"
          style="width: 100%"
          max-height="500"
          row-key="purchaseId"
          border
          @selection-change="purchaseDataHandleSelectionChange"
        >
          <el-table-column fixed type="selection" width="55" />
          <el-table-column fixed label="单据编号" prop="purchaseId" width="220">
            <template #default="scope">
              <el-button type="primary" link @click="checkPurchaseItemData(scope.row.purchaseId)">{{
                scope.row.purchaseId
              }}</el-button>
            </template>
          </el-table-column>
          <el-table-column label="供应商" prop="providerId" width="200">
            <template #default="scope">
              {{ providerMap[scope.row.providerId] || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="采购批发总额" prop="purchaseTradeTotalAmount" width="200">
            <template #default="scope">
              <span>{{ parseFloat(scope.row.purchaseTradeTotalAmount).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="status" width="120">
            <template #default="scope">
              <span>{{ purchaseDataMap[scope.row.status] }}</span>
            </template>
          </el-table-column>
          <el-table-column label="申请人" prop="applyUserName" width="80" />
          <el-table-column label="创建时间" prop="createTime" width="200">
            <template #default="scope">
              <span>{{ formatDate(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建人" prop="createBy" width="120" />
          <el-table-column label="最后一次修改时间" prop="updateTime" width="200">
            <template #default="scope">
              <span>{{ formatDate(scope.row.updateTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="修改人" prop="updateBy" width="120">
            <template #default="scope">
              <span>{{ scope.row.updateBy || '--' }}</span>
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

  <!-- 查看详细信息对话框 -->
  <el-dialog
    v-model="purchaseItemForm.purchaseItemDialogVisible"
    :title="purchaseItemForm.purchaseItemTitle"
    width="1000"
    destroy-on-close
  >
    <!-- 内容主体 -->
    <el-row>
      <el-col>
        <el-table border :data="purchaseItemList">
          <el-table-column label="详细ID" prop="itemId" width="220" />
          <el-table-column label="单据号" prop="purchaseId" width="220" />
          <el-table-column label="药品名称" prop="medicinesName" width="100" />
          <el-table-column label="药品类型" prop="medicinesType" width="160">
            <template #default="scope">
              <span>{{ medicinesMap[scope.row.medicinesType] }}</span>
            </template>
          </el-table-column>
          <el-table-column label="处方类型" prop="prescriptionType" width="100">
            <template #default="scope">
              <span>{{ prescriptionTypeMap[scope.row.prescriptionType] }}</span>
            </template>
          </el-table-column>
          <el-table-column label="生产厂家" prop="producterId" width="100" />
          <el-table-column label="规格" prop="conversion">
            <template #default="scope">
              {{ scope.row.conversion + scope.row.unit }}
            </template>
          </el-table-column>
          <el-table-column label="采购数量" prop="purchaseNumber" width="100" />
          <el-table-column label="批发价" prop="tradePrice" />
          <el-table-column label="批发额" prop="tradeTotalAmount">
            <template #default="scope">
              {{ parseFloat(scope.row.tradeTotalAmount).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="批次号" prop="batchNumber" />
          <el-table-column label="备注" prop="remark" />
          <el-table-column label="关键字" prop="keywords" />
        </el-table>
      </el-col>
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-row justify="center">
          <el-col :span="1">
            <el-button type="primary" @click="purchaseItemForm.purchaseItemDialogVisible = false">
              关闭
            </el-button>
          </el-col>
        </el-row>
      </div>
    </template>
  </el-dialog>

  <!-- 审核驳回原因对话框 -->
  <el-dialog v-model="unPassDialogVisible" title="审核驳回" width="500" destroy-on-close>
    <!-- 内容主体 -->
    <el-row>
      <el-col>
        <el-form-item label="驳回原因">
          <el-input
            v-model="unPassValue"
            :rows="4"
            maxlength="100"
            type="textarea"
            show-word-limit
            placeholder="请输入驳回原因"
            resize="none"
          />
        </el-form-item>
      </el-col>
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="unPassDialogVisible = false"> 关闭 </el-button>
        <el-button type="primary" @click="submitUnpassFetch"> 提交 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import http from '@/http'
import { onMounted, reactive, ref } from 'vue'
import { debounce } from '@/utils/debounceUtils'
import { formatDate } from '@/utils/dateUtils'
import { ElMessage, ElMessageBox } from 'element-plus'

const pageNum = ref(1) //当前页
const pageSize = ref(10) //每页显示的数据
const pageTotal = ref(0) //总个数
const purchaseData = ref([]) //待审核的入库数据
const queryForm = reactive({
  providerId: '', //供应商ID
  applyUserName: '', //申请人名称
})
const providerDataMap = ref({}) //存储供应商类型字典
const providerMap = ref([])
const purchaseIds = ref([]) // 选中的采购单 ID
const purchaseDataMap = ref({}) //存储入库状态类型字典
const purchaseItemList = ref([]) //详细信息的列表
const purchaseItemForm = reactive({
  purchaseItemDialogVisible: false, //控制显示
  purchaseItemTitle: '', //标题
}) //查看入库详细信息对象
const unPassValue = ref('') //审核不通过的原因
const unPassDialogVisible = ref(false) //审核驳回的对话框控制显示
const prescriptionTypeDataMap = ref({}) //存储处方类型字典
const prescriptionTypeMap = ref([])
const medicinesDataMap = ref({}) //存储药品类型字典
const medicinesMap = ref([])
const loading = ref(true)

//药品类型
const getMedicinesTypeFetch = () => {
  http.get('/dictData/get/his_medicines_type').then((res) => {
    const medicinesData = res.data.data || []
    medicinesDataMap.value = medicinesData

    medicinesMap.value = medicinesData.reduce((map, item) => {
      map[Number(item.dictValue)] = item.dictLabel
      return map
    }, {})
  })
}

//处方类型
const getPrescriptionTypeFetch = () => {
  http.get('/dictData/get/his_prescription_type').then((res) => {
    const prescriptionTypeData = res.data.data || []
    prescriptionTypeDataMap.value = prescriptionTypeData

    prescriptionTypeMap.value = prescriptionTypeData.reduce((map, item) => {
      map[Number(item.dictValue)] = item.dictLabel
      return map
    }, {})
  })
}

// 提交审核不通过的理由
const submitUnpassFetch = async () => {
  if (!unPassValue.value || !unPassValue.value.trim()) {
    return ElMessage.warning('请输入理由!')
  }

  try {
    // 显示确认框，防止误操作
    await ElMessageBox.confirm('你确定要因此理由回绝吗?', '温馨提示', {
      confirmButtonText: '是',
      cancelButtonText: '算了',
      type: 'warning',
    })

    const res = await http.post(
      `/purchase/status/4?auditMsg=${unPassValue.value}`,
      purchaseIds.value,
    )

    // 处理成功逻辑
    if (res.data.code === 200 && res.data.data) {
      ElMessage.success('操作成功!')
      unPassValue.value = '' // 清空输入框
      unPassDialogVisible.value = false // 关闭对话框
      getPurchaseFetch() // 重新获取数据
    } else {
      ElMessage.error(res.data.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error(`操作失败: ${error.message || '未知错误'}`)
  }
}

// 审核不通过弹窗
const unpass = () => {
  unPassDialogVisible.value = true
}

// 审核通过
const pass = async () => {
  try {
    // 显示确认框，防止误操作
    await ElMessageBox.confirm('你确定要审核通过吗?', '温馨提示', {
      confirmButtonText: '是',
      cancelButtonText: '算了',
      type: 'success',
    })

    const res = await http.post('/purchase/status/3', purchaseIds.value)

    // 处理成功逻辑
    if (res.data.code === 200 && res.data.data) {
      ElMessage.success('审核通过成功!')
      getPurchaseFetch() // 重新获取数据
    } else {
      ElMessage.error(res.data.message || '审核失败')
    }
  } catch (error) {
    ElMessage.info('操作已取消')
  }
}

//查看入库单的详细信息
const checkPurchaseItemData = (purId) => {
  //根据单号查询所有详细信息
  http.get(`/purchaseItem/get/${purId}`).then((res) => {
    purchaseItemList.value = res.data.data
  })
  //解构对象赋值
  Object.assign(purchaseItemForm, {
    purchaseItemDialogVisible: true, //控制显示
    purchaseItemTitle: `查看${purId}的入库详细信息`, //标题
  })
}

//入库状态
const getPurchaseTypeFetch = () => {
  http.get('/dictData/get/his_order_status').then((res) => {
    const purchaseData = res.data.data || []

    purchaseDataMap.value = purchaseData.reduce((map, item) => {
      map[Number(item.dictValue)] = item.dictLabel
      return map
    }, {})
  })
}

// 监听表格的选择事件
const purchaseDataHandleSelectionChange = (val) => {
  purchaseIds.value = val.map((item) => item.purchaseId)
}

//重置查询条件
const resetQueryFetch = () => {
  Object.assign(queryForm, {
    providerId: '', //供应商ID
    applyUserName: '', //申请人名称
  })
  getPurchaseFetch()
}

//供应商
const getProducterFetch = () => {
  http.get('/provider/getIdName').then((res) => {
    const providerData = res.data.data || []
    providerDataMap.value = providerData

    providerMap.value = providerData.reduce((map, item) => {
      map[Number(item.providerId)] = item.providerName
      return map
    }, {})
  })
}

//上一页
const sizeChange = (newPageSize) => {
  pageSize.value = newPageSize
  getPurchaseFetch()
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
  getPurchaseFetch()
}

//页面加载时挂载
onMounted(() => {
  getPurchaseFetch()
  getProducterFetch()
  getPurchaseTypeFetch()
  getPrescriptionTypeFetch()
  getMedicinesTypeFetch()
})

//获取所有待审核的入库订单数据
const getPurchaseFetch = () => {
  loading.value = true
  http
    .get('/purchase/list', {
      params: {
        status: '2',
        applyUserName: queryForm.applyUserName,
        providerId: queryForm.providerId,
      },
    })
    .then((res) => {
      const list = Array.isArray(res.data.data.list) ? res.data.data.list : []
      purchaseData.value.splice(0, purchaseData.value.length, ...list)
      pageTotal.value = res.data.data?.total || 0
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}

// 防抖处理
const debouncedGetProviderFetch = debounce(getPurchaseFetch, 500)
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
