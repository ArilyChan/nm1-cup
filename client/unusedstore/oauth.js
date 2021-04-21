export const state = () => ({
  result: {}
})

export const mutations = {
  set (state, user) {
    state.result = user
  },

  clear (state) {
    state.result = {}
  }
}
