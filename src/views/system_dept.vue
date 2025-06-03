<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- 第一行 -->
  <el-row>
    <el-col :span="24">
      <el-card shadow="always" class="mb-10px">
        <el-row justify="space-between">
          <el-col :span="12">
            <el-button type="primary" @click="addDept">
              <el-icon><Plus /></el-icon>
              <span>新增科室</span>
            </el-button>
            <el-button type="danger" @click="batchDelete">
              <el-icon><Minus /></el-icon>
              <span>批量删除</span>
            </el-button>
          </el-col>
          <!-- 模糊查询 -->
          <el-col :span="5">
            <el-input
              v-model="keyWord"
              @change="searchDept"
              placeholder="请输入科室名称回车以查询"
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
              :data="deptData"
              style="width: 100%"
              max-height="500"
              row-key="deptId"
              border
              @selection-change="handleSelectionChange"
            >
              <el-table-column fixed type="selection" width="55" />
              <el-table-column label="科室名称" prop="deptName" width="120" />
              <el-table-column label="科室编码" prop="deptNumber" />
              <el-table-column label="当前挂号量" prop="regNumber" width="120" sortable />
              <el-table-column label="负责人" prop="deptLeader" />
              <el-table-column label="电话" prop="leaderPhone" />
              <el-table-column label="状态" prop="status">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.status"
                    :before-change="
                      () =>
                        handleBeforeChange(
                          scope.row.deptId,
                          scope.row.status === 0 ? 1 : 0,
                          scope.row.deptName,
                        )
                    "
                    :active-value="0"
                    :inactive-value="1"
                    active-text="正常"
                    inactive-text="禁用"
                    class="ml-2"
                    inline-prompt
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                    :loading="rowLoadingMap[scope.row.deptId]"
                  />
                </template>
              </el-table-column>
              <el-table-column label="创建时间" prop="createTime" width="200" sortable />
              <!-- 按钮组 -->
              <el-table-column label="操作" fixed="right" width="240">
                <template #default="scope">
                  <el-button-group>
                    <el-button type="success" size="small" @click="editDept(scope.row.deptId)">
                      <el-icon><Edit /></el-icon>
                      <span>编辑</span>
                    </el-button>
                    <el-button type="danger" size="small" @click="delDept(scope.row.deptId)">
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

  <!-- 添加科室和编辑科室抽屉 -->
  <el-drawer
    v-model="addOrEditDrawerModal"
    :title="addOrEditDrawerTitle"
    size="30%"
    :before-close="beforeChangeAddOrEditDrawer"
  >
    <el-row>
      <el-col :span="20">
        <el-form :model="deptObject" label-width="auto" style="max-width: 600px">
          <el-input v-model="deptObject.deptId" style="display: none" />
          <el-form-item label="科室名称">
            <el-input v-model="deptObject.deptName" placeholder="请输入科室名" />
          </el-form-item>
          <el-form-item label="科室编码">
            <el-input v-model="deptObject.deptNumber" placeholder="请输入科室编码" />
          </el-form-item>
          <el-form-item label="负责人">
            <el-input v-model="deptObject.deptLeader" placeholder="请输入负责人" />
          </el-form-item>
          <el-form-item label="电话">
            <el-input v-model="deptObject.leaderPhone" placeholder="请输入电话" />
          </el-form-item>
          <el-form-item label="显示顺序">
            <el-input-number v-model="deptObject.orderNum" :min="0" :max="200" />
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
const addOrEditDrawerModal = ref(false) //添加或编辑科室抽屉
const addOrEditDrawerTitle = ref('') //添加或编辑科室抽屉标题
const pageNum = ref(1) //当前页
const pageSize = ref(10) //每页显示的数据
const pageTotal = ref(0) //总个数
const keyWord = ref('') //关键字
const deptData = reactive([]) //科室数据
const rowLoadingMap = reactive({}) //是否处于加载状态
const depIds = ref([]) //选中的编号数组
const loading = ref(true) //表格加载动画

//科室对象，用于存储添加或修改的科室信息
const deptObject = reactive({
  deptId: '',
  deptName: '',
  deptNumber: '',
  regNumber: '',
  orderNum: '',
  deptLeader: '',
  leaderPhone: '',
  status: '0',
})

// 监听多选
const handleSelectionChange = (val) => {
  depIds.value = val
}

