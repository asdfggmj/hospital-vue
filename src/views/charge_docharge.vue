<!-- 处方收费 -->
<template>
  <!-- 卡片1 -->
  <el-card shadow="always">
    <el-row>
      <el-col :span="6">
        <el-form-item label="挂单号ID">
          <el-input placeholder="请输入挂单号" v-model="regId" />
        </el-form-item>
      </el-col>
      <el-col :span="4" style="margin-left: 6px">
        <el-button type="primary" @click="get">
          <el-icon><Search /></el-icon>
          <span>查询</span>
        </el-button>
        <el-button type="primary">
          <el-icon><Search /></el-icon>
          <span>读取IC卡</span>
        </el-button>
      </el-col>
    </el-row>
  </el-card>
  <!-- 卡片2 -->
  <el-card class="mt-10px" shadow="always" v-if="msg === true">
    <el-row>
      <el-col :span="24">
        <el-text size="large" type="primary">基本信息：</el-text>
      </el-col>
    </el-row>
    <el-row justify="space-evenly">
      <el-col :span="9">
        <el-row class="mt-10px">
          <el-col>挂号单号：{{ infoData.regId }}</el-col>
        </el-row>
        <el-row class="mt-10px">
          <el-col>科室名称：{{ infoData.deptName }}</el-col>
        </el-row>
        <el-row class="mt-10px">
          <el-col>就诊时间：{{ infoData.careTime.replace('T',' ') }}</el-col>
        </el-row>
        <el-row class="mt-10px">
          <el-col>诊断信息：{{ infoData.caseResult }}</el-col>
        </el-row>
      </el-col>
      <el-col :span="9">
        <el-row class="mt-10px">
          <el-col>医生姓名：{{ infoData.doctorName }}</el-col>
        </el-row>
        <el-row class="mt-10px">
          <el-col>患者姓名：{{ infoData.patientName }}</el-col>
        </el-row>
        <el-row class="mt-10px">
          <el-col>主诉：{{ infoData.caseTitle }}</el-col>
        </el-row>
        <el-row class="mt-10px">
          <el-col>医生建议：{{ infoData.doctorTips }}</el-col>
        </el-row>
      </el-col>
    </el-row>
  </el-card>
  <!-- 卡片3 -->
  <el-card shadow="always" class="mt-10px" v-if="msg === true">
    <el-row>
      <el-col :span="12">
        <el-text size="large" type="primary">支付方式：</el-text>
      </el-col>
      <el-col :span="12">
        <el-text size="large" type="danger">订单总额：￥{{amount.toFixed(2)}}</el-text>
      </el-col>
    </el-row>
    <el-row class="mt-10px">
      <el-col :span="24">
        <el-button @click="toggleAllSelection" :type="`${isAllSelected ? 'success' : 'primary'}`">
      {{ isAllSelected ? '取消全选' : '全选' }}
        </el-button>
          <el-button type="danger" @click="pay('现金')">
            <i class="iconfont icon-_xianjin" style="margin-right: 6px"></i>
            <span>现金</span>
          </el-button>
          <el-button type="danger" @click="pay('支付宝')">
            <i class="iconfont icon-zhifubaozhifu" style="margin-right: 6px"></i>
            <span>支付宝</span>
          </el-button>
          <el-button type="danger" @click="pay('微信')">
            <i class="iconfont icon-weixin" style="margin-right: 6px"></i>
            <span>微信</span>
          </el-button>
        <!-- <el-button type="danger" @click="yinlian">
          <i class="iconfont icon-yinlian" style="margin-right: 6px"></i>
          <span>银联</span>
        </el-button> -->
      </el-col>
    </el-row>
  </el-card>
  <!-- 卡片4 -->
  <el-card shadow="always" class="mt-10px" v-if="msg === true">
    <el-row>
      <el-col :span="12">
        <el-text size="large" type="primary">订单明细：</el-text>
      </el-col>
    </el-row>
    <el-row class="mt-10px">
      <el-col :span="24">
        <el-collapse accordion>
          <!-- 检查处方明细 -->
          <el-collapse-item  :title="`【检查处方】&nbsp;&nbsp;[1]&nbsp;&nbsp;【处方总金额】：￥${totalCheckAmount.toFixed(2)}`"  name="2" >
            <div>
              <el-table :data="checkList" style="width: 100%"
              row-key="itemId"
              ref="checkTableRef"
              @selection-change="handleCheckSelectionChange">
                <el-table-column type="selection" width="100"  :checked="true"/>
                <el-table-column label="序号" width="120">
                  <template #default="scope">{{ scope.$index+1 }}</template>
                </el-table-column>
                <el-table-column label="项目名称" prop="itemName" width="200" />
                <el-table-column label="数量" prop="num" width="200" />
                <el-table-column label="单价(元)" prop="price" width="200" />
                <el-table-column label="金额(元)" prop="amount" width="200" />
                <el-table-column label="备注" prop="remark" width="200" />
                <el-table-column label="状态" width="150" >
                  <template #default="scope">
                    {{ scope.row.status==0?'未支付':'' }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-collapse-item>
          <el-collapse-item  :title="`【药品处方】&nbsp;&nbsp;[1]&nbsp;&nbsp;【处方总金额】：￥${totalmedicinesAmount.toFixed(2)}`"  name="3">
            <div>
              <el-table :data="medicinesList" style="width: 100%"
              row-key="itemId"
              ref="medicinesTableRef"
              @selection-change="handleMedicinesSelectionChange">
                <el-table-column type="selection" width="100" :selected="selectedItems"/>
                <el-table-column label="序号" width="120">
                  <template #default="scope">{{ scope.$index+1 }}</template>
                </el-table-column>
                <el-table-column label="药品名称" prop="itemName" width="200" />
                <el-table-column label="数量" prop="num" width="200" />
                <el-table-column label="单价(元)" prop="price" width="200" />
                <el-table-column label="金额(元)" prop="amount" width="200" />
                <el-table-column label="备注" prop="remark" width="200" />
                <el-table-column label="状态" width="150" >
                  <template #default="scope">
                    {{ scope.row.status==0?'未支付':'' }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-col>
    </el-row>
  </el-card>
  <el-row class="mt-10px" v-else style="text-align: center">
    <el-col>
      <el-text type="primary">暂无数据</el-text>
    </el-col>
  </el-row>
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
        <el-row :span="12" style="margin-top: -5px;margin-left: 30px;"><el-button type="primary" @click="confirmPayment ">确认</el-button></el-row>
      </el-row>
    </el-card>
    <el-card class="mt-10px" v-if="payType=='支付宝'">
      <el-row>
        <!-- <el-col :span="24">二维码</el-col> -->
        <!-- <img :src="`/src/assets/image/${payType}.jpg`" alt="二维码" style="width: 200px; height: 200px;margin-left: 160px;" /> -->
      </el-row>
    </el-card>
  </el-dialog>
</template>

<script setup lang="ts">
import http from '@/http'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, reactive, ref } from 'vue'

const payforVisible = ref(false)//二维码显示
const msg = ref(false)//显示数据
const regId=ref('')//挂号编号
let infoData=reactive({
  regId:'',
  regName:'',
  deptName:'',
  doctorName:'',
  chId:'',
  patientName:'',
  careTime:'',
  caseTitle:'',
  caseResult:'',
  doctorTips:'',
})//基本病例信息
const medicinesList=reactive([])//药品处方
const checkList=reactive([])//检查处方
const isAllSelected = ref(false); // 全选状态
let selectedItems = ref([]); // 选中的项目
const checkSelected = ref([]); // 检查处方的选中项
const medicinesSelected = ref([]); // 药品处方的选中项
const checkTableRef = ref(); // 检查处方表格ref
const medicinesTableRef = ref(); // 药品处方表格ref
let odc=ref('');//订单编号(自动生成)
let payType=ref('')//支付类型

//支付完成按钮点击事件
const confirmPayment = () => {
  const requestData = {
    infoData: JSON.parse(JSON.stringify(infoData)),  // 净化对象
    items: JSON.parse(JSON.stringify(selectedItems.value)), // 净化数组
    amount: Number(amount.value.toFixed(2)), // 转为数字
    payType: payType.value,
    orderId: odc.value
  }
  http.post("orderCharge/feesApply", requestData)
    .then(res => {
    const data=res.data.data;
    if(data){
      ElMessage.success('支付成功！');
      payforVisible.value=false
       // 清空选中项
       selectedItems.value = [];
      checkSelected.value = [];
      medicinesSelected.value = [];
      // 清空表格选中状态
      checkTableRef.value?.clearSelection();
      medicinesTableRef.value?.clearSelection();
      //判断是否没有可支付的项目,如果没有则清空挂号编号重新查询
      if(checkList.length==0&&medicinesList.length==0){
        regId.value=''
      }
      //刷新
      get()
    }else{
      ElMessage.error('支付失败,请重试！')
    }
  })
  .catch((erro)=>{
    ElMessage.error('支付超时,请重试！'+erro)
  })
};

//支付方式点击事件
const pay = (type) => {
  if(selectedItems.value.length==0){
    ElMessage.warning('请先选中要支付的项目!')
    return
  }
  //赋值支付类型
  payType.value=type
  //生成订单编号
  odc.value='ODC'+createODC()
  //显示
  payforVisible.value = true
}

//生成订单编号
const createODC=()=>{
  // 生成一个指定范围内的随机整数
  let min = BigInt(10 ** 18); // 最小的19位数
    let max = BigInt(10 ** 19) - BigInt(1); // 最大的19位数
    let range = max - min;
    let randomBigInt = min + BigInt(Math.floor(Math.random() * Number(range)));
    return randomBigInt.toString();
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

// 全选/取消全选
const toggleAllSelection = () => {
  if (isAllSelected.value) {
    // 取消全选
    checkTableRef.value.clearSelection();
    medicinesTableRef.value.clearSelection();
  } else {
    // 全选
    checkTableRef.value.toggleAllSelection();
    medicinesTableRef.value.toggleAllSelection();
  }
  isAllSelected.value = !isAllSelected.value;
};
// // 多选复选框改变事件
// const handleSelectionChange = (item) => {
//   selectedItems.value = item
//   console.log(selectedItems.value);
// };

// 检查处方选中项变化
const handleCheckSelectionChange = (items) => {
  checkSelected.value = items;
};

// 药品处方选中项变化
const handleMedicinesSelectionChange = (items) => {
  medicinesSelected.value = items;
};

// 计算总金额
const amount = computed(() => {
  //合并两个选中项数组
  selectedItems.value = [...checkSelected.value, ...medicinesSelected.value];
  console.log(selectedItems.value);
  return selectedItems.value.reduce((sum, item) => {
    return sum + Number(item.price) * Number(item.num);
  }, 0);
});

//计算检查处方金额总和
const totalCheckAmount=computed(()=>{
  //遍历checkList集合
  return checkList.reduce((sum, item) => {
    return sum + (Number(item.amount) || 0)
  }, 0);
})

//计算药品处方金额总和
const totalmedicinesAmount=computed(()=>{
  //遍历medicinesList集合
  return medicinesList.reduce((sum, item) => {
    return sum + (Number(item.amount) || 0)
  }, 0);

})

// 查询处方信息
const get = () => {
  msg.value=false
  if (!regId.value) {
    ElMessage.warning("挂单号ID不能为空！");
    return;
  }

  http.get("orderCharge/prescription", { params: { regId: regId.value,status:'0' } })
    .then((res) => {
      if (res.data.code !== 200) {
        throw new Error(res.data.message);
      }

      const data = res.data.data;
      if (data) {
        // 清空
        medicinesList.splice(0, medicinesList.length, ...data.medicinesList);
        checkList.splice(0, checkList.length, ...data.checkList);
        // 解构字段，并设置默认值
        const {
          medicinesList: resMedicines = [],
          checkList: resChecks = [],
          ...responseData
        } = data;

        // 更新基本信息
        infoData = responseData;

        // 清空并更新药品处方
        medicinesList.splice(0, medicinesList.length, ...resMedicines);
        // 清空并更新检查处方
        checkList.splice(0, checkList.length, ...resChecks);

        msg.value = true; // 显示数据
      }
    })
    .catch((error) => {
      console.error("请求失败:", error); // 输出错误详情
      ElMessage.warning("请输入正确的挂单号ID！");
      msg.value = false
    });
};
</script>

<style>
@import url('https://at.alicdn.com/t/c/font_4844128_4azmggyqmzg.css');
.mt-10px {
  margin-top: 10px;
}
</style>
