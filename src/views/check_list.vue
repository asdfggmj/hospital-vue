<template>
  <!-- 第一行 -->
  <el-row>
    <el-col :span="24">
      <el-card shadow="always" class="mb-10px">
        <el-row justify="space-between">
          <el-col :span="12">
            <el-text class="mr-20px">检查项目</el-text>
            <el-radio-group v-model="checkedRegItem">
              <el-radio-button
                v-for="item in checkItemList"
                :key="item.value"
                :value="item.value"
                @change="getCheckResultFinishFetch(item.value)"
              >
                {{ item.label }}
                <!-- 确保显示文本 -->
              </el-radio-button>
            </el-radio-group>
          </el-col>
          <!-- 模糊查询 -->
          <el-col :span="8">
            <el-input
              v-model="keyWord"
              placeholder="请输入检查单号回车以查询"
              @input="debouncedGetCheckResultFetch"
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
              :data="checkResultFinishList"
              style="width: 100%"
              max-height="500"
              row-key="itemId"
              border
            >
              <el-table-column type="expand">
                <template #default="{ row }">
                  <el-row justify="space-evenly">
                    <el-col :span="6">患者ID：{{ row.patientId }}</el-col>
                    <el-col :span="6">患者名称：{{ row.patientName }}</el-col>
                    <el-col :span="6">挂号单：{{ row.regId }}</el-col>
                  </el-row>
                </template>
              </el-table-column>
              <el-table-column label="检查项ID" prop="itemId" width="220" />
              <el-table-column label="项目名称" prop="checkItemName" width="180" />
              <el-table-column label="价格" prop="price">
                <template #default="scope">
                  {{ parseFloat(scope.row.price).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column
                label="检查描述"
                prop="resultMsg"
                width="200"
                show-overflow-tooltip
              />
              <el-table-column label="检查结果" prop="resultStatus" width="200">
                <template #default="scope">{{
                  scope.row.resultStatus === '1' ? '检测完成' : '检测中'
                }}</template>
              </el-table-column>
              <el-table-column label="创建时间" prop="updateTime" width="200">
                <template #default="scope">
                  {{ formatDate(scope.row.updateTime) }}
                </template>
              </el-table-column>
              <!-- 按钮组 -->
              <el-table-column label="操作" fixed="right" width="160">
                <template #default="scope">
                  <el-button-group>
                    <el-button type="success" size="small" @click="seeResult(scope.row.itemId)">
                      <el-icon><Edit /></el-icon>
                      <span>查看结果</span>
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
  <el-dialog v-model="resultVisible" :title="checkDialogTitle" center width="500">
    <el-row>
      <el-col>
        <el-form-item label="检查单号：">
          <el-text>{{ checkDialogItemId }}</el-text>
        </el-form-item>
        <el-form-item label="检查结果：">
          <el-text>{{ checkDIalogText }}</el-text>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <el-carousel :interval="4000" v-if="checkDialogResultImg.length" type="card" height="200px">
          <el-carousel-item v-for="(img, index) in checkDialogResultImg" :key="index">
            <el-image :src="img.url" fit="cover" style="width: 100%; height: 100%"></el-image>
          </el-carousel-item>
        </el-carousel>
        <el-empty v-else description="暂无检查图片" />
      </el-col>
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="resultVisible = false" type="primary">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import http from '@/http'
import { onMounted, ref } from 'vue'
import { formatDate } from '@/utils/dateUtils'
import { debounce } from '@/utils/debounceUtils'

const pageNum = ref(1) //当前页
const pageSize = ref(10) //每页显示的数据
const pageTotal = ref(0) //总个数
const keyWord = ref('') //关键字
const resultVisible = ref(false) //查看结果对话框控制显示
const checkItemList = ref([]) // 存储获取的检查项
const checkedRegItem = ref(1) //选中的检查项目
const checkResultFinishList = ref([]) //存储检查结果列表
const checkDialogTitle = ref('') //查看检查结果的对话框标题
const checkDIalogText = ref('') //查看检查结果的文本内容
const checkDialogItemId = ref('') //查看检查结果的检查单号
const checkDialogResultImg = ref([]) //查看检查结果的图片列表
const loading = ref(true)

//获取所有检查费用的ID和名字
const getCheckItemFetchData = async () => {
  const res = await http.get('/checkItem/getCheckIdAndName')
  checkItemList.value = (res.data.data || []).map((item) => ({
    label: item.checkItemName, // 文本
    value: item.checkItemId, // 绑定的值
  }))
}

//查看检查结果
const seeResult = (itemId) => {
  http.get(`/checkResult/getResult/${itemId}`).then((res) => {
    const data = res.data.data

    checkDialogTitle.value = `查看${data.patientName}检查结果`
    checkDIalogText.value = data.resultMsg
    checkDialogItemId.value = data.itemId

    //解析resultImg显示到走马灯上
    try {
      checkDialogResultImg.value = JSON.parse(data.resultImg) || [] // 确保是数组
    } catch (e) {
      checkDialogResultImg.value = [] // 解析失败时设为空数组
    }
  })

  resultVisible.value = true
}

//上一页
const sizeChange = (newPageSize) => {
  pageSize.value = newPageSize
  getCheckResultFinishFetch('1')
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
  getCheckResultFinishFetch('1')
}

//页面加载时挂载
onMounted(() => {
  getCheckResultFinishFetch('1')
  getCheckItemFetchData()
})

//获取检查结果
const getCheckResultFinishFetch = (checkItemId) => {
  loading.value = true
  http
    .get(`/checkResult/get/1/${checkItemId == '' ? '1' : checkItemId}`, {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        keyWord: keyWord.value,
      },
    })
    .then((res) => {
      const list = Array.isArray(res.data.data.list) ? res.data.data.list : []
      checkResultFinishList.value.splice(0, checkResultFinishList.value.length, ...list)
      pageTotal.value = res.data.data?.total || 0
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}

//防抖处理
const debouncedGetCheckResultFetch = debounce(getCheckResultFinishFetch, 500)
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
