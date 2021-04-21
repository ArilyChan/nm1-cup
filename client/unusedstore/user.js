import Vue from 'vue'
export const state = () => ({
})

export const mutations = {
  append (state, user) {
    Object.entries(user).forEach(([k, v]) => {
      Vue.set(state.options, k, v)
    })
  },

  set (state, user) {
    Object.keys(state).forEach(s => Vue.delete(state, s))
    Object.entries(user).forEach(([k, v]) => {
      Vue.set(state, k, v)
    })
  },

  clear (state) {
    Object.keys(state).forEach(s => Vue.delete(state, s))
  }
}
