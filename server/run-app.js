const { Builder } = require('nuxt')
const config = require('../nuxt.config.js')
const { app, nuxt } = require('./app')
const port = process.env.PORT || 3000
// 在开发模式下启用编译构建和热加载
if (config.dev) {
  new Builder(nuxt).build().then(listen)
} else {
  listen()
}

function listen () {
  // 服务端监听
  app.listen(port)
  console.log('Server listening on `' + port + '`.')
}
