<!-- 基础表单组件 -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" class="base-form">
      <slot name="form-items" :form="formData"></slot>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading"> 确 定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, defineEmits, watch } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'BaseForm',
  props: {
    // 对话框标题
    title: {
      type: String,
      default: '表单',
    },
    // 是否显示对话框
    visible: {
      type: Boolean,
      default: false,
    },
    // 表单数据
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    // 表单校验规则
    rules: {
      type: Object,
      default: () => ({}),
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:visible', 'update:modelValue', 'submit'],
  setup(props, { emit }) {
    const formRef = ref(null)
    const dialogVisible = ref(props.visible)
    const formData = ref({ ...props.modelValue })

    // 监听visible属性变化
    watch(
      () => props.visible,
      (val) => {
        dialogVisible.value = val
      },
    )

    // 监听modelValue属性变化
    watch(
      () => props.modelValue,
      (val) => {
        formData.value = { ...val }
      },
    )

    // 监听dialogVisible变化
    watch(dialogVisible, (val) => {
      emit('update:visible', val)
    })

    // 关闭对话框
    const handleClose = () => {
      dialogVisible.value = false
      formRef.value?.resetFields()
    }

    // 提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return

      try {
        await formRef.value.validate()
        emit('submit', formData.value)
      } catch (error) {
        ElMessage.error('请检查表单填写是否正确')
      }
    }

    return {
      formRef,
      dialogVisible,
      formData,
      handleClose,
      handleSubmit,
    }
  },
}
</script>

<style scoped>
.base-form {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
