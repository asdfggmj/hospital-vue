<template>
  <el-row>
    <!-- 左侧 -->
    <el-col :span="8">
      <el-card shadow="always" class="mb-10px mr-10px">
        <el-row>
          <el-col>
            <el-form :model="patientData" label-width="auto">
              <el-form-item label="患者姓名">
                <el-input v-model="patientData.name" disabled placeholder="请输入患者姓名">
                  <template #append>
                    <el-tooltip
                      class="box-item"
                      effect="dark"
                      content="点击选择患者"
                      placement="bottom-start"
                    >
                      <el-button type="success" @click="selectionPatientFetch">
                        <el-icon><Avatar /></el-icon>
                      </el-button>
                    </el-tooltip>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="身份证号">
                <el-input v-model="patientData.idCard" placeholder="请输入身份证号" disabled />
              </el-form-item>
              <el-form-item label="患者电话">
                <el-input v-model="patientData.phone" placeholder="请输入患者电话" disabled />
              </el-form-item>
              <el-form-item label="性别">
                <el-radio-group v-model="patientData.sex">
                  <el-radio value="0">男</el-radio>
                  <el-radio value="1">女</el-radio>
                  <el-radio value="2">未知</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="出生日期">
                <el-date-picker
                  disabled
                  v-model="patientData.birthDay"
                  type="date"
                  placeholder="出生日期"
                  format="YYYY-MM-DD"
                />
              </el-form-item>
              <el-form-item label="患者年龄">
                <el-input-number disabled v-model="patientData.age" :min="1" :max="200" />
              </el-form-item>
              <el-form-item label="地址信息">
                <el-input
                  v-model="patientData.address"
                  :rows="4"
                  type="textarea"
                  placeholder="患者地址"
                  resize="none"
                />
              </el-form-item>
              <el-form-item label="过敏史">
                <el-input
                  v-model="patientData.allergyInfo"
                  :rows="4"
                  type="textarea"
                  placeholder="患者过敏史"
                  resize="none"
                />
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <!-- 患者档案和历史病例 -->
        <el-row>
          <el-col>
            <el-tabs type="border-card">
              <el-tab-pane label="患者档案">
                <el-table :data="hisPatientFile" border :key="tableKey">
                  <el-table-column label="紧急联系人" prop="emergencyContactName" width="140" />
                  <el-table-column label="联系人电话" prop="emergencyContactPhone" width="140" />
                  <el-table-column
                    label="与就诊人关系"
                    prop="emergencyContactRelation"
                    width="140"
                  />
                  <el-table-column label="身高" prop="height" width="140" />
                  <el-table-column label="体重" prop="weight" width="140" />
                  <el-table-column label="血型" prop="bloodType" width="140" />
                  <el-table-column label="个人史" prop="personalInfo" width="140" />
                  <el-table-column label="家族史" prop="familyInfo" width="140" />
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="历史病例">
                <el-table :data="hisCareHistoryData" border :key="tableKey">
                  <el-table-column label="接诊医生" prop="userName" width="140" />
                  <el-table-column label="科室名称" prop="deptName" width="140" />
                  <el-table-column label="接诊类型" prop="receiveType" width="140">
                    <template #default="scope">
                      {{ scope.row.receiveType === '0' ? '初诊' : '复诊' }}
                    </template>
                  </el-table-column>
                  <el-table-column label="是否传染" prop="isContagious" width="140">
                    <template #default="scope">
                      {{ scope.row.isContagious === '0' ? '否' : '是' }}
                    </template>
                  </el-table-column>
                  <el-table-column label="发病时间" prop="caseDate" width="140" />
                  <el-table-column label="就诊时间" prop="careDate" width="200" />
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
    <!-- 右侧 -->
    <el-col :span="16">
      <el-row>
        <!-- 右上 -->
        <el-col>
          <el-card shadow="always" class="mb-10px">
            <el-row justify="space-between">
              <el-col :span="12">
                <el-text
                  >挂号单ID：<el-text type="danger">{{ patientData.regId }}</el-text></el-text
                ><br />
                <el-text
                  >病例编号：<el-text type="danger">{{ careHistoryData.chId }}</el-text></el-text
                >
              </el-col>
              <el-col :span="12" style="text-align: right">
                <el-button
                  type="primary"
                  @click="saveCareHistory"
                  :disabled="buttonDisabledObj.saveCareDisabled"
                >
                  <i class="iconfont icon-baocun" style="margin-right: 6px"></i>
                  <span>保存病例</span>
                </el-button>
                <el-button
                  type="danger"
                  @click="finishCare"
                  :disabled="buttonDisabledObj.careFinishDisabled"
                >
                  <i class="iconfont icon-shouye" style="margin-right: 6px"></i>
                  <span>就诊完成</span>
                </el-button>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
        <!-- 右下 -->
        <el-col>
          <el-card shadow="always" class="mb-10px">
            <el-tabs type="border-card">
              <!-- 病例 -->
              <el-tab-pane label="病例">
                <el-form
                  :inline="true"
                  :model="careHistoryData"
                  label-width="auto"
                  :rules="rules"
                  ref="ruleFormRef"
                >
                  <el-row>
                    <el-col :span="8">
                      <el-form-item label="发病日期">
                        <el-date-picker
                          v-model="careHistoryData.careDate"
                          type="datetime"
                          placeholder="请选择发病日期"
                          format="YYYY/MM/DD HH:mm:ss"
                          value-format="YYYY-MM-DD HH:mm:ss"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="接诊类型">
                        <el-select
                          class="min-width-120px"
                          v-model="careHistoryData.receiveType"
                          placeholder="请选择"
                          @click="getReceiveType"
                        >
                          <el-option
                            v-for="item in receiveType"
                            :key="item.dictValue"
                            :label="item.dictLabel"
                            :value="item.dictValue"
                          />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="是否传染">
                        <el-select
                          class="min-width-120px"
                          v-model="careHistoryData.isContagious"
                          placeholder="请选择"
                          @click="getContagious"
                        >
                          <el-option
                            v-for="item in contagious"
                            :key="item.dictValue"
                            :label="item.dictLabel"
                            :value="item.dictValue"
                          />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
                <el-form :model="careHistoryData" label-width="auto">
                  <el-form-item label="主诉">
                    <el-input
                      v-model="careHistoryData.caseTitle"
                      :rows="4"
                      type="textarea"
                      placeholder="请输入主诉"
                      resize="none"
                      maxlength="200"
                      show-word-limit
                    />
                  </el-form-item>
                  <el-form-item label="断诊信息">
                    <el-input
                      v-model="careHistoryData.caseResult"
                      :rows="4"
                      type="textarea"
                      placeholder="请输入断诊信息"
                      resize="none"
                      maxlength="200"
                      show-word-limit
                    />
                  </el-form-item>
                  <el-form-item label="医生建议">
                    <el-input
                      v-model="careHistoryData.doctorTips"
                      :rows="4"
                      type="textarea"
                      placeholder="请输入医生建议"
                      resize="none"
                      maxlength="200"
                      show-word-limit
                    />
                  </el-form-item>
                  <el-form-item label="备注">
                    <el-input
                      v-model="careHistoryData.remark"
                      :rows="4"
                      type="textarea"
                      placeholder="请输入备注"
                      resize="none"
                      maxlength="200"
                      show-word-limit
                    />
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              <!-- 处方展示 -->
              <el-row>
                <el-col>
                  <el-collapse v-model="activeNames">
                    <el-collapse-item
                      v-for="(order, index) in careOrderData"
                      :key="order.coId"
                      :title="`${order.coType === '0' ? '药品处方' : '检查处方'} -> ${index + 1} -> 总额: ${order.allAmount}$`"
                      :name="order.coId"
                    >
                      <el-table
                        border
                        :data="orderItemData.filter((item) => item.coId === order.coId)"
                        style="width: 100%"
                        :key="tableKey"
                      >
                        <el-table-column label="序号" type="index" width="55" />
                        <el-table-column prop="itemName" label="项目名称" />
                        <el-table-column prop="num" label="数量" />
                        <el-table-column prop="price" label="单价(元)" />
                        <el-table-column prop="amount" label="总价(元)" />
                        <el-table-column prop="remark" label="备注" />
                        <el-table-column prop="status" label="状态">
                          <template #default="scope">{{
                            scope.row.status === '0' ? '未支付' : '已支付'
                          }}</template>
                        </el-table-column>
                        <el-table-column label="操作">
                          <template #default="scope">
                            <el-button type="danger" size="small" @click="deleteItem(scope.row)">
                              <el-icon><Delete /></el-icon> 删除
                            </el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-collapse-item>
                  </el-collapse>
                </el-col>
              </el-row>
              <!-- 处方按钮 -->
              <el-row class="mt-10px">
                <el-col>
                  <el-tab-pane label="处方">
                    <el-button
                      type="success"
                      @click="medicinesDialogVisible = true"
                      :disabled="buttonDisabledObj.addCareOrderDisabled"
                    >
                      <el-icon><Plus /></el-icon>
                      <span>添加用药处方</span>
                    </el-button>
                    <el-button
                      type="success"
                      @click="checkDialogVisible = true"
                      :disabled="buttonDisabledObj.addCheckItemDisabled"
                    >
                      <el-icon><Plus /></el-icon>
                      <span>添加检查处方</span>
                    </el-button>
                  </el-tab-pane>
                </el-col>
              </el-row>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </el-col>
  </el-row>

  <!-- 挂号患者对话框 -->
  <el-dialog
    v-model="dialogVisible"
    title="选择挂号患者"
    center
    style="min-width: 400px; max-width: 1200px"
  >
    <el-tabs v-model="activeName" type="card" stretch @tab-click="handleTabClick">
      <el-tab-pane label="待就诊列表" name="first">
        <el-table :data="regListData" border style="width: 100%">
          <el-table-column label="患者姓名" prop="name" />
          <el-table-column label="身份证号" prop="idCard" />
          <el-table-column label="挂号类型" prop="schedulingType">
            <template #default="scope">
              {{ schedulingTypeMap[scope.row.schedulingType] }}
            </template>
          </el-table-column>
          <el-table-column label="过敏史" prop="allergyInfo" width="120">
            <template #default="scope">
              {{ scope.row.allergyInfo || '无' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
              <el-button
                type="success"
                size="small"
                @click="chooseSelectedPatient(scope.row.regId)"
              >
                <el-icon><Select /></el-icon>
                <span>选择</span>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="就诊中列表" name="second">
        <el-table :data="regListData" border style="width: 100%">
          <el-table-column label="患者姓名" prop="name" />
          <el-table-column label="身份证号" prop="idCard" />
          <el-table-column label="挂号类型" prop="regItemId" />
          <el-table-column label="过敏史" prop="allergyInfo" />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
              <el-button
                type="success"
                size="small"
                @click="chooseSelectedPatient(scope.row.regId)"
              >
                <el-icon><Select /></el-icon>
                <span>选择</span>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="就诊完成列表" name="third">
        <el-table :data="regListData" border style="width: 100%">
          <el-table-column label="患者姓名" prop="name" />
          <el-table-column label="身份证号" prop="idCard" />
          <el-table-column label="挂号类型" prop="regItemId" />
          <el-table-column label="过敏史" prop="allergyInfo" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>

  <!-- 添加用药处方对话框 -->
  <el-dialog v-model="medicinesDialogVisible" title="添加用药处方" center width="800">
    <el-row class="mt-10px">
      <el-col :span="24">
        <el-table
          border
          show-summary
          :summary-method="getSummaries"
          :data="submitMedicinesDataList"
        >
          <el-table-column label="序号" type="index" width="55" />
          <el-table-column label="药品名称" prop="medicinesName" />
          <el-table-column label="数量" prop="num" width="160">
            <template #default="scope">
              <el-input-number size="small" v-model="scope.row.num" :max="100000" />
            </template>
          </el-table-column>
          <el-table-column label="单价(元)" prop="prescriptionPrice">
            <template #default="scope">
              {{ parseFloat(scope.row.prescriptionPrice).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="总价(元)" prop="amount">
            <template #default="scope">
              {{ (parseFloat(scope.row.prescriptionPrice) * parseFloat(scope.row.num)).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="服用备注" prop="remark" width="200">
            <template #default="scope">
              <el-input v-model="scope.row.remark" placeholder="请输入服用备注" />
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button
                size="small"
                type="danger"
                @click="deleteCheckedMedicinesIdRow(scope.row.medicinesId)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <template #footer>
      <el-row class="mt-10px" justify="space-between">
        <el-col :span="10">
          <el-button type="primary" @click="addMedicinesDrawer" style="width: 100%">
            <el-icon><Plus /></el-icon>
            <span>添加药品项</span>
          </el-button>
        </el-col>
        <el-col :span="10">
          <el-button type="success" @click="submitMedicines" style="width: 100%">
            <el-icon><Plus /></el-icon>
            <span>确认添加</span>
          </el-button>
        </el-col>
      </el-row>
    </template>
  </el-dialog>

  <!-- 用药抽屉 -->
  <el-drawer v-model="medicinesDrawerVisible" direction="rtl" title="药品列表" size="40%">
    <el-card>
      <el-row>
        <el-col :span="24">
          <el-form-item label="关键字">
            <el-input
              placeholder="请输入关键字"
              @input="debouncedGetMedicinesFetch"
              v-model="medicinesObj.keywords"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-table
            border
            style="width: 100%"
            :data="medicinesList"
            row-key="medicinesId"
            @selection-change="medicinesHandleSelectionChange"
            max-height="600"
            v-model:selection="checkedMedicinalIds"
            ref="medicinesId"
          >
            <el-table-column fixed type="selection" width="55" />
            <el-table-column label="药品名称" prop="medicinesName" width="140" />
            <el-table-column label="药品类型" prop="medicinesType" width="160">
              <template #default="scope">
                <span>{{ medicinesMap[scope.row.medicinesType] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="处方类型" prop="prescriptionType" width="100">
              <template #default="scope">
                <span>{{ prescriptionTypeMap[scope.row.prescriptionType] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="规格">
              <template #default="scope">
                {{ scope.row.conversion + scope.row.unit }}
              </template>
            </el-table-column>
            <el-table-column label="库存" prop="medicinesStockNum" />
          </el-table>
        </el-col>
      </el-row>
      <!-- 分页行 -->
      <el-row class="mt-10px">
        <el-col :span="24">
          <el-pagination
            background
            layout="total,sizes,prev, pager, next,jumper"
            :total="medicinesObj.medicinesPageTotal"
            :pager-count="5"
            :page-size="medicinesObj.medicinesPageSize"
            size="small"
            :page-sizes="[10, 20, 50]"
            :current-page="medicinesObj.medicinesPageNum"
            @size-change="sizeChange"
            @current-change="currentChange"
          />
        </el-col>
      </el-row>
      <el-row class="mt-10px">
        <el-col>
          <el-button type="primary" style="width: 100%" @click="addMedicinesAndClosed">
            <el-icon><Plus /></el-icon>
            <span>添加并关闭</span>
          </el-button>
        </el-col>
      </el-row>
    </el-card>
  </el-drawer>

  <!-- 添加检查处方对话框 -->
  <el-dialog v-model="checkDialogVisible" title="添加检查处方" center width="800">
    <el-row class="mt-10px">
      <el-col :span="24">
        <el-table
          border
          show-summary
          :summary-method="getCheckItemSummaries"
          :data="submitCheckItemDataList"
        >
          <el-table-column label="序号" type="index" width="55" />
          <el-table-column label="项目名称" prop="checkItemName" />
          <el-table-column label="单价(元)" prop="unitPrice">
            <template #default="scope">
              {{ parseFloat(scope.row.unitPrice).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="单位" prop="unit" />
          <el-table-column label="总价(元)" prop="amount">
            <template #default="scope">
              {{ parseFloat(scope.row.unitPrice).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="检查备注" prop="remark" width="200">
            <template #default="scope">
              <el-input v-model="scope.row.remark" placeholder="请输入检查备注" />
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button
                size="small"
                type="danger"
                @click="deleteCheckedCheckitemIdRow(scope.row.checkItemId)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <template #footer>
      <el-row class="mt-10px" justify="space-between">
        <el-col :span="10">
          <el-button type="primary" @click="addCheckDrawer" style="width: 100%">
            <el-icon><Plus /></el-icon>
            <span>添加检查项</span>
          </el-button>
        </el-col>
        <el-col :span="10">
          <el-button type="success" @click="submitCheckItem" style="width: 100%">
            <el-icon><Plus /></el-icon>
            <span>确认添加</span>
          </el-button>
        </el-col>
      </el-row>
    </template>
  </el-dialog>

  <!-- 检查抽屉 -->
  <el-drawer v-model="checkDrawerVisible" title="检查项目列表" size="40%">
    <el-card>
      <el-row>
        <el-col :span="24">
          <el-form-item label="关键字">
            <el-input
              placeholder="请输入关键字"
              @input="debouncedGetCheckItemFetch"
              v-model="checkItemObj.keywords"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-table
            border
            style="width: 100%"
            :data="checkItemList"
            row-key="checkItemId"
            @selection-change="checkItemHandleSelectionChange"
            max-height="600"
            v-model:selection="checkedCheckItemIds"
            ref="checkItemId"
          >
            <el-table-column fixed type="selection" width="55" />
            <el-table-column label="项目名称" prop="checkItemName" width="140" />
            <el-table-column label="关键字" prop="keyWords" />
            <el-table-column label="项目单价" prop="unitPrice" width="160" />
            <el-table-column label="单位" prop="unit" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button
                  type="danger"
                  @click="deleteCheckedCheckitemIdRow(scope.row.checkItemId)"
                >
                  <el-icon><Delete /></el-icon>
                  <span>删除</span>
                </el-button>
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
            :total="checkItemObj.checkItemPageTotal"
            :pager-count="5"
            :page-size="checkItemObj.checkItemPageSize"
            size="small"
            :page-sizes="[10, 20, 50]"
            :current-page="checkItemObj.checkItemPageNum"
            @size-change="sizeChange"
            @current-change="currentChange"
          />
        </el-col>
      </el-row>
      <el-row class="mt-10px">
        <el-col>
          <el-button type="primary" style="width: 100%" @click="addCheckItemAndClosed">
            <el-icon><Plus /></el-icon>
            <span>添加并关闭</span>
          </el-button>
        </el-col>
      </el-row>
    </el-card>
  </el-drawer>
</template>

<script setup lang="ts">
import http from '@/http'
import { debounce } from '@/utils/debounceUtils'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { nextTick, onMounted, reactive, ref, watch } from 'vue'

const activeName = ref('first') // 默认选中的 tab
const medicinesObj = reactive({
  medicinesPageTotal: 0,
  medicinesPageNum: 1,
  medicinesPageSize: 10,
  keywords: '',
})
const dialogVisible = ref(false) //挂号患者对话框控制显示
let contagious = reactive([]) //是否传染
let receiveType = reactive([]) //接诊类型
const patientData = reactive({
  patientId: '',
  regId: '',
  phone: '',
  name: '',
  age: 0,
  sex: '0',
  birthDay: '',
  idCard: '',
  address: '',
  allergyInfo: '',
  isFinal: '',
  password: '',
  openId: '',
}) //患者信息对象
const careHistoryData = reactive({
  chId: '', //病例编号
  patientId: '', //患者ID
  patientName: '', //患者名
  regId: '', //挂号编号
  careDate: '', //就诊时间
  deptId: '', //部门编号
  deptName: '', //部门名
  receiveType: '', //接诊类型  初诊  复诊
  isContagious: '', //是否传染  否 是
  caseTitle: '', //主诉
  caseResult: '', //诊断信息
  doctorTips: '', //医生建议
  remark: '', //备注
}) //病例对象
const regListData = ref([]) //挂号数据
const hisCareHistoryData = ref([]) //患者历史病例数据
const hisPatientFile = ref([]) //患者档案数据
const schedulingTypeMap = ref({}) //存储排班类型字典
const checkDialogVisible = ref(false) //检查处方对话框
const checkDrawerVisible = ref(false) //检查处方抽屉
const medicinesDialogVisible = ref(false) //用药处方对话框
const medicinesDrawerVisible = ref(false) //用药处方抽屉
const medicinesList = ref([]) //药品列表
const medicinesDataMap = ref({}) //存储药品类型字典
const medicinesMap = ref([])
const prescriptionTypeDataMap = ref({}) //存储处方类型字典
const prescriptionTypeMap = ref([])
const checkedMedicinalIds = ref([]) //选中的药品列表，用于添加用药处方
const submitMedicinesDataList = ref([]) //要提交的药品列表，用于添加用药处方详细信息
const cfTotalAmount = ref(0)
const jcTotalAmount = ref(0)
const coId = ref('')
const careOrderData = ref([]) // 处方数据
const orderItemData = ref([]) // 处方明细
const activeNames = ref([]) // 折叠面板状态
const checkItemList = ref([]) //检查处方列表
const submitCheckItemDataList = ref([]) //要提交的检查列表，用于添加处方详细信息
const checkItemObj = reactive({
  checkItemPageTotal: 0,
  checkItemPageNum: 1,
  checkItemPageSize: 10,
  keywords: '',
}) //检查项目对象
const checkedCheckItemIds = ref([]) //选中的药品列表，用于添加用药处方
const tableKey = ref(Date.now()) // 定义 `tableKey` 变量
const buttonDisabledObj = reactive({
  careFinishDisabled: true, //就诊完成按钮
  saveCareDisabled: true, //保存病例按钮
  addCareOrderDisabled: true, //添加用药处方按钮
  addCheckItemDisabled: true, //添加检查处方按钮
})
const ruleFormRef = ref(null)

// 监听病例信息变化，启用 "保存病例" 按钮
watch(
  careHistoryData,
  (newVal) => {
    buttonDisabledObj.saveCareDisabled =
      !newVal.caseTitle || !newVal.caseResult || !newVal.doctorTips
  },
  { deep: true },
)

// 表单校验规则
const rules = reactive({
  careDate: [{ required: true, message: '请选择发病日期', trigger: 'change' }],
  receiveType: [{ required: true, message: '请选择接诊类型', trigger: 'change' }],
  isContagious: [{ required: true, message: '请选择是否传染', trigger: 'change' }],
  caseTitle: [
    { required: true, message: '请输入主诉', trigger: 'blur' },
    { min: 5, max: 200, message: '长度应在 5 到 200 之间', trigger: 'blur' },
  ],
  caseResult: [{ required: true, message: '请输入诊断信息', trigger: 'blur' }],
  doctorTips: [{ required: true, message: '请输入医生建议', trigger: 'blur' }],
})

//删除
const deleteItem = (row) => {
  ElMessageBox.confirm(`确定要删除 ${row.itemName} 吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    http.delete(`/orderItem/delete/${row.itemId}`).then((res) => {
      if (res.data.code === 200) {
        ElMessage.success('删除成功')
        getCareOrderByCoid() // 重新拉取数据
      } else {
        ElMessage.error('删除失败')
      }
    })
  })
}

//根据COID获取药用处方和明细信息
const getCareOrderByCoid = async () => {
  try {
    // 并行请求获取处方信息（药品 & 检查项）
    const [medRes, checkRes] = await Promise.all([
      http.get(`/careOrder/get/0/${coId.value}`), // 获取药品处方
      http.get(`/careOrder/get/1/${coId.value}`), // 获取检查处方
    ])

    if (medRes.data.code === 200 && checkRes.data.code === 200) {
      const newMedData = medRes.data.data || []
      const newCheckData = checkRes.data.data || []

      // 合并数据并去重（确保 coId 唯一）
      careOrderData.value = Array.from(
        new Map(
          [...careOrderData.value, ...newMedData, ...newCheckData].map((item) => [item.coId, item]),
        ).values(),
      )

      // 默认展开所有面板
      activeNames.value = careOrderData.value.map((order) => order.coId)
    }

    // 并行请求获取明细信息（药品 & 检查项）
    const [medItemsRes, checkItemsRes] = await Promise.all([
      http.get(`/orderItem/get/0/${coId.value}`), // 获取药品处方明细
      http.get(`/orderItem/get/1/${coId.value}`), // 获取检查处方明细
    ])

    if (medItemsRes.data.code === 200 && checkItemsRes.data.code === 200) {
      const newMedItems = medItemsRes.data.data || []
      const newCheckItems = checkItemsRes.data.data || []

      // 合并数据并去重（确保 itemId 唯一）
      orderItemData.value = Array.from(
        new Map(
          [...orderItemData.value, ...newMedItems, ...newCheckItems].map((item) => [
            item.itemId,
            item,
          ]),
        ).values(),
      )
    }
  } catch (error) {
    console.error('获取处方和明细数据失败:', error)
  }
}

//添加用药和检查处方的通用方法
const submitPrescription = async (type) => {
  // 确定提交的数据列表（检查项 or 药品）
  const isMedicine = type === '0'
  const dataList = isMedicine ? submitMedicinesDataList.value : submitCheckItemDataList.value

  // 确保每个数据项都有必要的属性
  dataList.forEach((item) => {
    item.num = item.num ?? (isMedicine ? 0 : 1) // 药品默认 0，检查项默认 1
    item.remark = item.remark || '无' // 备注默认 '无'
  })

  // 组装提交的数据
  const submitData = {
    coType: type, // 0: 用药，1: 检查
    patientId: careHistoryData.patientId,
    patientName: careHistoryData.patientName,
    chId: careHistoryData.chId,
    allAmount: isMedicine ? cfTotalAmount.value : jcTotalAmount.value, // 计算总金额
  }

  console.log(`提交${isMedicine ? '用药' : '检查'}数据:`, submitData)
  console.log('详细信息:', dataList)

  try {
    // 发送主处方请求
    const res = await http.post('/careOrder/add', submitData)

    if (res.data.code === 200) {
      coId.value = res.data.data

      // 发送详细项目数据
      const detailRes = await http.post(`/orderItem/add/${type}/${coId.value}`, dataList)

      if (detailRes.data.code === 200 && detailRes.data.data === true) {
        ElMessage.success('添加成功!!!')

        // 清空数据
        if (isMedicine) {
          submitMedicinesDataList.value = []
          checkedMedicinalIds.value = []
          medicinesDialogVisible.value = false
        } else {
          submitCheckItemDataList.value = []
          checkedCheckItemIds.value = []
          checkDialogVisible.value = false
        }

        // 重置提交数据对象
        Object.assign(submitData, {
          coType: '',
          patientId: '',
          patientName: '',
          chId: '',
          allAmount: '',
        })

        // 刷新处方数据
        getCareOrderByCoid()
      }
    }
  } catch (error) {
    console.error(`提交${isMedicine ? '用药' : '检查'}处方失败:`, error)
    ElMessage.error('提交失败，请重试！')
  }
}

const submitCheckItem = () => submitPrescription('1') //发送后端请求添加检查处方
const submitMedicines = () => submitPrescription('0') //发送后端请求添加用药处方

onMounted(() => {
  getSchedulingType()
  getPrescriptionTypeFetch()
  getMedicinesTypeFetch()
})

// 计算检查项目总价的总结方法
const getCheckItemSummaries = ({ columns, data }) => {
  const sums = []

  columns.forEach((column, index) => {
    if (column.property === 'amount') {
      // 计算总价列的合计
      jcTotalAmount.value = data.reduce((sum, row) => {
        return sum + parseFloat(row.unitPrice)
      }, 0)
      sums[index] = jcTotalAmount.value.toFixed(2) // 显示两位小数
    } else {
      sums[index] = '' // 其他列不计算
    }
  })

  return sums
}

// 计算总价的总结方法
const getSummaries = ({ columns, data }) => {
  const sums = []

  columns.forEach((column, index) => {
    if (column.property === 'amount') {
      // 计算总价列的合计
      cfTotalAmount.value = data.reduce((sum, row) => {
        return sum + parseFloat(row.prescriptionPrice) * parseFloat(row.num)
      }, 0)
      sums[index] = cfTotalAmount.value.toFixed(2) // 显示两位小数
    } else {
      sums[index] = '' // 其他列不计算
    }
  })

  return sums
}

// 监听药品数据变化
watch(
  submitMedicinesDataList,
  (newList) => {
    newList.forEach((medicine) => {
      if (medicine.num === undefined) {
        medicine.num = 1
      }
    })
  },
  { deep: true },
)

//删除选中的药品行
const deleteCheckedMedicinesIdRow = (medicinesId) => {
  //删除提交的数据列
  submitMedicinesDataList.value = submitMedicinesDataList.value.filter(
    (item) => item.medicinesId !== medicinesId,
  )

  //删除选中的数据列
  checkedMedicinalIds.value = submitMedicinesDataList.value.filter(
    (id) => id.medicinalId !== medicinesId,
  )
}

//删除选中的检查项目行
const deleteCheckedCheckitemIdRow = (checkItemId) => {
  //删除提交的数据列
  submitCheckItemDataList.value = submitCheckItemDataList.value.filter(
    (item) => item.checkItemId !== checkItemId,
  )

  //删除选中的数据列
  checkedCheckItemIds.value = submitCheckItemDataList.value.filter(
    (id) => id.medicinalId !== checkItemId,
  )
}

//检查项目列表的添加并关闭按钮
const addCheckItemAndClosed = () => {
  if (!checkedCheckItemIds.value.length) {
    ElMessage.warning('请选择检查项目！')
    return
  }

  // 获取已存在的药品 ID
  const existingIds = new Set(submitCheckItemDataList.value.map((item) => item.checkItemId))

  // 过滤出未添加的药品，并添加到列表
  const newCheckItems = checkedCheckItemIds.value.filter(
    (checkItem) => !existingIds.has(checkItem.checkItemId),
  )

  if (newCheckItems.length > 0) {
    submitCheckItemDataList.value.push(...newCheckItems)
    ElMessage.success(`${newCheckItems.length} 条检查项目已添加`)
  } else {
    ElMessage.info('所选检查项目已存在')
  }

  // 关闭抽屉
  checkDrawerVisible.value = false
}

//药品列表的添加并关闭按钮
const addMedicinesAndClosed = () => {
  if (!checkedMedicinalIds.value.length) {
    ElMessage.warning('请选择药品！')
    return
  }

  // 获取已存在的药品 ID
  const existingIds = new Set(submitMedicinesDataList.value.map((item) => item.medicinalId))

  // 过滤出未添加的药品，并添加到列表
  const newMedicines = checkedMedicinalIds.value.filter(
    (medicine) => !existingIds.has(medicine.medicinalId),
  )

  if (newMedicines.length > 0) {
    submitMedicinesDataList.value.push(...newMedicines)
    ElMessage.success(`${newMedicines.length} 条药品已添加`)
  } else {
    ElMessage.info('所选药品已存在')
  }

  // 关闭抽屉
  medicinesDrawerVisible.value = false
}

//检查项目的多选框监听变化
const checkItemHandleSelectionChange = (val) => {
  checkedCheckItemIds.value = val
  console.log(checkedCheckItemIds.value)
}

//药品列表的多选框监听变化
const medicinesHandleSelectionChange = (val) => {
  checkedMedicinalIds.value = val
}

//上一页
const sizeChange = (newPageSize) => {
  medicinesObj.medicinesPageSize = newPageSize
  getMedicinesFetch()
}

//下一页
const currentChange = (newPage) => {
  medicinesObj.medicinesPageNum = newPage
  getMedicinesFetch()
}

//处方类型
const getPrescriptionTypeFetch = () => {
  http.get('/dictData/get/his_prescription_type').then((res) => {
    const prescriptionTypeData = res.data.data || []
    prescriptionTypeDataMap.value = prescriptionTypeData

    prescriptionTypeMap.value = prescriptionTypeData.reduce((map, item) => {
      map[Number(item.dictValue)] = item.dictLabel
      return map
    }, {})
  })
}

//药品类型
const getMedicinesTypeFetch = () => {
  http.get('/dictData/get/his_medicines_type').then((res) => {
    const medicinesData = res.data.data || []
    medicinesDataMap.value = medicinesData

    medicinesMap.value = medicinesData.reduce((map, item) => {
      map[Number(item.dictValue)] = item.dictLabel
      return map
    }, {})
  })
}

//获取药品列表
const getMedicinesFetch = () => {
  http
    .get('/medicines/list', {
      params: {
        pageNum: medicinesObj.medicinesPageNum,
        pageSize: medicinesObj.medicinesPageSize,
        status: '0',
        keywords: medicinesObj.keywords,
      },
    })
    .then((res) => {
      const list = Array.isArray(res.data.data.list) ? res.data.data.list : []
      medicinesList.value.splice(0, medicinesList.value.length, ...list)
      medicinesObj.medicinesPageTotal = res.data.data?.total || 0
    })
}

//获取检查列表
const getCheckItemFetch = () => {
  http.get('/checkItem/list', { params: { status: '0' } }).then((res) => {
    const list = Array.isArray(res.data.data.list) ? res.data.data.list : []
    checkItemList.value.splice(0, checkItemList.value.length, ...list)
    checkItemObj.checkItemPageTotal = res.data?.total || 0
  })
}

//添加检查项
const addCheckDrawer = () => {
  getCheckItemFetch()
  checkDrawerVisible.value = true
}

//添加药品项
const addMedicinesDrawer = () => {
  getMedicinesFetch()
  medicinesDrawerVisible.value = true
}

//就诊完成
const finishCare = () => {
  http.put(`/regList/status/${patientData.regId}/3`).then((res) => {
    if (res.data.data === true && res.data.code === 200) {
      //清空患者对象
      Object.assign(patientData, {
        patientId: '',
        regId: '',
        phone: '',
        name: '',
        age: 0,
        sex: '0',
        birthDay: '',
        idCard: '',
        address: '',
        allergyInfo: '',
        isFinal: '',
        password: '',
        openId: '',
      })
      //清空历史病例对象
      Object.assign(careHistoryData, {
        chId: '', //病例编号
        patientId: '', //患者ID
        patientName: '', //患者名
        regId: '', //挂号编号
        careDate: '', //就诊时间
        deptId: '', //部门编号
        deptName: '', //部门名
        receiveType: '', //接诊类型  初诊  复诊
        isContagious: '', //是否传染  否 是
        caseTitle: '', //主诉
        caseResult: '', //诊断信息
        doctorTips: '', //医生建议
        remark: '', //备注
      })

      // 确保表格数据清空并触发 UI 更新
      orderItemData.value = []
      hisPatientFile.value = []
      hisCareHistoryData.value = []
      careOrderData.value = []

      // 强制刷新表格（如果数据仍然存在 UI 上）
      nextTick(() => {
        tableKey.value = Date.now() // 让表格重新渲染
      })
      ElMessage.success('操作成功!!')
    }
  })
}

//获取排班类型数据
const getSchedulingType = () => {
  http.get('/dictData/get/his_scheduling_type').then((res) => {
    const dictData = res.data.data || []

    schedulingTypeMap.value = dictData.reduce((map, item) => {
      map[Number(item.dictValue)] = item.dictLabel
      return map
    }, {})
  })
}

//保存病例
const saveCareHistory = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      if (careHistoryData.chId !== '') {
        ElMessage.warning('病例已存在！')
      } else {
        http.post('/careHistory/careHistory/add', careHistoryData).then((res) => {
          if (res.status === 200) {
            careHistoryData.chId = res.data.data
            ElNotification({
              title: '保存病例成功！',
              type: 'success',
              offset: 50,
              duration: 3000,
            })
            setTimeout(() => {
              buttonDisabledObj.careFinishDisabled = false // 启用 "就诊完成" 按钮
              buttonDisabledObj.addCareOrderDisabled = false
              buttonDisabledObj.addCheckItemDisabled = false
            }, 1000)
          }
        })
      }
    } else {
      ElMessage.error('请检查表单填写')
    }
  })
}

//根据身份证号计算出生日期和年龄的方法
const getBirthdayAndAgeFromIdCard = (idCard) => {
  if (!/^\d{17}[\dXx]$/.test(idCard)) return { birthday: '', age: 0 }

  const year = idCard.slice(6, 10)
  const month = idCard.slice(10, 12)
  const day = idCard.slice(12, 14)
  const birthday = `${year}-${month}-${day}`
  const age =
    new Date().getFullYear() - year - (new Date() < new Date(year, month - 1, day) ? 1 : 0)
  return { birthday, age }
}

// 选择患者
const chooseSelectedPatient = async (regId) => {
  const patient = regListData.value.find((item) => item.regId === regId)

  dialogVisible.value = false

  if (patient) {
    const { birthday, age } = getBirthdayAndAgeFromIdCard(patient.idCard)

    //解构赋值patientData
    Object.assign(patientData, {
      patientId: patient.patientId,
      regId: patient.regId,
      phone: patient.phone || '',
      name: patient.name || '',
      age: age, // 自动计算年龄
      sex: patient.sex || '0',
      birthDay: birthday, // 自动计算生日
      idCard: patient.idCard || '',
      address: patient.address || '',
      allergyInfo: patient.allergyInfo || '',
      isFinal: patient.isFinal || '',
      password: patient.password || '',
      openId: patient.openId || '',
    })
    //解构赋值careHistoryData
    Object.assign(careHistoryData, {
      deptId: patient.deptId,
      deptName: patient.deptName,
      patientId: patient.patientId,
      patientName: patient.name,
      regId: patient.regId,
    })
    //根据患者ID查询患者档案
    await getHisPatientFileByPid(patient.patientId)
    //根据患者ID查询历史病例
    await getHisCareHistoryByPid(patient.patientId)
    //修改挂号状态为就诊中
    await updateRegistrationStatus(2)
    ElMessage.success('选择成功！')
  } else {
    console.warn('未找到匹配的患者信息')
  }
}

//修改挂号状态为就诊中2
const updateRegistrationStatus = (regStatus) => {
  http.put(`/regList/status/${careHistoryData.regId}/${regStatus}`).then((res) => {
    if (res.status === 200) {
      console.log('状态已变就诊中')
    }
  })
}

// 根据患者ID查询患者档案
const getHisPatientFileByPid = (pid) => {
  http.get(`/patientFile/get/${pid}`).then((res) => {
    const data = res.data.data
    hisPatientFile.value = data
    console.log('============患者档案', data)
  })
}
// 根据患者ID查询历史病例
const getHisCareHistoryByPid = (pid) => {
  http.get(`/careHistory/careHistory/get/${pid}`).then((res) => {
    const list = Array.isArray(res.data.data) ? res.data.data : []
    hisCareHistoryData.value.splice(0, hisCareHistoryData.value.length, ...list)
    console.log('============历史病例')
    console.log(hisCareHistoryData.value)
  })
}

//选择患者根据状态查询，默认待就诊1
const selectionPatientFetch = () => {
  getRegListFetchByStatus(1)
  dialogVisible.value = true
}

// 监听 tab 切换
const handleTabClick = (pane) => {
  switch (pane.props.name) {
    case 'first':
      getRegListFetchByStatus(1)
      break
    case 'second':
      getRegListFetchByStatus(2)
      break
    case 'third':
      getRegListFetchByStatus(3)
      break
  }
}

// 获取挂号数据
const getRegListFetchByStatus = async (status) => {
  try {
    const res = await http.get(`/regList/get/${status}`)
    regListData.value = res.data.data || []
    // pageTotal.value = res.data.data?.total || 0
  } catch (error) {
    console.error('获取挂号数据失败', error)
  }
}

//获取是否传染方法
const getContagious = () => {
  if (contagious.length === 0) {
    http.get(`/dictData/list/his_contagious_status`).then((res) => {
      const list = Array.isArray(res.data.data) ? res.data.data : []
      contagious.splice(0, contagious.length, ...list)
    })
  }
}

//获取接诊类型方法
const getReceiveType = () => {
  if (receiveType.length === 0) {
    http.get(`/dictData/list/his_receive_type`).then((res) => {
      const list = Array.isArray(res.data.data) ? res.data.data : []
      receiveType.splice(0, receiveType.length, ...list)
    })
  }
}

// 防抖处理
const debouncedGetMedicinesFetch = debounce(getMedicinesFetch, 500)
const debouncedGetCheckItemFetch = debounce(getCheckItemFetch, 500)
</script>

<style>
@import url('https://at.alicdn.com/t/c/font_4844128_v8p50ve8kk9.css');
.mr-20px {
  margin-right: 20px;
}
.mr-10px {
  margin-right: 10px;
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
.min-width-120px {
  min-width: 120px;
}
</style>