//批量删除
const batchDelete = async () => {
  if (depIds.value.length === 0) {
    return ElMessage.warning('请选择要删除的项！')
  }
  ElMessageBox.confirm(`确定删除选中的 ${depIds.value.length} 条记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    //提取id
    const ids = depIds.value.map((item) => item.deptId)
    // 调用 API 批量删除
    http.post('/dept/batchDelete', { ids }).then((res) => {
      if (res.data.data && res.data.data !== null) {
        ElMessage.success('删除成功')
        getDeptFetch()
      } else {
        ElMessage.error('删除失败')
      }
    })
  })
}

//模糊查询
const searchDept = (keyWordInput) => {
  keyWord.value = keyWordInput
  getDeptFetch()
}

//添加科室抽屉
const addDept = () => {
  //清空科室对象
  deptObject.deptId = ''
  deptObject.deptName = ''
  deptObject.deptNumber = ''
  deptObject.regNumber = ''
  deptObject.orderNum = '0'
  deptObject.deptLeader = ''
  deptObject.leaderPhone = ''
  deptObject.status = '0'

  addOrEditDrawerTitle.value = '添加科室'
  addOrEditDrawerModal.value = true
}

//添加科室
const addDeptSubmit = () => {
  // console.log("添加的数据"+deptObject)
  //后端发送添加科室请求
  http.post('/dept/addDept', deptObject).then((res) => {
    if (res.data.data) {
      ElMessage.success('添加成功')
      addOrEditDrawerModal.value = false
    } else {
      ElMessage.error('添加失败')
    }
    getDeptFetch()
  })
}

//删除科室
const delDept = (deptId) => {
  ElMessageBox.confirm('确定删除编号为' + deptId + '的科室？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    //删除科室
    http.post('dept/deleteDept?deptId=' + deptId).then((res) => {
      if (res.data.data) {
        ElMessage.success('删除成功')
        getDeptFetch()
      } else {
        throw new Error('科室删除失败')
      }
    })
  })
}

//修改科室抽屉
const editDept = (deptId) => {
  addOrEditDrawerTitle.value = '编辑科室'
  addOrEditDrawerModal.value = true
  //回调单个科室数据
  http
    .get('/dept/getDeptById?deptId=' + deptId)
    .then((res) => {
      if (res.data.data) {
        deptObject.deptId = deptId
        deptObject.deptName = res.data.data.deptName
        deptObject.deptLeader = res.data.data.deptLeader
        deptObject.deptNumber = res.data.data.deptNumber
        deptObject.orderNum = res.data.data.orderNum
        deptObject.leaderPhone = res.data.data.leaderPhone
        deptObject.status = res.data.data.status
      }
    })
    .catch((error) => {
      ElMessage.error('获取科室数据失败' + error)
    })
}

//修改科室
const updateDeptSubmit = () => {
  // console.log("修改的数据"+userObject)
  //后端发送修改科室请求
  http.post('/dept/updateDept', deptObject).then((res) => {
    if (res.data) {
      ElMessage.success('修改成功')
      addOrEditDrawerModal.value = false
      getDeptFetch()
    } else {
      ElMessage.error('操作有误,请重试!')
    }
    getDeptFetch()
  })
}

//判断当前抽屉的按钮操作是添加还是修改
const handleSubmit = () => {
  if (addOrEditDrawerTitle.value === '添加科室') {
    addDeptSubmit() // 调用添加科室的方法
  } else if (addOrEditDrawerTitle.value === '编辑科室') {
    updateDeptSubmit() // 调用修改科室的方法
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
    })
    .catch(() => {
      return
    })
}

//上一页
const sizeChange = (newPageSize) => {
  pageSize.value = newPageSize
  getDeptFetch()
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
  getDeptFetch()
}

// 修改科室状态改变事件
const updateUserStatus = async (id, status, name) => {
  try {
    const response = await http.put(`/dept/update/${id}/${status}`)
    if (response.data.data) {
      ElNotification({
        title: '修改成功!',
        message: `科室 ${name} 的状态已更新为 ${status === 0 ? '正常' : '禁用'}`,
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

//判断修改科室状态前逻辑，判断科室id是否相同，如果相同拦截并不让更改，否则放行
const beforeChange = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
}

//按钮切换主逻辑方法
const handleBeforeChange = async (id, status, name) => {
  //将当前开关的动画状态开启
  rowLoadingMap[id] = true
  try {
    //执行beforeChange和更改科室状态
    await beforeChange()
    await updateUserStatus(id, status, name)
    return true
  } catch (error) {
    console.error(error.message)
    return false // 阻止状态切换
  } finally {
    rowLoadingMap[id] = false
  }
}

//页面加载时挂载
onMounted(() => {
  getDeptFetch()
})

const getDeptFetch = () => {
  loading.value = true
  //获取科室数据
  http
    .get('/dept/list', {
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
      deptData.splice(0, deptData.length, ...list)
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
