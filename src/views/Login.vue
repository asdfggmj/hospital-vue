<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 左侧插画 -->
      <div class="login-banner">
        <img
          src="@/assets/images/medical-banner.svg"
          alt="medical illustration"
          class="banner-image"
        />
        <div class="banner-text">
          <h3>智慧医疗</h3>
          <p>提供专业的医疗管理解决方案</p>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-form">
        <div class="login-header">
          <img src="@/assets/images/logo.svg" alt="logo" class="logo" />
          <h2 class="welcome-text">欢迎使用</h2>
          <p class="system-name">智慧医疗管理系统</p>
        </div>

        <el-form ref="ruleFormRef" :rules="rules" status-icon :model="loginData" class="form-body">
          <!-- 登录账号 -->
          <el-form-item prop="username">
            <el-input
              v-model="loginData.username"
              size="large"
              placeholder="手机号 | 邮箱"
              :prefix-icon="User"
            />
          </el-form-item>
          <!-- 密码 -->
          <el-form-item prop="password">
            <el-input
              v-model="loginData.password"
              size="large"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <!-- 验证码 -->
          <div class="verify-code-container">
            <el-form-item prop="code" class="verify-code-input">
              <el-input
                size="large"
                v-model="loginData.validateCode"
                :prefix-icon="Lock"
                placeholder="请输入右侧验证码"
              />
            </el-form-item>
            <div class="login-code" v-loading="loading">
              <img :src="codeUrl" @click="getCode" class="login-code-img" />
            </div>
          </div>

          <el-button
            type="primary"
            size="large"
            @click="submitLogin"
            class="login-button"
            :loading="isLoading"
          >
            登录
          </el-button>

          <div class="divider-container">
            <el-divider>
              <el-text>其他方式登录</el-text>
              <el-tooltip
                effect="dark"
                content="仅支持内部已绑定第三方账号的系统账号登录!"
                placement="top"
              >
                <el-button type="info" link>
                  <el-icon><InfoFilled /></el-icon>
                </el-button>
              </el-tooltip>
            </el-divider>
          </div>

          <!-- 第三方登录按钮 -->
          <div class="third-party-login">
            <el-tooltip effect="dark" content="使用GitHub登录" placement="top">
              <el-button type="primary" link @click="gitHubLogin">
                <img src="@/assets/svg/github.svg" style="width: 24px; height: 24px" />
              </el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="使用微信登录" placement="top">
              <el-button type="success" link @click="weChatLogin">
                <img src="@/assets/svg/wechat.svg" style="width: 24px; height: 24px" />
              </el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="使用谷歌登录" placement="top">
              <el-button type="danger" link @click="googleLogin">
                <img src="@/assets/svg/google.svg" style="width: 24px; height: 24px" />
              </el-button>
            </el-tooltip>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import http from '@/http'
import router from '@/router'
import { Lock, User } from '@element-plus/icons-vue'
import { useCookies } from '@vueuse/integrations/useCookies'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

const ruleFormRef = ref<FormInstance | null>(null)
const cookie = useCookies()
let isLoading = ref(false)
// 用户登录信息
const loginData = reactive({
  username: '',
  password: '',
  validateCode: '', // 存储输入的验证码
  uuid: '', // 记录后端返回的验证码唯一标识
})
const codeUrl = ref('') // 存储验证码图片的 Base64 数据
const loading = ref(true)

onMounted(() => {
  getCode()
})

// github登录
const gitHubLogin = () => {
  http.get('/oauth2/github').then((res) => {
    console.log(res.data)
  })
  ElMessage.info('使用github登录')
}

// 微信登录
const weChatLogin = () => {
  ElMessage.info('使用微信登录')
}

