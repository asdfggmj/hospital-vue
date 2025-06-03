<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- 第一行 -->
  <el-row>
    <el-col :span="24">
      <el-card shadow="always" class="mb-10px">
        <el-row justify="space-between">
          <el-col :span="6">
            <el-text class="mr-20px">检查项目</el-text>
            <el-radio-group v-model="checkedRegItem">
              <el-radio-button
                v-for="item in checkItemList"
                :key="item.value"
                :value="item.value"
                @change="getCheckResultList(item.value)"
              >
                {{ item.label }}
                <!-- 确保显示文本 -->
              </el-radio-button>
            </el-radio-group>
          </el-col>
          <el-col :span="6">
            <el-form-item label="挂号单号">
              <el-input
                placeholder="请输入挂号单号"
                v-model="queryForm.itemId"
                @input="debouncedGetCheckResultFetch"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="患者姓名">
              <el-input
                placeholder="请输入患者姓名"
                v-model="queryForm.patientName"
                @input="debouncedGetCheckResultFetch"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-button-group>
              <el-button type="primary" @click="debouncedGetCheckResultFetch">
                <el-icon><Search /></el-icon>
                <span>搜索</span>
              </el-button>
              <el-button type="primary" @click="resetQuery">
                <el-icon><Refresh /></el-icon>
                <span>重置</span>
              </el-button>
            </el-button-group>
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
              :data="checkResultList"
              style="width: 100%"
              max-height="500"
              row-key="dictId"
              border
            >
              <el-table-column label="检查单号" prop="itemId" width="220" />
              <el-table-column label="项目名称" prop="checkItemName" width="180" />
              <el-table-column label="患者姓名" prop="patientName" />
              <el-table-column label="检查状态" prop="resultStatus" width="200">
                <template #default="scope">
                  {{ scope.row.resultStatus === '0' ? '检测中' : '检测完成' }}
                </template>
              </el-table-column>
              <el-table-column label="创建时间" prop="createTime" width="200">
                <template #default="scope">
                  {{ formatDate(scope.row.updateTime) }}
                </template>
              </el-table-column>
              <!-- 按钮组 -->
              <el-table-column label="操作" fixed="right" width="160">
                <template #default="scope">
                  <el-button-group>
                    <el-button type="success" size="small" @click="joinResult(scope.row)">
                      <el-icon><Edit /></el-icon>
                      <span>录入结果</span>
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

  <!-- 检查结果对话框 -->
  <el-dialog v-model="resultVisible" center :title="resultVisibleTitle" width="500">
    <el-row>
      <el-col>
        <el-input
          v-model="checkResultText"
          :rows="6"
          type="textarea"
          placeholder="请描述检查结果"
          resize="none"
          maxlength="250"
          show-word-limit
        />
      </el-col>
    </el-row>
    <el-row class="mt-10px">
      <el-col>
        <el-upload
          class="upload-demo"
          drag
          :http-request="uploadCheckResultPhoto"
          multiple
          :limit="5"
          :on-success="handleSuccess"
          :before-upload="beforeUpload"
          :file-list="fileList"
          list-type="picture"
          :on-exceed="handleExceed"
          :on-remove="handleRemove"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">将图片拖拽至此处或 <em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">
              支持 jpg/png 图片格式, 大小限制为 500KB/张,最多支持5张图片
            </div>
          </template>
        </el-upload>
      </el-col>
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="resultVisible = false">取消</el-button>
        <el-button type="primary" @click="addCheckResult"> 确认录入 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import http from '@/http'
import { onMounted, reactive, ref } from 'vue'
import { formatDate } from '@/utils/dateUtils'
import { debounce } from '@/utils/debounceUtils'
import { ElLoading, ElMessage } from 'element-plus'

const pageNum = ref(1) //当前页
const pageSize = ref(10) //每页显示的数据
const pageTotal = ref(0) //总个数
const resultVisible = ref(false) //查看结果对话框控制显示
const checkedRegItem = ref(1) //选中的检查项目
const checkItemList = ref([]) // 存储获取的检查项
const checkResultList = ref([]) //检查结果数组
const resultVisibleTitle = ref('') //录入标题
const queryForm = reactive({
  itemId: '', //挂号单
  patientName: '', //患者姓名
})
const checkResultText = ref('') //检查结果文本
const fileList = ref([]) // 存储已上传文件列表
// 定义一个加载实例
let loadingInstance = null
const itemId = ref('')
const loading = ref(true)

