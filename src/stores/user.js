import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('counter', () => {
  //存储用户对象数据
  const user = ref({})

  //getters获取数据定义计算属性
  const getUser = computed(() => user.value)

  //actions操作用户数据
  function setUser(inputUser) {
    user.value = inputUser
  }

  //暴露组件
  return { user, getUser, setUser }
})
