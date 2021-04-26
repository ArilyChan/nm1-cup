const MongoClient = require('mongodb').MongoClient
const bancho = require('../BanchoApiV2')
const PublicController = require('../../controller/PublicController')

const slimPlayerFields = ['id', 'username', 'avatar_url', 'elo', 'eliminated', 'statistics', 'conver_url', 'last_visit', 'join_date', 'is_active']
module.exports = class nm1Cup {
  constructor () {
    this.initCollecitons()
  }

  get slimPlayerFields () { return slimPlayerFields }

  async initCollecitons () {
    const client = await MongoClient.connect(process.env.DB_URI || 'mongodb://localhost:27017', { useUnifiedTopology: true })
    const db = client.db(process.env.TOKEN_DATABASE || 'osu-info-web')
    this.collections = {
      players: db.collection('players'),
      matches: db.collection('matches'),
      'bancho-tokens': db.collection('bancho-tokens'),
      games: db.collection('games')
    }
  }

  async listTournament (filter = {}) {
    const tournaments = await this.collections.games.find(filter).toArray()
    return Promise.all(tournaments.map(this.addStatisticsToTournament.bind(this)))
  }

  async joinUser (tournament, { token }) {
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
    return await this.collections.players.find({ tournament, ...query }).toArray().then(arr => arr.map(this.playerSlimFieldsFilter.bind(this)))
  }

  async getPlayer (tournament, id) {
    return await this.collections.players.findOne({ id: parseInt(id), tournament }).then(p => this.playerSlimFieldsFilter(p))
  }

  async markEloBelowRequiredMarginPlayer (tournament) {
    const statistics = await this.collections.statistics.findOne({ slug: tournament })
    const players = this.collections.players.find().map((doc) => {
      if (doc.eliminated) { return doc }
      if (doc.elo < statistics.current.eloMargin) {
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
    return this.collections.games.findOne({ slug: tournament })
  }

  async updateGame (tournament, game) {
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
    const game = await this.getTournamentReal(tournament)
    return this.addStatisticsToTournament(game)
  }

  async getTournamentReal (tournament) {
    const game = await this.collections.games.findOne({ slug: tournament })
    return game || {}
  }

  async addStatisticsToTournament (game) {
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
    try {
      const game = await this.getGame(tournament)
      const stratregy = game.stratregy && require(`./stratregy/${game.stratregy}`)
      const mp = await PublicController.getMatchInfo(mpid)
      if (!mp || !mp?.events) {
        return {
          status: false,
          reason: 'error when fetching mp info'
        }
      }
      const result = await stratregy.onSubmit({ mp, game, manager: this })
      return result
    } catch (error) {
      return {
        status: false,
        reason: 'game stratregy not found',
        error: { message: error.message, stack: error.stack }
      }
    }
  }
}
