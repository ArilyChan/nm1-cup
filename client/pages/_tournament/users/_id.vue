<template>
  <b-container fluid="md" class="pt-4">
    <b-row>
      <b-col>
        <b-card v-if="user.registered !== false" class="shadow border-0" no-body>
          <b-card-header>
            <div class="d-flex justify-content-center">
              <b-avatar :src="user.avatar_url" class="mr-2" />
              <h2 class="mb-0 pb-0">
                {{ user.username }}
              </h2>
            </div>
          </b-card-header>
          <b-card-body>
            <b-container fluid>
              <b-row>
                <b-col>
                  elo: {{ user.elo }}
                </b-col>
                <b-col>
                  <div v-if="user.eliminated">
                    eliminated
                  </div>
                  <div v-else>
                    alive, {{ user.elo - $store.state.tournament.statistics.current.eloMargin }} away from knock out before next update
                  </div>
                </b-col>
              </b-row>
            </b-container>
          </b-card-body>
          <b-card-footer class="py-1">
            <div class="d-flex">
              <b-button-toolbar class="ml-auto">
                <b-button :href="`https://info.osustuff.ri.mk/users/${user.id}`" variant="info" size="sm">
                  see stat at info.osustuff.ri.mk
                </b-button>
              </b-button-toolbar>
            </div>
          </b-card-footer>
        </b-card>
        <b-card v-else class="shadow border-0">
          <b-card-title>user is not in the tournament</b-card-title>
          <b-link :to="{name: 'tournament'}">
            return to index
          </b-link>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  async asyncData ({ $axios, params, store }) {
    const user = Number.isInteger(params.id) ? { id: params.id } : await $axios.get('/api/broker/osu-api-v2/public/users/' + params.id).then(res => res.data)
    return {
      user: await $axios.get(`/api/tournament/${store.state.tournament.slug}/player/` + user.id).then(res => res.data) || { registered: false }
    }
  }
}
</script>
