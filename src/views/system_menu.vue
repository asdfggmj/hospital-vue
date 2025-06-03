<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- 第一行 -->
  <el-row>
    <el-col :span="24">
      <el-card shadow="always" class="mb-10px">
        <el-row justify="space-between">
          <el-col :span="12">
            <el-button type="primary" @click="addMenu">
              <el-icon><Plus /></el-icon>
              <span>新增目录</span>
            </el-button>
            <!-- <el-button type="danger" @click="batchDelete">
              <el-icon><Minus /></el-icon>
              <span>删除选中菜单</span>
            </el-button> -->
          </el-col>
          <!-- 模糊查询 -->
          <el-col :span="5">
            <el-input
              v-model="keyWord"
              @change="searchMenu"
              placeholder="请输入菜单名称"
              clearable
              size=""
            />
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
  <el-row>
    <el-col>
      <el-card shadow="always" v-loading="loading">
        <!-- 菜单行 -->
        <el-row>
          <el-col>
            <el-table
              :data="menuData"
              row-key="menuId"
              border
              max-height="560"
              :tree-props="{ children: 'childMenus', hasChildren: 'hasChildren' }"
              default-expand-none
              stripe
              @selection-change="handleSelectionChange"
            >
              <el-table-column prop="menuName" label="菜单名称" width="160" />
              <el-table-column prop="menuType" label="类型">
                <template #default="scope">
                  <el-tag effect="dark" :type="getMenuTagType(scope.row.menuType)">
                    {{ scope.row.menuType }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="path" label="组件路径" width="200" />
              <el-table-column prop="percode" label="权限标识" width="120">
                <template #default="scope">
                  <el-tag v-if="scope.row.percode === null">空的呢</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="菜单状态" width="120">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.status"
                    :before-change="
                      () =>
                        handleBeforeChange(
                          scope.row.menuId,
                          scope.row.status === '0' ? '1' : '0',
                          scope.row.menuName,
                        )
                    "
                    :active-value="'0'"
                    :inactive-value="'1'"
                    active-text="正常"
                    inactive-text="禁用"
                    class="ml-2"
                    inline-prompt
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                    :loading="rowLoadingMap[scope.row.menuId]"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" width="120" />
              <el-table-column label="操作" width="220" fixed="right">
                <!-- 按钮组 -->
                <template #default="scope">
                  <el-button-group>
                    <el-button type="success" size="small" @click="editMenu(scope.row.menuId)">
                      <el-icon><Edit /></el-icon>
                      <span>编辑</span>
                    </el-button>
                    <el-button type="danger" size="small" @click="delMenu(scope.row.menuId)">
                      <el-icon><Delete /></el-icon>
                      <span>删除</span>
                    </el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
        <!-- 分页行 -->
        <el-row class="mt-10px">
          <el-col :span="24">
            <el-pagination
              background
              layout="total,sizes,prev, pager, next,jumper"
              :total="pageTotal"
              :pager-count="11"
              :page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :current-page="pageNum"
              @size-change="sizeChange"
              @current-change="currentChange"
            />
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>

  <!-- 添加菜单和编辑菜单抽屉 -->
  <el-drawer
    v-model="addOrEditDrawerModal"
    :title="addOrEditDrawerTitle"
    size="30%"
    :before-close="beforeChangeAddOrEditDrawer"
  >
    <el-row>
      <el-col :span="20">
        <el-form :model="menuObject" label-width="auto" style="max-width: 600px">
          <el-input v-model="menuObject.menuId" style="display: none" />
          <el-form-item label="上级菜单">
            <el-select
              id="parentSelect"
              v-model="menuObject.parentId"
              @click="getParentsMenu"
              placeholder="所属科室"
            >
              <el-option
                v-for="item in parentMenuData"
                :key="item.menuId"
                :label="item.menuName"
                :value="item.menuId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="菜单名称">
            <el-input v-model="menuObject.menuName" placeholder="请输入菜单名" />
          </el-form-item>
          <el-form-item label="路由地址">
            <el-input v-model="menuObject.path" placeholder="请输入路由地址" />
          </el-form-item>
          <el-form-item label="权限标识">
            <el-input placeholder="请输入权限标识" />
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="menuObject.status">
              <el-radio value="0">正常</el-radio>
              <el-radio value="1">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="menuObject.remark" type="textarea" />
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-divider />
    <el-row class="text-center">
      <el-col>
        <el-button @click="handleSubmit" type="primary">提交</el-button>
        <el-button type="primary" @click="addOrEditDrawerModal = false">取消</el-button>
      </el-col>
    </el-row>
  </el-drawer>
</template>

<script setup lang="ts">
import http from '@/http'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

const addOrEditDrawerModal = ref(false) //添加或编辑角色抽屉
const addOrEditDrawerTitle = ref('') //添加或编辑角色抽屉标题
const pageNum = ref(1) //当前页
const pageSize = ref(10) //每页显示的数据
const pageTotal = ref(0) //总个数
const keyWord = ref('') //关键字
const rowLoadingMap = reactive({}) //是否处于加载状态
let menuData = ref([]) //菜单响应式数据
let parentMenuData = ref([]) //父菜单响应式数据
let dids = ref([]) //存储选中的字典数据编号的数组
const loading = ref(true) //表格加载动画

//角色对象，用于存储添加或修改的角色信息
const menuObject = reactive({
  menuId: '',
  parentId: '',
  parentIds: '',
  menuName: '',
  menuType: '',
  perCode: '',
  path: '',
  remark: '',
  status: '0',
  createTime: '',
  updateTime: '',
  createBy: '',
  updateBy: '',
})

//计算菜单类别名字
const getMenuTagType = computed(() => (tagTypeName) => {
  if (tagTypeName === 'M') return 'primary'
  if (tagTypeName === 'N') return 'success'
  if (tagTypeName === 'C') return 'warning'
  return 'danger'
})

//模糊查询
const searchMenu = (keyWordInput) => {
  keyWord.value = keyWordInput
  getMenus()
}

//添加菜单抽屉
const addMenu = () => {
  //清空菜单对象
  menuObject.parentId = ''
  menuObject.menuName = ''
  menuObject.menuType = ''
  menuObject.status = '0'
  menuObject.path = ''

  addOrEditDrawerTitle.value = '添加菜单'
  addOrEditDrawerModal.value = true
}

const queryMenuObj = reactive({
  pageNum: pageNum.value,
  pageSize: pageSize.value,
  menuName: keyWord.value,
})

//添加菜单
const addMenuSubmit = () => {
  // console.log("添加的数据"+roleObject)
  //后端发送添加菜单请求
  http.post('/menu/menu/save', menuObject).then((res) => {
    if ((res.data.code = '00000')) {
      ElMessage.success('添加成功')
      addOrEditDrawerModal.value = false
    } else {
      ElMessage.error('添加失败')
    }
    getMenus()
  })
}

// 监听多选
const handleSelectionChange = (val) => {
  //console.log('当前选中的数据:', val) // ✅ 确保这里不是空的
  dids.value = val
}

//批量删除
const batchDelete = async () => {
  if (dids.value.length === 0) {
    return ElMessage.warning('请选择要删除的项！')
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${dids.value.length} 条记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    //提取id
    const ids = dids.value.map((item) => item.dictCode)
    // 调用 API 批量删除
    await http.post('/dictData/batchDelete', { ids }).then((res) => {
      // 重新查询一遍数据
      if (res.data.data) {
        getMenus()
        ElMessage.success('批量删除成功！')
      }
    })
  } catch (error) {
    ElMessage.error('批量删除有误,请重试!', error)
  }
  keyWord.value = ''
}

//删除菜单
const delMenu = (menuId) => {
  ElMessageBox.confirm('确定删除编号为' + menuId + '的菜单？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    //删除菜单
    http.post(`/menu/menu/delMenu/${menuId}`).then((res) => {
      if (res.data.code === '00000') {
        ElMessage.success('删除成功')
        getMenus()
      } else {
        throw new Error('菜单删除失败')
      }
    })
  })
}

