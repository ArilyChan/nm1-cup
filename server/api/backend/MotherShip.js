const moment = require('moment')
const axios = require('axios')
class MotherShip {
  async getUserHistory ({ id }, start = new Date(), limit = 0, timeout = 1000 * 5) {
    const dateStr = moment(start).format('YYYYMMDD')

    if (!limit) { limit = Math.ceil((new Date() - start) / (1000 * 3600 * 24)) - 1 }
    if (!limit) { limit = 1 }

    const result = await axios.get(`https://www.mothership.top/api/v1/userinfo/${id}`, {
      params: {
        start: dateStr,
        limit
      },
      timeout
    })
      .then(res => res.data)
    if (result.code === 0) {
      return result.data.filter(r => r !== null)
    } else if (result.code === 3) {
      const dateStr = Object.values(result.data).join('-')
      return this.getUserHistory({ id }, new Date(dateStr))
    }
  }
}

module.exports = MotherShip
