// TODO: schedule update elo margin
// https://www.npmjs.com/package/node-schedule
const axios = require('axios')
const FormData = require('form-data')
const utils = require('../../../../../universal/utils/MatchStats')

const requiredOptions = {
  start: {
    type: 'ISODate',
    description: 'tournament start date'
  },
  end: {
    type: 'ISODate',
    description: 'tournament end date'
  },
  eloMarginIncrease: {
    type: 'object',
    description: 'intervals of increasing elo margin',
    value: {
      daily: {
        type: 'number',
        description: 'increment per day'
      }
    }
  }
}
const mappool = [1840640]
function validateResult (ok, reason) {
  if (ok) { return { status: ok, reason } }
}
function gameFilter (game) {
  return game.mode === 'osu' &&
  mappool.includes(game.beatmap.id)
}
module.exports = {

  description: 'elo下线每日会抬高，小心自己沉没！在每日结算前您仍有机会踩着别人的尸体上岸！！',

  get requiredOptions () {
    return requiredOptions
  },

  async onSubmit ({ mp, game, manager }) {
    const { games, players } = utils.playersInMatch(mp)
    const valid = games.filter(gameFilter)
    const playersInGame = await manager.getPlayers(game.slug, {
      _id: {
        $in: players.map(p => p.id)
      }
    })
    const form = new FormData()
    // form.append('elo', JSON.stringify({
    //   elos: playersInGame.map(player => ({
    //     uid: player.id,
    //     elo: player.elo
    //   }))
    // }))
    form.append('elo', JSON.stringify({
      elos: players.map(player => ({
        uid: player.id,
        elo: player.elo || 1000
      }))
    }))
    mp.events = mp.events.filter(event => event.game && valid.includes(event.game))
    form.append('matchentity', JSON.stringify(mp))
    const request = await axios({
      method: 'post',
      url: 'http://13.113.95.234:19201/api/Elo/Calculate',
      data: form,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${form._boundary}`
      }
    })
      .then(res => res.data)
      .catch(err => err)
    return request
  },

  validateOptions (options) {
    if (!options.start) { return validateResult(false, 'start undefined') }
    if (!options.end) { return validateResult(false, 'end undefined') }
    if (!options.eloMarginIncrease?.daily) { return validateResult(false, 'daily margin incrment required') }
    return validateResult(true)
  }

  // async update(oldVal, newVal) {

  // },
}
