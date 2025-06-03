<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- 第一行 -->
  <el-card>
    <el-form :model="queryForm" label-width="auto">
      <el-row :gutter="20">
        <el-col :span="5">
          <el-form-item label="药品名称">
            <el-input
              placeholder="请输入药品名称"
              clearable
              @input="debouncedGetProviderFetch"
              v-model="queryForm.medicinesName"
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="关键字">
            <el-input
              placeholder="请输入关键字"
              clearable
              @input="debouncedGetProviderFetch"
              v-model="queryForm.keywords"
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="药品类型">
            <el-select
              v-model="queryForm.medicinesType"
              @change="debouncedGetProviderFetch"
              clearable
              placeholder="请选择药品类型"
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
              v-model="queryForm.producterId"
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
      <el-row :gutter="20">
        <el-col :span="5">
          <el-form-item label="处方类型">
            <el-select
              v-model="queryForm.prescriptionType"
              @change="debouncedGetProviderFetch"
              clearable
              placeholder="请选择处方类型"
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
          <el-form-item label="状态">
            <el-select
              @change="debouncedGetProviderFetch"
              v-model="queryForm.status"
              placeholder="请选择状态"
              style="width: 240px"
              clearable
            >
              <el-option label="正常" value="0" />
              <el-option label="禁用" value="1" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="5">
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
  </el-card>
  <!-- 第二行 -->
  <el-row class="mt-10px">
    <el-col :span="24">
      <el-card shadow="always" class="mb-10px">
        <el-row justify="space-between">
          <el-col :span="12">
            <el-button-group>
              <el-button type="primary" @click="addMedicines">
                <el-icon><Plus /></el-icon>
                <span>新增药品</span>
              </el-button>
              <el-button type="danger" @click="deletes" :disabled="medicinalIds.length === 0">
                <el-icon><Minus /></el-icon>
                <span>删除选中</span>
              </el-button>
            </el-button-group>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
  <!-- 第三行 -->
  <el-row>
    <el-col :span="24">
      <el-card shadow="always" v-loading="loading">
        <!-- 表格 -->
        <el-row class="mt-10px">
          <el-col>
            <el-table
              :data="medicinesData"
              style="width: 100%"
              max-height="500"
              row-key="medicinesId"
              border
              @selection-change="handleSelectionChange"
            >
              <el-table-column fixed type="selection" width="55" />
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
              <el-table-column label="库存量" prop="medicinesStockNum" width="100" />
              <el-table-column label="预警值" prop="medicinesStockDangerNum" width="100" />
              <el-table-column label="状态" prop="status" width="100" fixed="right">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.status"
                    :before-change="
                      () =>
                        handleBeforeChange(
                          scope.row.medicinesId,
                          scope.row.status === '0' ? '1' : '0',
                          scope.row.medicinesName,
                        )
                    "
                    active-value="0"
                    inactive-value="1"
                    active-text="正常"
                    inactive-text="禁用"
                    class="ml-2"
                    inline-prompt
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                    :loading="rowLoadingMap[scope.row.medicinesId]"
                  />
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
                  {{ scope.row.updateBy || '暂无修改' }}
                </template>
              </el-table-column>
              <!-- 按钮组 -->
              <el-table-column label="操作" fixed="right" width="160">
                <template #default="scope">
                  <el-button-group>
                    <el-button
                      type="success"
                      size="small"
                      @click="editMedicinesFetch(scope.row.medicinesId)"
                    >
                      <el-icon><Edit /></el-icon>
                      <span>编辑</span>
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      @click="delMedicinesFetch(scope.row.medicinesId)"
                    >
                      <el-icon><Delete /></el-icon>
                      <span>删除</span>
                    </el-button>
                  </el-button-group>
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

  <!-- 修改和添加对话框 -->
  <el-dialog
    v-model="addOrUpdateMedicinesDialogVisible"
    :title="medicinesDialogTitle"
    width="500"
    :before-close="handleClose"
  >
    <!-- 主体内容 -->
    <el-card shadow="hover">
      <el-row>
        <el-col>
          <el-form label-width="auto" :model="medicinesForm">
            <el-form-item label="药品名称">
              <el-input
                placeholder="请输入药品名称"
                v-model="medicinesForm.medicinesName"
              ></el-input>
            </el-form-item>
            <el-form-item label="药品编码">
              <el-input
                placeholder="请输入药品编码"
                v-model="medicinesForm.medicinesNumber"
              ></el-input>
            </el-form-item>
            <el-form-item label="关键字">
              <el-input placeholder="请输入关键字" v-model="medicinesForm.keywords"></el-input>
            </el-form-item>
            <el-form-item label="单位">
              <el-input placeholder="请输入药品单位" v-model="medicinesForm.unit"></el-input>
            </el-form-item>
            <el-form-item label="换算量">
              <el-input
                placeholder="请输入药品换算量"
                v-model="medicinesForm.conversion"
              ></el-input>
            </el-form-item>
            <el-form-item label="处方价格">
              <el-input-number v-model="medicinesForm.prescriptionPrice" :min="1" :max="100000" />
            </el-form-item>
            <el-form-item label="库存量">
              <el-input-number v-model="medicinesForm.medicinesStockNum" :min="1" :max="100000" />
            </el-form-item>
            <el-form-item label="预警值">
              <el-input-number
                v-model="medicinesForm.medicinesStockDangerNum"
                :min="1"
                :max="100000"
              />
            </el-form-item>
            <el-form-item label="药品类型">
              <el-select
                v-model="medicinesForm.medicinesType"
                placeholder="请选择药品类型"
                style="width: 240px"
              >
                <el-option
                  v-for="item in medicinesDataMap"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="处方类型">
              <el-select
                v-model="medicinesForm.prescriptionType"
                placeholder="请选择处方类型"
                style="width: 240px"
              >
                <el-option
                  v-for="item in prescriptionTypeDataMap"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="生产厂家">
              <el-select
                v-model="medicinesForm.producterId"
                placeholder="请选择生产厂家"
                style="width: 240px"
              >
                <el-option
                  v-for="item in producterList"
                  :key="item.producterId"
                  :label="item.producterName"
                  :value="item.producterId"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-card>
    <!-- 页脚 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitAddOrUpdate">
          {{ medicinesDialogButtonContent }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import http from '@/http'
import { dayjs, ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import debounce from 'lodash/debounce'

const pageNum = ref(1) //当前页
const pageSize = ref(10) //每页显示的数据
const pageTotal = ref(0) //总个数
const medicinesData = reactive([]) //药品数据
const rowLoadingMap = reactive({}) //是否处于加载状态
const medicinesDataMap = ref({}) //存储药品类型字典
const medicinesMap = ref([])
const prescriptionTypeDataMap = ref({}) //存储处方类型字典
const prescriptionTypeMap = ref([])
const addOrUpdateMedicinesDialogVisible = ref(false) //添加或修改药品信息对话框控制显示
const medicinesDialogTitle = ref('') //添加或修改药品对话框标题
const medicinesDialogButtonContent = ref('') //添加或修改药品对话框按钮内容
const medicinesForm = reactive({
  medicinesId: 0, //药品ID
  medicinesName: '', //药品名称
  medicinesNumber: '', //药品编号
  medicinesType: '', //药品分类
  prescriptionType: '', //处方类型
  prescriptionPrice: '', //处方价格
  unit: '', //单位
  conversion: '', //换算量
  keywords: '', //关键字
  producterId: '', //生产厂家
  medicinesStockNum: 0, //库存量
  medicinesStockDangerNum: 0, //预警值
}) //药品表单数据
const producterList = ref([]) //生产厂家数组
const medicinalIds = ref([]) //选中的编号数组
const queryForm = reactive({
  medicinesName: '', //药品名字
  status: '', //状态
  medicinesType: '', //药品类型
  keywords: '', //关键字
  prescriptionType: '', //处方类型
  producterId: '', //生产厂家
}) //查询条件表单
const loading = ref(true)

//重置查询条件
const resetQueryFetch = () => {
  Object.assign(queryForm, {
    medicinesName: '', //药品名字
    status: '', //状态
    medicinesType: '', //药品类型
    keywords: '', //关键字
    prescriptionType: '', //处方类型
    producterId: '', //生产厂家
  })
  getMedicinesFetch()
}

//批量删除
const deletes = async () => {
  if (medicinalIds.value.length === 0) {
    return ElMessage.warning('请选择要删除的项！')
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${medicinalIds.value.length} 条记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    //提取id
    const ids = medicinalIds.value.map((item) => item.medicinesId)
    // 调用 API 批量删除
    await http.post('/medicines/batchDelete', { ids })

    // 重新查询一遍数据
    getMedicinesFetch()

    ElMessage.success('批量删除成功！')
  } catch (error) {
    ElMessage.error('批量删除失败！', error)
  }
}

// 监听多选
const handleSelectionChange = (val) => {
  medicinalIds.value = val
}

//根据ID编辑药品
const editMedicinesFetch = (mid) => {
  if (producterList.value.length === 0) {
    getProducterIdNameFetch()
  }
  http.get(`/medicines/get/${mid}`).then((res) => {
    Object.assign(medicinesForm, {
      medicinesId: res.data.data.medicinesId, //药品ID
      medicinesName: res.data.data.medicinesName, //药品名称
      medicinesNumber: res.data.data.medicinesNumber, //药品编号
      medicinesType: res.data.data.medicinesType, //药品分类
      prescriptionType: res.data.data.prescriptionType, //处方类型
      prescriptionPrice: res.data.data.prescriptionPrice, //处方价格
      unit: res.data.data.unit, //单位
      conversion: res.data.data.conversion, //换算量
      keywords: res.data.data.keywords, //关键字
      producterId: res.data.data.producterId, //生产厂家
      medicinesStockNum: res.data.data.medicinesStockNum, //库存量
      medicinesStockDangerNum: res.data.data.medicinesStockDangerNum, //预警值
    })
    console.log(res.data.data)
  })
  medicinesDialogTitle.value = `编辑${mid}号药品信息`
  addOrUpdateMedicinesDialogVisible.value = true
  medicinesDialogButtonContent.value = '确认修改'
}

//根据ID删除药品
const delMedicinesFetch = (mid) => {
  ElMessageBox.confirm(`您确定要删除${mid}号药品吗？`, '温馨提示', {
    cancelButtonText: '取消',
    confirmButtonText: '确定',
  }).then(() => {
    http.delete(`/medicines/del/${mid}`).then((res) => {
      if (res.data.code === 200) {
        ElMessage.success('删除成功！')
        getMedicinesFetch()
      }
    })
  })
}

//获取厂家ID和名字
const getProducterIdNameFetch = () => {
  http.get('/producter/getIdName').then((res) => {
    producterList.value = res.data.data
    console.log(producterList)
  })
}

//提交表单
const submitAddOrUpdate = () => {
  http.post('/medicines/addOrUpdate', medicinesForm).then((res) => {
    if (res.data.code === 200) {
      ElMessage.success('操作成功！')
      //清除表单信息
      resetMedicinesForm()
      //重新查询药品信息
      getMedicinesFetch()
      //关闭对话框
      addOrUpdateMedicinesDialogVisible.value = false
    }
  })
}

//新增药品
const addMedicines = () => {
  if (producterList.value.length === 0) {
    getProducterIdNameFetch()
  }
  medicinesDialogTitle.value = '新增药品信息'
  addOrUpdateMedicinesDialogVisible.value = true
  medicinesDialogButtonContent.value = '确认添加'
}

//关闭前询问
const handleClose = () => {
  ElMessageBox.confirm('你确定要关闭该界面吗?数据不会做任何保存!')
    .then(() => {
      addOrUpdateMedicinesDialogVisible.value = false
      resetMedicinesForm()
    })
    .catch(() => {
      // catch error
    })
}

//清空对象方法
const resetMedicinesForm = () => {
  Object.assign(medicinesForm, {
    medicinesId: 0, // 药品ID
    medicinesName: '', // 药品名称
    medicinesNumber: '', // 药品编号
    medicinesType: '', // 药品分类
    prescriptionType: '', // 处方类型
    prescriptionPrice: '', // 处方价格
    unit: '', // 单位
    conversion: '', // 换算量
    keywords: '', // 关键字
    producterId: '', // 生产厂家
    medicinesStockNum: 0, // 库存量
    medicinesStockDangerNum: 0, // 预警值
  })
}

//判断修改前逻辑，判断id是否相同，如果相同拦截并不让更改，否则放行
const beforeChange = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
}
// 修改用户状态改变事件
const updateUserStatus = async (medicinesId, statusId, medicinesName) => {
  try {
    const response = await http.put(`/medicines/update/${medicinesId}/${statusId}`)
    if (response.data) {
      ElNotification({
        title: '修改成功!',
        message: `药品 ${medicinesName} 的状态已更新为 ${statusId === '0' ? '启用' : '禁用'}`,
        type: 'success',
        offset: 50,
        duration: 3000,
      })
    } else {
      throw new Error('状态更新失败')
    }
  } catch (error) {
    console.error(error)
    ElNotification({
      title: '修改失败!',
      message: '状态更新时发生错误，请稍后重试.',
      type: 'error',
      offset: 50,
      duration: 3000,
    })
    throw error
  }
}
//按钮切换主逻辑方法
const handleBeforeChange = async (medicinesId, statusId, medicinesName) => {
  console.log(medicinesId, statusId, medicinesName)
  //将当前开关的动画状态开启
  rowLoadingMap[medicinesId] = true
  try {
    //执行beforeChange和更改用户状态
    await beforeChange()
    await updateUserStatus(medicinesId, statusId, medicinesName)
    return true
  } catch (error) {
    console.error(error.message)
    return false // 阻止状态切换
  } finally {
    rowLoadingMap[medicinesId] = false
  }
}

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

//使用dayjs序列化时间
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '--'
}

//上一页
const sizeChange = (newPageSize) => {
  pageSize.value = newPageSize
  getMedicinesFetch()
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
  getMedicinesFetch()
}

//页面加载时挂载
onMounted(() => {
  getMedicinesFetch()
  getPrescriptionTypeFetch()
  getMedicinesTypeFetch()
  getProducterIdNameFetch()
})

//获取药品信息
const getMedicinesFetch = () => {
  loading.value = true
  http
    .get('/medicines/list', {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        medicinesName: queryForm.medicinesName,
        keywords: queryForm.keywords,
        medicinesType: queryForm.medicinesType,
        prescriptionType: queryForm.prescriptionType,
        producterId: queryForm.producterId,
        status: queryForm.status,
      },
    })
    .then((res) => {
      const list = Array.isArray(res.data.data.list) ? res.data.data.list : []
      medicinesData.splice(0, medicinesData.length, ...list)
      pageTotal.value = res.data.data?.total || 0
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}

// 防抖处理
const debouncedGetProviderFetch = debounce(getMedicinesFetch, 500)
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
