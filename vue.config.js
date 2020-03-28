const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
module.exports = {
  chainWebpack: config => {
    // 根据打包环境动态切换入口
    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add('./src/main-prod.js')
      // 不进行打包，而是找index.html中的CDN资源
      config.set('externals', {
        vue: 'Vue',
        'vue-quill-editor': 'VueQuillEditor',
        'vue-lazyload': 'VueLazyload',
        echarts: 'echarts',
        axios: 'axios',
        nprogress: 'NProgress',
        'vue-router': 'VueRouter',
        lodash: '_'
      })
      // 通过htmlWebpackPlugin设置首页的一些参数
      config.plugin('html').tap(args => {
        console.log('args', args)
        args[0].title = '电商管理系统'
        args[0].isProd = true
        return args
      })
    })
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')
      config.plugin('html').tap(args => {
        console.log('args', args)
        args[0].title = '电商管理系统 - dev'
        args[0].isProd = false
        return args
      })
    })
  },
  configureWebpack: config => {
    config.plugins.push(new MomentLocalesPlugin({
      localesToKeep: ['zh-cn']
    }))
  }
}
