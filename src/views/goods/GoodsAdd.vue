<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品添加</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-alert
            title="添加商品信息"
            type="info"
            center
            show-icon
            :closable="false">
          </el-alert>
        </el-col>
      </el-row>
      <el-steps :active="currentStep" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form ref="formRef" :model="form" :rules="formRules" label-position="top">
        <el-tabs tab-position="left" v-model="activeTabName" @tab-click="handleTabClick" :before-leave="beforeTabLeave">
          <el-tab-pane label="基本信息" name="basicInfo">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="form.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="form.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="form.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="form.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="selectedCateIds"
                :options="categories"
                :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
                @change="handleCateChange"
                placeholder="请选择商品分类"
                clearable>
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="goodsParams">
            <el-form-item v-for="param in dynamicParams" :key="param.attr_id" :label="param.attr_name">
              <el-checkbox-group v-model="param.attr_vals">
                <el-checkbox v-for="label in param.checkbox_labels" :key="param.attr_id + ':' + label" :label="label" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="goodsAttrs">
            <el-form-item v-for="attr in staticAttrs" :key="attr.attr_id" :label="attr.attr_name">
              <el-input v-model="attr.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="goodsPics">
            <el-upload
              :action="uploadApiUrl"
              :headers="uploadApiHeaders"
              :before-upload="handleGoodsPicBeforeUpload"
              :on-preview="handleGoodsPicPreview"
              :on-remove="handleGoodsPicRemove"
              :on-success="handleGoodsPicUploadSuccess"
              :file-list="fileList"
              list-type="picture"
              accept=".jpg,.png">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2MB</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品介绍" name="goodsContent">
            <quill-editor v-model="form.goods_introduce" />
            <el-button type="primary" class="margin-top-15" @click="addGoods" :loading="loading">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog
      :title="goodsPic4Preview.name"
      :visible.sync="previewDialogVisible"
      width="50%"
      @close="handlePreviewDialogClose">
      <img v-lazy="goodsPic4Preview.absoluteWebUrl" class="preview-img">
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'GoodsAdd',
  created () {
    this.loadCategories()
  },
  data () {
    const checkGoodsCates = (rule, value, callback) => {
      if (this.selectedCateIds.length === 0) {
        return callback(new Error('商品分类不能为空'))
      }
      callback()
    }
    return {
      activeTabName: 'basicInfo',
      tabNameStepsMap: {
        basicInfo: 0,
        goodsParams: 1,
        goodsAttrs: 2,
        goodsPics: 3,
        goodsContent: 4,
        done: 5
      },
      form: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: '',
        goods_introduce: '',
        pics: [],
        attrs: []
      },
      formRules: {
        goods_name: [
          { required: true, message: '商品名称不能为空', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '商品价格不能为空', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '商品重量不能为空', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '商品数量不能为空', trigger: 'blur' }
        ],
        goods_cat: [
          { validator: checkGoodsCates, trigger: 'change' }
        ]
      },
      categories: [],
      selectedCateIds: [],
      dynamicParams: [],
      staticAttrs: [],
      fileList: [],
      uploadApiHeaders: {
        Authorization: sessionStorage.getItem('token')
      },
      goodsPic4Preview: {},
      previewDialogVisible: false,
      loading: false
    }
  },
  computed: {
    currentStep () {
      return this.tabNameStepsMap[this.activeTabName]
    },
    currentCateId () {
      return this.selectedCateIds[2]
    },
    uploadApiUrl () {
      return `${this.$http.defaults.baseURL}upload`
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
    handleTabClick (tab, event) {
      console.log(this.activeTabName)
    },
    handleCateChange (selectedKeys) {
      if (this.selectedCateIds.length < 3) {
        this.selectedCateIds = []
        return
      }
      this.form.goods_cat = this.selectedCateIds.join(',')
      this.loadDynamicParams()
      this.loadStaticAttrs()
    },
    beforeTabLeave (tabName, oldTabName) {
      console.log('form %s to %s', oldTabName, tabName)
      if (oldTabName === 'basicInfo') {
        return this.$refs.formRef.validate()
      }
    },
    async loadDynamicParams () {
      const { data: res } = await this.$http.get(`categories/${this.currentCateId}/attributes`, { params: { sel: 'many' } })
      if (res.meta.status !== 200) {
        return this.$message.error(`加载动态参数失败：${res.meta.msg}`)
      }
      res.data.forEach(item => {
        if (item.attr_vals && item.attr_vals.trim()) {
          item.checkbox_labels = item.attr_vals = item.attr_vals.split(' ')
        } else {
          item.checkbox_labels = item.attr_vals = []
        }
      })
      this.dynamicParams = res.data
    },
    async loadStaticAttrs () {
      const { data: res } = await this.$http.get(`categories/${this.currentCateId}/attributes`, { params: { sel: 'only' } })
      if (res.meta.status !== 200) {
        return this.$message.error(`加载静态属性失败：${res.meta.msg}`)
      }
      this.staticAttrs = res.data
    },
    handleGoodsPicBeforeUpload (file) {
      console.log('handleGoodsPicBeforeUpload', file)
      const suffix = file.name.substring(file.name.lastIndexOf('.') + 1)
      if (suffix !== 'png' && suffix !== 'jpg') {
        this.$message.error(`图片格式不正确，不支持 ${suffix}`)
        return false
      }
      if (file.size > 2097152) {
        this.$message.error('图片文件大小不能超过2MB')
        return false
      }
    },
    handleGoodsPicPreview (file) {
      console.log('handleGoodsPicPreview', file)
      this.goodsPic4Preview = file
      this.previewDialogVisible = true
    },
    handleGoodsPicRemove (file, fileList) {
      console.log('handleGoodsPicRemove', file, fileList)
      this.fileList = fileList
    },
    handleGoodsPicUploadSuccess (resp, file, fileList) {
      console.log('handleGoodsPicUploadSuccess', resp, file, fileList)
      if (resp.meta.status !== 200) {
        return this.$message.error(`上传图片文件（${file.name}）失败：${resp.meta.msg}`)
      }
      file.absoluteWebUrl = resp.data.url
      file.relativeWebUrl = resp.data.tmp_path
      this.fileList = fileList
    },
    handlePreviewDialogClose () {
      this.previewDialogVisible = false
      this.goodsPic4Preview = {}
    },
    async addGoods () {
      const r = await this.$confirm('确定要提交商品信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (r === 'confirm') {
        this.loading = true
        // 1、处理商品参数和属性
        this.dynamicParams.forEach(item => {
          this.form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          })
        })
        this.staticAttrs.forEach(item => {
          this.form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          })
        })
        // 2、处理商品图片
        this.fileList.forEach(item => {
          this.form.pics.push({
            pic: item.relativeWebUrl
          })
        })
        // 3、将商品信息提交到后台服务器
        const { data: resp } = await this.$http.post('goods', this.form)
        if (resp.meta.status !== 201) {
          this.loading = false
          return this.$message.error(`添加商品失败：${resp.meta.msg}`)
        }
        this.activeTabName = 'done'
        this.loading = false
        this.loadCategories()
        this.$message.success('添加商品成功')
        setTimeout(() => {
          this.$router.push('/goods')
        }, 1000)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.preview-img {
  width: 100%;
}
</style>
