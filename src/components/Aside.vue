<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <el-row class="aside-container">
    <el-col :span="24" class="aside-col">
      <el-scrollbar class="custom-scrollbar">
        <el-menu class="el-menu-vertical-demo" :default-active="activeMenu">
          <!-- 首页 -->
          <el-menu-item index="/home" @click="navigateTo('/home')">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <!-- 循环遍历菜单 -->
          <el-sub-menu
            v-for="parentMenu in menuData"
            :key="parentMenu.menuId"
            :index="String(parentMenu.menuId)"
          >
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>{{ parentMenu.menuName }}</span>
            </template>
            <!-- 子菜单循环遍历 -->
            <el-menu-item
              v-for="childrenMenu in parentMenu.childMenus"
              :key="childrenMenu.menuId"
              :index="childrenMenu.path"
              @click="navigateTo(childrenMenu.path)"
            >
              {{ childrenMenu.menuName }}
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import http from '@/http'
import { useUserStore } from '@/stores/user'
import { House, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const menuData = ref([]) // 菜单数据
const router = useRouter() // 获取路由实例
const activeMenu = ref(router.currentRoute.value.path) // 绑定当前激活菜单

const navigateTo = (path: string) => {
  if (router.currentRoute.value.path !== path) {
    router.push(path)
  }
}

// 监听路由变化，保持菜单高亮
watch(
  () => router.currentRoute.value.path,
  (newPath) => {
    activeMenu.value = newPath
  },
)

onMounted(() => {
  getMenus()
})

const getMenus = async () => {
  try {
    const userStore = useUserStore()
    const userData = userStore.getUser

    if (!userData) {
      ElMessage.error('用户不存在或未加载成功')
      return
    }

    if (menuData.value.length === 0) {
      const response = await http.get('/menu/menu/getUserMenus')
      menuData.value = response.data.data || []
      console.log(menuData.value)
    }
  } catch (error) {
    ElMessage.error('获取菜单失败: ' + error)
  }
}
</script>

<style scoped>
.aside-container {
  height: 100%;
  background-color: #fff;
  border-right: 1px solid var(--el-border-color-light);
}

.aside-col {
  height: 100%;
}

:deep(.el-scrollbar) {
  height: calc(100vh - 60px); /* 60px 是 Element Plus 默认导航栏高度 */
}

/* 自定义滚动条样式 */
:deep(.custom-scrollbar) {
  .el-scrollbar__bar.is-vertical {
    width: 6px;
    right: 0;
  }

  .el-scrollbar__thumb {
    background-color: var(--el-text-color-placeholder);
    opacity: 0;
  }

  &:hover {
    .el-scrollbar__thumb {
      opacity: 0;
    }
  }
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  height: 56px;
  line-height: 56px;
  transition: all 0.3s;

  &:hover {
    background-color: var(--el-menu-hover-bg-color);
  }

  &.is-active {
    background-color: var(--el-menu-hover-bg-color);
    border-right: 2px solid var(--el-color-primary);
    color: var(--el-color-primary);
  }
}

:deep(.el-sub-menu .el-menu-item) {
  min-width: 199px;
  padding-left: 40px !important;
}

:deep(.el-sub-menu__title) {
  height: 56px;
  line-height: 56px;
  transition: all 0.3s;

  &:hover {
    background-color: var(--el-menu-hover-bg-color);
  }
}

:deep(.el-icon) {
  width: 24px;
  text-align: center;
  font-size: 18px;
  margin-right: 5px;
  transition: all 0.3s;
}
</style>
