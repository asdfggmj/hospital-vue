<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- 第一行 -->
  <el-row>
    <el-col :span="24">
      <el-card shadow="always" class="mb-10px">
        <el-row justify="space-between">
          <el-col :span="12">
            <el-button type="primary" @click="addCheckItem">
              <el-icon><Plus /></el-icon>
              <span>新增</span>
            </el-button>
            <el-button type="danger" @click="batchDelete">
              <el-icon><Minus /></el-icon>
              <span>删除选中</span>
            </el-button>
          </el-col>
          <!-- 模糊查询 -->
          <el-col :span="5">
            <el-input
              v-model="keyWord"
              @change="searchCheckItem"
              placeholder="请输入项目名称回车键以查询"
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
              :data="inspectionFeeData"
              style="width: 100%"
              max-height="500"
              row-key="checkItemId"
              @selection-change="handleSelectionChange"
              border
            >
              <el-table-column fixed type="selection" width="55" />
              <el-table-column label="项目费用ID" prop="checkItemId" width="120" />
              <el-table-column label="项目名称" prop="checkItemName" width="120" />
              <el-table-column label="关键字" prop="keyWords" width="120" />
              <el-table-column label="项目单价" prop="unitPrice" width="120">
                <template #default="scope">{{
                  parseFloat(scope.row.unitPrice).toFixed(2)
                }}</template>
              </el-table-column>
              <el-table-column label="项目成本" prop="cost" width="120">
                <template #default="scope">{{ parseFloat(scope.row.cost).toFixed(2) }}</template>
              </el-table-column>
              <el-table-column label="单位" prop="unit" width="120" />
              <el-table-column label="类别" prop="dictLabel" width="120" />
              <el-table-column label="状态" prop="status">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.status"
                    :before-change="
                      () =>
                        handleBeforeChange(
                          scope.row.checkItemId,
                          scope.row.status,
                          scope.row.checkItemName,
                        )
                    "
                    :active-value="0"
                    :inactive-value="1"
                    active-text="正常"
                    inactive-text="禁用"
                    class="ml-2"
                    inline-prompt
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                    :loading="rowLoadingMap[scope.row.checkItemId]"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="200" sortable>
                <template #default="scope">
                  {{ scope.row.createTime.replace('T', ' ') }}
                </template>
              </el-table-column>
              <el-table-column label="创建人" prop="createBy" width="120" />
              <el-table-column label="最后一次修改时间" prop="updateTime" width="200">
                <template #default="scope">
                  {{ scope.row.updateTime.replace('T', ' ') }}
                </template>
              </el-table-column>
              <el-table-column label="修改人" prop="updateBy" width="200" />

              <!-- 按钮组 -->
              <el-table-column label="操作" fixed="right" width="160">
                <template #default="scope">
                  <el-button-group>
                    <el-button
                      type="success"
                      size="small"
                      @click="editCheckItem(scope.row.checkItemId)"
                    >
                      <el-icon><Edit /></el-icon>
                      <span>编辑</span>
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      @click="delCheckItem(scope.row.checkItemId)"
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

  <!-- 添加检查费用和编辑检查费用抽屉 -->
  <el-drawer
    v-model="addOrEditDrawerModal"
    :title="addOrEditDrawerTitle"
    size="30%"
    :before-close="beforeChangeAddOrEditDrawer"
  >
    <el-row>
      <el-col :span="20">
        <el-form :model="checkItemObject" label-width="auto" style="max-width: 600px">
          <el-input v-model="checkItemObject.checkItemId" style="display: none" />
          <el-form-item label="项目类型">
            <el-select id="itemType" v-model="checkItemObject.typeId" placeholder="项目类型">
              <el-option label="拍片类" value="1"></el-option>
              <el-option label="化验类" value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="项目名称">
            <el-input v-model="checkItemObject.checkItemName" placeholder="请输入项目名称" />
          </el-form-item>
          <el-form-item label="关键字">
            <el-input v-model="checkItemObject.keyWords" placeholder="请输入关键字" />
          </el-form-item>
          <el-form-item label="项目价格">
            <el-input v-model="checkItemObject.unitPrice" placeholder="请输入项目价格" />
          </el-form-item>
          <el-form-item label="项目成本">
            <el-input v-model="checkItemObject.cost" placeholder="请输入项目成本" />
          </el-form-item>
          <el-form-item label="项目单位">
            <el-input v-model="checkItemObject.unit" placeholder="请输入项目单位" />
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-divider />
    <el-row class="text-center">
      <el-col>
        <el-button @click="handleSubmit" type="primary">提交</el-button>
        <el-button type="primary" @click="addOrEditDrawerModal = false">取消</el-button>
      </el-col>
    </el-row>
  </el-drawer>
