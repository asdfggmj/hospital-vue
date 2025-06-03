<!-- 收费列表 -->
<template>
  <!-- 卡片1 -->
  <el-card shadow="always">
    <el-row>
      <el-col :span="6">
        <el-form-item label="挂号单号">
          <el-input v-model="regId" placeholder="请输入挂号单号" />
        </el-form-item>
      </el-col>
      <el-col :span="6" style="margin-left: 6px">
        <el-form-item label="患者姓名">
          <el-input v-model="paientName" placeholder="请输入患者姓名" />
        </el-form-item>
      </el-col>
      <el-col :span="4" style="margin-left: 6px">
        <el-button type="primary" @click="getOrder">
          <el-icon><Search /></el-icon>
          <span>查询</span>
        </el-button>
        <el-button type="info" @click="reset">重置</el-button>
      </el-col>
    </el-row>
  </el-card>
  <!-- 卡片2 -->
  <el-card class="mt-10px" shadow="always">
    <el-row>
      <el-col>
        <el-table :data="chargeListData" border>
          <el-table-column type="expand">
            <template #default="props">
              <div m="4">
                <el-card shadow="never" style="border: 1px solid white">
                  <el-table :data="props.row.orderChargeItemList" border style="width: 100%">
                    <el-table-column label="详情ID" prop="itemId" />
                    <el-table-column label="处方ID" prop="coId" />
                    <el-table-column label="名称" prop="itemName" />
                    <el-table-column label="价格" prop="itemPrice" />
                    <el-table-column label="数量" prop="itemNum" />
                    <el-table-column label="小计" prop="itemAmount" />
                    <el-table-column label="类型" prop="itemType">
                      <template #default="scope">
                        {{ scope.row.itemType == 1 ? '检查' : '药品' }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态">
                      <template #default="scope">
                        <span v-if="scope.row.status == 0">未支付</span>
                        <span v-if="scope.row.status == 1">已支付</span>
                        <span v-if="scope.row.status == 2">已退费</span>
                        <span v-if="scope.row.status == 3">已完成</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-card>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="orderId" label="订单号" width="220" />
          <el-table-column prop="regId" label="挂号单号" width="220" />
          <el-table-column prop="patientName" label="患者姓名" />
          <el-table-column prop="orderAmount" label="总金额" />
          <el-table-column prop="payType" label="支付类型">
            <template #default="scope">
              {{ scope.row.payType == 1 ? '支付宝' : '现金' }}
            </template>
          </el-table-column>
          <el-table-column prop="orderStatus" label="订单状态">
            <template #default="scope">
              <span v-if="scope.row.orderStatus == 0">未支付</span>
              <span v-if="scope.row.orderStatus == 1">支付成功</span>
              <span v-if="scope.row.orderStatus == 2">支付超时</span>
              <span v-if="scope.row.status == 3">支付失败</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="220">
            <template #default="scope">
              {{ scope.row.createTime.replace('T', ' ') }}
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="400">
            <template #default="scope">
              <el-button-group>
                <el-button  type="primary" v-if="scope.row.payType==0" :disabled="isPyTypeDisabled(scope.row.orderStatus)" @click="pay('现金',scope.row)">
                  <i class="iconfont icon-_xianjin" style="margin-right: 6px"></i>
                  <span>现金收费</span>
                </el-button>
                <el-button style="margin-left: 10px;" v-if="scope.row.payType==1" type="primary" :disabled="isPyTypeDisabled(scope.row.orderStatus)" @click="pay('支付宝',scope.row)">
                  <i class="iconfont icon-zhifubaozhifu" style="margin-right: 6px"></i>
                  <span>支付宝收费</span>
                </el-button>
                <!-- <el-button type="primary">
                  <i class="iconfont icon-weixin" style="margin-right: 6px"></i>
                  <span>微信收费</span>
                </el-button> -->
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
  <el-dialog
    v-model="payforVisible"
    title="请确认订单信息"
    width="600"
    :before-close="handleClose"
  >
    <el-card shadow="hover">
      <el-row>
        <el-col :span="12">订单号：{{ odc }}</el-col>
        <el-row :span="12">总金额：￥{{ amount.toFixed(2) }}</el-row>
        <el-row :span="12" style="margin-top: -5px;margin-left: 30px;"><el-button type="primary" @click="confirmPayment()">支付完成</el-button></el-row>
      </el-row>
    </el-card>
    <!-- <el-card class="mt-10px" v-if="payType=='支付宝'">
      <el-row> -->
        <!-- <el-col :span="24">二维码</el-col> -->
        <!-- <img
          :src="`/src/assets/image/${payType}.jpg`"
          alt="二维码"
          style="width: 200px; height: 200px; margin-left: 160px"
        />
      </el-row>
    </el-card>-->
  </el-dialog> 
</template>

<script setup lang="ts">
import http from '@/http'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

const pageNum = ref(1) //当前页
const pageSize = ref(10) //每页显示的数据
const pageTotal = ref(0) //总个数
const odc=ref('')//名称
const paientName=ref('')//患者名称
const chargeListData = reactive([])//收费列表数据
const payforVisible = ref(false)//二维码显示
let regId=ref('');//挂号编号
let payType=ref('')//支付类型
let amount=ref(0)//订单总金额
const selectItem=ref('')//选中项

// 重置按钮，清空数据
const reset = () => {
  paientName.value = ''
  regId.value = ''
  getOrder()
}

//支付费用
const confirmPayment = () => {
  http.post("orderCharge/feesApplyUpdateStatus",selectItem.value)
    .then(res => {
    const data=res.data.data;
    if(data){
      ElMessage.success('支付成功！');
      payforVisible.value=false

        //刷新
        getOrder()
      } else {
        ElMessage.error('支付失败,请重试！')
      }
    })
    .catch((erro) => {
      ElMessage.error('支付超时,请重试！' + erro)
    })
}

//支付方式点击事件
const pay = (type,row) => {
  //赋值支付类型
  payType.value = type
  //赋值订单编号
  odc.value=row.orderId
  //赋值总金额
  amount.value=row.orderAmount
  //赋值选中项
  selectItem.value=row
  //显示
  payforVisible.value = true
}

//根据当前收费列状态判断支付方式是否可用
const isPyTypeDisabled = (status) => {
  return status === '1'
}

//支付关闭前提示用户
const handleClose = (done: () => void) => {
  ElMessageBox.confirm('你确定要取消支付吗')
    .then(() => {
      done()
    })
    .catch(() => {
      // catch error
    })
}

//上一页
const sizeChange = (newPageSize) => {
  pageSize.value = newPageSize
  getOrder()
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
  getOrder()
}

//页面挂载
onMounted(() => {
  //获取页面数据
  getOrder()
})

//获取收费列表页面数据
const getOrder = () => {
  //发送后端异步请求
  http
    .get('orderCharge/list', {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        regId: regId.value,
        patientName: paientName.value,
      },
    })
    .then((res) => {
      chargeListData.splice(0, chargeListData.length, ...res.data.data.list)
      pageTotal.value = res.data.data?.total || 0
    })
}
</script>

<style>
@import url('https://at.alicdn.com/t/c/font_4844128_4azmggyqmzg.css');
.mt-10px {
  margin-top: 10px;
}
</style>
