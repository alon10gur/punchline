import { useState, useEffect, useCallback } from 'react'
import PromptPhase from './PromptPhase'
import AnswerPhase from './AnswerPhase'
import VotingPhase from './VotingPhase'
import ResultPhase from './ResultPhase'
import GameOverPhase from './GameOverPhase'

function Game({ gameState, players, onSubmitPrompt, onSubmitAnswer, onSubmitVote, socket }) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!gameState.timerEnd) return

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((gameState.timerEnd - Date.now()) / 1000))
      setTimeLeft(remaining)

      if (remaining <= 0) {
        // Timer expired, auto-submit if needed
        if (gameState.state === 'answering' && !gameState.answerSubmitted) {
          onSubmitAnswer('I was too slow...')
        }
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 100)

    return () => clearInterval(interval)
  }, [gameState.timerEnd, gameState.state, gameState.answerSubmitted, onSubmitAnswer])

  const renderPhase = () => {
    switch (gameState.state) {
      case 'prompt':
        return (
          <PromptPhase
            round={gameState.round}
            judge={gameState.judge}
            scores={gameState.scores}
            isJudge={socket?.id === gameState.judge?.id}
            onSubmitPrompt={onSubmitPrompt}
          />
        )
      case 'answering':
        return (
          <AnswerPhase
            prompt={gameState.prompt}
            timeLeft={timeLeft}
            isJudge={gameState.isJudge}
            answerSubmitted={gameState.answerSubmitted}
            onSubmitAnswer={onSubmitAnswer}
          />
        )
      case 'voting':
        return (
          <VotingPhase
            answers={gameState.answers}
            timeLeft={timeLeft}
            isJudge={socket?.id === gameState.judge?.id}
            onSubmitVote={onSubmitVote}
          />
        )
      case 'result':
        return (
          <ResultPhase
            winner={gameState.winner}
            scores={gameState.scores}
            gameWinner={gameState.gameWinner}
          />
        )
      case 'gameover':
        return (
          <GameOverPhase
            winner={gameState.winner}
            scores={gameState.scores}
          />
        )
      default:
        return <div>Unknown game state</div>
    }
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-dark-900/95 backdrop-blur-sm border-b border-dark-600">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-accent font-bold">
              Round {gameState.round || '-'}
            </span>
            {timeLeft > 0 && (gameState.state === 'answering' || gameState.state === 'voting') && (
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                timeLeft <= 10
                  ? 'bg-punch-red/20 text-punch-red animate-pulse'
                  : 'bg-dark-600 text-gray-300'
              }`}>
                {timeLeft}s
              </div>
            )}
          </div>

          {/* Mini scoreboard */}
          <div className="flex items-center gap-2">
            {players
              .sort((a, b) => b.score - a.score)
              .slice(0, 3)
              .map((player, i) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                    player.id === socket?.id
                      ? 'bg-accent/20 text-accent'
                      : 'bg-dark-700 text-gray-400'
                  }`}
                >
                  <span className="font-semibold">{player.name}</span>
                  <span className="text-punch-yellow">{player.score}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {renderPhase()}
      </div>
    </div>
  )
}

export default Game
