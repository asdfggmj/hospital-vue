<!-- 基础表格组件 -->
<template>
  <div class="base-table">
    <!-- 表格顶部操作区 -->
    <div class="table-header">
      <div class="left-area">
        <slot name="tableHeader">
          <!-- 默认的新增按钮 -->
          <el-button type="primary" @click="handleAdd" v-if="showAdd">
            <el-icon><Plus /></el-icon>新增
          </el-button>
        </slot>
      </div>

      <!-- 搜索区域 -->
      <div class="right-area">
        <slot name="search">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入关键字搜索"
            class="search-input"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </slot>
      </div>
    </div>

    <!-- 表格主体 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      stripe
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <!-- 复选框列 -->
      <el-table-column v-if="showSelection" type="selection" width="55" />

      <!-- 序号列 -->
      <el-table-column v-if="showIndex" type="index" label="序号" width="60" />

      <!-- 动态列 -->
      <slot name="columns" />

      <!-- 操作列 -->
      <el-table-column v-if="showOperations" label="操作" :width="operationWidth" fixed="right">
        <template #default="scope">
          <slot name="operations" :row="scope.row">
            <el-button v-if="showEdit" type="primary" link @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button v-if="showDelete" type="danger" link @click="handleDelete(scope.row)">
              删除
            </el-button>
          </slot>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container" v-if="showPagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, defineEmits } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'BaseTable',
  components: {
    Plus,
    Search,
  },
  props: {
    // 表格数据
    data: {
      type: Array,
      default: () => [],
    },
    // 是否显示加载状态
    loading: {
      type: Boolean,
      default: false,
    },
    // 是否显示复选框列
    showSelection: {
      type: Boolean,
      default: false,
    },
    // 是否显示序号列
    showIndex: {
      type: Boolean,
      default: true,
    },
    // 是否显示操作列
    showOperations: {
      type: Boolean,
      default: true,
    },
    // 操作列宽度
    operationWidth: {
      type: String,
      default: '150',
    },
    // 是否显示新增按钮
    showAdd: {
      type: Boolean,
      default: true,
    },
    // 是否显示编辑按钮
    showEdit: {
      type: Boolean,
      default: true,
    },
    // 是否显示删除按钮
    showDelete: {
      type: Boolean,
      default: true,
    },
    // 是否显示分页
    showPagination: {
      type: Boolean,
      default: true,
    },
    // 总数据条数
    total: {
      type: Number,
      default: 0,
    },
  },
  setup(props, { emit }) {
    const searchKeyword = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const tableData = ref(props.data)
    const multipleSelection = ref([])

    // 搜索处理
    const handleSearch = () => {
      emit('search', searchKeyword.value)
    }

    // 新增处理
    const handleAdd = () => {
      emit('add')
    }

    // 编辑处理
    const handleEdit = (row) => {
      emit('edit', row)
    }

    // 删除处理
    const handleDelete = (row) => {
      ElMessageBox.confirm('确定要删除该记录吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          emit('delete', row)
        })
        .catch(() => {
          ElMessage.info('已取消删除')
        })
    }

    // 多选处理
    const handleSelectionChange = (selection) => {
      multipleSelection.value = selection
      emit('selection-change', selection)
    }

    // 分页大小改变
    const handleSizeChange = (val) => {
      pageSize.value = val
      emit('size-change', val)
    }

    // 当前页改变
    const handleCurrentChange = (val) => {
      currentPage.value = val
      emit('current-change', val)
    }

    return {
      searchKeyword,
      currentPage,
      pageSize,
      tableData,
      multipleSelection,
      handleSearch,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSelectionChange,
      handleSizeChange,
      handleCurrentChange,
    }
  },
}
</script>

<style scoped>
.base-table {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.left-area {
  display: flex;
  gap: 10px;
}

.right-area {
  display: flex;
  gap: 10px;
}

.search-input {
  width: 200px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
