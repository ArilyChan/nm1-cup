export default async function ({ params, $axios, store }) {
  if (!params.tournament && store.state.tournament.slug) {
    return store.commit('tournament/clear')
  }
  if (params.tournament && !store.state.tournament.slug) {
    await $axios.get(`/api/tournament/${params.tournament}`)
      .then(res => res.data)
      .then(tournament => store.commit('tournament/set', { ...tournament }))
  }
}
