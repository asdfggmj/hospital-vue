<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu-demo"
    mode="horizontal"
    :ellipsis="false"
    style="padding: 0; border-bottom: 1px solid var(--el-border-color-light)"
  >
    <el-menu-item index="0" @click="router.push('/home')" class="logo-container">
      <img style="height: 60px" src="../assets/images/home/menuLogo.png" alt="Element logo" />
    </el-menu-item>

    <div class="right-menu">
      <!-- 全屏按钮 -->
      <el-tooltip effect="dark" content="全屏" placement="bottom">
        <el-button class="right-menu-item" type="primary" link @click="toggleFullScreen">
          <el-icon :size="20">
            <FullScreen v-if="!isFullscreen" />
            <Aim v-else />
          </el-icon>
        </el-button>
      </el-tooltip>

      <!-- 主题切换 -->
      <el-tooltip effect="dark" :content="isDark ? '浅色模式' : '深色模式'" placement="bottom">
        <el-button class="right-menu-item" type="primary" link @click="toggleTheme">
          <el-icon :size="20">
            <Moon v-if="!isDark" />
            <Sunny v-else />
          </el-icon>
        </el-button>
      </el-tooltip>

      <!-- 公告按钮 -->
      <el-tooltip effect="dark" content="系统公告" placement="bottom">
        <el-button class="right-menu-item" type="primary" link @click="chatNotice">
          <el-badge :value="noticeCount" :max="99" class="notice-badge">
            <el-icon :size="20"><Bell /></el-icon>
          </el-badge>
        </el-button>
      </el-tooltip>

      <!-- 用户菜单 -->
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="avatar-container">
          <el-avatar :size="36" :src="userInfo.avatar">
            {{ userInfo.userName?.charAt(0)?.toUpperCase() }}
          </el-avatar>
          <div class="user-info">
            <span class="username">{{ userInfo.userName }}</span>
            <el-icon><CaretBottom /></el-icon>
          </div>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>个人信息
            </el-dropdown-item>
            <el-dropdown-item command="password">
              <el-icon><Lock /></el-icon>修改密码
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-menu>
</template>

<script>
import router from '@/router'
import { useUserStore } from '@/stores/user'
import {
  Bell,
  FullScreen,
  Aim,
  Moon,
  Sunny,
  CaretBottom,
  User,
  Lock,
  SwitchButton,
} from '@element-plus/icons-vue'
import { useCookies } from '@vueuse/integrations/useCookies'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'

export default {
  name: 'AppHeader',
  components: {
    Bell,
    FullScreen,
    Aim,
    Moon,
    Sunny,
    CaretBottom,
    User,
    Lock,
    SwitchButton,
  },
  setup() {
    const cookie = useCookies()
    const userStore = useUserStore()
    const activeIndex = ref('1')
    const noticeCount = ref(5)
    const userInfo = ref({
      userName: '',
      avatar: '',
    })
    const isFullscreen = ref(false)
    const isDark = ref(false)

    // 切换全屏
    const toggleFullScreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
        isFullscreen.value = true
      } else {
        document.exitFullscreen()
        isFullscreen.value = false
      }
    }

    // 切换主题
    const toggleTheme = () => {
      isDark.value = !isDark.value
      document.documentElement.classList.toggle('dark')
    }

    // 查看公告
    const chatNotice = () => {
      ElMessage.info('正在开发中...')
    }

    // 处理下拉菜单命令
    const handleCommand = (command) => {
      switch (command) {
        case 'profile':
          router.push('/user/profile')
          break
        case 'password':
          ElMessage.info('修改密码功能开发中...')
          break
        case 'logout':
          logout()
          break
      }
    }

    // 退出登录
    const logout = () => {
      ElMessageBox.confirm('确定要退出此账号吗？', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        router.push('/login')
        ElMessage.success('已安全退出系统')
        cookie.remove('Authorization')
        localStorage.removeItem('activeMenu')
      })
    }

    onMounted(() => {
      const user = userStore.getUser
      userInfo.value = {
        userName: user?.userName || '',
        avatar: user?.picture || '',
      }
    })

    return {
      cookie,
      activeIndex,
      noticeCount,
      userInfo,
      isFullscreen,
      isDark,
      chatNotice,
      handleCommand,
      logout,
      toggleFullScreen,
      toggleTheme,
    }
  },
}
</script>

<style scoped>
.el-menu {
  --el-menu-bg-color: #fff;
  --el-menu-hover-bg-color: var(--el-color-primary-light-9);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: relative;
  z-index: 100;
}

.logo-container {
  padding: 0;
  margin-right: 30px;
  transition: all 0.3s;
}

.logo-container:hover {
  background-color: var(--el-menu-hover-bg-color);
}

.right-menu {
  display: flex;
  align-items: center;
  margin-left: auto;
  padding-right: 20px;
  height: 100%;
}

.right-menu-item {
  padding: 0 10px;
  font-size: 18px;
  color: var(--el-text-color-regular);
  vertical-align: text-bottom;
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: var(--el-menu-hover-bg-color);
    color: var(--el-color-primary);
  }
}

.notice-badge :deep(.el-badge__content) {
  top: 12px;
  right: 0;
}

.avatar-container {
  display: flex;
  align-items: center;
  padding: 0 8px;
  margin-left: 10px;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 4px;

  &:hover {
    background-color: var(--el-menu-hover-bg-color);
  }
}

.user-info {
  margin-left: 8px;
  display: flex;
  align-items: center;
}

.username {
  font-size: 14px;
  margin-right: 4px;
  color: var(--el-text-color-regular);
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  padding: 8px 16px;

  .el-icon {
    margin-right: 8px;
    font-size: 16px;
  }
}

/* 深色模式样式 */
:root.dark {
  --el-menu-bg-color: #1f1f1f;
  --el-menu-hover-bg-color: #2c2c2c;
  --el-text-color-regular: #e5eaf3;
  --el-border-color-light: #4c4d4f;
}

:root.dark .el-menu {
  background-color: var(--el-menu-bg-color);
  border-color: var(--el-border-color-light);
}

:root.dark .right-menu-item {
  color: var(--el-text-color-regular);
}

:root.dark .username {
  color: var(--el-text-color-regular);
}
</style>