</template>

<script setup lang="ts">
import http from '@/http'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

const pageNum = ref(1) //当前页
const pageSize = ref(10) //每页显示的数据
const pageTotal = ref(0) //总个数
const keyWord = ref('') //关键字
const inspectionFeeData = reactive([]) //检查费用数据
const rowLoadingMap = reactive({}) //是否处于加载状态
const addOrEditDrawerModal = ref(false) //添加或编辑检查费用抽屉
const addOrEditDrawerTitle = ref('') //添加或编辑检查费用抽屉标题
const checkItemIds = ref([]) //选中的编号数组
const loading = ref(true) //表格加载动画

//检查费用对象，用于存储添加或修改的检查费用信息
const checkItemObject = reactive({
  checkItemId: '',
  checkItemName: '',
  keyWords: '',
  unitPrice: '',
  cost: '',
  unit: '',
  typeId: '',
  status: '0',
})

// 监听多选
const handleSelectionChange = (val) => {
  //console.log('当前选中的数据:', val) // ✅ 确保这里不是空的
  checkItemIds.value = val
}

//批量删除
const batchDelete = async () => {
  if (checkItemIds.value.length === 0) {
    return ElMessage.warning('请选择要删除的项！')
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${checkItemIds.value.length} 条记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    //提取id
    const ids = checkItemIds.value.map((item) => item.checkItemId)
    // 调用 API 批量删除
    await http.post('/checkItem/batchDelete', { ids })

    // 重新查询一遍数据
    getAnnouncementFetch()

    ElMessage.success('批量删除成功！')
  } catch (error) {
    ElMessage.error('批量删除失败！', error)
  }
}

//模糊查询
const searchCheckItem = (keyWordInput) => {
  keyWord.value = keyWordInput
  // ElMessage.info(keyWord.value)
  getAnnouncementFetch()
}

//添加检查费用抽屉
const addCheckItem = () => {
  //清空检查费用对象
  checkItemObject.checkItemId = ''
  checkItemObject.checkItemName = ''
  ;(checkItemObject.keyWords = ''), (checkItemObject.unitPrice = '')
  checkItemObject.cost = ''
  checkItemObject.unit = ''
  checkItemObject.typeId = ''
  checkItemObject.status = '0'

  addOrEditDrawerTitle.value = '添加检查费用'
  addOrEditDrawerModal.value = true
}

//添加检查费用
const addCheckItemSubmit = () => {
  // console.log("添加的数据"+checkItemObject)
  //后端发送添加检查费用请求
  http.post('/checkItem/add', checkItemObject).then((res) => {
    if (res.data.data) {
      ElMessage.success('添加成功')
      addOrEditDrawerModal.value = false
    } else {
      ElMessage.error('添加失败')
    }
    getAnnouncementFetch()
  })
}

//删除检查费用
const delCheckItem = (checkItemId) => {
  ElMessageBox.confirm('确定删除编号为' + checkItemId + '的检查费用？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    //删除检查费用
    http.post('checkItem/deleteById?id=' + checkItemId).then((res) => {
      if (res.data.data) {
        ElMessage.success('删除成功')
        getAnnouncementFetch()
      } else {
        throw new Error('检查费用删除失败')
      }
    })
  })
  // .catch(() => {
  //   ElMessage({
  //     type: 'info',
  //     message: 'Delete canceled',
  //   })
  // })
}

