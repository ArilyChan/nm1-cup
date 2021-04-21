export const actions = {
  async nuxtServerInit ({ commit }, { $axios, params, $auth, route }) {
    if (route.path === '/logout') { return }
    const token = $auth.strategy.token.get()
    if (!token) { return }
    if (new Date(token.expiresAt) >= new Date()) {
      if (!$auth.user.id) {
        const user = await $axios.get(`/api/broker/osu-api-v2/${token.access_token}/me/osu`).then(res => res.data)
        if (user?.id) { $auth.setUser(user) }
      }
    } else {
      return $auth.logout()
    }
  }
}
