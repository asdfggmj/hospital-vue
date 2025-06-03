<template>
  <router-view />
</template>

<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 监听路由变化，动态更新标题
watch(
  route,
  (to) => {
    document.title = to.meta.title || '医疗一体站管理系统'
  },
  { immediate: true },
) // 使用 immediate: true 以便页面加载时立刻更新标题
</script>