//修改菜单抽屉
const editMenu = (menuId: string) => {
  addOrEditDrawerTitle.value = '编辑菜单'
  addOrEditDrawerModal.value = true
  //回调单个菜单数据
  http
    .get(`/menu/menu/getMenu/` + menuId)
    .then((res) => {
      if (res.data) {
        console.log(res.data.data)
        if (res.data.data.parentId === 0) {
          console.log('进入了')
          menuObject.menuId = '1222'
        } else {
          menuObject.menuId = menuId
        }
        menuObject.parentId = res.data.data.parentId
        menuObject.menuName = res.data.data.menuName
        menuObject.menuType = res.data.data.menuType
        menuObject.status = res.data.data.status
        menuObject.path = res.data.data.path
        menuObject.remark = res.data.data.remark
      }
    })
    .catch((error) => {
      // ElMessage.error('获取菜单数据失败'+error)
    })
}

//修改菜单
const updateMenuSubmit = () => {
  // console.log("修改的数据"+userObject)
  //后端发送修改菜单请求
  http.post('/menu/menu/update', menuObject).then((res) => {
    if (res.data.code === '00000') {
      ElMessage.success('修改成功')
      addOrEditDrawerModal.value = false
      getMenus()
    } else {
      ElMessage.error('操作有误,请重试!')
    }
    getMenus()
  })
}

