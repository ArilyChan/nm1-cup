<template>
  <div>
    <b-overlay v-if="$auth.user.id" :show="registerClicked">
      <template #overlay>
        <span v-if="registrationResult.success">
          done!
        </span>
        <b-button v-if="registrationResult.success" :to="{name:'index'}">
          return to index
        </b-button>
        <span class="text-warning">{{ registrationResult.reason }}</span>
        <b-button v-if="!registrationResult.success" :to="{name:'index'}">
          return to index
        </b-button>
      </template>
      <b-jumbotron header="registration" :lead="`You are about to sign up for ${$store.state.tournament.name}`">
        <b-button variant="primary" @click="register">
          confirm
        </b-button>
      </b-jumbotron>
    </b-overlay>
    <div v-else class="d-flex align-items-center justify-content-center">
      please <b-button :to="{name: 'OAuth-require'}">
        auth
      </b-button>
    </div>
  </div>
</template>
<script>
export default {
  middleware: ['auth', 'load-tournament'],
  data () {
    return {
      registerClicked: false,
      registrationResult: {}
    }
  },
  methods: {
    async register () {
      const result = await this.$axios.get(`/api/tournament/${this.$store.state.tournament.slug}/join/` + this.$auth.strategy.token.get().access_token).then(res => res.data)
      this.registerClicked = true
      this.registrationResult = result
    }
  }
}
</script>
