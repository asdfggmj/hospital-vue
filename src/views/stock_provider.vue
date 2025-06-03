<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- 第一行 -->
  <el-card shadow="always">
    <!-- 查询行 -->
    <el-form :model="queryForm">
      <el-row justify="space-between">
        <el-col :span="5">
          <el-form-item style="margin-right: 6px" label="供应商名称">
            <el-input
              v-model="queryForm.providerName"
              @input="debouncedGetProviderFetch"
              placeholder="请输入供应商名称"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item style="margin-right: 6px" label="联系人">
            <el-input
              v-model="queryForm.contactName"
              @input="debouncedGetProviderFetch"
              placeholder="请输入联系人"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item style="margin-right: 6px" label="联系人电话">
            <el-input
              v-model="queryForm.contactTel"
              @input="debouncedGetProviderFetch"
              placeholder="请输入联系人电话"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item style="margin-right: 6px" label="状态">
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
            <el-button type="primary" @click="getProviderFetch">
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

  <el-card shadow="always" class="mt-10px">
    <!-- 按钮行 -->
    <el-row justify="space-between" class="mt-10px">
      <el-col :span="12">
        <el-button-group>
          <el-button type="primary" @click="addProvider">
            <el-icon><Plus /></el-icon>
            <span>新增供应商</span>
          </el-button>
          <el-button type="danger" @click="deletes" :disabled="providerIds.length === 0">
            <el-icon><Minus /></el-icon>
            <span>删除选中</span>
          </el-button>
        </el-button-group>
      </el-col>
    </el-row>
  </el-card>
  <!-- 第二行 -->
  <el-card shadow="always" class="mt-10px" v-loading="loading">
    <!-- 表格 -->
    <el-row>
      <el-col>
        <el-table
          :data="dictData"
          style="width: 100%"
          max-height="500"
          row-key="providerId"
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column fixed type="selection" width="55" />
          <el-table-column label="供应商编号" prop="providerId" width="120" />
          <el-table-column label="供应商名称" prop="providerName" width="200" />
          <el-table-column label="联系人" prop="contactName" width="200" />
          <el-table-column label="联系人手机号" prop="contactMobile" width="200" />
          <el-table-column label="联系人电话号" prop="contactTel" width="200" />
          <el-table-column label="银行账号" prop="bankAccount" width="200" />
          <el-table-column label="地址" prop="providerAddress" width="200" />
          <el-table-column label="状态" prop="status" width="80" fixed="right">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                :before-change="
                  () =>
                    handleBeforeChange(
                      scope.row.providerId,
                      scope.row.status === '0' ? '1' : '0',
                      scope.row.providerName,
                    )
                "
                active-value="0"
                inactive-value="1"
                active-text="正常"
                inactive-text="禁用"
                class="ml-2"
                inline-prompt
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                :loading="rowLoadingMap[scope.row.providerId]"
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
                <el-button type="success" size="small" @click="editProvider(scope.row.providerId)">
                  <el-icon><Edit /></el-icon>
                  <span>编辑</span>
                </el-button>
                <el-button type="danger" size="small" @click="delProvider(scope.row.providerId)">
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

  <!-- 修改和添加对话框 -->
  <el-dialog
    v-model="addOrUpdateProviderDialogVisible"
    :title="providerDialogTitle"
    width="500"
    :before-close="handleClose"
  >
    <!-- 主体内容 -->
    <el-card shadow="hover">
      <el-row>
        <el-col>
          <el-form label-width="auto" :model="providerForm">
            <el-form-item label="供应商名称">
              <el-input placeholder="请输入供应商名称" v-model="providerForm.providerName" />
            </el-form-item>
            <el-form-item label="联系人">
              <el-input placeholder="请输入联系人" v-model="providerForm.contactName" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input placeholder="请输入关键字" v-model="providerForm.contactMobile" />
            </el-form-item>
            <el-form-item label="电话号">
              <el-input placeholder="请输入药品单位" v-model="providerForm.contactTel" />
            </el-form-item>
            <el-form-item label="银行账户">
              <el-input placeholder="请输入药品换算量" v-model="providerForm.bankAccount" />
            </el-form-item>
            <el-form-item label="地址">
              <el-input placeholder="请输入供应商地址" v-model="providerForm.providerAddress" />
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
          {{ providerDialogButtonContent }}
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
const dictData = reactive([]) //科室数据
const rowLoadingMap = reactive({}) //是否处于加载状态
const addOrUpdateProviderDialogVisible = ref(false) //供应商对话框显示
const providerDialogTitle = ref('') //供应商标题
const providerDialogButtonContent = ref('') //按钮内容
const providerForm = reactive({
  providerId: 0, //供应商ID
  providerName: '', //供应商名字
  contactName: '', //联系人名称
  contactMobile: '', //手机号
  contactTel: '', //电话号
  bankAccount: '', //卡号
  providerAddress: '', //地址
  status: '', //状态
  createTime: '', //创建时间
  updateTime: '', //创建人
  createBy: '', //修改时间
  updateBy: '', //修改人
}) //供应商响应式对象
const providerIds = ref([]) //选中的编号数组
const queryForm = reactive({
  providerName: '', //供应商名称
  contactName: '', //联系人名称
  contactTel: '', //联系人电话
  status: '', //状态
}) //搜索行条件对象
const loading = ref(true)

