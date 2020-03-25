<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入搜索内容" v-model="searchKey" clearable @clear="reqParams.query = ''">
            <el-button slot="append" icon="el-icon-search" @click="reqParams.query = searchKey"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="$router.push('/goods/add')">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table
        :data="goods"
        border
        stripe>
        <el-table-column
          label="#"
          type="index">
        </el-table-column>
        <el-table-column
          prop="goods_name"
          label="商品名称">
        </el-table-column>
        <el-table-column
          prop="goods_price"
          label="商品价格（元）"
          width="125">
        </el-table-column>
        <el-table-column
          prop="goods_weight"
          label="商品重量"
          width="85">
        </el-table-column>
        <el-table-column
          label="创建时间"
          width="165">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="130">
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
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="reqParams.pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="reqParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background>
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'GoodsList',
  created () {
    this.loadGoods()
  },
  data () {
    return {
      reqParams: {
        pagenum: 1,
        pagesize: 5,
        query: ''
      },
      goods: [],
      total: 0,
      searchKey: ''
    }
  },
  methods: {
    async loadGoods () {
      const { data: res } = await this.$http.get('goods', { params: this.reqParams })
      if (res.meta.status !== 200) {
        return this.$message.error(`加载商品列表失败：${res.meta.msg}`)
      }
      this.goods = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (val) {
      console.log(`每页 ${val} 条`)
      this.reqParams.pagesize = val
    },
    handleCurrentChange (val) {
      console.log(`当前页: ${val}`)
      this.reqParams.pagenum = val
    },
    handleEdit (index, row) {
      console.log('handleEdit', index, row)
    },
    async handleDelete (index, { goods_id: id }) {
      const r = await this.$confirm('确定要删除这条记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (r === 'confirm') {
        const { data: resp } = await this.$http.delete(`goods/${id}`)
        if (resp.meta.status !== 200) {
          return this.$message.error(`删除商品失败：${resp.meta.msg}`)
        }
        this.loadGoods()
        this.$message.success('删除商品成功')
      }
    }
  },
  watch: {
    reqParams: {
      deep: true,
      handler (val) {
        this.loadGoods()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
