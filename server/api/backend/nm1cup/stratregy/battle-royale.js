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
// const mappool = [1840640]

function validateResult (ok, reason) {
  if (ok) { return { status: ok, reason } }
}
function gameFilter (maps) {
  return game => game.mode === 'osu' &&
  (maps.includes(game.beatmap.id) || maps.includes(parseInt(game.beatmap.id)))
}
module.exports = {

  description: 'elo下线每日会抬高，小心自己沉没！在每日结算前您仍有机会踩着别人的尸体上岸！！',

  get requiredOptions () {
    return requiredOptions
  },

  async onSubmit ({ mp, game, manager }) {
    const { games, players } = utils.playersInMatch(mp)

    const maps = await manager.getPool(game.slug)
    const valid = games.filter(gameFilter(maps.map(({ id }) => id)))
    const playersInGame = await manager.getPlayers(game.slug, {
      id: {
        $in: players.map(p => p.id)
      }
    })
    const form = new FormData()
    const submitPlayers = {
      elos: playersInGame.map(player => ({
        uid: player.id,
        elo: player.elo || 1000
      }))
    }
    form.append('elo', JSON.stringify(submitPlayers))
    const copy = {
      ...mp
    }
    mp.events = [...mp.events.filter(event => event.game && valid.includes(event.game))]
    console.log({
      players,
      submitPlayers,
      mp
    })
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
    return await module.exports.processResponse({ mp: copy, result: request, manager, before: submitPlayers, game })
  },

  async processResponse ({ mp, result, manager, before, game }) {
    if (result?.message !== 'Success') {
      return {
        origin: result,
        status: false
      }
    }
    result.elos.forEach((res) => {
      const b = before.elos.find(u => u.uid === res.key)
      res.delta = res.value - b.elo
    })
    const collection = manager.collections.matches
    const done = await collection.findOne({
      'match.match.id': mp.id,
      tournament: game.slug,
      calculated: true
    })
    if (done) {
      return {
        statue: false,
        reason: 'submitted match'
      }
    }
    const session = manager.client.startSession()
    session.startTransaction()
    try {
      const insertResult = await collection.insertOne({
        match: mp,
        tournament: game.slug,
        result,
        calculated: true
      })
      if (!insertResult.insertedId) {
        await session.abortTransaction()
        return
      }

      await Promise.all(result.elos.map(({ key, value, delta }) => {
        return manager.collections.players.findOneAndUpdate({
          tournament: game.slug,
          id: key
        }, {
          $inc: {
            elo: delta
          }
        })
      }))
      await session.commitTransaction()
      await session.endSession()
      return {
        status: true,
        result
      }
    } catch (error) {
      console.log(error)
      await session.abortTransaction()
      return {
        statue: false,
        reason: 'error when inserting match result to database'
      }
    }
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
