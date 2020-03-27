<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <div id="main" class="chart"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import _ from 'lodash'
export default {
  name: 'Reports',
  async mounted () {
    const { data: res } = await this.$http.get('reports/type/1')
    console.log('res', res)
    if (res.meta.status !== 200) {
      return this.$message.error(`加载报表数据失败：${res.meta.msg}`)
    }
    const chart = echarts.init(document.getElementById('main'))
    /*
    const options = Object.assign({}, this.options, res.data)
    options.xAxis[0].boundaryGap = false
    */
    const options = _.merge(res.data, this.options)
    chart.setOption(options)
  },
  data () {
    return {
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  }
}
</script>

<style lang="less" scoped>
.chart {
  width: 800px;
  height: 400px;
}
</style>
