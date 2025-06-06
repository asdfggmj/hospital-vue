<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- 第一行 -->
  <el-row>
    <el-col :span="24">
      <el-card shadow="always" class="mb-10px">
        <el-row justify="space-between">
          <el-col :span="12">
            <el-button type="primary" @click="addUser">
              <el-icon><Plus /></el-icon>
              <span>新增用户</span>
            </el-button>
            <!-- <el-button type="success">
              <el-icon><Refresh /></el-icon>
              <span>重置选中用户账号</span>
            </el-button> -->
            <el-button type="danger">
              <el-icon><Minus /></el-icon>
              <span>删除选中用户</span>
            </el-button>
          </el-col>
          <!-- 模糊查询 -->
          <el-col :span="5">
            <el-input
              v-model="keyWord"
              @change="searchUser"
              placeholder="请输入用户名"
              clearable
              size=""
            />
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
  <!-- 第二行 -->
  <el-row>
    <el-col :span="24">
      <el-card shadow="always" v-loading="loading">
        <!-- 表格 -->
        <el-row class="mt-10px">
          <el-col>
            <el-table :data="userData" style="width: 100%" max-height="500" row-key="userId" border>
              <el-table-column fixed type="selection" width="55" />
              <el-table-column label="用户头像" property="picture" width="100">
                <template #default="scope">
                  <el-image style="width: 48px; height: 48px" :src="`${scope.row.picture}`" />
                </template>
              </el-table-column>
              <el-table-column label="用户姓名" prop="userName" width="120" />
              <el-table-column label="所属部门" width="120">
                <template #default="{ row }">
                  {{ getDeptName(row.deptId) }}
                </template>
              </el-table-column>
              <el-table-column label="手机号码" prop="phone" width="120" />
              <el-table-column label="用户类型" prop="userType" width="120">
                <template #default="scope">
                  <el-tag :type="userTypeComputed(scope.row.userType)">
                    {{ scope.row.userType === 0 ? '超级用户' : '系统用户' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="性别" prop="sex">
                <template #default="scope">
                  <el-tag effect="dark" :type="sexComputedFetch(scope.row.sex)">
                    {{
                    scope.row.sex === 0 ? '男' : scope.row.sex === 1 ? '女' : '未知'
                    }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="是否参与排班" prop="schedulingFlag" width="120">
                <template #default="scope">
                  <el-tag
                    effect="dark"
                    :type="schedulingFlagComputedFetch(scope.row.schedulingFlag)"
                    >{{ scope.row.schedulingFlag === '0' ? '是' : '否' }}</el-tag
                  >
                </template>
              </el-table-column>
              <el-table-column label="年龄" prop="age" />
              <el-table-column label="级别" prop="userRank" width="100" />
              <el-table-column label="教育背景" prop="background" width="100" />
              <el-table-column label="用户状态" prop="status" width="100">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.status"
                    :before-change="
                      () =>
                        handleBeforeChange(
                          scope.row.userId,
                          scope.row.status === 0 ? '1' : '0',
                          scope.row.userName,
                        )
                    "
                    :active-value="0"
                    :inactive-value="1"
                    active-text="正常"
                    inactive-text="禁用"
                    class="ml-2"
                    inline-prompt
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                    :loading="rowLoadingMap[scope.row.userId]"
                  />
                </template>
              </el-table-column>
              <!-- 按钮组 -->
              <el-table-column label="操作" fixed="right" width="240">
                <template #default="scope">
                  <el-button-group>
                    <el-button type="success" size="small" @click="editUser(scope.row.userId)">
                      <el-icon><Edit /></el-icon>
                      <span>编辑</span>
                    </el-button>
                    <el-button type="danger" size="small" @click="delUser(scope.row.userId)">
                      <el-icon><Delete /></el-icon>
                      <span>删除</span>
                    </el-button>
                    <el-button
                      type="primary"
                      size="small"
                      @click="userGrant(scope.$index, scope.row.userId)"
                    >
                      <el-icon><Pointer /></el-icon>
                      <span>分配角色</span>
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

  <!-- 添加用户和编辑用户抽屉 -->
  <el-drawer
    v-model="addOrEditDrawerModal"
    :title="addOrEditDrawerTitle"
    size="30%"
    :before-close="beforeChangeAddOrEditDrawer"
  >
    <el-row>
      <el-col :span="20">
        <el-form :model="userObject" label-width="auto" style="max-width: 600px">
          <el-input v-model="userObject.userId" style="display: none" />
          <el-form-item label="用户名">
            <el-input v-model="userObject.userName" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="userObject.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="userObject.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="所属部门">
            <el-select v-model="userObject.deptId" placeholder="所属科室">
              <el-option
                v-for="item in deptData"
                :key="item.deptId"
                :label="item.deptName"
                :value="item.deptId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="级别">
            <el-select v-model="selectedFieldUserRank" placeholder="用户级别">
              <el-option
                v-for="item in userRankData"
                :key="item.dictValue"
                :label="item.dictLabel"
                :value="item.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="背景">
            <el-select
              v-model="selectedFieldBackground"
              @click="getAllBackground"
              placeholder="学历"
            >
              <el-option
                v-for="item in backgroundData"
                :key="item.dictValue"
                :label="item.dictLabel"
                :value="item.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="年龄">
            <el-input-number v-model="userObject.age" :min="18" :max="200" />
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="userObject.sex">
              <el-radio value="0">男</el-radio>
              <el-radio value="1">女</el-radio>
              <el-radio value="2">未知</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="头像:" label-width="140px">
            <el-upload
              class="avatar-uploader"
              :http-request="uploadUserHeader"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <img v-if="userObject.picture" :src="userObject.picture" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="是否参与排班" style="margin-left: 30px">
            <el-radio-group v-model="userObject.schedulingFlag">
              <el-radio value="0">是</el-radio>
              <el-radio value="1">否</el-radio>
            </el-radio-group>
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

  <!-- 用户分配角色的抽屉 -->
  <el-drawer
    v-model="dialog"
    title="分配角色"
    direction="rtl"
    class="demo-drawer"
    :before-close="beforeChangeAddOrEditDrawer"
  >
    <div class="demo-drawer__content">
      <!-- 复选框组 -->
      <el-checkbox-group v-model="rids">
        <el-checkbox
          v-for="role in roleData"
          :label="role.roleName"
          :value="role.roleId"
          :key="role.roleId"
          style="display: block; margin: 10px"
        />
      </el-checkbox-group>

      <div class="demo-drawer__footer">
        <el-button type="primary" @click="addUserRole">确定</el-button>
        <el-button @click="dialog = false">取消</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import http from '@/http'
import {
  dayjs,
  ElLoading,
  ElMessage,
  ElMessageBox,
  ElNotification
} from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useCookies } from '@vueuse/integrations/useCookies'
import { Plus } from '@element-plus/icons-vue'

const addOrEditDrawerModal = ref(false) //添加或编辑用户抽屉
const addOrEditDrawerTitle = ref('') //添加或编辑用户抽屉标题
const pageNum = ref(1) //当前页
const pageSize = ref(10) //每页显示的数据
const pageTotal = ref(0) //总个数
const keyWord = ref('') //关键字
const userData = reactive([]) //用户数据
const rowLoadingMap = reactive({}) //是否处于加载状态
const deptData = ref([]) //科室数据
const backgroundData = reactive([]) //背景数据
const userRankData = reactive([]) //级别数据
let dialog = ref(false) //控制分配抽屉
//存储选中的角色编号的数组
let rids = ref([])
//所有的角色的数据
let roleData = ref([])
//授权的用户编号
let uid = ref('')
// 定义一个加载实例
let loadingInstance = null
const loading = ref(true) //表格加载动画
//用户对象，用于存储添加或修改的用户信息
const userObject = reactive({
  userId: '',
  userName: '',
  email: '',
  deptId: '',
  phone: '',
  age: '',
  sex: '2',
  status: '0',
  userType: '',
  userRank: '',
  background: '',
  schedulingFlag: '1',
  picture: '',
  userRankValue: '',
  backgroundValue: '',
})

const queryUserObject = reactive({
  pageNum: pageNum.value,
  pageSize: pageSize.value,
  userName: keyWord.value,
})

//计算用户类型
const userTypeComputed = (value) => {
  switch (value) {
    case 0:
      return 'danger'
    case 1:
      return 'primary'
    default:
      return 'warning'
  }
}

//上传用户头像方法
const uploadUserHeader = (file) => {
  const formData = new FormData()
  // 检查 file 是否存在且包含 file 属性
  if (!file || !file.file) {
    ElMessage.error('请选择要上传的文件!')
    return
  }
  // 如果 file.file 是一个 File 对象
  if (!(file.file instanceof File)) {
    ElMessage.error('上传的文件格式不正确!')
    return
  }
  // 添加文件到 FormData
  formData.append('file', file.file)

  // 开始上传时显示加载动画
  loadingInstance = ElLoading.service({
    lock: true,
    text: '头像上传中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  // 发送 POST 请求上传图片
  http.post('/file/file/uploadImg', formData)
    .then((res) => {
      if (res.data.code === 200) {
        handleAvatarSuccess(res.data, file)
        if (addOrEditDrawerTitle.value == '添加用户') {
          ElMessage.success('头像上传成功!')
        } else {
          ElMessage.success('头像更改成功!')
        }
      }
    })
    .catch(() => {
      ElMessage.error('头像上传失败!请重试')
    })
    .finally(() => {
      // 上传完成后关闭加载动画
      if (loadingInstance) {
        loadingInstance.close()
      }
    })
}

//计算性别颜色
const sexComputedFetch = (value) => {
  switch (value) {
    case 0:
      return 'primary'
    case 1:
      return 'danger'
    default:
      return 'warning'
  }
}

//是否需要参与排班的标签类型
const schedulingFlagComputedFetch = (value) => {
  switch (value) {
    case '0':
      return 'primary'
    case '1':
      return 'danger'
    default:
      return 'warning'
  }
}

// 计算属性，根据 deptId 获取科室名称
const getDeptName = (deptId) => {
  const map = new Map()
  deptData.value.forEach((item) => {
    if(deptId){
    map.set(item.deptId, item.deptName)
    }
  })
  return map.get(deptId) || '未知科室'
}

//使用dayjs序列化时间
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '--'
}

//用户授权的按钮
const userGrant = async (index, userId) => {
  uid.value = userId
  //查询用户拥有的角色编号
  await http.get('/user/user/getUserRids' , {params:{userId:userId}}).then((res) => {
    rids.value = res.data.data
  })
  //查询所有的角色
  await http.get('/role/role/getAll').then((res) => {
    //console.log(res)
    roleData.value = res.data.data
  })
  //用户授予角色抽屉显示
  dialog.value = true
}
//为用户授权
function addUserRole() {
  //判断没有选中的角色，不发送请求
  //console.log('rids:',rids.value)
  //向后端发送添加用户的角色的授权的请求
  const params = {
    userId: uid.value,
    rids: rids.value,
  }
  http.post('/user/user/addUserRole',params)
    .then((res) => {
      if (res.data.data) {
        //成功提示
        ElMessage({
          message: '授权成功',
          type: 'success',
        })
        //抽屉隐藏
        dialog.value = false
        //刷新用户数据
        getUserData()
      }
    })
}

//根据抽屉值选择值返回用户级别
const selectedFieldUserRank = computed({
  get() {
    return addOrEditDrawerTitle.value === '编辑用户'
      ? userObject.userRankValue
      : userObject.userRank
  },
  set(value) {
    if (addOrEditDrawerTitle.value === '编辑用户') {
      userObject.userRankValue = value
    } else {
      userObject.userRank = value
    }
  },
})

//根据抽屉值选择值返回学历
const selectedFieldBackground = computed({
  get() {
    return addOrEditDrawerTitle.value === '编辑用户'
      ? userObject.backgroundValue
      : userObject.background
  },
  set(value) {
    if (addOrEditDrawerTitle.value === '编辑用户') {
      userObject.backgroundValue = value
    } else {
      userObject.background = value
    }
  },
})

// 获取科室数据
const getAllDept = async () => {
  if (deptData.value.length === 0) {
    try {
      const res = await http.get('/dept/dept/getNormalDept')
      deptData.value = res.data.data ? res.data.data : []
    } catch (error) {
      console.error('获取科室列表失败', error)
    }
  }
}

// 获取背景数据
const getAllBackground = async () => {
  if (backgroundData.length === 0) {
    try {
      const res = await http.get('/dict/dict/getDictByType/sys_user_background')
      backgroundData.splice(0, backgroundData.length, ...res.data.data)
    } catch (error) {
      console.error('获取背景数据失败', error)
    }
  }
}

// 获取级别数据
const getAllRank = async () => {
 if (userRankData.length === 0) {
    try {
      const res = await http.get('/dict/dict/getDictByType/sys_user_level')
      userRankData.splice(0, userRankData.length, ...res.data.data)
    } catch (error) {
      console.error('获取背景数据失败', error)
    }
  }
}

//模糊查询
const searchUser = (keyWordInput) => {
  keyWord.value = keyWordInput
  getUserData()
}

//上一页
const sizeChange = (newPageSize) => {
  pageSize.value = newPageSize
  getUserData()
}

//下一页
const currentChange = (newPage) => {
  pageNum.value = newPage
  getUserData()
}


//判断当前抽屉的按钮操作是添加还是修改
const handleSubmit = () => {
  if (addOrEditDrawerTitle.value === '添加用户') {
    addUserSubmit() // 调用添加用户的方法
  } else if (addOrEditDrawerTitle.value === '编辑用户') {
    updateUserSubmit() // 调用修改用户的方法
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
      dialog.value = false
    })
    .catch(() => {
      return
    })
}

//实现添加用户头像文件上传
const handleAvatarSuccess = (response, uploadFile) => {
  // 这里使用从服务器返回的图片 URL，而不是本地临时URL
  userObject.picture = response.data // 更新用户头像地址
}
//上传之前调用,验证文件的格式文件的大小
const beforeAvatarUpload = (rawFile) => {
  // 验证文件类型
  if (
    rawFile.type !== 'image/jpeg' &&
    rawFile.type !== 'image/png' &&
    rawFile.type !== 'image/gif'
  ) {
    ElMessage.error('请选择正确图片格式!')
    return false
  }
  // 验证文件大小
  else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('文件大小不能大于2MB!')
    return false
  }
  return true
}

//添加用户
const addUser = () => {
  //清空用户对象
  userObject.userId =
    userObject.userName =
    userObject.email =
    userObject.deptId =
    userObject.phone =
    userObject.age =
    userObject.userRank =
    userObject.background =
    userObject.schedulingFlag =
    userObject.picture =
    userObject.userRankValue =
    userObject.backgroundValue =
    ''
  addOrEditDrawerTitle.value = '添加用户'
  addOrEditDrawerModal.value = true
}

//添加用户
const addUserSubmit = () => {
  //后端发送添加用户请求
  http.post('/user/user/addUser', userObject).then((res) => {
    if (res.data.data === true) {
      ElMessage.success('添加成功')
      addOrEditDrawerModal.value = false
    } else {
      ElMessage.error('添加失败')
    }
    getUserData()
  })
}

//删除用户
const delUser = (userId) => {
  ElMessageBox.confirm('确定删除编号为' + userId + '的用户？', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    //删除用户
    http.post('user/user/deleteUser' ,{params: {userId:userId}}).then((res) => {
      if (res.data.data) {
        ElMessage.success('删除成功')
        getUserData()
      } else {
        throw new Error('用户删除失败')
      }
    })
  })
}

