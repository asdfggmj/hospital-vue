<!-- 用户列表示例 -->
<template>
  <div class="user-list">
    <!-- 使用基础表格组件 -->
    <base-table
      :data="tableData"
      :loading="loading"
      :total="total"
      show-selection
      @search="handleSearch"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @selection-change="handleSelectionChange"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 自定义表格列 -->
      <template #columns>
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="role" label="角色" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
      </template>
    </base-table>

    <!-- 使用基础表单组件 -->
    <base-form
      v-model="formData"
      v-model:visible="dialogVisible"
      :title="formTitle"
      :rules="rules"
      :loading="formLoading"
      @submit="handleSubmit"
    >
      <template #form-items="{ form }">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </template>
    </base-form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import BaseTable from '@/components/crud/BaseTable.vue'
import BaseForm from '@/components/crud/BaseForm.vue'

export default {
  name: 'UserList',
  components: {
    BaseTable,
    BaseForm,
  },
  setup() {
    // 表格相关
    const loading = ref(false)
    const tableData = ref([])
    const total = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const searchKeyword = ref('')
    const selectedRows = ref([])

    // 表单相关
    const dialogVisible = ref(false)
    const formLoading = ref(false)
    const formTitle = ref('新增用户')
    const formData = ref({
      username: '',
      name: '',
      email: '',
      phone: '',
      role: '',
      status: 1,
    })

    // 表单校验规则
    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
      ],
      name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
      ],
      phone: [
        { required: true, message: '请输入电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
      ],
      role: [{ required: true, message: '请选择角色', trigger: 'change' }],
    }

    // 获取用户列表
    const getUserList = async () => {
      loading.value = true
      try {
        // 这里替换为实际的API调用
        const response = await mockGetUserList({
          page: currentPage.value,
          pageSize: pageSize.value,
          keyword: searchKeyword.value,
        })
        tableData.value = response.data
        total.value = response.total
      } catch (error) {
        ElMessage.error('获取用户列表失败')
      } finally {
        loading.value = false
      }
    }

    // 搜索处理
    const handleSearch = (keyword) => {
      searchKeyword.value = keyword
      currentPage.value = 1
      getUserList()
    }

    // 新增处理
    const handleAdd = () => {
      formTitle.value = '新增用户'
      formData.value = {
        username: '',
        name: '',
        email: '',
        phone: '',
        role: '',
        status: 1,
      }
      dialogVisible.value = true
    }

    // 编辑处理
    const handleEdit = (row) => {
      formTitle.value = '编辑用户'
      formData.value = { ...row }
      dialogVisible.value = true
    }

    // 删除处理
    const handleDelete = async (row) => {
      try {
        // 这里替换为实际的API调用
        await mockDeleteUser(row.id)
        ElMessage.success('删除成功')
        getUserList()
      } catch (error) {
        ElMessage.error('删除失败')
      }
    }

    // 多选处理
    const handleSelectionChange = (selection) => {
      selectedRows.value = selection
    }

    // 分页大小改变
    const handleSizeChange = (val) => {
      pageSize.value = val
      getUserList()
    }

    // 当前页改变
    const handleCurrentChange = (val) => {
      currentPage.value = val
      getUserList()
    }

    // 表单提交
    const handleSubmit = async (data) => {
      formLoading.value = true
      try {
        // 这里替换为实际的API调用
        if (data.id) {
          await mockUpdateUser(data)
          ElMessage.success('更新成功')
        } else {
          await mockCreateUser(data)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        getUserList()
      } catch (error) {
        ElMessage.error(data.id ? '更新失败' : '创建失败')
      } finally {
        formLoading.value = false
      }
    }

    // 模拟API调用
    const mockGetUserList = ({ page, pageSize, keyword }) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const list = Array(pageSize)
            .fill(0)
            .map((_, index) => ({
              id: page * pageSize + index + 1,
              username: `user${page * pageSize + index + 1}`,
              name: `用户${page * pageSize + index + 1}`,
              email: `user${page * pageSize + index + 1}@example.com`,
              phone: '13800138000',
              role: index % 2 === 0 ? 'admin' : 'user',
              status: index % 3 === 0 ? 0 : 1,
            }))
          resolve({
            data: list,
            total: 100,
          })
        }, 500)
      })
    }

    const mockCreateUser = (data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ ...data, id: Date.now() })
        }, 500)
      })
    }

    const mockUpdateUser = (data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(data)
        }, 500)
      })
    }

    const mockDeleteUser = (id) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id })
        }, 500)
      })
    }

    onMounted(() => {
      getUserList()
    })

    return {
      // 表格相关
      loading,
      tableData,
      total,
      handleSearch,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSelectionChange,
      handleSizeChange,
      handleCurrentChange,

      // 表单相关
      dialogVisible,
      formLoading,
      formTitle,
      formData,
      rules,
      handleSubmit,
    }
  },
}
</script>

<style scoped>
.user-list {
  padding: 20px;
}
</style>
