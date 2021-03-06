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
  res.json(await tournament.getPlayer(req.params.tournament, req.params.id))
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
router.get('/:tournament/submit/:matchId', bodyParser.json(), async (req, res, next) => {
  if (!req.params.tournament) { throw new Error('tournament is required') }
  if (!req.params.matchId) { throw new Error('Numeric Match Id is required') }
  res.json(await tournament.submitMpResult(req.params.tournament, req.params.matchId))
})
router.get('/:tournament/pool', bodyParser.json(), async (req, res, next) => {
  if (!req.params.tournament) { throw new Error('tournament is required') }
  res.json(await tournament.getPool(req.params.tournament))
})
router.get('/:tournament/pool/add/:beatmapId', bodyParser.json(), async (req, res, next) => {
  if (!req.params.tournament) { throw new Error('tournament is required') }
  if (!req.params.beatmapId) { throw new Error('beatmap id is required') }
  res.json(await tournament.poolAddMap(req.params.tournament, req.params.beatmapId))
})
router.get('/:tournament/pool/delete/:beatmapId', bodyParser.json(), async (req, res, next) => {
  if (!req.params.tournament) { throw new Error('tournament is required') }
  if (!req.params.beatmapId) { throw new Error('beatmap id is required') }
  res.json(await tournament.poolDeleteMap(req.params.tournament, req.params.beatmapId))
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

router.use((err, req, res, next) => {
  return res.json({
    status: false,
    error: { message: err.message, stack: err.stack }
  })
})

module.exports = router