//获取图形验证码
const getCode = () => {
  loading.value = true
  http
    .get('/auth/auth/getCode')
    .then((res) => {
      if (res.data.code === '00000') {
        loginData.uuid = res.data.data.uuid // 存储验证码唯一标识
        codeUrl.value = 'data:image/png;base64,' + res.data.data.img // 直接赋值 Base64 图片
      }
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}

// 表单验证规则
const rules = reactive<FormRules>({
  username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
  validateCode: [{ required: true, message: '验证码不能为空', trigger: 'blur' }],
})

// 提交登录表单
const submitLogin = () => {
  if (!ruleFormRef.value) return // 确保 ruleFormRef 已经绑定
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      isLoading.value = true
      http
        .post('/auth/auth/login', loginData)
        .then((response) => {
          if (response.data.code === '00000') {
            console.log(response.data)

            const token = response.data.data
            cookie.set('Authorization', token)
            console.log('token:', token)
            ElMessage.success('登录成功!')
            router.push('/home')
            return
          }
          getCode()
          return ElMessage.error(response.data.msg)
        })
        .catch((error) => {
          ElMessage.error('出错了QwQ!!!', error)
        })
        .finally(() => {
          isLoading.value = false
        })
    }
  })
}

// 添加谷歌登录方法
const googleLogin = () => {
  ElMessage.info('使用谷歌登录')
}
</script>

<style>
@import url('https://at.alicdn.com/t/c/font_4844128_go2jbgovf.css');

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 10% 20%, rgba(24, 144, 255, 0.05) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(24, 144, 255, 0.05) 0%, transparent 20%),
    radial-gradient(circle at 50% 50%, rgba(24, 144, 255, 0.03) 0%, transparent 50%);
}

.login-box {
  display: flex;
  width: 1000px;
  min-height: 600px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
}

/* 左侧登录表单样式 */
.login-form {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 60px;
  height: 60px;
  margin-bottom: 15px;
  filter: drop-shadow(0 2px 4px rgba(24, 144, 255, 0.2));
}

.welcome-text {
  font-size: 20px;
  color: #666;
  margin-bottom: 5px;
  font-weight: normal;
}

.system-name {
  font-size: 26px;
  background: linear-gradient(45deg, #1890ff, #40a9ff);
  -webkit-background-clip: text;
  color: transparent;
  font-weight: 600;
  margin: 0;
}

.form-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

.el-input {
  --el-input-hover-border-color: #1890ff;
  --el-input-focus-border-color: #1890ff;
}

.el-input__inner {
  height: 45px !important;
  transition: all 0.3s ease;
  border-color: #e8f0fe !important;
}

.el-input__inner:hover {
  border-color: #40a9ff !important;
}

.el-input__inner:focus {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
}

.verify-code-container {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.verify-code-input {
  flex: 1;
  margin-bottom: 0;
}

.login-code-img {
  height: 45px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.login-code-img:hover {
  transform: scale(1.02);
}

.login-button {
  width: 100%;
  height: 45px;
  margin-top: 20px;
  background: linear-gradient(45deg, #1890ff, #40a9ff) !important;
  border: none !important;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  transition: all 0.3s ease !important;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3) !important;
}

.divider-container {
  margin: 30px 0;
}

.third-party-login {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.third-party-login .el-button {
  padding: 8px;
  border-radius: 8px;
  background: #f5f5f5 !important;
  border: none !important;
  transition: all 0.3s ease !important;
}

.third-party-login .el-button:hover {
  background: #e6f7ff !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 右侧插画样式 */
.login-banner {
  width: 500px;
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.login-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 30% 20%, rgba(24, 144, 255, 0.1) 0%, transparent 25%),
    radial-gradient(circle at 70% 80%, rgba(24, 144, 255, 0.1) 0%, transparent 25%);
}

.banner-image {
  width: 80%;
  max-width: 400px;
  margin-bottom: 30px;
  filter: drop-shadow(0 4px 8px rgba(24, 144, 255, 0.1));
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.banner-text {
  text-align: center;
  position: relative;
  z-index: 1;
}

.banner-text h3 {
  font-size: 28px;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #1890ff, #40a9ff);
  -webkit-background-clip: text;
  color: transparent;
}

.banner-text p {
  font-size: 16px;
  color: #666;
  margin: 0;
  line-height: 1.6;
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .login-box {
    width: 90%;
    height: auto;
    flex-direction: column;
  }

  .login-banner {
    width: 100%;
    padding: 30px;
  }

  .banner-image {
    width: 60%;
  }
}

@media screen and (max-width: 768px) {
  .login-form {
    padding: 30px 20px;
  }

  .login-banner {
    display: none;
  }
}
</style>
