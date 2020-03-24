<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false">
      </el-alert>
      <el-row>
        <el-col>
          选择商品分类：
          <el-cascader
            v-model="selectedKeys"
            :options="categories"
            :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
            @change="handleCateChange"
            placeholder="请选择商品分类"
            clearable>
          </el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many"></el-tab-pane>
        <el-tab-pane label="静态属性" name="only"></el-tab-pane>
      </el-tabs>
      <el-button size="mini" type="primary" :disabled="isAddBtnDisabled" @click="openDialog4Add">{{ addBtnLabel }}</el-button>
      <el-table
        :data="tableData"
        border>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-tag
              :key="scope.row.attr_id + ':' + tag"
              v-for="(tag, index) in scope.row.attr_vals"
              closable
              :disable-transitions="false"
              @close="handleTagClose(scope.row, index)">
              {{ tag }}
            </el-tag>
            <el-input
              class="input-new-tag"
              v-if="scope.row.tagInputVisible"
              v-model="scope.row.tagInputValue"
              :ref="'saveTagInput_' + scope.row.attr_id"
              size="small"
              @keyup.enter.native="handleInputConfirm(scope.row)"
              @blur="handleInputConfirm(scope.row)">
            </el-input>
            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="#"
          type="index">
        </el-table-column>
        <el-table-column
          :label="paramsNameLabel"
          prop="attr_name">
        </el-table-column>
        <el-table-column
          label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              icon="el-icon-edit"
              type="primary"
              @click="openDialog4Modify(scope.$index, scope.row)">修改</el-button>
            <el-button
              size="mini"
              icon="el-icon-delete"
              type="danger"
              class="edit-btn"
              @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog
      :title="operationLabel + activeLabel"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @opened="$refs.formAttrNameRef.focus()"
      @close="$refs.formRef.resetFields()">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-form-item :label="activeLabel + '名称'" prop="attrName">
          <el-input ref="formAttrNameRef" v-model="form.attrName" maxlength="50" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrModifyAttrName" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'GoodsParams',
  created () {
    this.loadCategories()
  },
  data () {
    return {
      selectedKeys: [],
      categories: [],
      dynamicParams: [],
      staticAttrs: [],
      activeName: 'many',
      dialogVisible: false,
      operationType: '',
      form: {
        attrName: ''
      },
      formRules: {
        attrName: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ]
      },
      loading: false
    }
  },
  computed: {
    isAddBtnDisabled () {
      return this.selectedKeys.length < 3
    },
    currCateId () {
      return this.selectedKeys[2]
    },
    paramsNameLabel () {
      return this.activeName === 'many' ? '参数名称' : '属性名称'
    },
    addBtnLabel () {
      return this.activeName === 'many' ? '添加参数' : '添加属性'
    },
    activeLabel () {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    },
    operationLabel () {
      return this.operationType === 'add' ? '添加' : '修改'
    },
    tableData () {
      return this.activeName === 'many' ? this.dynamicParams : this.staticAttrs
    }
  },
  methods: {
    async loadCategories () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error(`加载商品分类列表失败：${res.meta.msg}`)
      }
      this.categories = res.data
    },
    async loadParams () {
      const { data: res } = await this.$http.get(`categories/${this.currCateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error(`加载${this.activeLabel}列表失败：${res.meta.msg}`)
      }
      res.data.forEach(item => {
        if (item.attr_vals && item.attr_vals.trim()) {
          item.attr_vals = item.attr_vals.split(' ')
        } else {
          item.attr_vals = []
        }
        item.tagInputVisible = false
        item.tagInputValue = ''
      })
      if (this.activeName === 'many') {
        this.dynamicParams = res.data
      } else {
        this.staticAttrs = res.data
      }
    },
    handleCateChange (selectedKeys) {
      if (selectedKeys.length < 3) {
        this.selectedKeys = []
        this.dynamicParams = []
        this.staticAttrs = []
        return
      }
      this.loadParams()
    },
    handleTabClick (currTab) {
      if (this.currCateId) {
        this.loadParams()
      }
    },
    openDialog4Add () {
      this.form = { catId: this.currCateId, attrName: '', attrVals: null }
      this.dialogVisible = true
      this.operationType = 'add'
    },
    openDialog4Modify (index, { cat_id: catId, attr_id: attrId, attr_name: attrName, attr_vals: attrVals }) {
      this.form = { catId, attrId, attrName, attrVals: attrVals.join(' ') }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.formAttrNameRef.select()
      })
      this.operationType = 'modify'
    },
    addOrModifyAttrName () {
      this.$refs.formRef.validate(valid => {
        if (!valid) {
          return
        }
        this.loading = true
        const promise = this.operationType === 'add'
          ? this.addCateAndAttrs(this.form.catId, this.form.attrName, this.form.attrVals)
          : this.modifyCateAndAttrs(this.form.catId, this.form.attrId, this.form.attrName, this.form.attrVals)
        promise.then(val => {
          this.loadParams()
          this.dialogVisible = false
          this.loading = false
          this.$message.success(`${this.operationLabel}${this.activeLabel}名称成功`)
        }).catch(errorMsg => {
          this.$message.error(`${this.operationLabel}${this.activeLabel}名称失败：${errorMsg}`)
          this.loading = false
        })
      })
    },
    async handleDelete (index, { cat_id: catId, attr_id: attrId }) {
      const r = await this.$confirm('确定要删除这条记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (r === 'confirm') {
        const { data: resp } = await this.$http.delete(`categories/${catId}/attributes/${attrId}`)
        if (resp.meta.status !== 200) {
          return this.$message.error(`删除${this.activeLabel}失败：${resp.meta.msg}`)
        }
        this.loadParams()
        this.$message.success(`删除${this.activeLabel}成功`)
      }
    },
    handleTagClose ({ cat_id: cateId, attr_id: attrId, attr_name: attrName, attr_vals: attrVals }, tagIndex) {
      console.log(cateId, attrId, attrName, attrVals)
      attrVals.splice(tagIndex, 1)
      this.modifyCateAndAttrs(cateId, attrId, attrName, attrVals.join(' '))
        .catch(errorMsg => {
          this.$message.error(`删除${this.activeLabel}的值失败：${errorMsg}`)
        })
    },
    handleInputConfirm (attr) {
      // 保存数据
      const tagInputValue = attr.tagInputValue.trim()
      if (tagInputValue && !attr.attr_vals.includes(tagInputValue)) {
        attr.attr_vals.push(tagInputValue)
        this.modifyCateAndAttrs(attr.cat_id, attr.attr_id, attr.attr_name, attr.attr_vals.join(' '))
          .catch(errorMsg => {
            this.$message.error(`添加${this.activeLabel}的值失败：${errorMsg}`)
          })
      }
      attr.tagInputValue = ''
      attr.tagInputVisible = false
    },
    showInput (attr) {
      attr.tagInputVisible = true
      this.$nextTick(() => {
        this.$refs['saveTagInput_' + attr.attr_id].$refs.input.focus()
      })
    },
    addCateAndAttrs (cateId, attrName, attrVals) {
      return new Promise((resolve, reject) => {
        this.$http.post(`categories/${cateId}/attributes`, { attr_name: attrName, attr_sel: this.activeName, attr_vals: attrVals })
          .then(res => {
            res = res.data
            if (res.meta.status !== 201) {
              reject(res.meta.msg)
              return
            }
            resolve(res.data)
          })
      })
    },
    modifyCateAndAttrs (cateId, attrId, attrName, attrVals) {
      return new Promise((resolve, reject) => {
        this.$http.put(`categories/${cateId}/attributes/${attrId}`, { attr_name: attrName, attr_sel: this.activeName, attr_vals: attrVals })
          .then(res => {
            res = res.data
            if (res.meta.status !== 200) {
              reject(res.meta.msg)
              return
            }
            resolve(res.data)
          })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-row {
  margin: 15px 0;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