//重置查询方法
const resetQuery = () => {
  Object.assign(queryForm, {
    itemId: '', //挂号单
    patientName: '', //患者姓名
  })
}

const handleRemove = (file, fileList) => {
  // 删除本地文件（在前端删除）
  const index = fileList.findIndex((item) => item.name === file.name)
  if (index > -1) {
    fileList.splice(index, 1)
  }

  console.log('删除后的文件列表:', fileList)
}

//录入结果
const addCheckResult = () => {
  const resultImg = JSON.stringify(fileList.value.map((file) => file.url)) // 转换成 JSON 字符串

  http
    .put(
      `/checkResult/update/${itemId.value}`,
      {
        resultMsg: checkResultText.value,
        resultImg: resultImg,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
    .then((res) => {
      if (res.data.code === 200 || res.data.data === true) {
        checkResultText.value = '' //清空检查描述
        fileList.value = [] //清空图片列表
        getCheckResultList('1') //重新获取数据
        resultVisible.value = false //关闭对话框
        //修改用药和检查项目状态为3已完成
        http.put(`/orderItem/update/3/${itemId.value}`).then((res) => {
          if (res.data.code === 200 && res.data.data === true) {
            itemId.value = '' //清空itemId
            ElMessage.success('录入成功!!!')
          }
        })
      }
    })
    .catch(() => {
      ElMessage.error('录入失败')
    })

  console.log('发送的数据:', JSON.stringify(resultImg))
}

const handleExceed = (files, uploadFiles) => {
  ElMessage.warning(
    `图片最大限制为5张,您选择了 ${files.length}张图片,共${files.length + uploadFiles.length}张,请重新选择`,
  )
}

// 上传检查结果图片方法
const uploadCheckResultPhoto = (file) => {
  const formData = new FormData()
  formData.append('file', file.file)

  // 开始上传时显示加载动画
  loadingInstance = ElLoading.service({
    lock: true,
    text: '上传中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  // 上传图片
  http
    .post('http://localhost:8080/file/user/uploadImg', formData)
    .then((res) => {
      if (res.data.code === 200) {
        ElMessage.success('图片上传成功!!')
        // 在上传成功后，手动调用 handleSuccess
        handleSuccess(res, file) // 将返回的 response 和 file 传递给 handleSuccess
      }
    })
    .catch((err) => {
      ElMessage.error('上传失败')
    })
    .finally(() => {
      // 上传完成后关闭加载动画
      if (loadingInstance) {
        loadingInstance.close()
      }
    })
}

// 上传成功回调
const handleSuccess = (response, file) => {
  console.log('上传响应:', response) // 打印响应对象
  console.log('文件对象:', file) // 打印传入的文件对象

  if (!response.data) {
    ElMessage.error('上传失败')
    return
  }

  // 确保 fileList 触发响应式更新
  fileList.value = [
    ...fileList.value,
    {
      name: file.name, // 使用文件名
      url: response.data.data, // 使用后端返回的 URL
    },
  ]

  console.log('上传成功:', fileList.value)

  // 上传完成后关闭加载动画
  if (loadingInstance) {
    loadingInstance.close()
  }
}

// 限制文件大小
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt500KB = file.size / 1024 < 500

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt500KB) {
    ElMessage.error('图片大小不能超过 500KB')
    return false
  }
  return true
}

//获取检测中的检查数据
const getCheckResultList = (itemRefId) => {
  loading.value = true
  http
    .get(`/checkResult/get/0/${itemRefId == '' ? '1' : itemRefId}`, {
      params: {
        regId: queryForm.itemId,
        patientName: queryForm.patientName,
      },
    })
    .then((res) => {
      checkResultList.value = res.data.data.list
      console.log(res.data.data)
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}

//获取指定的已支付检查项目
const getCheckItemFetchData = async () => {
  const res = await http.post('/checkItem/getCheckIdAndName')
  checkItemList.value = (res.data.data || []).map((item) => ({
    label: item.checkItemName, // 文本
    value: item.checkItemId, // 绑定的值
  }))
}

//查看检查结果
const joinResult = (row) => {
  resultVisibleTitle.value = `录入${row.patientName}的检查结果`
  itemId.value = row.itemId
  console.log(itemId.value)

  resultVisible.value = true
}

//上一页
const sizeChange = (newPageSize) => {
  pageSize.value = newPageSize
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
}

//页面加载时挂载
onMounted(() => {
  getCheckItemFetchData()
  getCheckResultList('1')
})

//防抖处理
const debouncedGetCheckResultFetch = debounce(getCheckResultList, 500)
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