//判断当前抽屉的按钮操作是添加还是修改
const handleSubmit = () => {
  if (addOrEditDrawerTitle.value === '添加菜单') {
    addMenuSubmit() // 调用添加菜单的方法
  } else if (addOrEditDrawerTitle.value === '编辑菜单') {
    updateMenuSubmit() // 调用修改菜单的方法
  }
}

//关闭抽屉前提示用户是否关闭
const beforeChangeAddOrEditDrawer = () => {
  ElMessageBox.confirm('你确定要关闭吗?所有数据将不会做任何保存', '温馨提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      addOrEditDrawerModal.value = false
      //deptData.splice(0, deptData.length)
    })
    .catch(() => {
      return
    })
}

//按钮切换主逻辑方法
const handleBeforeChange = async (menuId, menuStatus, menuName) => {
  //将当前开关的动画状态开启
  rowLoadingMap[menuId] = true
  try {
    //执行beforeChange和更改用户状态
    await beforeChange()
    await updateMenuStatus(menuId, menuStatus, menuName)
    return true
  } catch (error) {
    console.error(error.message)
    return false // 阻止状态切换
  } finally {
    rowLoadingMap[menuId] = false
  }
}

// 修改菜单状态改变事件
const updateMenuStatus = async (menuId, menuStatus, menuName) => {
  //menuId = menuId.parseInt(menuId);
  try {
    const response = await http.put(`/menu/menu/update/${menuId}/${menuStatus}`)
    if (response.data.data) {
      ElNotification({
        title: '修改成功!',
        message: `菜单 ${menuName} 的状态已更新为 ${menuStatus === 0 ? '启用' : '禁用'}`,
        type: 'success',
        offset: 50,
        duration: 3000,
      })
      //刷新
      getMenus()
    } else {
      throw new Error('状态更新失败')
    }
  } catch (error) {
    console.error(error)
    ElNotification({
      title: '修改失败!',
      message: '状态更新时发生错误，请稍后重试.',
      type: 'error',
      offset: 50,
      duration: 3000,
    })
    throw error
  }
  //刷新
  //getMenus()
}

//上一页
const sizeChange = (newPageSize) => {
  pageSize.value = newPageSize
  getMenus()
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
  getMenus()
}

//判断修改菜单状态前逻辑，判断菜单id是否相同，如果相同拦截并不让更改，否则放行
const beforeChange = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
}

//获取父菜单
const getParentsMenu = async () => {
  try {
    const response = await http.get('/menu/menu/getParentMenus')
    parentMenuData.value = response.data.data
  } catch (error) {
    console.error('获取父菜单失败', error)
  }
}

//初始化钩子
onMounted(() => {
  getMenus()
})

//获取所有菜单信息
const getMenus = async () => {
  try {
    const response = await http.post('/menu/menu/list', queryMenuObj)
    const list = Array.isArray(response.data.data.list) ? response.data.data.list : []
    // // 将 status 转换为数字类型
    // list.forEach(item => {
    //     item.status = item.status
    //   })
    menuData.value = buildMenuTree(list) //处理为树形结构
    pageTotal.value = menuData.value.length
    setTimeout(() => {
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取菜单失败', error)
  }
}

// 递归构造树形菜单
const buildMenuTree = (menuList) => {
  const menuMap = new Map()
  const tree = []

  // 将数据存入 Map，方便查找
  menuList.forEach((item) => menuMap.set(item.menuId, { ...item, children: [] }))
  //console.log(menuMap)

  // 构建树
  menuList.forEach((item) => {
    if (item.parentId !== 0) {
      const parent = menuMap.get(item.parentId)
      if (parent) {
        parent.children.push(menuMap.get(item.menuId))
      }
    } else {
      tree.push(menuMap.get(item.menuId))
    }
  })
  return tree
}
</script>

<style>
.mr-20px {
  margin-right: 20px;
}
.mt-10px {
  margin-top: 10px;
}
.mb-10px {
  margin-bottom: 10px;
}
.ml-10px {
  margin-left: 10px;
}
.text-center {
  text-align: center;
}
</style>
