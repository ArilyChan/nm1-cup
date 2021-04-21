<template>
  <div class="d-flex align-items-center justify-content-center fullscreen">
    <b-link :href="oauth()">
      Click here to Sign up
    </b-link>
  </div>
</template>

<script>
export default {
  data () {
    return {
      payload: {
        client_id: process.env.clientId,
        redirect_uri: process.env.OAuthRedirectUrl,
        response_type: 'code',
        scope: 'identify',
        state: JSON.stringify({
          scope: 'identify'
        })
      }
    }
  },
  methods: {
    oauth () {
      const params = new URLSearchParams(this.payload)
      return `https://osu.ppy.sh/oauth/authorize?${params}`
    }
  }
}
</script>

<style scoped>
.fullscreen {
  height: 100vh
}
</style>