//修改检查费用抽屉
const editCheckItem = (checkItemId) => {
  //userId=userId
  addOrEditDrawerTitle.value = '编辑检查费用'
  addOrEditDrawerModal.value = true
  //回调单个检查费用数据
  http.get('/checkItem/getById?id=' + checkItemId).then((res) => {
    if (res.data.data) {
      res.data=res.data.data
      checkItemObject.checkItemId = res.data.checkItemId
      checkItemObject.checkItemName = res.data.checkItemName
      checkItemObject.keyWords = res.data.keyWords
      checkItemObject.unitPrice = res.data.unitPrice
      checkItemObject.cost = res.data.cost
      checkItemObject.unit = res.data.unit
      checkItemObject.typeId = res.data.typeId
      checkItemObject.status = res.data.status
    }
  })
  // .catch((error)=>{
  //   ElMessage.error('获取检查费用数据失败'+error)
  // })
}

//修改检查费用
const updateCheckItemSubmit = () => {
  // console.log("修改的数据"+userObject)
  //后端发送修改检查费用请求
  http.post('/checkItem/update', checkItemObject).then((res) => {
    if (res.data.data) {
      ElMessage.success('修改成功')
      addOrEditDrawerModal.value = false
      getAnnouncementFetch()
    } else {
      ElMessage.error('操作有误,请重试!')
    }
    getAnnouncementFetch()
  })
}

//判断当前抽屉的按钮操作是添加还是修改
const handleSubmit = () => {
  if (addOrEditDrawerTitle.value === '添加检查费用') {
    addCheckItemSubmit() // 调用添加检查费用的方法
  } else if (addOrEditDrawerTitle.value === '编辑检查费用') {
    updateCheckItemSubmit() // 调用修改检查费用的方法
  }
}

//关闭抽屉前提示用户是否关闭
const beforeChangeAddOrEditDrawer = () => {
  ElMessageBox.confirm('你确定要关闭吗?所有数据将不会做任何保存', '温馨提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      addOrEditDrawerModal.value = false
      //checkItemData.splice(0, checkItemData.length)
    })
    .catch(() => {
      return
    })
}

// 修改检查费用状态改变事件
const updateUserStatus = async (id, roleStatus, roleName) => {
  if (roleStatus == 0) {
    roleStatus = 1
  } else {
    roleStatus = 0
  }
  try {
    const response = await http.put(`/checkItem/update/${id}/${roleStatus}`)
    if (response.data.data) {
      ElNotification({
        title: '修改成功!',
        message: `检查费用 ${roleName} 的状态已更新为 ${roleStatus === 0 ? '正常' : '禁用'}`,
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
//判断修改检查费用状态前逻辑，判断检查费用id是否相同，如果相同拦截并不让更改，否则放行
const beforeChange = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
}

//按钮切换主逻辑方法
const handleBeforeChange = async (rid, roleStatus, roleName) => {
  //将当前开关的动画状态开启
  rowLoadingMap[rid] = true
  try {
    //执行beforeChange和更改检查费用状态
    await beforeChange()
    await updateUserStatus(rid, roleStatus, roleName)
    return true
  } catch (error) {
    console.error(error.message)
    return false // 阻止状态切换
  } finally {
    rowLoadingMap[rid] = false
  }
}

//上一页
const sizeChange = (newPageSize) => {
  pageSize.value = newPageSize
  getAnnouncementFetch()
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
  getAnnouncementFetch()
}

//页面加载时挂载
onMounted(() => {
  getAnnouncementFetch()
})

const getAnnouncementFetch = () => {
  loading.value = true
  //获取检查费用数据
  http
    .get('/checkItem/list', {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        keyWord: keyWord.value,
      },
    })
    .then((res) => {
      const list = Array.isArray(res.data.data.list) ? res.data.data.list : []
      // 将 status 转换为数字类型
      list.forEach((item) => {
        item.status = Number(item.status)
      })
      inspectionFeeData.splice(0, inspectionFeeData.length, ...list)
      pageTotal.value = res.data.data?.total || 0
      setTimeout(() => {
        loading.value = false
      }, 500)
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
