<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- 第一行 -->
  <el-row>
    <el-col :span="24">
      <el-card shadow="always" class="mb-10px">
        <el-row justify="space-between">
          <el-col :span="12">
            <el-button type="primary" @click="addNotice">
              <el-icon><Plus /></el-icon>
              <span>新增公告</span>
            </el-button>
            <el-button type="danger" @click="batchDelete">
              <el-icon><Minus /></el-icon>
              <span>删除选中公告</span>
            </el-button>
          </el-col>
          <!-- 模糊查询 -->
          <el-col :span="5">
            <el-input
              v-model="keyWord"
              @change="searchNotice"
              placeholder="请输入公告标题回车以查询"
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
              :data="noticeData"
              style="width: 100%"
              max-height="500"
              row-key="noticeId"
              @selection-change="handleSelectionChange"
              border
            >
              <el-table-column fixed type="selection" width="55" />
              <el-table-column label="公告编号" prop="noticeId" width="120" />
              <el-table-column
                label="公告标题"
                prop="noticeTitle"
                width="300"
                show-overflow-tooltip
              />
              <el-table-column label="公告类型" prop="dictLabel" width="100">
                <template #default="scope">
                  <el-tag :type="noticeTag(scope.row.dictLabel)">{{ scope.row.dictLabel }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="状态" prop="status">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.status"
                    :before-change="
                      () =>
                        handleBeforeChange(
                          scope.row.noticeId,
                          scope.row.status === 0 ? 1 : 0,
                          scope.row.noticeTitle,
                        )
                    "
                    :active-value="0"
                    :inactive-value="1"
                    active-text="正常"
                    inactive-text="禁用"
                    class="ml-2"
                    inline-prompt
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                    :loading="rowLoadingMap[scope.row.noticeId]"
                  />
                </template>
              </el-table-column>
              <el-table-column label="备注" prop="remark" width="200" />
              <el-table-column label="创建时间" prop="createTime" width="200" sortable>
                <template #default="scope">
                  {{ scope.row.createTime.replace('T', ' ') }}
                </template>
              </el-table-column>
              <el-table-column label="创建人" prop="createBy" width="200" />
              <el-table-column label="最后一次修改日期" prop="updateTime" width="200">
                <template #default="scope">
                  {{ scope.row.updateTime.replace('T', ' ') }}
                </template>
              </el-table-column>
              <el-table-column label="修改人" prop="updateBy" width="200" />
              <!-- 按钮组 -->
              <el-table-column label="操作" fixed="right" width="240">
                <template #default="scope">
                  <el-button-group>
                    <el-button type="success" size="small" @click="editNotice(scope.row.noticeId)">
                      <el-icon><Edit /></el-icon>
                      <span>编辑</span>
                    </el-button>
                    <el-button type="danger" size="small" @click="delNotice(scope.row.noticeId)">
                      <el-icon><Delete /></el-icon>
                      <span>删除</span>
                    </el-button>
                    <el-button type="primary" size="small" @click="seeContext(scope.row.noticeId)">
                      <el-icon><Delete /></el-icon>
                      <span>查看内容</span>
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
        <el-form :model="noticeObject" label-width="auto" style="max-width: 600px">
          <el-input v-model="noticeObject.noticeId" style="display: none" />
          <el-form-item label="公告名称">
            <el-input v-model="noticeObject.noticeTitle" placeholder="请输入公告标题" />
          </el-form-item>
          <el-form-item label="公告类型">
            <el-radio-group v-model="noticeObject.noticeType">
              <el-radio value="0">通知</el-radio>
              <el-radio value="1">公告</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="noticeObject.status">
              <el-radio value="0">正常</el-radio>
              <el-radio value="1">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="内容">
            <el-input v-model="noticeObject.remark" placeholder="请输入公告内容" type="textarea" />
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-divier />
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
import { computed, onMounted, reactive, ref } from 'vue'

const pageNum = ref(1) //当前页
const pageSize = ref(10) //每页显示的数据
const pageTotal = ref(0) //总个数
const keyWord = ref('') //关键字
const noticeData = reactive([]) //通知数据
const rowLoadingMap = reactive({}) //是否处于加载状态
const addOrEditDrawerModal = ref(false) //添加或编辑通知抽屉
const addOrEditDrawerTitle = ref('') //添加或编辑通知抽屉标题
const loading = ref(true)

//计算菜单类别名字
const noticeTag = computed(() => (tagName) => {
  if (tagName === '通知') return 'primary'
  if (tagName === '公告') return 'success'
  return 'danger'
})

//通知对象，用于存储添加或修改的通知信息
const noticeObject = reactive({
  noticeId: '',
  noticeTitle: '',
  noticeType: '0',
  noticeContent: '',
  status: '0',
  remark: '',
})

const noticeIds = ref([]) //选中的编号数组

// 监听多选
const handleSelectionChange = (val) => {
  noticeIds.value = val
}

//批量删除
const batchDelete = async () => {
  if (noticeIds.value.length === 0) {
    return ElMessage.warning('请选择要删除的项！')
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${noticeIds.value.length} 条记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    //提取id
    const ids = noticeIds.value.map((item) => item.noticeId)
    // 调用 API 批量删除
    await http.post('/notice/batchDelete', { ids })

    // 重新查询一遍数据
    getNoticeFetch()

    ElMessage.success('批量删除成功！')
  } catch (error) {
    ElMessage.error('批量删除失败！', error)
  }
}

//模糊查询
const searchNotice = (keyWordInput) => {
  keyWord.value = keyWordInput
  // ElMessage.info(keyWord.value)
  getNoticeFetch()
}

//添加通知抽屉
const addNotice = () => {
  //清空通知对象
  noticeObject.noticeId = ''
  noticeObject.noticeTitle = ''
  noticeObject.noticeType = '0'
  noticeObject.noticeContent = ''
  noticeObject.remark = ''
  noticeObject.status = '0'

  addOrEditDrawerTitle.value = '添加通知'
  addOrEditDrawerModal.value = true
}

//添加通知
const addNoticeSubmit = () => {
  // console.log("添加的数据"+noticeObject)
  //后端发送添加通知请求
  http.post('/notice/add', noticeObject).then((res) => {
    if (res.data.data) {
      ElMessage.success('添加成功')
      addOrEditDrawerModal.value = false
    } else {
      ElMessage.error('添加失败')
    }
    getNoticeFetch()
  })
}

//查看通知内容
const seeContext = (noticeId) => {
  //查询当前通知内容
  http.get('/notice/getById?id=' + noticeId).then((res) => {
    if (res.data.data) {
      noticeObject.noticeContent = res.data.data.noticeContent
      noticeObject.noticeTitle = res.data.data.noticeTitle
    }
    ElMessageBox.alert(`${noticeObject.noticeContent}`, `${noticeObject.noticeTitle}`, {
      confirmButtonText: '已阅',
    })
  })
}

//删除通知
const delNotice = (noticeId) => {
  ElMessageBox.confirm('确定删除编号为 ' + noticeId + ' 的通知？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    //删除通知
    http.post('notice/deleteById?id=' + noticeId).then((res) => {
      if (res.data.data) {
        ElMessage.success('删除成功')
        getNoticeFetch()
      } else {
        throw new Error('通知删除失败')
      }
    })
  })
}

