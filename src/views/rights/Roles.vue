<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table
        :data="roles"
        border
        stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(rightLv1, index) in scope.row.children" :key="rightLv1.id" class="bdrBottom" :class="{ bdrTop: index === 0 }">
              <el-col :span="5">
                <el-tag closable @close="deleteRight(scope.row, rightLv1.id)">{{ rightLv1.authName }}</el-tag>
                <span class="el-icon-caret-right"></span>
              </el-col>
              <el-col :span="19">
                <el-row v-for="(rightLv2, index) in rightLv1.children" :key="rightLv2.id" :class="{ bdrTop: index !== 0 }">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="deleteRight(scope.row, rightLv2.id)">{{ rightLv2.authName }}</el-tag>
                    <span class="el-icon-caret-right"></span>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="rightLv3 in rightLv2.children" :key="rightLv3.id" closable @close="deleteRight(scope.row, rightLv3.id)">{{ rightLv3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column
          label="序号"
          type="index">
        </el-table-column>
        <el-table-column
          prop="roleName"
          label="角色名称">
        </el-table-column>
        <el-table-column
          prop="roleDesc"
          label="角色描述">
        </el-table-column>
        <el-table-column
          label="操作"
          width="320">
          <template slot-scope="scope">
            <el-button
              size="mini"
              icon="el-icon-edit"
              type="primary"
              @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button
              size="mini"
              icon="el-icon-delete"
              type="danger"
              class="edit-btn"
              @click="handleDelete(scope.$index, scope.row)">删除</el-button>
            <el-button
              size="mini"
              icon="el-icon-setting"
              type="warning"
              @click="handleRights(scope.$index, scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @opened="$refs.addFormRoleNameRef.focus()">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input ref="addFormRoleNameRef" v-model="addForm.roleName" maxlength="20" clearable></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc" maxlength="50" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add" :loading="adding">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="修改角色"
      :visible.sync="modifyDialogVisible"
      width="50%"
      :close-on-click-modal="false">
      <el-form ref="modifyFormRef" :model="modifyForm" :rules="modifyFormRules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="modifyForm.roleName" maxlength="20" clearable></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="modifyForm.roleDesc" maxlength="50" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modify" :loading="modifying">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="分配权限"
      :visible.sync="allotRightsDialogVisible"
      width="50%"
      :close-on-click-modal="false">
      <el-tree :data="rightsTree"
        ref="rightsTree"
        :props="rightsTreeProps"
        node-key="id"
        show-checkbox
        default-expand-all
        :default-checked-keys="checkedKeys">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allotRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights" :loading="modifying">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  created () {
    this.loadRoles()
    this.loadRightsTree()
  },
  data () {
    return {
      roles: [],
      addDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '角色描述不能为空', trigger: 'blur' }
        ]
      },
      adding: false,
      modifyDialogVisible: false,
      modifyForm: {
        id: '',
        roleName: '',
        roleDesc: ''
      },
      modifyFormRules: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '角色描述不能为空', trigger: 'blur' }
        ]
      },
      modifying: false,
      allotRightsDialogVisible: false,
      currRoleIndex: -1,
      rightsTree: [],
      rightsTreeProps: {
        children: 'children',
        label: 'authName'
      },
      alloting: false
    }
  },
  computed: {
    checkedKeys () {
      if (this.currRoleIndex === -1) {
        return []
      }
      const rights = this.roles[this.currRoleIndex].children
      return this.getLeafRightIds(rights)
    }
  },
  methods: {
    getLeafRightIds (rights) {
      let ids = []
      rights.forEach(r => {
        if (r.children) {
          ids = ids.concat(this.getLeafRightIds(r.children))
        } else {
          ids.push(r.id)
        }
      })
      return ids
    },
    async loadRoles () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error(`加载角色列表失败：${res.meta.msg}`)
      }
      this.roles = res.data
    },
    async loadRightsTree () {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error(`加载权限树失败：${res.meta.msg}`)
      }
      this.rightsTree = res.data
    },
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        this.adding = true
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error(`添加角色失败：${res.meta.msg}`)
          this.adding = false
          return
        }
        this.loadRoles()
        this.addDialogVisible = false
        this.adding = false
        this.$message.success('添加角色成功')
      })
    },
    handleEdit (index, { id, roleName, roleDesc }) {
      this.modifyForm = { id, roleName, roleDesc }
      this.modifyDialogVisible = true
    },
    modify () {
      this.$refs.modifyFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        this.modifying = true
        const { data: res } = await this.$http.put(`roles/${this.modifyForm.id}`, this.modifyForm)
        if (res.meta.status !== 200) {
          this.$message.error(`修改角色失败：${res.meta.msg}`)
          this.modifying = false
          return
        }
        this.loadRoles()
        this.modifyDialogVisible = false
        this.modifying = false
        this.$message.success('修改角色成功')
      })
    },
    async handleDelete (index, { id }) {
      const r = await this.$confirm('确定要删除这条记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (r === 'confirm') {
        const { data: resp } = await this.$http.delete(`roles/${id}`)
        if (resp.meta.status !== 200) {
          return this.$message.error(`删除角色失败：${resp.meta.msg}`)
        }
        this.loadRoles()
        this.$message.success('删除角色成功')
      }
    },
    handleRights (index) {
      this.currRoleIndex = index
      this.allotRightsDialogVisible = true
    },
    async allotRights () {
      this.alloting = true
      const rt = this.$refs.rightsTree
      const rids = rt.getCheckedKeys().concat(rt.getHalfCheckedKeys()).join(',')
      const { data: res } = await this.$http.post(`roles/${this.roles[this.currRoleIndex].id}/rights`, { rids })
      if (res.meta.status !== 200) {
        this.$message.error(`分配权限失败：${res.meta.msg}`)
        this.alloting = false
        return
      }
      this.loadRoles()
      this.allotRightsDialogVisible = false
      this.alloting = false
      this.$message.success('分配权限成功')
    },
    async deleteRight (role, rightId) {
      const { data: resp } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (resp.meta.status !== 200) {
        return this.$message.error(`删除权限失败：${resp.meta.msg}`)
      }
      role.children = resp.data
      this.$message.success('删除权限成功')
    }
  },
  watch: {
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
    allotRightsDialogVisible (val) {
      if (!val) {
        this.$refs.rightsTree.setCheckedKeys([])
        this.currRoleIndex = -1
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .el-row {
    display: flex;
    align-items: center;
    .el-tag {
      margin: 10px 6px;
    }
  }
  .bdrBottom {
    border-bottom: 1px solid #eee;
  }
  .bdrTop {
    border-top: 1px solid #eee;
  }
</style>
