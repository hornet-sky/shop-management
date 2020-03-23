<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入搜索内容" v-model="searchKey" clearable @clear="reqParams.query = ''">
            <el-button slot="append" icon="el-icon-search" @click="reqParams.query = searchKey"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table
        :data="users"
        border
        stripe>
        <el-table-column
          label="序号"
          type="index"
          :index="1"
          width="60">
        </el-table-column>
        <el-table-column
          prop="username"
          label="姓名">
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱">
        </el-table-column>
        <el-table-column
          prop="mobile"
          label="手机">
        </el-table-column>
        <el-table-column
          prop="role_name"
          label="角色">
        </el-table-column>
        <el-table-column
          label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="handleUserStateChange(scope.$index, scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="180">
          <template slot-scope="scope">
            <el-button
              size="mini"
              icon="el-icon-edit"
              type="primary"
              @click="handleEdit(scope.$index, scope.row)"></el-button>
            <el-button
              size="mini"
              icon="el-icon-delete"
              type="danger"
              class="edit-btn"
              @click="handleDelete(scope.$index, scope.row)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                size="mini"
                icon="el-icon-setting"
                type="warning"
                @click="handleSetting(scope.$index, scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="reqParams.pagenum"
        :page-sizes="[2, 5, 10, 20, 50]"
        :page-size="reqParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @opened="$refs.addFormUsernameRef.focus()">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="60px">
        <el-form-item label="姓名" prop="username">
          <el-input ref="addFormUsernameRef" v-model="addForm.username" maxlength="50" clearable></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" maxlength="20" autocomplete="new-password" show-password clearable></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" maxlength="150" clearable></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile" maxlength="11" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add" :loading="adding">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="修改用户"
      :visible.sync="modifyDialogVisible"
      width="50%"
      :close-on-click-modal="false">
      <el-form ref="modifyFormRef" :model="modifyForm" :rules="modifyFormRules" label-width="60px">
        <el-form-item label="姓名">
          <el-input :value="modifyForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="modifyForm.email" maxlength="150" clearable></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="modifyForm.mobile" maxlength="11" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modify" :loading="modifying">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="分配角色"
      :visible.sync="allotRoleDialogVisible"
      width="50%"
      :close-on-click-modal="false">
      <el-form ref="allotRoleFormRef" :model="allotRoleForm" :rules="allotRoleFormRules" label-width="100px">
        <el-form-item label="当前用户">
          <el-input :value="allotRoleForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="当前角色">
          <el-input :value="allotRoleForm.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="分配新角色" prop="rid">
          <el-select v-model="allotRoleForm.rid" placeholder="请选择新角色">
            <el-option
              v-for="r in roles"
              :key="r.id"
              :label="r.roleName"
              :value="r.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allotRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRole" :loading="alloting">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  created () {
    this.loadUsers()
    this.loadRoles()
  },
  data () {
    const checkEmail = (rule, value, callback) => {
      const regExp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (!regExp.test(value)) {
        return callback(new Error('请输入正确的邮箱地址'))
      }
      callback()
    }
    const checkMobile = (rule, value, callback) => {
      const regExp = /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57]|19[0-9])[0-9]{8}$/
      if (!regExp.test(value)) {
        return callback(new Error('请输入正确的手机号码'))
      }
      callback()
    }
    return {
      reqParams: {
        pagenum: 1,
        pagesize: 2,
        query: ''
      },
      users: [],
      total: 0,
      searchKey: '',
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '姓名不能为空', trigger: 'blur' },
          { min: 2, message: '姓名至少两个字符', trigger: 'change' }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { min: 6, max: 20, message: '密码至少六位', trigger: 'change' }
        ],
        email: [
          { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      adding: false,
      modifyDialogVisible: false,
      modifyForm: {
        id: '',
        username: '',
        email: '',
        mobile: ''
      },
      modifyFormRules: {
        username: [
          { required: true, message: '姓名不能为空', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      modifying: false,
      allotRoleDialogVisible: false,
      allotRoleForm: {
        id: '',
        username: '',
        roleName: '',
        rid: -1
      },
      allotRoleFormRules: {
        rid: [
          { required: true, message: '请先选择一个角色', trigger: 'blur' }
        ]
      },
      alloting: false,
      roles: []
    }
  },
  methods: {
    async loadUsers () {
      const { data: res } = await this.$http.get('users', { params: this.reqParams })
      if (res.meta.status !== 200) {
        return this.$message.error(`加载用户列表失败：${res.meta.msg}`)
      }
      this.users = res.data.users
      this.total = res.data.total
    },
    handleEdit (index, { id, username, email, mobile }) {
      this.modifyForm = { id, username, email, mobile }
      this.modifyDialogVisible = true
    },
    async handleDelete (index, { id }) {
      const r = await this.$confirm('确定要删除这条记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (r === 'confirm') {
        const { data: resp } = await this.$http.delete(`users/${id}`)
        if (resp.meta.status !== 200) {
          return this.$message.error(`删除用户失败：${resp.meta.msg}`)
        }
        this.loadUsers()
        this.$message.success('删除用户成功')
      }
    },
    handleSetting (index, { id, username, role_name: roleName }) {
      this.allotRoleForm = { id, username, roleName }
      this.allotRoleDialogVisible = true
    },
    async handleUserStateChange (index, row) {
      const { data: res } = await this.$http.put(`users/${row.id}/state/${row.mg_state}`)
      if (res.meta.status !== 200) {
        row.mg_state = !row.mg_state // 把已改变的状态还原
        return this.$message.error(`修改用户状态失败：${res.meta.msg}`)
      }
    },
    handleSizeChange (val) {
      console.log(`每页 ${val} 条`)
      this.reqParams.pagesize = val
    },
    handleCurrentChange (val) {
      console.log(`当前页: ${val}`)
      this.reqParams.pagenum = val
    },
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        this.adding = true
        const { data: res } = await this.$http.post('users', this.addForm)
        console.log(res)
        if (res.meta.status !== 201) {
          this.$message.error(`添加用户失败：${res.meta.msg}`)
          this.adding = false
          return
        }
        this.loadUsers()
        this.addDialogVisible = false
        this.adding = false
        this.$message.success('添加用户成功')
      })
    },
    modify () {
      this.$refs.modifyFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        this.modifying = true
        const { data: res } = await this.$http.put(`users/${this.modifyForm.id}`, this.modifyForm)
        console.log(res)
        if (res.meta.status !== 200) {
          this.$message.error(`修改用户失败：${res.meta.msg}`)
          this.modifying = false
          return
        }
        this.loadUsers()
        this.modifyDialogVisible = false
        this.modifying = false
        this.$message.success('修改用户成功')
      })
    },
    async loadRoles () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error(`加载角色列表失败：${res.meta.msg}`)
      }
      this.roles = res.data
    },
    allotRole () {
      this.$refs.allotRoleFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        this.alloting = true
        const { data: res } = await this.$http.put(`users/${this.allotRoleForm.id}/role`, { rid: this.allotRoleForm.rid })
        if (res.meta.status !== 200) {
          this.$message.error(`分配角色失败：${res.meta.msg}`)
          this.alloting = false
          return
        }
        this.loadUsers()
        this.allotRoleDialogVisible = false
        this.alloting = false
        this.$message.success('分配角色成功')
      })
    }
  },
  watch: {
    reqParams: {
      deep: true,
      handler (val) {
        console.log('请求参数改变了', val)
        this.loadUsers()
      }
    },
    addDialogVisible (val) {
      if (!val) {
        this.$refs.addFormRef.resetFields()
      }
    },
    modifyDialogVisible (val) {
      if (!val) {
        this.$refs.modifyFormRef.resetFields()
      }
    },
    allotRoleDialogVisible (val) {
      if (!val) {
        this.$refs.allotRoleFormRef.resetFields()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
