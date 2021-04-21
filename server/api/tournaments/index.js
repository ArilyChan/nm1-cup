const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')

const TournamentClass = require('../backend/nm1cup')
const tournament = new TournamentClass({})

router.get('/all', async (req, res, next) => {
  res.json(await tournament.listTournament())
})
router.get('/:tournament/players', async (req, res, next) => {
  res.json(await tournament.getPlayers(req.params.tournament))
})
router.get('/:tournament/player/:id', async (req, res, next) => {
  res.json(await tournament.getPlayer(req.params.id))
})
router.get('/:tournament', async (req, res, next) => {
  if (!req.params.tournament) { throw new Error('tournament is required') }
  res.json(await tournament.getTournament(req.params.tournament))
})
router.get('/:tournament/database', async (req, res, next) => {
  if (!req.params.tournament) { throw new Error('tournament is required') }
  res.json(await tournament.getTournamentReal(req.params.tournament))
})
router.get('/:tournament/join/:token', async (req, res, next) => {
  if (!req.params.tournament) { throw new Error('tournament is required') }
  if (!req.params.token) { throw new Error('id is required') }
  res.json(await tournament.joinUser(req.params.tournament, { token: req.params.token }))
})
router.post('/:tournament/game', bodyParser.json(), async (req, res, next) => {
  if (!req.params.tournament) { throw new Error('tournament is required') }
  res.json(await tournament.updateGame(req.params.tournament, req.body))
})
// router.post('/:tournament/statistics', bodyParser.json(), async (req, res, next) => {
//   if (!req.params.tournament) { throw new Error('tournament is required') }
//   res.json(await tournament.updateStatistics(req.params.tournament, req.body))
// })
router.get('/:tournament/update', bodyParser.json(), async (req, res, next) => {
  if (!req.params.tournament) { throw new Error('tournament is required') }
  res.json(await tournament.markEloBelowRequiredMarginPlayer(req.params.tournament))
})
router.get('/:tournament/players/reset', bodyParser.json(), async (req, res, next) => {
  if (!req.params.tournament) { throw new Error('tournament is required') }
  res.json(await tournament.resetPlayersMark(req.params.tournament))
})

module.exports = router
