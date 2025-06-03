import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useDictTypeStore = defineStore('dictTypeStore', () => {
  // 存储字典类型数据
  const dictType = ref({})

  // Getters：获取字典类型数据
  const getDictType = computed(() => dictType.value)

  // Actions：设置字典类型数据
  function setDictType(newDictType) {
    dictType.value = newDictType
  }

  // 暴露变量和方法
  return { dictType, getDictType, setDictType }
})
