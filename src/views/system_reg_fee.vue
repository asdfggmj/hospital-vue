<template>
  <!-- 第一行 -->
  <el-row>
    <el-col :span="24">
      <el-card shadow="always" class="mb-10px">
        <el-row justify="space-between">
          <el-col :span="12">
            <el-button type="primary" @click="addRegisteredItem">
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
              @change="searchRegisteredItem"
              placeholder="请输入项目名称回车键搜索"
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
              style="width: 100%"
              max-height="500"
              row-key="regItemId"
              @selection-change="handleSelectionChange"
              border
            >
              <el-table-column fixed type="selection" width="55" />
              <el-table-column label="挂号费编号" prop="regItemId" width="120" />
              <el-table-column label="挂号项目名称" prop="regItemName" width="180" />
              <el-table-column label="挂号费" prop="regItemFee">
                <template #default="scope">
                  <el-text>{{ parseFloat(scope.row.regItemFee).toFixed(2) }}</el-text>
                </template>
              </el-table-column>
              <el-table-column label="状态" prop="status">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.status"
                    :before-change="
                      () =>
                        handleBeforeChange(
                          scope.row.regItemId,
                          scope.row.status,
                          scope.row.regItemName,
                        )
                    "
                    :active-value="0"
                    :inactive-value="1"
                    active-text="正常"
                    inactive-text="禁用"
                    class="ml-2"
                    inline-prompt
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                    :loading="rowLoadingMap[scope.row.regItemId]"
                  />
                </template>
              </el-table-column>
              <el-table-column label="创建时间" prop="createTime" width="200" sortable>
                <template #default="scope">{{ formatDate(scope.row.createTime) }}</template>
              </el-table-column>
              <el-table-column label="创建人" prop="createBy" width="200" />
              <el-table-column label="最后修改时间" prop="updateTime" width="200">
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
                      @click="editRegistrationFee(scope.row.regItemId)"
                    >
                      <el-icon><Edit /></el-icon>
                      <span>编辑</span>
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      @click="delRegistrationFee(scope.row.regItemId)"
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
        <el-form :model="regItemObject" label-width="auto" style="max-width: 600px">
          <el-input v-model="regItemObject.regItemId" style="display: none" />
          <el-form-item label="项目名称">
            <el-input v-model="regItemObject.regItemName" placeholder="请输入挂号费名称" />
          </el-form-item>
          <el-form-item label="金额">
            <el-input-number
              v-model="regItemObject.regItemFee"
              :precision="2"
              :step="0.1"
              :min="0"
            />
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
import { formatDate } from '@/utils/dateUtils'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

const pageNum = ref(1) //当前页
const pageSize = ref(10) //每页显示的数据
const pageTotal = ref(0) //总个数
const keyWord = ref('') //关键字
const registrationFeeData = reactive([]) //检查费用数据
const rowLoadingMap = reactive({}) //是否处于加载状态
const addOrEditDrawerModal = ref(false) //添加或编辑检查费用抽屉
const addOrEditDrawerTitle = ref('') //添加或编辑检查费用抽屉标题
const regIds = ref([]) //选中的编号数组
const loading = ref(true) //表格加载动画

//检查费用对象，用于存储添加或修改的检查费用信息
const regItemObject = reactive({
  regItemId: '',
  regItemName: '',
  regItemFee: '0.00',
  status: '0',
  delFlag: '0',
})

// 监听多选
const handleSelectionChange = (val) => {
  //console.log('当前选中的数据:', val) // ✅ 确保这里不是空的
  regIds.value = val
}

//批量删除
const batchDelete = async () => {
  if (regIds.value.length === 0) {
    return ElMessage.warning('请选择要删除的项！')
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${regIds.value.length} 条记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    //提取id
    const ids = regIds.value.map((item) => item.regItemId)
    // 调用 API 批量删除
    await http.post('/registeredItem/batchDelete', { ids })

    // 重新查询一遍数据
    getAnnouncementFetch()

    ElMessage.success('批量删除成功！')
  } catch (error) {
    ElMessage.error('批量删除失败！', error)
  }
}

//模糊查询
const searchRegisteredItem = (keyWordInput) => {
  keyWord.value = keyWordInput
  // ElMessage.info(keyWord.value)
  getAnnouncementFetch()
}

//添加检查费用抽屉
const addRegisteredItem = () => {
  //清空检查费用对象
  regItemObject.regItemId = ''
  regItemObject.regItemName = ''
  regItemObject.regItemFee = ''
  regItemObject.delFlag = ''
  regItemObject.status = '0'
  regItemObject.regItemFee = '0.00'
  addOrEditDrawerTitle.value = '添加检查费用'
  addOrEditDrawerModal.value = true
}

//添加检查费用
const addRegisteredItemSubmit = () => {
  // console.log("添加的数据"+regItemObject)
  //后端发送添加检查费用请求
  http.post('/registeredItem/add', regItemObject).then((res) => {
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
const delRegistrationFee = (registeredItemId) => {
  ElMessageBox.confirm('确定删除编号为' + registeredItemId + '的检查费用？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    //删除检查费用
    http.post('registeredItem/deleteById?id=' + registeredItemId).then((res) => {
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
const editRegistrationFee = (registeredItemId) => {
  //userId=userId
  addOrEditDrawerTitle.value = '编辑检查费用'
  addOrEditDrawerModal.value = true
  //回调单个检查费用数据
  http.get('/registeredItem/getById?id=' + registeredItemId).then((res) => {
    if (res.data.data) {
      res.data=res.data.data
      regItemObject.regItemId = res.data.regItemId
      regItemObject.regItemName = res.data.regItemName
      regItemObject.regItemFee = res.data.regItemFee
      regItemObject.delFlag = res.data.delFlag
      regItemObject.status = res.data.status
    }
  })
  // .catch((error)=>{
  //   ElMessage.error('获取检查费用数据失败'+error)
  // })
}

//修改检查费用
const updateRegisteredItemSubmit = () => {
  // console.log("修改的数据"+userObject)
  //后端发送修改检查费用请求
  http.post('/registeredItem/update', regItemObject).then((res) => {
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
    addRegisteredItemSubmit() // 调用添加检查费用的方法
  } else if (addOrEditDrawerTitle.value === '编辑检查费用') {
    updateRegisteredItemSubmit() // 调用修改检查费用的方法
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
      //registeredItemData.splice(0, registeredItemData.length)
    })
    .catch(() => {
      return
    })
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

// 修改检查费用状态改变事件
const updateUserStatus = async (rid, roleStatus, roleName) => {
  if (roleStatus == 0) {
    roleStatus = 1
  } else {
    roleStatus = 0
  }
  try {
    const response = await http.put(`/registeredItem/update/${rid}/${roleStatus}`)
    if (response.data.data) {
      ElNotification({
        title: '修改成功!',
        message: `挂号费用 ${roleName} 的状态已更新为 ${roleStatus === 0 ? '正常' : '禁用'}`,
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

//页面加载时挂载
onMounted(() => {
  getAnnouncementFetch()
})

const getAnnouncementFetch = () => {
  loading.value = true
  //获取检查费用数据
  http
    .get('/registeredItem/list', {
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
      registrationFeeData.splice(0, registrationFeeData.length, ...list)
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
