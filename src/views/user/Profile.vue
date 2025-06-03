<template>
  <div class="profile-container">
    <!-- 顶部卡片 -->
    <div class="profile-header">
      <el-card class="welcome-card">
        <div class="welcome-content">
          <div class="user-avatar">
            <el-avatar :size="80" :src="userInfo.picture">
              <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
            </el-avatar>
            <div class="avatar-actions">
              <el-upload
                class="avatar-uploader"
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <el-button type="primary" link size="small">更换头像</el-button>
              </el-upload>
            </div>
          </div>
          <div class="welcome-info">
            <h2>{{ getGreeting() }}，{{ userInfo.userName }}</h2>
            <p class="welcome-subtitle">欢迎回到医疗一体站管理系统</p>
            <div class="user-tags">
              <el-tag
                v-for="role in userInfo.sysRoleList"
                :key="role.id"
                class="role-tag"
                effect="plain"
                size="small"
              >
                {{ role.roleName }}
              </el-tag>
            </div>
          </div>
          <div class="quick-actions">
            <el-button type="primary" @click="updatePwdDialog" :icon="Lock">修改密码</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主要内容区 -->
    <div class="profile-main">
      <el-row :gutter="20">
        <!-- 左侧个人信息 -->
        <el-col :span="16">
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <span class="title">
                  <el-icon><UserFilled /></el-icon>
                  个人信息
                </span>
                <el-button type="primary" link @click="handleEdit">
                  <el-icon><Edit /></el-icon>
                  编辑信息
                </el-button>
              </div>
            </template>
            <el-form ref="infoForm" :model="userInfo" :disabled="!isEditing" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="姓名" prop="userName">
                    <el-input v-model="userInfo.userName" placeholder="请输入姓名" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="性别" prop="sex">
                    <el-select v-model="userInfo.sex" class="w-full" placeholder="请选择性别">
                      <el-option :value="0" label="男" />
                      <el-option :value="1" label="女" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="年龄" prop="age">
                    <el-input-number
                      v-model="userInfo.age"
                      :min="0"
                      :max="150"
                      class="w-full"
                      placeholder="请输入年龄"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="手机号" prop="phone">
                    <el-input v-model="userInfo.phone" placeholder="请输入手机号" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userInfo.email" placeholder="请输入邮箱" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="所属部门">
                    <el-input v-model="userInfo.deptValue" disabled placeholder="所属部门" />
                  </el-form-item>
                </el-col>
              </el-row>
              <div v-if="isEditing" class="form-actions">
                <el-button @click="cancelEdit">取消</el-button>
                <el-button type="primary" @click="saveUserInfo">保存</el-button>
              </div>
            </el-form>

            <!-- 添加信息卡片组 -->
            <div class="info-cards">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="info-card-item">
                    <div class="info-card-icon">
                      <el-icon><Clock /></el-icon>
                    </div>
                    <div class="info-card-content">
                      <div class="info-card-label">上次登录</div>
                      <div class="info-card-value">2024-03-18 09:30</div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="info-card-item">
                    <div class="info-card-icon">
                      <el-icon><Document /></el-icon>
                    </div>
                    <div class="info-card-content">
                      <div class="info-card-label">待处理工单</div>
                      <div class="info-card-value">5</div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="info-card-item">
                    <div class="info-card-icon">
                      <el-icon><MessageBox /></el-icon>
                    </div>
                    <div class="info-card-content">
                      <div class="info-card-label">未读消息</div>
                      <div class="info-card-value">3</div>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>

            <!-- 添加工作记录 -->
            <div class="work-records">
              <div class="section-title">
                <el-icon><Histogram /></el-icon>
                <span>工作记录</span>
              </div>
              <el-table :data="workRecords" style="width: 100%" :border="false" size="large">
                <el-table-column prop="date" label="日期" width="180" />
                <el-table-column prop="type" label="类型" width="120" />
                <el-table-column prop="description" label="描述" />
                <el-table-column prop="status" label="状态" width="120">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === '完成' ? 'success' : 'warning'">
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧统计信息 -->
        <el-col :span="8">
          <el-card class="stat-card">
            <template #header>
              <div class="card-header">
                <span class="title">
                  <el-icon><DataLine /></el-icon>
                  工作统计
                </span>
              </div>
            </template>
            <div class="stat-list">
              <div class="stat-item">
                <div class="stat-icon today">
                  <el-icon><Calendar /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">12</div>
                  <div class="stat-label">今日接诊</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon month">
                  <el-icon><TrendCharts /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">256</div>
                  <div class="stat-label">本月接诊</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon total">
                  <el-icon><Medal /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">1,234</div>
                  <div class="stat-label">总接诊量</div>
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="activity-card">
            <template #header>
              <div class="card-header">
                <span class="title">
                  <el-icon><Bell /></el-icon>
                  最近动态
                </span>
              </div>
            </template>
            <div class="activity-list">
              <el-timeline>
                <el-timeline-item
                  v-for="(activity, index) in recentActivities"
                  :key="index"
                  :type="activity.type"
                  :timestamp="activity.time"
                  :size="activity.size"
                >
                  {{ activity.content }}
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>

  <!-- 修改密码对话框 -->
  <el-dialog
    v-model="updatePwdDialogVisible"
    title="修改密码"
    width="500px"
    :before-close="handleClose"
    center
  >
    <el-form
      ref="pwdFormRef"
      :model="updatePwdForm"
      :rules="pwdRules"
      label-width="100px"
      class="pwd-form"
    >
      <el-form-item label="原密码" prop="oldPwd">
        <el-input
          v-model="updatePwdForm.oldPwd"
          type="password"
          placeholder="请输入原密码"
          show-password
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPwd">
        <el-input
          v-model="updatePwdForm.newPwd"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPwd">
        <el-input
          v-model="updatePwdForm.confirmPwd"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button link type="danger" @click="forgetPwd">忘记密码？</el-button>
        <div>
          <el-button @click="updatePwdDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpdatePwd">确认修改</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import {
  UserFilled,
  Edit,
  DataLine,
  Calendar,
  TrendCharts,
  Medal,
  Bell,
  Lock,
  Clock,
  Document,
  MessageBox,
  Histogram,
} from '@element-plus/icons-vue'

