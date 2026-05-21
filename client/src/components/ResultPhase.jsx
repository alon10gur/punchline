function ResultPhase({ winner, scores, gameWinner }) {
  const sortedScores = [...scores].sort((a, b) => b.score - a.score)

  return (
    <div className="animate-fade-in">
      {/* Winner announcement */}
      <div className="text-center mb-8 animate-bounce-in">
        <div className="inline-block bg-punch-yellow/10 border border-punch-yellow/30 rounded-full px-6 py-2 mb-4">
          <span className="text-punch-yellow font-semibold">
            Winner of the round!
          </span>
        </div>
        <h2 className="text-4xl font-black mb-4">
          {winner.name}
        </h2>
        <div className="card bg-dark-700 border-punch-yellow/30 inline-block">
          <p className="text-xl font-medium text-punch-yellow">
            "{winner.answer}"
          </p>
        </div>
      </div>

      {/* Scores */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4 text-gray-300">Scores</h3>
        <div className="space-y-2">
          {sortedScores.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                player.id === winner.id
                  ? 'bg-punch-yellow/10 border border-punch-yellow/30'
                  : 'bg-dark-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-500 font-mono w-6">
                  #{index + 1}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
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
                <span className="font-semibold">{player.name}</span>
              </div>
              <span className="text-punch-yellow font-bold text-lg">
                {player.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {gameWinner && (
        <div className="mt-6 text-center animate-pulse-glow p-4 rounded-2xl bg-punch-yellow/10 border border-punch-yellow/30">
          <p className="text-punch-yellow text-lg font-bold">
            {gameWinner.name} wins the game!
          </p>
        </div>
      )}
    </div>
  )
}

export default ResultPhase
