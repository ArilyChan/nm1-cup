const axios = require('axios')
const Translator = require('../../helpers/ModeTranslator')
const translator = new Translator().from('ppv2').to('numerical')
class OsuTrack {
  constructor () {
    this.base = 'https://osutrack-api.ameo.dev'
  }

  getUserHistoricalBest ({ id, playmode }) {
    return axios.get(`${this.base}/peak`, { params: { user: id, mode: translator.mode(playmode) } }).then(data => data.data)
  }

  updateUser ({ id, playmode }) {
    return axios.post(`${this.base}/update`, null, { params: { user: id, mode: translator.mode(playmode) } }).then(data => data.data)
  }
}

module.exports = new OsuTrack()
