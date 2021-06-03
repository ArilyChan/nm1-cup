const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId
const bancho = require('../BanchoApiV2')
const PublicController = require('../../controller/PublicController')

const slimPlayerFields = ['id', 'username', 'avatar_url', 'elo', 'eliminated', 'statistics', 'conver_url', 'last_visit', 'join_date', 'is_active']

// const unsetFields = (old, newValue) => {
//   const $unset = {}
//   Object.keys(newValue).forEach((k) => {
//     if (k === '_id') { return }
//     if (!old[k]) { $unset[k] = 1 }
//   })
//   delete old._id
//   return $unset
// }
module.exports = class nm1Cup {
  constructor () {
    this.ready = false
    this.initCollecitons()
  }

  get slimPlayerFields () { return slimPlayerFields }

  async initCollecitons () {
    const client = await MongoClient.connect(process.env.DB_URI || 'mongodb://localhost:27017', { useUnifiedTopology: true })
    const db = client.db(process.env.TOKEN_DATABASE || 'osu-info-web')
    this.client = client
    this.db = db
    this.collections = {
      players: db.collection('players'),
      matches: db.collection('matches'),
      'bancho-tokens': db.collection('bancho-tokens'),
      games: db.collection('games'),
      poolMaps: db.collection('pool-maps')
    }
    this.collections.players.createIndex({
      id: 1,
      tournament: 1
    })
    this.collections.matches.createIndex({
      'match.match.id': 1,
      tournament: 1,
      calculated: 1
    })
    this.collections['bancho-tokens'].createIndex({
      userId: 1
    })
    this.collections.games.createIndex({
      slug: 1
    })
    this.collections.poolMaps.createIndex({ tournament: 1, id: 1 })
    this.ready = true
  }

  async listTournament (filter = {}) {
    if (!this.ready) { return { status: false, reason: 'database initializing' } }
    const tournaments = await this.collections.games.find(filter).toArray()
    return Promise.all(tournaments.map(this.addStatisticsToTournament.bind(this)))
  }

  async joinUser (tournament, { token }) {
    if (!this.ready) { return { status: false, reason: 'database initializing' } }
    const userToken = await this.collections['bancho-tokens'].findOne({ access_token: token })
    if (!userToken) {
      return {
        success: false,
        reason: 'token not exists'
      }
    }
    const id = userToken.userId
    const userExists = await this.collections.players.findOne({ id, tournament })
    if (userExists) {
      return {
        success: false,
        reason: 'user already joined'
      }
    }
    const user = await bancho.getUser(id).catch((err) => {
      if (err.response.status === 404) { return null }
      return err.response.data
    })
    if (!user || !user.id) {
      return {
        success: false,
        reason: user?.error || 404
      }
    }
    user.elo = 1000
    user.tournament = tournament
    delete user.page
    const result = await this.collections.players.insertOne(user)
    return {
      success: result.result.n > 0,
      result
    }
  }

  playerSlimFieldsFilter (player) {
    if (!player) { return player }
    const rtn = {}
    this.slimPlayerFields.forEach((field) => {
      rtn[field] = player[field]
    })
    return rtn
  }

  async getPlayers (tournament, query = {}) {
    if (!this.ready) { return { status: false, reason: 'database initializing' } }
    return await this.collections.players.find({ tournament, ...query }).toArray().then(arr => arr.map(this.playerSlimFieldsFilter.bind(this)))
  }

  async getPlayer (tournament, id) {
    if (!this.ready) { return { status: false, reason: 'database initializing' } }
    return await this.collections.players.findOne({ id: parseInt(id), tournament }).then(p => this.playerSlimFieldsFilter(p))
  }

  async markEloBelowRequiredMarginPlayer (tournament) {
    if (!this.ready) { return { status: false, reason: 'database initializing' } }
    const game = await this.getGame(tournament)
    const eloMargin = game?.['battle-royale']?.current?.eloMargin
    const players = this.collections.players.find().map((doc) => {
      if (doc.eliminated) { return doc }
      if (doc.elo < eloMargin) {
        doc.eliminated = true
        doc.eliminatedThisTime = true
      }
      return doc
    })
    const result = await players.toArray()
    const dead = result.filter(r => r.eliminatedThisTime)
    await this.collections.players.updateMany({ _id: { $in: dead.map(d => d._id) } }, { $set: { eliminated: true } })
    return result
  }

  resetPlayersMark (tournament, find = {}) {
    if (!this.ready) { return { status: false, reason: 'database initializing' } }
    find.tournament = tournament
    const result = this.collections.players.updateMany(find, {
      $unset: { eliminated: 1, page: 1 }
    })
    return {
      success: result.result.n > 0,
      result
    }
  }

  getGame (tournament) {
    if (!this.ready) { return { status: false, reason: 'database initializing' } }
    return this.collections.games.findOne({ slug: tournament })
  }

  async updateGame (tournament, game) {
    if (!this.ready) { return { status: false, reason: 'database initializing' } }
    const $unset = {}
    const current = await this.getGame(tournament) || {}
    Object.keys(current).forEach((k) => {
      if (k === '_id') { return }
      if (!game[k]) { $unset[k] = 1 }
    })
    delete game._id
    const mod = { $set: game, $unset }

    if (!Object.keys($unset).length) { delete mod.$unset }
    return await this.collections.games.updateOne({ slug: tournament }, mod, { upsert: true })
  }

  async getTournament (tournament) {
    if (!this.ready) { return { status: false, reason: 'database initializing' } }
    const game = await this.getTournamentReal(tournament)
    return this.addStatisticsToTournament(game)
  }

  async getTournamentReal (tournament) {
    if (!this.ready) { return { status: false, reason: 'database initializing' } }
    const game = await this.getGame(tournament)
    return game || {}
  }

  async addStatisticsToTournament (game) {
    if (!this.ready) { return { status: false, reason: 'database initializing' } }
    try {
      const stratregy = game.stratregy && require(`./stratregy/${game.stratregy}`)
      game.description = stratregy.description
    } catch (error) {
    }
    const top = (await this.collections.players.find({ tournament: game.slug }).sort({ elo: -1 }).limit(1).toArray())[0]
    game.statistics = {
      ...game.statistics ?? {},
      player: {
        count: await this.collections.players.find({ tournament: game.slug }).count(),
        top: this.playerSlimFieldsFilter(top)
      }
    }
    return game
  }

  async submitMpResult (tournament, mpid) {
    if (!this.ready) { return { status: false, reason: 'database initializing' } }
    try {
      const game = await this.getGame(tournament)
      const stratregy = game.stratregy && require(`./stratregy/${game.stratregy}`)
      const mp = await PublicController.getMatchInfo(mpid).catch(_ => _)
      if (!mp || !mp?.events) {
        // return {
        //   status: false,
        //   reason: 'error when fetching mp info'
        // }
        throw new Error('error on fetching match info')
      }
      const result = await stratregy.onSubmit({ mp, game, manager: this })
      return result
    } catch (error) {
      return {
        status: false,
        reason: error.message || 'game stratregy not found',
        error: { message: error.message, stack: error.stack }
      }
    }
  }

  async getPool (tournament, toArray = true) {
    const collection = this.collections.poolMaps
    const res = await collection.find({ tournament })
    if (toArray) { return res.toArray() } else { return res }
  }

  async poolAddMap (tournament, beatmapId) {
    const game = await this.getGame(tournament)
    if (!game) { throw new Error('game non-exists') }
    const beatmap = await bancho.getBeatmap({ id: beatmapId }).catch(_ => undefined)
    if (!beatmap) { throw new Error('beatmap id invalid') }
    const res = await this.collections.poolMaps.updateOne(
      {
        tournament,
        id: beatmap.id
      }, {
        $set: {
          ...beatmap,
          tournament
        }
      },
      {
        upsert: true
      })
    return {
      status: (res.upsertedCount && true) || false,
      response: res
    }
  }

  async poolEditMap (_id, upsert) {
    _id = ObjectId(_id)
    // const beatmap = await this.collections.poolMaps.findOne({ _id })
    delete upsert._id
    const res = await this.collections.poolMaps.findOneAndReplace({ _id }, upsert)
    return res
  }
}
