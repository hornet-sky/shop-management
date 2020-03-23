<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加分类</el-button>
        </el-col>
      </el-row>
      <zk-table
        :data="categories"
        :columns="columnsConfigs"
        show-index
        index-text="#"
        border
        :selection-type="false"
        :expand-type="false">
        <template slot="cate-status" slot-scope="scope">
          <i :class="scope.row.deleted ? 'el-icon-error color-danger' : 'el-icon-success color-success'"></i>
        </template>
        <template slot="cate-level" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <template slot="cate-operations" slot-scope="scope">
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
        </template>
      </zk-table>
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
      title="添加分类"
      :visible.sync="addDialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @close="handleAddDialogclose"
      @opened="$refs.addFormCatNameRef.focus()">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input ref="addFormCatNameRef" v-model="addForm.cat_name" maxlength="50" clearable></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCategories"
            :props="{ expandTrigger: 'hover', checkStrictly: true, value: 'cat_id', label: 'cat_name', children: 'children' }"
            @change="handleParentCateChange4Add"
            placeholder="请选择父级分类"
            popper-class="cascader-popper"
            clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add" :loading="adding">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="修改分类"
      :visible.sync="modifyDialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @close="handleModifyDialogclose">
      <el-form ref="modifyFormRef" :model="modifyForm" :rules="modifyFormRules" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="modifyForm.cat_name" maxlength="50" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modify" :loading="modifying">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'GoodsCategory',
  created () {
    this.loadCategories()
    this.loadParentCategories()
  },
  data () {
    return {
      reqParams: {
        pagenum: 1,
        pagesize: 5
      },
      categories: [],
      columnsConfigs: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'cate-status'
        },
        {
          label: '分类等级',
          type: 'template',
          template: 'cate-level'
        },
        {
          label: '操作',
          type: 'template',
          template: 'cate-operations'
        }
      ],
      total: 0,
      addDialogVisible: false,
      addForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addFormRules: {
        cat_name: [
          { required: true, message: '分类名称不能为空', trigger: 'blur' }
        ]
      },
      parentCategories: [],
      selectedKeys: [],
      adding: false,
      modifyDialogVisible: false,
      modifyForm: {
        cat_id: '',
        cat_name: ''
      },
      modifyFormRules: {
        cat_name: [
          { required: true, message: '分类名称不能为空', trigger: 'blur' }
        ]
      },
      modifying: false
    }
  },
  methods: {
    async loadCategories () {
      const { data: res } = await this.$http.get('categories', { params: this.reqParams })
      if (res.meta.status !== 200) {
        return this.$message.error(`加载商品分类列表失败：${res.meta.msg}`)
      }
      this.categories = res.data.result
      this.total = res.data.total
    },
    async loadParentCategories () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error(`加载商品父级分类列表失败：${res.meta.msg}`)
      }
      this.parentCategories = res.data
    },
    handleEdit (index, { cat_id: catId, cat_name: catName }) {
      this.modifyForm = { cat_id: catId, cat_name: catName }
      this.modifyDialogVisible = true
    },
    async handleDelete (index, { cat_id: id }) {
      const r = await this.$confirm('确定要删除这条记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (r === 'confirm') {
        const { data: resp } = await this.$http.delete(`categories/${id}`)
        if (resp.meta.status !== 200) {
          return this.$message.error(`删除商品分类失败：${resp.meta.msg}`)
        }
        this.loadCategories()
        this.$message.success('删除商品分类成功')
      }
    },
    handleSizeChange (val) {
      this.reqParams.pagesize = val
      this.loadCategories()
    },
    handleCurrentChange (val) {
      this.reqParams.pagenum = val
      this.loadCategories()
    },
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        this.adding = true
        const { data: res } = await this.$http.post('categories', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error(`添加商品分类失败：${res.meta.msg}`)
          this.adding = false
          return
        }
        this.loadCategories()
        this.loadParentCategories()
        this.addDialogVisible = false
        this.adding = false
        this.$message.success('添加商品分类成功')
      })
    },
    handleParentCateChange4Add (selectedKeys) {
      this.addForm.cat_level = selectedKeys.length
      this.addForm.cat_pid = selectedKeys[selectedKeys.length - 1]
    },
    handleAddDialogclose () {
      this.$refs.addFormRef.resetFields()
      this.addForm.cat_level = 0
      this.addForm.cat_pid = 0
      this.selectedKeys = []
    },
    modify () {
      this.$refs.modifyFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        this.modifying = true
        const { data: res } = await this.$http.put(`categories/${this.modifyForm.cat_id}`, this.modifyForm)
        if (res.meta.status !== 200) {
          this.$message.error(`修改商品分类失败：${res.meta.msg}`)
          this.modifying = false
          return
        }
        this.loadCategories()
        this.modifyDialogVisible = false
        this.modifying = false
        this.$message.success('修改商品分类成功')
      })
    },
    handleModifyDialogclose () {
      this.$refs.modifyFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
