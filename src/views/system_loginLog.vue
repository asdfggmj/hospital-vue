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
            <el-button type="warning" @click="emptyLoginInfo">
              <el-icon><DeleteFilled /></el-icon>
              <span>清空</span>
            </el-button>
          </el-col>
          <!-- 模糊查询 -->
           <el-col :span="5">
            <el-input
              v-model="userName"
              @change="searchLoginLog"
              placeholder="请输入用户名称回车以查询"
              clearable
              size=""
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
              :data="loginLogData"
              style="width: 100%"
              max-height="500"
              row-key="infoId"
              @selection-change="handleSelectionChange"
              border
            >
              <el-table-column fixed type="selection" width="55" />
              <el-table-column label="用户名" prop="userName" width="160" show-overflow-tooltip />
              <el-table-column
                label="登录账号"
                prop="loginAccount"
                width="160"
                show-overflow-tooltip
              />
              <el-table-column label="IP" prop="ipAddr" width="150" />
              <el-table-column label="登录地址" prop="loginLocation" width="150" />
              <el-table-column label="浏览器" prop="browser" width="150" />
              <el-table-column label="操作系统" prop="os" width="160" />
              <el-table-column label="登录状态" width="140" prop="msg" show-overflow-tooltip />
              <el-table-column label="用户类型" width="140" prop="loginType">
                <template #default="scope">
                  <span>{{ scope.row.loginType === '0' ? '系统用户' : '患者用户' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="loginTime" label="登录时间" width="200">
                <template #default="scope">
                  {{ scope.row.loginTime.replace('T', ' ') }}
                </template>
              </el-table-column>
              <!-- 按钮组 -->
              <el-table-column label="操作" fixed="right" width="100">
                <template #default="scope">
                  <el-button-group>
                    <el-button
                      type="danger"
                      size="small"
                      @click="delLoginInfo(scope.row.infoId, scope.row.userName)"
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
const loginLogData = reactive([]) //登录日志数据
const pageNum = ref(1) //当前页
const pageSize = ref(10) //每页显示的数据
const pageTotal = ref(0) //总个数
const userName = ref('') //用户名称
const loading = ref(true) //表格加载动画

const infoIds = ref([]) //选中的编号数组

// 监听多选
const handleSelectionChange = (val) => {
  console.log('当前选中的数据:', val) // ✅ 确保这里不是空的
  infoIds.value = val
}

//批量删除
const batchDelete = async () => {
  if (infoIds.value.length === 0) {
    return ElMessage.warning('请选择要删除的项！')
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${infoIds.value.length} 条记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    //提取id
    const ids = infoIds.value.map((item) => item.infoId)
    // 调用 API 批量删除
    await http.post('/loginInfo/batchDelete', { ids })

    // 重新查询一遍数据
    getLoginInfoData()
    ElMessage.success('批量删除成功！')
  } catch (error) {
    ElMessage.error('批量删除失败！', error)
  }
}
//模糊查询
const searchLoginLog = () => {
  getLoginInfoData()
}

//删除操作日志
const delLoginInfo = (id, title) => {
  ElMessageBox.confirm(`你确定要删除本条登录日志记录吗?`, '安全提示', {
    type: 'warning',
    cancelButtonText: '取消',
    confirmButtonText: '确定',
  }).then(() => {
    http.delete(`/loginInfo/deleteById/${id}`).then((res) => {
      if (res.data.data === true) {
        ElMessage.success('删除成功！')
        getLoginInfoData()
      }
    })
  })
}

//清空操作日志
const emptyLoginInfo = () => {
  ElMessageBox.confirm(`你确定要删除所有记录吗?`, '安全提示', {
    type: 'warning',
    cancelButtonText: '取消',
    confirmButtonText: '确定',
  }).then(() => {
    http.post('/loginInfo/emptyLoginInfo').then((res) => {
      if (res.data.data === true) {
        ElMessage.success('清空成功！')
        getLoginInfoData()
      }
    })
  })
}

//上一页
const sizeChange = (newPageSize) => {
  pageSize.value = newPageSize
  getLoginInfoData()
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
  getLoginInfoData()
}

// 页面加载时获取登录数据
onMounted(() => {
  getLoginInfoData()
})

// 获取登录日志记录数据
const getLoginInfoData = () => {
  loading.value = true
  http
    .get('/loginInfo/list', {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        userName: userName.value,
      },
      headers: { Authorization: 'Bearer' + auhtorization },
    })
    .then((res) => {
      const loginLog = res.data.data
      if (loginLog.list) {
        pageTotal.value = loginLog.total
        pageNum.value = loginLog.pageNum
        pageSize.value = loginLog.pageSize
        loginLogData.splice(0, loginLogData.length, ...loginLog.list)
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
