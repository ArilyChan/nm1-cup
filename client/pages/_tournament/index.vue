<template>
  <div class="d-flex align-items-center fullscreen">
    <b-container v-if="$store.state.tournament && $store.state.tournament.statistics" fluid="md">
      <b-row v-if="$store.state.tournament.statistics.player.top">
        <b-col class="py-2">
          <b-card class="shadow mx-auto" no-body style="width:fit-content">
            <b-card-header>Top player</b-card-header>
            <b-card-body>
              <div class="d-flex align-items-center">
                <b-avatar :src="$store.state.tournament.statistics.player.top.avatar_url" size="lg" />
                <b-link :to="{name: 'tournament-users-id', params: { tournament: $store.state.tournament.slug, id: $store.state.tournament.statistics.player.top.id}}">
                  <h3 class="m-0 p-0 pl-1">
                    {{ $store.state.tournament.statistics.player.top.username }}
                  </h3>
                </b-link>
              </div>
              <hr>
              <h3 class="text-center">
                {{ $store.state.tournament.statistics.player.top.elo }} elo
              </h3>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm class="py-2">
          <h3 class="text-center">
            start: {{ new Date($store.state.tournament.start).toLocaleString() }}
          </h3>
        </b-col>
        <b-col sm class="py-2">
          <h3 class="text-center">
            end: {{ new Date($store.state.tournament.end).toLocaleString() }}
          </h3>
        </b-col>
      </b-row>
      <b-row>
        <b-col v-if="$store.state.tournament['battle-royale']" sm class="py-2">
          <h3 class="text-center">
            current elo margin: {{ $store.state.tournament['battle-royale'].current.eloMargin }}
          </h3>
        </b-col>
        <b-col class="py-2">
          <h3 class="text-center">
            {{ $store.state.tournament.statistics.player.count }} players joined
          </h3>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="text-center">
          <b-button-group>
            <b-button :to="{name: 'tournament-sign-up', params: {tournament: $store.state.tournament.slug}}" variant="primary">
              sign up for tournament
            </b-button>
            <b-button :to="{name: 'tournament-players', params: {tournament: $store.state.tournament.slug}}" variant="info">
              view registered players
            </b-button>
          </b-button-group>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  middleware: ['load-tournament']
}
</script>

<style scoped>
.fullscreen {
  height: 100vh;
}
</style>
