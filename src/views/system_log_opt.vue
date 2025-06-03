<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- 第一行 -->
  <el-row>
    <el-col :span="24">
      <el-card shadow="always" class="mb-10px">
        <el-row justify="space-between">
          <el-col :span="12">
            <el-button type="danger" @click="batchDelete">
              <el-icon><Minus /></el-icon>
              <span>删除</span>
            </el-button>
            <el-button type="warning" @click="emptyOperLog">
              <el-icon><DeleteFilled /></el-icon>
              <span>清空</span>
            </el-button>
          </el-col>
          <!-- 模糊查询 -->
          <el-col :span="5">
            <el-input
              v-model="title"
              @change="searchLoginLog"
              placeholder="请输入系统模块名称回车以查询"
              clearable
              size="10"
            />
          </el-col>
          <el-row> </el-row>
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
              :data="operLogData"
              style="width: 100%"
              max-height="500"
              row-key="operId"
              @selection-change="handleSelectionChange"
              border
            >
              <el-table-column type="expand">
                <template #default="props">
                  <div m="6" style="margin-left: 40px">
                    <p m="t-0 b-2"><b>操作模块:</b> {{ props.row.title }}</p>
                    <p m="t-0 b-2">
                      <b>登陆信息:</b>
                      {{
                        props.row.operName + '//' + props.row.operIp + '//' + props.row.operLocation
                      }}
                    </p>
                    <p m="t-0 b-2"><b>请求地址: </b>{{ props.row.operUrl }}</p>
                    <p m="t-0 b-2"><b>操作方法: </b>{{ props.row.method }}</p>

                    <p m="t-0 b-2"><b>请求参数:</b> {{ props.row.operParam }}</p>
                    <p m="t-0 b-2"><b>返回参数:</b> {{ props.row.jsonResult }}</p>

                    <p m="t-0 b-2"><b>操作状态:</b>{{ props.row.status == 0 ? '正常' : '异常' }}</p>
                    <p m="t-0 b-2"><b>操作时间:</b> {{ props.row.operTime.replace('T', ' ') }}</p>

                    <p m="t-0 b-2"><b>异常信息:</b> {{ props.row.erroMsg }}</p>
                  </div>
                </template>
              </el-table-column>
              <el-table-column fixed type="selection" width="55" />
              <el-table-column label="日志ID" prop="operId" width="100" />
              <el-table-column label="系统模块" prop="title" width="200" show-overflow-tooltip />
              <el-table-column label="操作类型" props="businessType" width="150">
                <template #default="scope">
                  <span>{{ getBusinessTypeText(scope.row.businessType) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="请求方式" prop="requestMethod" width="150" />
              <el-table-column label="操作人员" prop="operName" width="150" />
              <el-table-column label="主机" prop="operIp" width="150" />
              <el-table-column label="操作地点" prop="operLocation" width="120" />
              <el-table-column label="操作状态" prop="status" width="120">
                <template #default="scope">
                  <span>{{ scope.row.status == 0 ? '成功' : '失败' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作时间" prop="operTime" width="200">
                <template #default="scope">
                  {{ scope.row.operTime.replace('T', ' ') }}
                </template>
              </el-table-column>
              <!-- 按钮组 -->
              <el-table-column label="操作" fixed="right" width="100">
                <template #default="scope">
                  <el-button-group>
                    <el-button
                      type="danger"
                      size="small"
                      @click="delOperateLog(scope.row.operId, scope.row.title)"
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
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import http from '@/http'
import { useCookies } from '@vueuse/integrations/useCookies'
import { ElMessage, ElMessageBox } from 'element-plus'

//从cookie获取authorization
const cookie = useCookies()
const auhtorization = cookie.get('authorization')

const pageNum = ref(1) //当前页
const pageSize = ref(10) //每页显示的数据
const pageTotal = ref(0) //总个数
const title = ref('')
const loading = ref(true) //表格加载动画

//计算操作类型
const getBusinessTypeText = (businessType) => {
  switch (businessType) {
    case '0':
      return '其他'
    case '1':
      return '新增'
    case '2':
      return '修改'
    case '3':
      return '删除'
    case '4':
      return '授权'
    case '5':
      return '导出'
    case '6':
      return '导入'
    case '7':
      return '退出'
    case '8':
      return '清空数据'
    default:
      return '未知操作'
  }
}
//操作日志数据
const operLogData = reactive([
  {
    operId: '',
    title: '',
    businessType: '',
    method: '',
    requestMethod: '',
    operatorType: '',
    operName: '',
    operUrl: '',
    operLocation: '',
    operParam: '',
    jsonResult: '',
    status: '',
    errorMsg: '',
    operTime: '',
  },
])

const operIds = ref([]) //选中的编号数组

// 监听多选
const handleSelectionChange = (val) => {
  console.log('当前选中的数据:', val) // ✅ 确保这里不是空的
  operIds.value = val
}

//批量删除
const batchDelete = async () => {
  if (operIds.value.length === 0) {
    return ElMessage.warning('请选择要删除的项！')
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${operIds.value.length} 条记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    //提取id
    const ids = operIds.value.map((item) => item.operId)
    // 调用 API 批量删除
    await http.post('/operLog/batchDelete', { ids })

    // 重新查询一遍数据
    getOperLogData()

    ElMessage.success('批量删除成功！')
  } catch (error) {
    ElMessage.error('批量删除失败！', error)
  }
}
//模糊查询
const searchLoginLog = () => {
  getOperLogData()
}

//删除操作日志
const delOperateLog = (id, title) => {
  ElMessageBox.confirm(`你确定要删除 ${title} 记录吗?`, '安全提示', {
    type: 'warning',
    cancelButtonText: '取消',
    confirmButtonText: '确定',
  }).then(() => {
    http.delete(`/operLog/deleteById/${id}`).then((res) => {
      if (res.data.data === true) {
        ElMessage.success('删除成功！')
        getOperLogData()
      }
    })
  })
}

//清空操作日志
const emptyOperLog = (id) => {
  ElMessageBox.confirm(`你确定要删除所有记录吗?`, '安全提示', {
    type: 'warning',
    cancelButtonText: '取消',
    confirmButtonText: '确定',
  }).then(() => {
    http.post('/operLog/emptyOperLog').then((res) => {
      if (res.data.data === true) {
        ElMessage.success('删除成功！')
        getOperLogData()
      }
    })
  })
}

//上一页
const sizeChange = (newPageSize) => {
  pageSize.value = newPageSize
  getOperLogData()
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
  getOperLogData()
}

// 页面加载时获取操作数据
onMounted(() => {
  getOperLogData()
})

// 获取操作日志记录数据
const getOperLogData = () => {
  loading.value = true
  http
    .get('/operLog/list', {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        title: title.value,
      },
      headers: { Authorization: 'Bearer' + auhtorization },
    })
    .then((res) => {
      const operLog = res.data.data
      if (operLog.list) {
        pageTotal.value = operLog.total
        pageNum.value = operLog.pageNum
        pageSize.value = operLog.pageSize
        operLogData.splice(0, operLogData.length, ...operLog.list)
      }
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}
</script>

<style scoped>
.mt-10px {
  margin-top: 10px;
}
.mb-10px {
  margin-bottom: 10px;
}
</style>
