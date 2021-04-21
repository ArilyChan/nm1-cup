const { Nuxt } = require('nuxt')

const express = require('express')
const app = express()
const isProd = process.env.NODE_ENV === 'production'

// 用指定的配置对象实例化 Nuxt.js
const config = require('../nuxt.config.js')
config.dev = !isProd
const nuxt = new Nuxt(config)

app.use(express.static('../static'))
app.use('/api', require('./api'))

// 用 Nuxt.js 渲染每个路由
app.use(nuxt.render)

module.exports = { app, nuxt }
