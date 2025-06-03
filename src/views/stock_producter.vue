<template>
  <!-- 第一行 -->
  <el-card shadow="always">
    <el-form :model="queryForm" label-width="auto">
      <el-row justify="space-between">
        <el-col :span="4">
          <el-form-item label="厂家名称">
            <el-input
              placeholder="请输入厂家名字"
              clearable
              @input="debouncedGetProviderFetch"
              v-model="queryForm.producterName"
            />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="关键字">
            <el-input
              placeholder="请输入厂家关键字"
              clearable
              @input="debouncedGetProviderFetch"
              v-model="queryForm.keywords"
            />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="电话">
            <el-input
              placeholder="请输入厂家电话"
              clearable
              @input="debouncedGetProviderFetch"
              v-model="queryForm.producterTel"
            />
          </el-form-item>
        </el-col>
        <el-col :span="4">
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
        <el-col :span="4">
          <el-button-group>
            <el-button type="primary" @click="getProucterFetch">
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
          <el-button type="primary" @click="addProducter">
            <el-icon><Plus /></el-icon>
            <span>新增厂家</span>
          </el-button>
          <el-button type="danger" @click="deletes" :disabled="producterIds.length === 0">
            <el-icon><Minus /></el-icon>
            <span>删除选中</span>
          </el-button>
        </el-button-group>
      </el-col>
    </el-row>
  </el-card>

  <!-- 第三行 -->
  <el-row class="mt-10px">
    <el-col :span="24">
      <el-card shadow="always" v-loading="loading">
        <!-- 表格 -->
        <el-row class="mt-10px">
          <el-col>
            <el-table
              border
              :data="producterData"
              style="width: 100%"
              max-height="500"
              row-key="producterId"
              @selection-change="handleSelectionChange"
            >
              <el-table-column fixed type="selection" width="55" />
              <el-table-column label="厂家编号" prop="producterId" width="120" />
              <el-table-column label="厂家名称" prop="producterName" width="240" />
              <el-table-column label="厂家编码" prop="producterCode" width="120" />
              <el-table-column label="联系人" prop="producterPerson" width="120" />
              <el-table-column label="电话" prop="producterTel" width="200" />
              <el-table-column label="关键字" prop="keywords" width="120" />
              <el-table-column label="状态" prop="status" width="100">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.status"
                    :before-change="
                      () =>
                        handleBeforeChange(
                          scope.row.producterId,
                          scope.row.status === '0' ? '1' : '0',
                          scope.row.producterName,
                        )
                    "
                    active-value="0"
                    inactive-value="1"
                    active-text="正常"
                    inactive-text="禁用"
                    class="ml-2"
                    inline-prompt
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                    :loading="rowLoadingMap[scope.row.producterId]"
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
              <el-table-column label="修改人" prop="updateBy" width="120" />
              <!-- 按钮组 -->
              <el-table-column label="操作" fixed="right" width="160">
                <template #default="scope">
                  <el-button-group>
                    <el-button
                      type="success"
                      size="small"
                      @click="editProducter(scope.row.producterId)"
                    >
                      <el-icon><Edit /></el-icon>
                      <span>编辑</span>
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      @click="delProducter(scope.row.producterId, scope.row.producterName)"
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

  <!-- 新增和修改厂家对话框 -->
  <el-dialog
    v-model="addOrUpdateProducterDialogVisible"
    :title="producterDialogTitle"
    width="500"
    :before-close="handleClose"
  >
    <!-- 主体内容 -->
    <el-card shadow="hover">
      <el-row>
        <el-col>
          <el-form label-width="auto" :model="producterForm">
            <el-form-item label="厂家名称">
              <el-input
                placeholder="请输入厂家名称"
                v-model="producterForm.producterName"
              ></el-input>
            </el-form-item>
            <el-form-item label="厂家编码">
              <el-input
                placeholder="请输入厂家编码"
                v-model="producterForm.producterCode"
              ></el-input>
            </el-form-item>
            <el-form-item label="联系人">
              <el-input
                placeholder="请输入联系人"
                v-model="producterForm.producterPerson"
              ></el-input>
            </el-form-item>
            <el-form-item label="电话">
              <el-input placeholder="请输入电话" v-model="producterForm.producterTel"></el-input>
            </el-form-item>
            <el-form-item label="关键字">
              <el-input placeholder="请输入关键字" v-model="producterForm.keywords"></el-input>
            </el-form-item>
            <el-form-item label="地址">
              <el-input
                placeholder="请输入地址"
                v-model="producterForm.producterAddress"
              ></el-input>
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
          {{ producterDialogButtonContent }}
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
const producterData = reactive([]) //科室数据
const rowLoadingMap = reactive({}) //是否处于加载状态
const addOrUpdateProducterDialogVisible = ref(false) //添加或修改厂家信息对话框控制显示
const producterDialogTitle = ref('') //修改或新增厂家标题
const producterDialogButtonContent = ref('') //修改或新增厂家按钮内容
const producterForm = reactive({
  producterId: 0,
  producterName: '',
  producterCode: '',
  producterAddress: '',
  producterTel: '',
  producterPerson: '',
  keywords: '',
}) //表单数据
const producterIds = ref([]) //选中的编号数组
const queryForm = reactive({
  producterName: '', //厂家名字
  status: '', //状态
  producterTel: '', //电话
  keywords: '', //关键字
}) //查询条件表单
const loading = ref(true)

