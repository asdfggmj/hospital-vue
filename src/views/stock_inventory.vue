<template>
  <!-- 第一行 -->
  <el-card shadow="always" v-loading="loading">
    <!-- 切换卡 -->
    <el-tabs v-model="activeName" class="demo-tabs" stretch>
      <el-tab-pane label="药品总库存" name="first">
        <el-form :model="medicinesQueryForm">
          <!-- 按钮行 -->
          <el-row justify="space-between">
            <el-col :span="5">
              <el-form-item label="药品名称">
                <el-input
                  placeholder="请输入药品名称"
                  @input="debouncedGetProviderFetch"
                  v-model="medicinesQueryForm.medicinesName"
                />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="关键字">
                <el-input
                  placeholder="请输入关键字"
                  @input="debouncedGetProviderFetch"
                  v-model="medicinesQueryForm.keywords"
                />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="药品类型">
                <el-select
                  clearable
                  v-model="medicinesQueryForm.medicinesType"
                  placeholder="请选择药品类型"
                  style="width: 240px"
                  @change="debouncedGetProviderFetch"
                >
                  <el-option
                    v-for="item in medicinesDataMap"
                    :key="item.dictValue"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="生产厂家">
                <el-select
                  v-model="medicinesQueryForm.producterId"
                  clearable
                  @change="debouncedGetProviderFetch"
                  placeholder="请选择生产厂家"
                >
                  <el-option
                    v-for="item in producterList"
                    :key="item.producterId"
                    :label="item.producterName"
                    :value="item.producterId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 按钮行 -->
          <el-row justify="space-between">
            <el-col :span="5">
              <el-form-item label="处方类型">
                <el-select
                  clearable
                  v-model="medicinesQueryForm.prescriptionType"
                  placeholder="请选择处方类型"
                  style="width: 240px"
                  @change="debouncedGetProviderFetch"
                >
                  <el-option
                    v-for="item in prescriptionTypeDataMap"
                    :key="item.dictValue"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item style="margin-right: 6px" label="状态">
                <el-select
                  @change="debouncedGetProviderFetch"
                  v-model="medicinesQueryForm.status"
                  placeholder="请选择状态"
                  style="width: 240px"
                  clearable
                >
                  <el-option label="正常" value="0" />
                  <el-option label="禁用" value="1" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-button-group>
                <el-button type="primary" @click="getMedicinesFetch">
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
        <!-- 表格行 -->
        <el-row>
          <el-col>
            <el-table
              :data="medicinesData"
              style="width: 100%"
              max-height="500"
              row-key="medicinesId"
              border
            >
              <el-table-column label="药品编号" prop="medicinesId" width="120" />
              <el-table-column label="药品名称" prop="medicinesName" width="120" />
              <el-table-column label="药品编码" prop="medicinesNumber" width="120" />
              <el-table-column label="生产厂家" prop="producterName" width="240" />
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
              <el-table-column label="关键词" prop="keywords" width="100" />
              <el-table-column label="处方价格" prop="prescriptionPrice" width="100">
                <template #default="scope">
                  <span>{{ Number(scope.row.prescriptionPrice).toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="换算量" prop="conversion" width="100" />
              <el-table-column label="单位" prop="unit" width="100" />
              <el-table-column label="库存量" prop="medicinesStockNum" width="100">
                <template #default="scope">
                  <el-tag
                    :type="
                      stockColor(scope.row.medicinesStockNum, scope.row.medicinesStockDangerNum)
                    "
                    >{{ scope.row.medicinesStockNum }}</el-tag
                  >
                </template>
              </el-table-column>
              <el-table-column label="预警值" prop="medicinesStockDangerNum" width="100" />
              <el-table-column label="状态" prop="status" width="100">
                <template #default="scope">
                  {{ scope.row.status === '0' ? '正常' : '禁用' }}
                </template>
              </el-table-column>
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
                  {{ scope.row.updateBy || '--' }}
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
              :total="medicinesPageTotal"
              :pager-count="11"
              :page-size="medicinesPageSize"
              :page-sizes="[10, 20, 50]"
              :current-page="medicinesPageNum"
              @size-change="sizeChange"
              @current-change="currentChange"
            />
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- 批次库存及价格 -->
      <el-tab-pane label="批次库存及价格" name="second">
        <!-- 按钮行 -->
        <el-form :model="stockQueryForm">
          <el-row justify="space-between">
            <el-col :span="5">
              <el-form-item label="采购单编号">
                <el-input
                  placeholder="请输入采购单编号"
                  v-model="purchaseItemQueryForm.purchaseId"
                  @input="debouncedGetPurchaseItemFetch"
                />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="药品名称">
                <el-input
                  placeholder="请输入药品名称"
                  v-model="purchaseItemQueryForm.medicinesName"
                  @input="debouncedGetPurchaseItemFetch"
                />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="药品类型">
                <el-select
                  clearable
                  v-model="purchaseItemQueryForm.medicinesType"
                  placeholder="请选择药品类型"
                  style="width: 240px"
                  @change="debouncedGetPurchaseItemFetch"
                >
                  <el-option
                    v-for="item in medicinesDataMap"
                    :key="item.dictValue"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="生产厂家">
                <el-select
                  v-model="purchaseItemQueryForm.producterId"
                  clearable
                  @change="debouncedGetPurchaseItemFetch"
                  placeholder="请选择生产厂家"
                >
                  <el-option
                    v-for="item in producterList"
                    :key="item.producterId"
                    :label="item.producterName"
                    :value="item.producterId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 第二行 -->
          <el-row justify="space-between">
            <el-col :span="5">
              <el-form-item label="处方类型">
                <el-select
                  clearable
                  v-model="purchaseItemQueryForm.prescriptionType"
                  placeholder="请选择处方类型"
                  @change="debouncedGetPurchaseItemFetch"
                >
                  <el-option
                    v-for="item in prescriptionTypeDataMap"
                    :key="item.dictValue"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="18">
              <el-button-group>
                <el-button type="primary" @click="getPurchaseFetch">
                  <el-icon><Search /></el-icon>
                  <span>搜索</span>
                </el-button>
                <el-button type="danger" @click="resetMedicinesQueryFetch">
                  <el-icon><Refresh /></el-icon>
                  <span>重置</span>
                </el-button>
              </el-button-group>
            </el-col>
          </el-row>
        </el-form>

        <!-- 表格行 -->
        <el-row>
          <el-col>
            <el-table
              :data="purchaseItemData"
              style="width: 100%"
              max-height="500"
              row-key="medicinesId"
              border
            >
              <!-- 扩展行列 -->
              <el-table-column type="expand">
                <template #default="{ row }">
                  <el-row>
                    <el-col :span="12">
                      <el-form label-width="100px">
                        <el-form-item label="采购单编号">
                          <span>{{ row.purchaseId }}</span>
                        </el-form-item>
                        <el-form-item label="批次号">
                          <span>{{ row.batchNumber }}</span>
                        </el-form-item>
                        <el-form-item label="药品类型">
                          <span>{{ medicinesMap[row.medicinesType] }}</span>
                        </el-form-item>
                        <el-form-item label="处方类型">
                          <span>{{ prescriptionTypeMap[row.prescriptionType] }}</span>
                        </el-form-item>
                      </el-form>
                    </el-col>
                    <el-col :span="12">
                      <el-form label-width="100px">
                        <el-form-item label="批发价">
                          <span>{{ row.tradePrice }}</span>
                        </el-form-item>
                        <el-form-item label="批发额">
                          <span>{{ row.tradeTotalAmount }}</span>
                        </el-form-item>
                        <el-form-item label="生产厂家">
                          <span>{{ row.producterName }}</span>
                        </el-form-item>
                      </el-form>
                    </el-col>
                  </el-row>
                </template>
              </el-table-column>

              <!-- 其他列 -->
              <el-table-column label="药品编号" prop="medicinesId" width="120" />
              <el-table-column label="药品名称" prop="medicinesName" width="120" />
              <el-table-column label="采购量" prop="purchaseNumber" width="120" />
              <el-table-column label="批发价" prop="tradePrice" width="240" />
              <el-table-column label="批发额" prop="tradeTotalAmount" width="240" />
              <el-table-column label="批次号" prop="batchNumber" width="240" />
              <el-table-column label="生产厂家" prop="producterName" width="240" />
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
              <el-table-column label="创建时间" prop="createTime" width="200">
                <template #default="scope">
                  <span>{{ formatDate(scope.row.createTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="创建人" prop="createBy" width="120" />
            </el-table>
          </el-col>
        </el-row>
        <!-- 分页行 -->
        <el-row class="mt-10px">
          <el-col :span="24">
            <el-pagination
              background
              layout="total,sizes,prev, pager, next,jumper"
              :total="batchPageTotal"
              :pager-count="11"
              :page-size="batchPageSize"
              :page-sizes="[10, 20, 50]"
              :current-page="batchPageNum"
              @size-change="batchSizeChange"
              @current-change="batchCurrentChange"
            />
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup lang="ts">
import http from '@/http'
import { onMounted, reactive, ref, watch } from 'vue'
import { debounce } from '@/utils/debounceUtils'
import { formatDate } from '@/utils/dateUtils'

const activeName = ref('first')
const medicinesPageNum = ref(1) //当前页
const medicinesPageSize = ref(10) //每页显示的数据
const medicinesPageTotal = ref(0) //总个数
const medicinesQueryForm = reactive({
  medicinesName: '', //药品名称
  keywords: '', //关键字
  medicinesType: '', //药品类型
  prescriptionType: '', //处方类型
  producterId: '', //生产厂家
  status: '', //状态
}) //药品总库存的搜索条件对象
const stockQueryForm = reactive({
  purchaseId: '', //采购单号
  medicinesName: '', //药品名称
  medicinesType: '', //药品类型
  prescriptionType: '', //处方类型
  producterId: '', //生产厂家
})
const medicinesDataMap = ref({}) //存储药品类型字典
const medicinesMap = ref([])
const prescriptionTypeDataMap = ref({}) //存储处方类型字典
const prescriptionTypeMap = ref([])
const medicinesData = reactive([]) //药品数据
const producterList = ref([]) //生产厂家数组
const loading = ref(true)
const purchaseItemData = ref([])
const batchPageNum = ref(1)
const batchPageSize = ref(10)
const batchPageTotal = ref(0)
const purchaseItemQueryForm = reactive({
  purchaseId: '', //单据ID
  medicinesName: '', //药品名称
  producterId: '', //生产厂家
  medicinesType: '', //药品类型
  prescriptionType: '', //处方类型
})

//上一页
const batchSizeChange = (newPageSize) => {
  batchPageSize.value = newPageSize
  getPurchaseFetch()
}

//下一页
const batchCurrentChange = (newPage) => {
  batchPageNum.value = newPage
  getPurchaseFetch()
}

// 监听 activeName 变化，切换不同的请求
watch(activeName, (newTab) => {
  if (newTab === 'first') {
    getMedicinesFetch() // 获取药品总库存数据
  } else if (newTab === 'second') {
    getPurchaseFetch() // 获取批次库存及价格数据
  }
})

const getPurchaseFetch = () => {
  loading.value = true
  http
    .get('/purchaseItem/list', {
      params: {
        pageNum: batchPageNum.value,
        batchPageSize: batchPageSize.value,
        purchaseId: purchaseItemQueryForm.purchaseId,
        medicinesName: purchaseItemQueryForm.medicinesName,
        producterId: purchaseItemQueryForm.producterId,
        medicinesType: purchaseItemQueryForm.medicinesType,
        prescriptionType: purchaseItemQueryForm.prescriptionType,
      },
    })
    .then((res) => {
      const list = Array.isArray(res.data.data.list) ? res.data.data.list : []
      purchaseItemData.value.splice(0, purchaseItemData.value.length, ...list)
      batchPageTotal.value = res.data.data?.total || 0
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}

//重置查询条件
const resetMedicinesQueryFetch = () => {
  Object.assign(medicinesQueryForm, {
    medicinesName: '', //药品名称
    keywords: '', //关键字
    medicinesType: '', //药品类型
    prescriptionType: '', //处方类型
    producterId: '', //生产厂家
    status: '', //状态
  })
  getMedicinesFetch()
}

//获取厂家ID和名字
const getProducterIdNameFetch = () => {
  http.get('/producter/getIdName').then((res) => {
    producterList.value = res.data.data
    console.log(producterList)
  })
}

const stockColor = (kucun, yujing) => {
  if (!Number.isFinite(kucun) || !Number.isFinite(yujing)) return '' // 保护措施
  if (kucun > yujing) return 'success'
  if (kucun === yujing) return 'warning'
  return 'danger' // 省略 `if`，默认小于时返回 danger
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

onMounted(() => {
  getMedicinesFetch()
  getMedicinesTypeFetch()
  getPrescriptionTypeFetch()
  getProducterIdNameFetch()
})

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

//上一页
const sizeChange = (newPageSize) => {
  medicinesPageSize.value = newPageSize
  getMedicinesFetch()
}

//下一页
const currentChange = (newPage) => {
  medicinesPageNum.value = newPage
  getMedicinesFetch()
}

const getMedicinesFetch = () => {
  loading.value = true
  http
    .get('/medicines/list', {
      params: {
        pageNum: medicinesPageNum.value,
        pageSize: medicinesPageSize.value,
        medicinesName: medicinesQueryForm.medicinesName,
        keywords: medicinesQueryForm.keywords,
        medicinesType: medicinesQueryForm.medicinesType,
        prescriptionType: medicinesQueryForm.prescriptionType,
        producterId: medicinesQueryForm.producterId,
        status: medicinesQueryForm.status,
      },
    })
    .then((res) => {
      const list = Array.isArray(res.data.data.list) ? res.data.data.list : []
      medicinesData.splice(0, medicinesData.length, ...list)
      medicinesPageTotal.value = res.data.data?.total || 0
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}

// 防抖处理
const debouncedGetProviderFetch = debounce(getMedicinesFetch, 500)
const debouncedGetPurchaseItemFetch = debounce(getPurchaseFetch, 500)
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
