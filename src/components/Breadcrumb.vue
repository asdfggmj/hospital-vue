<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
      <router-link v-if="item.path" :to="item.path">
        {{ item.label }}
      </router-link>
      <span v-else>{{ item.label }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'AppBreadcrumb',
  setup() {
    const route = useRoute()

    const breadcrumbs = computed(() => {
      return route.matched
        .filter((r) => r.meta.breadcrumb)
        .map((r) => ({
          label: r.meta.breadcrumb,
          path: r.path !== route.path ? r.path : '',
        }))
    })

    return {
      breadcrumbs,
    }
  },
}
</script>

<style scoped>
.el-breadcrumb {
  line-height: 1;
  padding: 16px 0;
}
</style>
