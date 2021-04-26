function allGameResults (games, users) {
  return games.map((game) => {
    const { player, host } = game.scores.reduce(
      (acc, score) => {
        score.accuracy > 0.03 ? acc.player.push(score) : acc.host.push(score)
        return acc
      },
      { player: [], host: [] }
    )

    game.scores = player
    game.hostScores = host
    const teamScore =
      game.team_type === 'team-vs'
        ? {
            red: game.scores
              .filter(score => score.match.team === 'red')
              .reduce((acc, cur) => acc + cur.score, 0),
            blue: game.scores
              .filter(score => score.match.team === 'blue')
              .reduce((acc, cur) => acc + cur.score, 0)
          }
        : undefined
    const totalScore = game.scores.reduce((acc, cur) => acc + cur.score, 0)
    const scores = game.scores.map((score) => {
      return {
        ...score,
        user: users.find(user => score.user_id === user.id)
      }
    })
    // const hostScores = game.hostScores.map((score) => {
    //   return {
    //     ...score,
    //     user: this.users.find(user => score.user_id === user.id)
    //   }
    // })
    const maxScore = Math.max(...scores.map(score => score.score))
    const minScore = Math.min(...scores.map(score => score.score))
    const mvp = scores.find(score => score.score === maxScore)
    const worst = scores.find(score => score.score === minScore)
    return {
      ...game,
      scores,
      teamScore,
      totalScore,
      teamWinner:
        teamScore && teamScore.red > teamScore.blue
          ? teamScore.red === teamScore.blue
            ? 'draw'
            : 'red'
          : 'blue',
      mvp,
      worst
    }
  })
}
function playersInMatch ({ events, users }) {
  const matches = events.filter(event => event.game && event.game.scores.length).map(event => event.game)
  const games = matches
  const userPlayed = users.filter(user => games.some((match) => {
    const userScore = match.scores.find(score => score.user_id === user.id)
    return userScore && userScore.score > 5000
  }))
  const players = userPlayed
  const hosts = users.filter(user => !players.includes(user))
  return {
    games,
    players,
    hosts
  }
}

module.exports = {
  allGameResults,
  playersInMatch
}
