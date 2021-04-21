<template>
  <b-container fluid="md">
    <b-row>
      <b-col>
        <b-card no-body>
          <b-card-body>
            <b-card-title>registered players</b-card-title>
          </b-card-body>
          <b-list-group flush>
            <b-list-group-item v-for="player in players" :key="player.id">
              <div class="d-flex justify-content-between">
                <div>
                  <b-avatar :src="player.avatar_url" />
                  <b-link :href="`https://info.osustuff.ri.mk/users/${player.id}`">
                    {{ player.username }}
                  </b-link>
                </div>
                <div class="flex-grow-1 text-right">
                  <b-card-text class="mb-0">
                    rank(at registration): #{{ player.statistics.global_rank }}
                  </b-card-text>
                  <b-card-text>elo: {{ player.elo }}</b-card-text>
                </div>
              </div>
            </b-list-group-item>
          </b-list-group>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  async asyncData ({ $axios, store }) {
    return {
      players: await $axios.get(`/api/tournament/${store.state.tournament.slug}/players`).then(res => res.data).then(players => players.sort((a, b) => b.elo - a.elo))
    }
  }
}
</script>
