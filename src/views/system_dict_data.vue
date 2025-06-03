<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- 第一行 -->
  <el-row>
    <el-col :span="24">
      <el-card shadow="always" class="mb-10px">
        <el-row justify="space-between">
          <el-col :span="12">
            <el-button type="primary" @click="router.back()">
              <el-icon><Back /></el-icon>
              <span>返回上一级</span>
            </el-button>
            <el-button type="primary" @click="addDictData">
              <el-icon><Plus /></el-icon>
              <span>新增字典数据</span>
            </el-button>
            <el-button type="danger" @click="batchDelete">
              <el-icon><Minus /></el-icon>
              <span>删除选中字典数据</span>
            </el-button>
          </el-col>
          <!-- 模糊查询 -->
          <el-col :span="5">
            <el-input
              v-model="keyWord"
              @change="searchDictData"
              placeholder="请输入字典标签回车以查询"
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
      <el-card shadow="always">
        <!-- 表格 -->
        <el-row class="mt-10px">
          <el-col>
            <el-table
              :data="dictData"
              style="width: 100%"
              max-height="500"
              border
              row-key="dictCode"
              @selection-change="handleSelectionChange"
            >
              <el-table-column fixed type="selection" width="55" />
              <el-table-column label="字典编码" prop="dictCode" width="100" />
              <el-table-column label="字典标签" prop="dictLabel" width="160" />
              <el-table-column label="字典键值" prop="dictValue" width="100" />
              <el-table-column label="字典排序" prop="dictSort" width="100" />
              <el-table-column label="状态" prop="status" width="100">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.status"
                    :before-change="
                      () =>
                        handleBeforeChange(
                          scope.row.dictCode,
                          scope.row.status === 0 ? 1 : 0,
                          scope.row.dictLabel,
                        )
                    "
                    :active-value="0"
                    :inactive-value="1"
                    active-text="正常"
                    inactive-text="禁用"
                    class="ml-2"
                    inline-prompt
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                    :loading="rowLoadingMap[scope.row.dictCode]"
                  />
                </template>
              </el-table-column>
              <el-table-column label="备注" prop="remark" width="200" />
              <el-table-column label="创建时间" prop="createTime" width="200">
                <template #default="scope">
                  {{ scope.row.createTime.replace('T', ' ') }}
                </template>
              </el-table-column>
              <el-table-column label="创建人" prop="createBy" width="120" />
              <el-table-column label="最后一次修改时间" prop="updateTime" width="200">
                <template #default="scope">
                  {{ scope.row.updateTime?scope.row.updateTime.replace('T',' '):'' }}
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
                      @click="editDictData(scope.row.dictCode)"
                    >
                      <el-icon><Edit /></el-icon>
                      <span>编辑</span>
                    </el-button>
                    <el-button type="danger" size="small" @click="delDictData(scope.row.dictCode)">
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

  <!-- 添加字典类别和编辑类别抽屉 -->
  <el-drawer
    v-model="addOrEditDrawerModal"
    :title="addOrEditDrawerTitle"
    size="30%"
    :before-close="beforeChangeAddOrEditDrawer"
  >
    <el-row>
      <el-col :span="20">
        <el-form :model="dictDataObject" label-width="auto" style="max-width: 600px">
          <el-input v-model="dictDataObject.dictCode" style="display: none" />
          <el-form-item label="字典类型">
            <el-input v-model="dictDataObject.dictType" disabled placeholder="请输入数据标签" />
          </el-form-item>
          <el-form-item label="数据标签">
            <el-input v-model="dictDataObject.dictLabel" placeholder="请输入数据标签" />
          </el-form-item>
          <el-form-item label="数据键值">
            <el-input v-model="dictDataObject.dictValue" placeholder="请输入数据键值" />
          </el-form-item>
          <el-form-item label="显示顺序">
            <el-input-number v-model="dictDataObject.dictSort" :min="0" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="dictDataObject.remark" placeholder="请输入备注" type="textarea" />
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-divider />
    <el-row class="text-center">
      <el-col>
        <el-button @click="addOrEditDictDataSubmit" type="primary">提交</el-button>
        <el-button type="primary" @click="addOrEditDrawerModal = false">取消</el-button>
      </el-col>
    </el-row>
  </el-drawer>
</template>

<script setup lang="ts">
import http from '@/http'
import router from '@/router'
import { useDictTypeStore } from '@/stores/dictType'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

const pageNum = ref(1) //当前页
const pageSize = ref(10) //每页显示的数据
const pageTotal = ref(0) //总个数
const keyWord = ref('') //关键字
const dictData = reactive([]) //科室数据
const rowLoadingMap = reactive({}) //是否处于加载状态
const dictTypeStore = useDictTypeStore() //使用字典类别的xx
const addOrEditDrawerModal = ref(false) //添加或编辑字典数据抽屉
const addOrEditDrawerTitle = ref('') //添加或编辑字典数据抽屉标题
const dictType = ref('')
let dids = ref([]) //存储选中的字典数据编号的数组

