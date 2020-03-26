<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入搜索内容" v-model="searchKey" clearable @clear="reqParams.query = ''">
            <el-button slot="append" icon="el-icon-search" @click="reqParams.query = searchKey"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table
        :data="orders"
        border
        stripe>
        <el-table-column
          label="序号"
          type="index"
          :index="1"
          width="60">
        </el-table-column>
        <el-table-column
          prop="order_number"
          label="订单编号">
        </el-table-column>
        <el-table-column
          prop="order_price"
          label="订单价格"
          width="90">
        </el-table-column>
        <el-table-column
          label="是否付款"
          width="90">
          <template slot-scope="scope">
            <el-tag :type="scope.row.order_pay === 1 ? 'success' : 'danger'">{{ scope.row.order_pay === 1 ? '已付款' : '未付款' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_send"
          label="是否发货"
          width="90">
        </el-table-column>
        <el-table-column
          label="下单时间"
          width="160">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
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
              icon="el-icon-location-outline"
              type="success"
              class="edit-btn"
              @click="handleLocation(scope.$index, scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="reqParams.pagenum"
        :page-sizes="[5, 10, 20, 50, 100]"
        :page-size="reqParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <el-dialog
      title="修改地址"
      :visible.sync="modifyDialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @closed="handleModifyDialogClosed">
      <el-form ref="modifyFormRef" :model="modifyForm" :rules="modifyFormRules" label-width="100px">
        <el-form-item label="省市区/县" prop="region">
          <el-cascader
            v-model="modifyForm.region"
            :options="cityData"
            :props="{ expandTrigger: 'hover'}"
            @change="handleRegionChange"
            placeholder="请选择区域"
            clearable>
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="modifyForm.address" maxlength="150" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modify" :loading="modifying">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="查看物流进度"
      :visible.sync="logisticsProcessDialogVisible"
      width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(process, index) in logisticsProcessInfo"
          :key="index"
          :timestamp="process.time"
          :type="index === 0 ? 'success' : 'info'"
          placement="top">
          {{ process.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  name: 'Orders',
  created () {
    this.loadOrders()
  },
  data () {
    return {
      reqParams: {
        pagenum: 1,
        pagesize: 5,
        query: ''
      },
      orders: [],
      total: 0,
      searchKey: '',
      modifyDialogVisible: false,
      modifyForm: {
        id: '',
        region: [],
        address: ''
      },
      modifyFormRules: {
        region: [
          { type: 'array', required: true, message: '省市区/县不能为空', trigger: 'change' }
        ],
        address: [
          { required: true, message: '详细地址不能为空', trigger: 'blur' }
        ]
      },
      modifying: false,
      cityData: cityData,
      logisticsProcessDialogVisible: false,
      logisticsProcessInfo: []
    }
  },
  methods: {
    async loadOrders () {
      const { data: res } = await this.$http.get('orders', { params: this.reqParams })
      if (res.meta.status !== 200) {
        return this.$message.error(`加载订单列表失败：${res.meta.msg}`)
      }
      this.orders = res.data.goods
      this.total = res.data.total
    },
    handleEdit (index, row) {
      this.modifyForm = { id: row.order_id, address: '', region: [] }
      this.modifyDialogVisible = true
    },
    handleRegionChange () {
      console.log('当前所选区域是', this.modifyForm.region)
    },
    async handleLocation (index, { order_number: orderNumber }) {
      console.log('handleLocation', orderNumber)
      const { data: resp } = await this.$http.get('/kuaidi/1106975712662')
      console.log(resp)
      if (resp.meta.status !== 200) {
        return this.$message.error(`获取物流信息失败：${resp.meta.msg}`)
      }
      this.logisticsProcessInfo = resp.data
      this.logisticsProcessDialogVisible = true
    },
    handleSizeChange (val) {
      console.log(`每页 ${val} 条`)
      this.reqParams.pagesize = val
    },
    handleCurrentChange (val) {
      console.log(`当前页: ${val}`)
      this.reqParams.pagenum = val
    },
    modify () {
      console.log('修改地址信息', this.modifyForm)
    },
    handleModifyDialogClosed () {
      this.$refs.modifyFormRef.resetFields()
    }
  },
  watch: {
    reqParams: {
      deep: true,
      handler (val) {
        console.log('请求参数改变了', val)
        this.loadOrders()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
