<template>
  <b-container class="pt-4">
    <b-row>
      <b-col>
        <div>
          choose a tournament
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col v-for="tournament in tournaments" :key="'tournament-' + tournament.slug" class="px-2">
        <b-link :to="{name:'tournament', params: {tournament: tournament.slug}}">
          <b-card no-body>
            <b-card-header>
              {{ tournament.name || 'unnamed' }}
            </b-card-header>
            <b-card-body>
              <div v-if="tournament.statistics.player.top">
                top: {{ tournament.statistics.player.top.username }}
              </div>
              <div>{{ tournament.statistics.player.count }} players joined</div>
            </b-card-body>
          </b-card>
        </b-link>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  middleware: ['load-tournament'],
  async asyncData ({ $axios }) {
    return {
      tournaments: await $axios.get('/api/tournament/all').then(res => res.data)
    }
  }
}
</script>