//字典数据对象，用于存储添加或修改的字典数据信息
const dictDataObject = reactive({
  dictCode: '',
  dictSort: '0',
  dictLabel: '',
  dictValue: '',
  dictType: '',
  status: '0',
  remark: '',
})

//模糊查询
const searchDictData = (keyWordInput) => {
  keyWord.value = keyWordInput
  // ElMessage.info(keyWord.value)
  getDictFetch()
}

// 监听多选
const handleSelectionChange = (val) => {
  //console.log('当前选中的数据:', val) // ✅ 确保这里不是空的
  dids.value = val
}

//批量删除
const batchDelete = async () => {
  if (dids.value.length === 0) {
    return ElMessage.warning('请选择要删除的项！')
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${dids.value.length} 条记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    //提取id
    const ids = dids.value.map((item) => item.dictCode)
    // 调用 API 批量删除
    await http.post('/dictData/batchDelete', { ids }).then((res) => {
      // 重新查询一遍数据
      if(res.data.data){
      getDictFetch()
      ElMessage.success('批量删除成功！')
    }
    })
  } catch (error) {
    ElMessage.error('批量删除有误,请重试!', error)
  }
  keyWord.value = ''
}

//添加字典数据抽屉
const addDictData = () => {
  //清空字典数据对象
  dictDataObject.dictCode = ''
  dictDataObject.dictLabel = ''
  dictDataObject.dictSort = ''
  dictDataObject.status = '0'
  dictDataObject.dictValue = ''
  dictDataObject.dictType = dictType.value
  dictDataObject.remark = ''

  addOrEditDrawerTitle.value = '添加字典数据'
  addOrEditDrawerModal.value = true
}

//修改字典数据抽屉
const editDictData = (dictCode) => {
  //userId=userId
  addOrEditDrawerTitle.value = '编辑字典数据'
  addOrEditDrawerModal.value = true
  //回调单个字典数据数据
  http.get('/dictData/getById?id=' + dictCode).then((res) => {
    if (res.data.data) {
      dictDataObject.dictCode = res.data.data.dictCode
      dictDataObject.dictLabel = res.data.data.dictLabel
      dictDataObject.dictSort = res.data.data.dictSort
      dictDataObject.status = res.data.data.status
      dictDataObject.dictType = res.data.data.dictType
      dictDataObject.dictValue = res.data.data.dictValue
      dictDataObject.remark = res.data.data.remark
    }
  })
  // .catch((error)=>{
  //   //ElMessage.error('获取字典数据数据失败'+error)
  // })
}

//添加或修改字典数据
const addOrEditDictDataSubmit = () => {
  // console.log("添加的数据"+dictDataObject)
  //后端发送添加字典数据请求
  http.post('/dictData/addOrEditDictData', dictDataObject).then((res) => {
    if (res.data.data) {
      if (res.data.data.includes('成功')) {
        ElMessage.success(res.data.data)
        addOrEditDrawerModal.value = false
      } else {
        ElMessage.error(res.data.data)
      }
    } else {
      ElMessage.error(res.data.data)
    }
    getDictFetch()
  })
}

//删除字典数据
const delDictData = (roleId) => {
  ElMessageBox.confirm('确定删除编码为' + roleId + '的字典数据？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    //删除字典数据
    http.post('dictData/deleteById?id=' + roleId).then((res) => {
      if (res.data.data) {
        ElMessage.success('删除成功')
        getDictFetch()
      } else {
        throw new Error('字典数据删除失败')
      }
    })
    keyWord.value = ''
  })
  // .catch(() => {
  //   ElMessage({
  //     type: 'info',
  //     message: 'Delete canceled',
  //   })
  // })
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

// 修改字典数据状态改变事件
const updateUserStatus = async (rid, roleStatus, roleName) => {
  try {
    const response = await http.put(`/dictData/update/${rid}/${roleStatus}`)
    if (response.data.data) {
      ElNotification({
        title: '修改成功!',
        message: `字典数据 ${roleName} 的状态已更新为 ${roleStatus === 0 ? '正常' : '禁用'}`,
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

//判断修改字典数据状态前逻辑，判断字典数据id是否相同，如果相同拦截并不让更改，否则放行
const beforeChange = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
}

//状态按钮切换主逻辑方法
const handleBeforeChange = async (rid, roleStatus, roleName) => {
  //将当前开关的动画状态开启
  rowLoadingMap[rid] = true
  try {
    //执行beforeChange和更改字典数据状态
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
  getDictFetch()
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
  getDictFetch()
}

//页面挂载
onMounted(() => {
  //设置字典类别默认值=>从父页面获取
  dictType.value = dictTypeStore.getDictType.dictType
  getDictFetch()
})

//获取字典数据
const getDictFetch = () => {
  http
    .get('/dictData/list', {
      params: {
        dictType: dictType.value,
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
      dictData.splice(0, dictData.length, ...list)
      pageTotal.value = res.data.data?.total || 0
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
