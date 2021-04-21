<template>
  <div class="d-flex flex-column text-center">
    <span v-if="$store.state.auth.loggedIn" class="mt-1">
      OAuth successed
    </span>
    <span v-if="$store.state.auth.user.id" class="mt-1">
      Logged in as {{ $store.state.auth.user.username }}
    </span>
    <span v-if="$store.state.auth.user.id" class="mt-1">
      auto redirect to index in {{ countdown }}
    </span>
    <b-button :to="{name: 'index'}" class="mt-1">
      to index
    </b-button>
    <!-- <b-button :to="{name: 'sign-up'}" class="mt-1">
      sign up
    </b-button> -->
  </div>
</template>
<script>
export default {
  data () {
    return {
      countdown: 5,
      i: undefined
    }
  },
  async fetch ({ query, $axios, store, $auth }) {
    const result = await $auth.loginWith('osu', { params: query }).then(res => res.data)
    await $auth.setUser(await $axios.get(`/api/broker/osu-api-v2/${result.access_token}/me/osu`).then(res => res.data))
  },
  mounted () {
    // this.
    if (!this.$store.state.auth.user.id) { return }
    this.i = setInterval(() => {
      this.countdown -= 1
      if (this.countdown < 0) {
        this.$router.push('/')
        clearInterval(this.i)
      }
    }, 1000)
  },
  beforeDestroy () {
    clearInterval(this.i)
  }
}
</script>