// 类型定义
type UserInfo = {
  userName: string
  avatar: string
  sex: number
  age: number
  email: string
  phone: string
  deptValue: string
  sysRoleList: Array<{
    id: number
    roleName: string
  }>
}

type UpdatePwdForm = {
  oldPwd: string
  newPwd: string
  confirmPwd: string
}

const userStore = useUserStore()
const updatePwdDialogVisible = ref(false)
const isEditing = ref(false)
const infoForm = ref()
const pwdFormRef = ref()

// 用户信息
const userInfo = ref<UserInfo>({
  userName: '',
  avatar: '',
  sex: 0,
  age: 0,
  email: '',
  phone: '',
  deptValue: '',
  sysRoleList: [],
})

// 修改密码表单
const updatePwdForm = ref<UpdatePwdForm>({
  oldPwd: '',
  newPwd: '',
  confirmPwd: '',
})

// 最近动态数据
const recentActivities = ref([
  {
    content: '完成了一次门诊接诊',
    time: '10分钟前',
    type: 'success',
    size: 'large',
  },
  {
    content: '修改了个人信息',
    time: '1小时前',
    type: 'info',
  },
  {
    content: '登录系统',
    time: '今天 09:00',
    type: 'primary',
  },
])

// 工作记录数据
const workRecords = ref([
  {
    date: '2024-03-18',
    type: '门诊',
    description: '完成了3例常规门诊诊疗',
    status: '完成',
  },
  {
    date: '2024-03-17',
    type: '手术',
    description: '参与了2台普外科手术',
    status: '完成',
  },
  {
    date: '2024-03-16',
    type: '会诊',
    description: '进行了跨科室会诊',
    status: '进行中',
  },
])

// 获取问候语
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 17) return '下午好'
  if (hour < 19) return '傍晚好'
  return '晚上好'
}

// 头像上传相关方法
const handleAvatarSuccess = (res: any) => {
  userInfo.value.avatar = res.url
  ElMessage.success('头像更新成功')
}

const beforeAvatarUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 编辑个人信息
const handleEdit = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  // 重置表单
  const user = userStore.getUser
  userInfo.value = { ...user } as UserInfo
}

