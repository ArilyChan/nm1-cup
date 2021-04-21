const express = require('express')
const router = express.Router()

const bancho = require('../backend/BanchoApiV2')
const requestHandler = (req, res, next) => {
  const publicTokenHeader = bancho.accessTokenHeader({
    token_type: 'Bearer',
    access_token: req.params.token
  })
  const apiv2Uri = req.url
  bancho.apiCall(apiv2Uri, {
    headers: publicTokenHeader,
    params: req.query
  })
    .then(res => res.data)
    .then(d => res.json(d))
    .catch((err) => {
      res.status(err.response.status)
      res.json(err.response.data)
    })
}
router.use(
  '/:token',
  requestHandler
)

module.exports = router
