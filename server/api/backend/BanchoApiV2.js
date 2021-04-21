const axios = require('axios')
const FormData = require('form-data')
const MongoClient = require('mongodb').MongoClient
const UserModel = require('../model/User')

class BanchoApi {
  constructor ({ clientId, clientSecret }) {
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  async initPublicToken () {
    const formData = new FormData()
    Object.entries({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
      scope: 'public'
    }).map(([key, value]) => formData.append(key, value))
    const result = await axios.post('https://osu.ppy.sh/oauth/token', formData, {
      headers: formData.getHeaders()
    })
      .then(res => res.data)
      .catch((err) => {
        if (err.response.status === 401) { throw new Error('auth failed') }
        return undefined
      })
    if (!result) { return }
    this.tokenType = result.token_type
    this.expiresIn = result.expires_in
    this.accessToken = result.access_token
  }

  async initUserTokens () {
    if (!process.env.DB_URI) {
      console.warn('database uri is not set. data requires user auth will not be available.\nadd DB_URI=<mongodb database connection string>, TOKEN_DATABASE=<database name>, TOKEN_COLLECTION=<collection name> to your .env configure')
      return
    }
    if (!this.userTokenCollection) {
      const client = await MongoClient.connect(process.env.DB_URI || 'mongodb://localhost:27017', { useUnifiedTopology: true })
      const db = client.db(process.env.TOKEN_DATABASE || 'osu-info-web')
      this.userTokenCollection = db.collection(process.env.TOKEN_COLLECTION || 'bancho-tokens')
    }

    const tokens = await this.userTokenCollection.find({
      expiresAt: { $gte: new Date() }
    }).toArray()

    Promise.all(tokens.map((token) => {
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          resolve(await this.refreshUserToken(token))
        }, token.expiresAt.getTime() - new Date().getTime() - 1000 * 60)
      })
    }))
  }

  async init () {
    await this.initPublicToken()
    await this.initUserTokens()
    this.reTokenTimeout = setTimeout(() => {
      this.init()
    }, (this.expiresIn - 60) * 1000)
  }

  publicTokenHeader () {
    return {
      Authorization: `${this.tokenType} ${this.accessToken}`
    }
  }

  accessTokenHeader (token) {
    return {
      Authorization: `${token.token_type} ${token.access_token}`
    }
  }

  apiCall (endpoint, axiosReq) {
    return axios({
      ...axiosReq,
      url: `https://osu.ppy.sh/api/v2${endpoint}`
    })
  }

  getScore ({ scoreId, mode }, { params, headers } = {}) {
    const options = {
      params,
      headers: headers || this.publicTokenHeader()
    }
    return axios.get(`https://osu.ppy.sh/api/v2/scores/${mode}/${scoreId}`, options).then(res => res.data)
  }

  getUser (handle, mode) {
    return axios.get(`https://osu.ppy.sh/api/v2/users/${handle}${mode ? `/${mode}` : ''}`, {
      headers: this.publicTokenHeader()
    }).then(res => res.data)
  }

  getUserMe (mode, { headers }) {
    return axios.get(`https://osu.ppy.sh/api/v2/me${mode ? `/${mode}` : ''}`, {
      headers: headers || this.publicTokenHeader()
    }).then(res => res.data)
  }

  getUserActivity (user, limit = 20, start = 0) {
    return axios.get(`https://osu.ppy.sh/api/v2/users/${user.id}/recent_activity`, {
      params: {
        limit,
        offset: start
      },
      headers: this.publicTokenHeader()
    }).then(res => res.data)
  }

  getUserKudosu (user, limit = 20, start = 0) {
    return axios.get(`https://osu.ppy.sh/api/v2/users/${user.id}/kudosu`, {
      params: {
        limit,
        offset: start
      },
      headers: this.publicTokenHeader()
    }).then(res => res.data)
  }

  async getUserScores (user, { type = 'best', limit = 12, ...options } = {}) {
    let page = 1
    let current = 0
    let last = 0
    const data = []
    if (limit > 50) {
      last = limit % 50
      page = Math.floor(limit / 50)
      for (;current < page; current += 1) {
        data.push(axios.get(`https://osu.ppy.sh/api/v2/users/${user.id}/scores/${type}`, {
          params: {
            ...options,
            limit: 50,
            offset: current * 50
          },
          headers: this.publicTokenHeader()
        }).then(res => res.data))
      }
    } else {
      last = limit
    }
    if (last) {
      data.push(axios.get(`https://osu.ppy.sh/api/v2/users/${user.id}/scores/${type}`, {
        params: {
          ...options,
          limit: last,
          offset: current * 50
        },
        headers: this.publicTokenHeader()
      }).then(res => res.data))
    }
    return [].concat(...await Promise.all(data))
  }

  getUserRecentScores (user, options) {
    return this.getUserScores(user, {
      ...options,
      type: 'recent'
    })
  }

  getUserBestScores (user, options) {
    return this.getUserScores(user, {
      ...options
    })
  }

  getBeatmapScores ({ id: beatmapId }, { params, headers } = {}) {
    const options = {
      params,
      headers: headers || this.publicTokenHeader()
    }
    return axios.get(`https://osu.ppy.sh/api/v2/beatmaps/${beatmapId}/scores`, options).then(res => res.data)
  }

  async getBeatmapScoresCountry (beatmap, user) {
    const userTokens = await this.getUserValidTokens(user, 'public')
    if (!userTokens.length) { throw new Error('no token') }
    return this.getBeatmapScores(beatmap, {
      params: {
        type: 'country'
      },
      headers: this.accessTokenHeader(userTokens[0])
    })
  }

  getUserValidTokens ({ id: userId }, scope = 'public') {
    return this.userTokenCollection.find({
      userId,
      scope,
      expiresAt: { $gte: new Date() }
    }).toArray()
  }

  removeExpiredTokens () {
    this.userTokenCollection.deleteMany({
      expiresAt: { $lt: new Date() }
    })
  }

  async setUserToken ({ id: userId }, token, scope = 'public') {
    if (!this.userTokenCollection) { throw new Error('user token collection not set') }
    const record = {
      ...token,
      scope,
      userId,
      expiresAt: new Date(new Date().getTime() + token.expires_in * 1000)
    }
    const result = await this.userTokenCollection.updateOne({
      userId,
      scope
    }, { $set: record }, {
      upsert: true
    })
    if (!result) { return }
    return record
  }

  async userOAuthCode (code, scope) {
    const res = await axios.post('https://osu.ppy.sh/oauth/token', {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.BANCHO_V2_REDIRECT_URL
    })
      .then(res => res.data)
      .catch((error) => {
        return error.response.data
      })
    if (!res.access_token) { return false }
    const user = await this.getUserMe(undefined, {
      headers: this.accessTokenHeader(res)
    })
    return (new UserModel(user)).setToken(res, scope)
  }

  refreshUserToken (userToken) {
    return axios.post('https://osu.ppy.sh/oauth/token', {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: userToken.refresh_token
    }, {
      headers: this.publicTokenHeader()
    }).then(res => res.data)
  }

  getMatch (id) {
    return axios.get(`https://osu.ppy.sh/api/v2/matches/${id}`, {
      headers: this.publicTokenHeader()
    }).then(res => res.data)
  }
}

// module.exports = BanchoApi
const bancho = new BanchoApi({
  clientId: process.env.BANCHO_API_V2_CLIENTID,
  clientSecret: process.env.BANCHO_API_V2_CLIENTSECRET
})
bancho.init()

module.exports = bancho
