import { useState } from 'react'

function Lobby({ roomCode, players, onToggleReady, onStartGame, error, socket }) {
  const [copied, setCopied] = useState(false)
  const currentPlayer = players.find(p => p.id === socket?.id)
  const isHost = currentPlayer?.isHost
  const allReady = players.length >= 3 && players.every(p => p.ready)

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false, 2000))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Room Code */}
        <div className="text-center mb-8 animate-fade-in">
          <p className="text-gray-400 mb-2">Room Code</p>
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-2 bg-dark-700 hover:bg-dark-600 px-6 py-3 rounded-xl border-2 border-dark-500 hover:border-accent transition-all duration-200 group"
          >
            <span className="text-4xl font-mono font-bold tracking-widest text-accent">
              {roomCode}
            </span>
            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
              {copied ? 'Copied!' : 'Copy'}
            </span>
          </button>
        </div>

        {/* Players List */}
        <div className="card mb-6 animate-slide-up">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-accent">Players</span>
            <span className="text-sm font-normal text-gray-400">
              ({players.length}/10)
            </span>
          </h2>

          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                  player.id === socket?.id
                    ? 'bg-accent/10 border border-accent/30'
                    : 'bg-dark-800'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    player.isJudge
                      ? 'bg-punch-yellow text-dark-900'
                      : player.isHost
                      ? 'bg-accent text-white'
                      : 'bg-dark-600 text-gray-300'
                  }`}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {player.name}
                      {player.id === socket?.id && (
                        <span className="text-xs text-gray-400 ml-2">(You)</span>
                      )}
                    </p>
                    {player.isHost && (
                      <span className="text-xs text-accent">Host</span>
                    )}
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  player.ready
                    ? 'bg-punch-green/20 text-punch-green'
                    : 'bg-gray-600/30 text-gray-400'
                }`}>
                  {player.ready ? 'Ready' : 'Not Ready'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ready Button */}
        {!isHost && (
          <button
            onClick={onToggleReady}
            className={`btn-primary w-full text-lg py-4 mb-4 ${
              currentPlayer?.ready
                ? 'bg-punch-green hover:bg-punch-green/80'
                : ''
            }`}
          >
            {currentPlayer?.ready ? 'Ready!' : 'I'm Ready'}
          </button>
        )}

        {/* Start Button (Host only) */}
        {isHost && (
          <div className="space-y-3">
            <button
              onClick={onStartGame}
              disabled={!allReady}
              className="btn-primary w-full text-lg py-4 bg-punch-green hover:bg-punch-green/80 disabled:bg-dark-600 disabled:text-gray-500"
            >
              {players.length < 3
                ? `Need ${3 - players.length} more player${3 - players.length > 1 ? 's' : ''}`
                : allReady
                ? 'Start Game!'
                : 'Waiting for players...'}
            </button>

            {!allReady && players.length >= 3 && (
              <p className="text-center text-gray-400 text-sm">
                {players.filter(p => !p.ready).map(p => p.name).join(', ')} not ready yet
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 bg-punch-red/10 border border-punch-red/30 text-punch-red px-4 py-3 rounded-xl text-sm text-center animate-shake">
            {error}
          </div>
        )}

        {/* Rules */}
        <div className="mt-6 card animate-fade-in">
          <h3 className="font-bold text-lg mb-3 text-accent">How to Play</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-punch-yellow mt-0.5">1.</span>
              <span>Each round, one player is the <strong>Judge</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-punch-yellow mt-0.5">2.</span>
              <span>Judge creates a fill-in-the-blank sentence</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-punch-yellow mt-0.5">3.</span>
              <span>Everyone else submits funny answers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-punch-yellow mt-0.5">4.</span>
              <span>Judge picks the funniest answer</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-punch-yellow mt-0.5">5.</span>
              <span>First to <strong>10 points</strong> wins!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Lobby
