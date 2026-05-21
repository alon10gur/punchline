function GameOverPhase({ winner, scores }) {
  const sortedScores = [...scores].sort((a, b) => b.score - a.score)

  return (
    <div className="animate-fade-in">
      {/* Winner announcement */}
      <div className="text-center mb-8 animate-bounce-in">
        <div className="text-6xl mb-4">
          <span className="inline-block animate-confetti">🎉</span>
        </div>
        <h1 className="text-5xl font-black mb-2">
          <span className="text-punch-yellow">GAME OVER</span>
        </h1>
        <p className="text-2xl font-bold text-accent mb-4">
          {winner.name} Wins!
        </p>
        <div className="card bg-dark-700 border-punch-yellow/30 inline-block">
          <p className="text-3xl font-black text-punch-yellow">
            {winner.score} points
          </p>
        </div>
      </div>

      {/* Final Scores */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4 text-gray-300 text-center">
          Final Standings
        </h3>
        <div className="space-y-3">
          {sortedScores.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                player.id === winner.id
                  ? 'bg-punch-yellow/20 border-2 border-punch-yellow'
                  : 'bg-dark-800'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-2xl font-black w-8 ${
                  index === 0
                    ? 'text-punch-yellow'
                    : index === 1
                    ? 'text-gray-400'
                    : index === 2
                    ? 'text-amber-600'
                    : 'text-gray-600'
                }`}>
                  {index + 1}
                </span>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                  index === 0
                    ? 'bg-punch-yellow text-dark-900'
                    : index === 1
                    ? 'bg-gray-400 text-dark-900'
                    : index === 2
                    ? 'bg-amber-600 text-white'
                    : 'bg-dark-600 text-gray-300'
                }`}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xl font-bold">{player.name}</span>
              </div>
              <span className={`text-2xl font-black ${
                player.id === winner.id ? 'text-punch-yellow' : 'text-gray-400'
              }`}>
                {player.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Play again button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => window.location.reload()}
          className="btn-primary text-lg py-4 px-8"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}

export default GameOverPhase