//重置查询条件
const resetQueryFetch = () => {
  Object.assign(queryForm, {
    producterName: '', //厂家名字
    status: '', //状态
    producterTel: '', //电话
    keywords: '', //关键字
  })
}

//使用dayjs序列化时间
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '--'
}

// 监听多选
const handleSelectionChange = (val) => {
  console.log('当前选中的数据:', val) // ✅ 确保这里不是空的
  producterIds.value = val
}

//批量删除
const deletes = async () => {
  if (producterIds.value.length === 0) {
    return ElMessage.warning('请选择要删除的项！')
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${producterIds.value.length} 条记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    //提取id
    const ids = producterIds.value.map((item) => item.producterId)
    // 调用 API 批量删除
    await http.post('/producter/batchDelete', { ids })

    // 重新查询一遍数据
    getProucterFetch()

    ElMessage.success('批量删除成功！')
  } catch (error) {
    ElMessage.error('批量删除失败！', error)
  }
}

//提交修改或新增厂家异步方法
const submitAddOrUpdate = () => {
  http.post('/producter/addOrUpdate', producterForm).then((res) => {
    if (res.data.code === 200) {
      ElMessage.success('操作成功！')
      //清除表单信息
      clearProducterForm()
      //重新查询厂家信息
      getProucterFetch()
      //关闭对话框
      addOrUpdateProducterDialogVisible.value = false
    }
  })
}

//关闭前询问
const handleClose = () => {
  ElMessageBox.confirm('你确定要关闭该界面吗?数据不会做任何保存!').then(() => {
    addOrUpdateProducterDialogVisible.value = false
    clearProducterForm()
  })
}

//清除表单数据
const clearProducterForm = () => {
  Object.assign(producterForm, {
    producterId: 0,
    producterName: '',
    producterCode: '',
    producterAddress: '',
    producterTel: '',
    producterPerson: '',
    keywords: '',
  })
}

//删除厂家方法
const delProducter = (id, name) => {
  ElMessageBox.confirm(`你确定要删除 ${name} 吗?`, '安全提示', {
    type: 'warning',
    cancelButtonText: '取消',
    confirmButtonText: '确定',
  }).then(() => {
    http.delete(`/producter/delete/${id}`).then((res) => {
      if (res.data.data === true) {
        ElMessage.success('删除成功！')
        getProucterFetch()
      }
    })
  })
}

//修改厂家方法
const editProducter = (id) => {
  addOrUpdateProducterDialogVisible.value = true
  producterDialogButtonContent.value = '修改'
  producterDialogTitle.value = '修改厂家信息'
  http.get(`/producter/get/${id}`).then((res) => {
    producterForm.producterId = res.data.data.producterId
    producterForm.producterName = res.data.data.producterName
    producterForm.producterCode = res.data.data.producterCode
    producterForm.producterTel = res.data.data.producterTel
    producterForm.keywords = res.data.data.keywords
    producterForm.producterAddress = res.data.data.producterAddress
    producterForm.producterPerson = res.data.data.producterPerson
  })
}

//新增厂家方法
const addProducter = () => {
  addOrUpdateProducterDialogVisible.value = true
  producterDialogButtonContent.value = '添加'
  producterDialogTitle.value = '新增厂家信息'
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
const updateUserStatus = async (producterId, statusId, producterName) => {
  try {
    const response = await http.put(`/producter/update/${producterId}/${statusId}`)
    if (response.data) {
      ElNotification({
        title: '修改成功!',
        message: `厂家 ${producterName} 的状态已更新为 ${statusId === '0' ? '启用' : '禁用'}`,
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
const handleBeforeChange = async (producterId, statusId, producterName) => {
  console.log(producterId, statusId, producterName)
  //将当前开关的动画状态开启
  rowLoadingMap[producterId] = true
  try {
    //执行beforeChange和更改用户状态
    await beforeChange()
    await updateUserStatus(producterId, statusId, producterName)
    return true
  } catch (error) {
    console.error(error.message)
    return false // 阻止状态切换
  } finally {
    rowLoadingMap[producterId] = false
  }
}

//上一页
const sizeChange = (newPageSize) => {
  pageSize.value = newPageSize
  getProucterFetch()
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
  getProucterFetch()
}

//页面加载时挂载
onMounted(() => {
  getProucterFetch()
})

const getProucterFetch = () => {
  loading.value = true
  //获取厂家信息
  http
    .get('/producter/getAll', {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        producterName: queryForm.producterName, //厂家名字
        status: queryForm.status, //状态
        producterTel: queryForm.producterTel, //电话
        keywords: queryForm.keywords, //关键字
      },
    })
    .then((res) => {
      const list = Array.isArray(res.data.list) ? res.data.list : []
      producterData.splice(0, producterData.length, ...list)
      pageTotal.value = res.data?.total || 0
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}
// 防抖处理
const debouncedGetProviderFetch = debounce(getProucterFetch, 500)
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