//修改通知抽屉
const editNotice = (noticeId) => {
  //userId=userId
  addOrEditDrawerTitle.value = '编辑通知'
  addOrEditDrawerModal.value = true
  //回调单个通知数据
  http
    .get('/notice/getById?id=' + noticeId)
    .then((res) => {
        res.data.status = res.data.data.status
        noticeObject.noticeId = noticeId
        noticeObject.noticeType = res.data.data.noticeType
        noticeObject.noticeContent = res.data.data.noticeContent
        noticeObject.noticeTitle = res.data.data.noticeTitle
        noticeObject.status = res.data.data.status
        noticeObject.remark = res.data.data.remark

    })
    .catch((error) => {
      ElMessage.error('获取通知数据失败' + error)
    })
}

//修改通知
const updateNoticeSubmit = () => {
  // console.log("修改的数据"+userObject)
  //后端发送修改通知请求
  http.post('/notice/update', noticeObject).then((res) => {
    if (res.data.data) {
      ElMessage.success('修改成功')
      addOrEditDrawerModal.value = false
      getNoticeFetch()
    } else {
      ElMessage.error('操作有误,请重试!')
    }
    getNoticeFetch()
  })
}

//判断当前抽屉的按钮操作是添加还是修改
const handleSubmit = () => {
  if (addOrEditDrawerTitle.value === '添加通知') {
    addNoticeSubmit() // 调用添加通知的方法
  } else if (addOrEditDrawerTitle.value === '编辑通知') {
    updateNoticeSubmit() // 调用修改通知的方法
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
  getNoticeFetch()
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
  getNoticeFetch()
}

// 修改通知状态改变事件
const updateUserStatus = async (id, roleStatus, roleName) => {
  try {
    const response = await http.put(`/notice/update/${id}/${roleStatus}`)
    if (response.data.data) {
      ElNotification({
        title: '修改成功!',
        message: `公告编号为 ${id} 的状态已更新为 ${roleStatus === 0 ? '正常' : '禁用'}`,
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

//判断修改通知状态前逻辑，判断通知id是否相同，如果相同拦截并不让更改，否则放行
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
    //执行beforeChange和更改通知状态
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
  getNoticeFetch()
})

const getNoticeFetch = () => {
  loading.value = true
  //获取通知数据
  http
    .get('/notice/list', {
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
      noticeData.splice(0, noticeData.length, ...list)
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
