<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="main-container">
    <div class="breadcrumb-container">
      <Breadcrumb />
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import Breadcrumb from './Breadcrumb.vue'

export default {
  name: 'AppMain',
  components: {
    Breadcrumb,
  },
}
</script>

<style scoped>
.main-container {
  height: 100%;
}

.breadcrumb-container {
  background-color: #fff;
  padding: 0 20px;
  margin: -20px -20px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}
</style>