//修改用户抽屉
const editUser = (userId) => {
  addOrEditDrawerTitle.value = '编辑用户'
  addOrEditDrawerModal.value = true
  //回调单个用户数据
  http.get('/user/user/getUserRids' + {params:{ userId: userId }})
    .then((res) => {
      if (res.data.data) {
        const data = res.data.data
        Object.assign(userObject, {
          userId: userId,
          userName: data.userName,
          email: data.email,
          deptId: data.deptId,
          phone: data.phone,
          age: data.age,
          sex: String(data.sex),
          status: data.status,
          userRank: data.userRank,
          background: data.background,
          schedulingFlag: data.schedulingFlag,
          picture: data.picture,
          userRankValue: data.userRankValue,
          backgroundValue: data.backgroundValue,
        })
      }
    })
    .catch((error) => {
      ElMessage.error('获取用户数据失败' + error)
    })
}

//修改用户
const updateUserSubmit = () => {
  //后端发送修改用户请求
  http.post('/user/user/updateUser', userObject).then((res) => {
    if (res.data.data) {
      ElMessage.success('修改成功')
      addOrEditDrawerModal.value = false
      getUserData()
    } else {
      ElMessage.error('操作有误,请重试!')
    }
    getUserData()
  })
}

//判断修改用户状态前逻辑，判断用户id是否相同，如果相同拦截并不让更改，否则放行
const beforeChange = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
}