const saveUserInfo = async () => {
  try {
    // TODO: 调用保存用户信息API
    await new Promise((resolve) => setTimeout(resolve, 1000))
    ElMessage.success('保存成功')
    isEditing.value = false
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 密码验证规则
const pwdRules = {
  oldPwd: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPwd: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
  ],
  confirmPwd: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== updatePwdForm.value.newPwd) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// 忘记密码
const forgetPwd = () => {
  ElMessage.info('请联系系统管理员重置密码')
}

// 提交修改密码
const submitUpdatePwd = async () => {
  if (!pwdFormRef.value) return
  await pwdFormRef.value.validate((valid: boolean) => {
    if (valid) {
      // TODO: 调用修改密码API
      ElMessage.success('密码修改成功')
      updatePwdDialogVisible.value = false
      updatePwdForm.value = {
        oldPwd: '',
        newPwd: '',
        confirmPwd: '',
      }
    }
  })
}

// 打开修改密码对话框
const updatePwdDialog = () => {
  updatePwdDialogVisible.value = true
}

// 关闭对话框前确认
const handleClose = (done: () => void) => {
  if (updatePwdForm.value.oldPwd || updatePwdForm.value.newPwd || updatePwdForm.value.confirmPwd) {
    ElMessageBox.confirm('确定要关闭吗？未保存的数据将会丢失')
      .then(() => {
        updatePwdForm.value = {
          oldPwd: '',
          newPwd: '',
          confirmPwd: '',
        }
        done()
      })
      .catch(() => {})
  } else {
    done()
  }
}

onMounted(() => {
  const user = userStore.getUser
  userInfo.value = { ...user } as UserInfo
})
</script>

<style scoped>
.profile-container {
  padding: 16px;
  background-color: #f6f9fc;
  min-height: calc(100vh - 60px);
}

.profile-header {
  margin-bottom: 16px;
}

.welcome-card {
  background: linear-gradient(120deg, #2c3e50 0%, #3498db 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.welcome-content {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  gap: 24px;
  position: relative;
  overflow: hidden;
}

.welcome-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
}

.user-avatar {
  text-align: center;
  position: relative;
  z-index: 1;
}

.avatar-actions {
  margin-top: 8px;
  opacity: 0.9;
}

.welcome-info {
  flex: 1;
  position: relative;
  z-index: 1;
}

.welcome-info h2 {
  margin: 0;
  font-size: 22px;
  color: white;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.welcome-subtitle {
  margin: 6px 0;
  opacity: 0.85;
  font-size: 14px;
}

.user-tags {
  margin-top: 8px;
}

.role-tag {
  margin-right: 8px;
  background-color: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  backdrop-filter: blur(4px);
}

.quick-actions {
  margin-left: auto;
  align-self: flex-start;
  position: relative;
  z-index: 1;
}

.quick-actions .el-button {
  background-color: rgba(255, 255, 255, 0.15);
  border: none;
  backdrop-filter: blur(4px);
}

.quick-actions .el-button:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.profile-main {
  .el-card {
    margin-bottom: 16px;
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    &:hover {
      box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
}

.title {
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #303133;
}

.info-card {
  .el-form {
    padding: 16px 0;
  }
}

.form-actions {
  text-align: right;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.stat-list {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
  padding: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid #ebeef5;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #e0e7ff;
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;

  .el-icon {
    font-size: 20px;
    color: white;
  }

  &.today {
    background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  }

  &.month {
    background: linear-gradient(135deg, #52c41a 0%, #85d675 100%);
  }

  &.total {
    background: linear-gradient(135deg, #722ed1 0%, #b37feb 100%);
  }
}

.stat-info {
  .stat-value {
    font-size: 22px;
    font-weight: 600;
    line-height: 1;
    margin-bottom: 4px;
    color: #303133;
  }

  .stat-label {
    color: #909399;
    font-size: 13px;
  }
}

.activity-list {
  padding: 0 16px 16px;
}

.w-full {
  width: 100%;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-input__wrapper:hover),
:deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-timeline-item__node) {
  background-color: #e6f7ff;
  border-color: #1890ff;
}

:deep(.el-timeline-item__content) {
  color: #606266;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 12px;
}

.info-cards {
  margin: 24px 0;
  padding: 0 12px;
}

.info-card-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
}

.info-card-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.info-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-card-icon .el-icon {
  font-size: 24px;
  color: #1890ff;
}

.info-card-content {
  flex: 1;
}

.info-card-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.info-card-value {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.work-records {
  margin-top: 24px;
  padding: 0 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.section-title .el-icon {
  font-size: 18px;
  color: #409eff;
}

:deep(.el-table) {
  --el-table-border-color: #ebeef5;
  --el-table-header-bg-color: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-table--large) {
  font-size: 14px;
}

:deep(.el-table .cell) {
  padding: 12px 16px;
}
</style>
