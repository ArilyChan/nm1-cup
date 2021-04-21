module.exports = {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'client',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    // { src: '~/plugins/persistedState.js' },
    { src: '@/plugins/vue-json-editor', ssr: false }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/proxy',
    'cookie-universal-nuxt',
    '@nuxtjs/auth-next'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},
  publicRuntimeConfig: {
    axios: {
      browserBaseURL: '/'
    }
  },

  privateRuntimeConfig: {
    axios: {
      baseURL: `http://localhost:${process.env.PORT || 3000}`
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  },
  srcDir: 'client/',
  telemetry: false,
  env: {
    clientId: process.env.BANCHO_API_V2_CLIENTID,
    clientSecret: process.env.BANCHO_API_V2_CLIENTSECRET,
    OAuthRedirectUrl: process.env.BANCHO_V2_REDIRECT_URL
  },
  proxy: {
    // see Proxy section
    '/api': process.env.API_SCHEME?.startsWith('unix')
      ? {
          changeOrigin: false,
          target: { socketPath: process.env.API_LISTEN }
        }
      : {
          changeOrigin: false,
          target: `${process.env.API_SCHEME}${process.env.API_DOMAIN}:${process.env.API_LISTEN}`
        }
  },
  server: {
    host: '0' // default: localhost
  },
  auth: {
    redirect: {
      login: 'OAuth/require'
    },
    strategies: {
      osu: {
        scheme: 'local',
        token: {
          property: false
        },
        endpoints: {
          login: { url: '/api/OAuth/code', method: 'get' },
          // user: { url: '/api/broker/osu-api-v2/user/me/osu', method: 'get' },
          user: false,
          logout: false
        }
      }
    }
  }
}