// 修改用户状态
const updateUserStatus = async (userId, userStatus, username) => {
  try {
    const response = await http.put(`/user/user/update/${userId}/${userStatus}`)
    if (response.data.data) {
      ElNotification({
        title: '修改成功!',
        message: `用户 ${username} 的状态已更新为 ${userStatus === 0 ? '正常' : '禁用'}`,
        type: 'success',
        offset: 50,
        duration: 3000,
      })
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
}

//按钮切换主逻辑方法
const handleBeforeChange = async (uid, value, username) => {
  //将当前开关的动画状态开启
  rowLoadingMap[uid] = true
  try {
    //执行beforeChange和更改用户状态
    await beforeChange()
    await updateUserStatus(uid, value, username)
    return true
  } catch (error) {
    console.error(error.message)
    return false // 阻止状态切换
  } finally {
    rowLoadingMap[uid] = false
  }
}

// 页面加载时获取用户、用户个别字段对应的字典value数据
onMounted(() => {
  getUserData()
  getAllDept()
  getAllBackground()
  getAllRank()
})

// 获取用户数据
const getUserData = () => {
  http.post('/user/user/list', queryUserObject).then((res) => {
    const user = res.data.data
    //文本转数字
    user.list.forEach((item) => {
      //状态
      item.status = Number(item.status)
      //性别
      item.sex = Number(item.sex)
    })
    if (user.list) {
      pageTotal.value = user.total
      pageNum.value = user.pageNum
      pageSize.value = user.pageSize
      userData.splice(0, userData.length, ...user.list)
      //数字字段对应实际ditcvalue
      userData.forEach((item) => {
        //级别
        item.userRank = userRankData.find(
          (rank) => rank.dictValue === item.userRank
        )?.dictLabel || ''
        //学历
        item.background = backgroundData.find(
          (bg) => bg.dictValue === item.background
        )?.dictLabel || ''
      })
    }
    setTimeout(() => {
      loading.value = false
    }, 500)
  })
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
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
