import { useState } from 'react'

function VotingPhase({ answers, timeLeft, isJudge, onSubmitVote }) {
  const [selectedId, setSelectedId] = useState(null)
  const [voted, setVoted] = useState(false)

  const handleVote = (playerId) => {
    if (voted) return
    setSelectedId(playerId)
    onSubmitVote(playerId)
    setVoted(true)
  }

  if (!isJudge) {
    return (
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Answers Are In!</h2>
          <p className="text-gray-400">The judge is picking the funniest one...</p>
        </div>

        <div className="card text-center">
          <div className="animate-pulse-glow inline-block p-6 rounded-2xl bg-dark-800">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 animate-pulse" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-gray-400">Judge is deciding...</p>
          </div>
        </div>
      </div>
    )
  }

  if (voted) {
    return (
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Vote Submitted!</h2>
          <p className="text-gray-400">Revealing the winner...</p>
        </div>

        <div className="card text-center animate-bounce-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-accent text-lg font-semibold">Great choice!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Pick the Funniest!</h2>
        <p className="text-gray-400">Choose the best answer</p>
      </div>

      <div className="grid gap-3">
        {answers.map((item, index) => (
          <button
            key={item.playerId}
            onClick={() => handleVote(item.playerId)}
            className={`card-hover text-left animate-slide-up group ${
              selectedId === item.playerId
                ? 'border-punch-green bg-punch-green/10'
                : ''
            }`}
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium group-hover:text-accent transition-colors">
                {item.answer}
              </p>
              <div className="ml-4 w-8 h-8 rounded-full bg-dark-600 group-hover:bg-accent/20 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default VotingPhase