// 重置方法
const resetQueryFetch = () => {
  Object.assign(queryForm, {
    providerName: '',
    contactName: '',
    contactTel: '',
    status: '',
  })
  getProviderFetch()
}

//批量删除
const deletes = async () => {
  if (providerIds.value.length === 0) {
    return ElMessage.warning('请选择要删除的项！')
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${providerIds.value.length} 条记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    //提取id
    const ids = providerIds.value.map((item) => item.providerId)
    // 调用 API 批量删除
    await http.post('/provider/batchDelete', { ids })

    // 重新查询一遍数据
    getProviderFetch()

    ElMessage.success('批量删除成功！')
  } catch (error) {
    ElMessage.error('批量删除失败！', error)
  }
}

// 监听多选
const handleSelectionChange = (val) => {
  console.log('当前选中的数据:', val) // ✅ 确保这里不是空的
  providerIds.value = val
}

//关闭前询问
const handleClose = () => {
  ElMessageBox.confirm('你确定要关闭该界面吗?数据不会做任何保存!')
    .then(() => {
      addOrUpdateProviderDialogVisible.value = false
      resetProviderForm()
    })
    .catch(() => {
      // catch error
    })
}

//清空对象方法
const resetProviderForm = () => {
  Object.assign(providerForm, {
    providerId: 0, //供应商ID
    providerName: '', //供应商名字
    contactName: '', //联系人名称
    contactMobile: '', //手机号
    contactTel: '', //电话号
    bankAccount: '', //卡号
    providerAddress: '', //地址
    status: '', //状态
    createTime: '', //创建时间
    updateTime: '', //创建人
    createBy: '', //修改时间
    updateBy: '', //修改人
  })
}

//提交表单
const submitAddOrUpdate = () => {
  http.post('/provider/addOrUpdate', providerForm).then((res) => {
    if (res.data.code === 200) {
      ElMessage.success('操作成功！')
      //清除表单信息
      resetProviderForm()
      //重新查询供应商信息
      getProviderFetch()
      //关闭对话框
      addOrUpdateProviderDialogVisible.value = false
    }
  })
}

//新增供应商
const addProvider = () => {
  providerDialogTitle.value = '新增供应商'
  providerDialogButtonContent.value = '确认添加'
  addOrUpdateProviderDialogVisible.value = true
}

//根据ID编辑供应商
const editProvider = (pid) => {
  providerDialogTitle.value = `修改${pid}号供应商`
  providerDialogButtonContent.value = '确认修改'
  http.get(`/provider/get/${pid}`).then((res) => {
    Object.assign(providerForm, {
      providerId: res.data.data.providerId, //供应商ID
      providerName: res.data.data.providerName, //供应商名字
      contactName: res.data.data.contactName, //联系人名称
      contactMobile: res.data.data.contactMobile, //手机号
      contactTel: res.data.data.contactTel, //电话号
      bankAccount: res.data.data.bankAccount, //卡号
      providerAddress: res.data.data.providerAddress, //地址
    })
  })
  addOrUpdateProviderDialogVisible.value = true
}

//根据ID删除供应商
const delProvider = (pid) => {
  ElMessageBox.confirm(`您确定要删除${pid}号供应商吗？`, '温馨提示', {
    cancelButtonText: '取消',
    confirmButtonText: '确定',
  }).then(() => {
    http.delete(`/provider/del/${pid}`).then((res) => {
      if (res.data.code === 200) {
        ElMessage.success('删除成功！')
        getProviderFetch()
      }
    })
  })
}

//使用dayjs序列化时间
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '--'
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
const updateUserStatus = async (providerId, statusId, providerName) => {
  try {
    const response = await http.put(`/provider/update/${providerId}/${statusId}`)
    if (response.data) {
      ElNotification({
        title: '修改成功!',
        message: `供应商 ${providerName} 的状态已更新为 ${statusId === '0' ? '启用' : '禁用'}`,
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

//上一页
const sizeChange = (newPageSize) => {
  pageSize.value = newPageSize
  getProviderFetch()
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
  getProviderFetch()
}

//页面加载时挂载
onMounted(() => {
  getProviderFetch()
})

//获取供应商数据
const getProviderFetch = () => {
  loading.value = true
  http
    .get('/provider/list', {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        providerName: queryForm.providerName,
        contactName: queryForm.contactName,
        contactTel: queryForm.contactTel,
        status: queryForm.status,
      },
    })
    .then((res) => {
      const list = Array.isArray(res.data.data.list) ? res.data.data.list : []
      dictData.splice(0, dictData.length, ...list)
      pageTotal.value = res.data.data?.total || 0
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}

// 防抖处理
const debouncedGetProviderFetch = debounce(getProviderFetch, 500)
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
