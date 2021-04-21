const express = require('express')
const router = express.Router()

const bancho = require('../backend/BanchoApiV2')
const requestHandler = (req, res, next) => {
  const publicTokenHeader = bancho.publicTokenHeader()
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

router.get(
  '*',
  // (req, res, next) => {
  //   console.log(req.url)
  //   next()
  // },
  requestHandler
)

module.exports = router
