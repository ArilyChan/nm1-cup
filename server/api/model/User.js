class User {
  constructor (osuApiUser) {
    this.data = osuApiUser
    this.bacho = require('../backend/BanchoApiV2')
  }

  getRecentScores (arg) {
    return this.bacho.getUserRecentScores(this.data, arg)
  }

  getCountryRankingOnBeatmap (bm) {
    return this.bacho.getBeatmapScoresCountry(bm, this.data)
  }

  getBestScores (arg) {
    return this.bacho.getUserBestScores(this.data, arg)
  }

  getActivity (limit, start) {
    return this.bacho.getUserActivity(this.data, limit, start)
  }

  setToken (token, scope) {
    return this.bacho.setUserToken(this.data, token, scope)
  }
}

module.exports = User
