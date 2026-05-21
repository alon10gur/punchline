import { useState } from 'react'

function AnswerPhase({ prompt, timeLeft, isJudge, answerSubmitted, onSubmitAnswer }) {
  const [answer, setAnswer] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!answer.trim()) return
    onSubmitAnswer(answer)
  }

  if (isJudge) {
    return (
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Your Prompt</h2>
          <div className="card bg-dark-700 border-accent/30">
            <p className="text-xl font-medium">{prompt}</p>
          </div>
        </div>

        <div className="card text-center">
          <div className="animate-pulse-glow inline-block p-6 rounded-2xl bg-dark-800">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <p className="text-gray-400">Waiting for players to answer...</p>
          </div>
        </div>
      </div>
    )
  }

  if (answerSubmitted) {
    return (
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">The Prompt</h2>
          <div className="card bg-dark-700 border-accent/30">
            <p className="text-xl font-medium">{prompt}</p>
          </div>
        </div>

        <div className="card text-center animate-bounce-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-punch-green/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-punch-green" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-punch-green text-lg font-semibold">Answer submitted!</p>
          <p className="text-gray-400 mt-2">Waiting for others...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">The Prompt</h2>
        <div className="card bg-dark-700 border-accent/30 animate-scale-in">
          <p className="text-2xl font-medium">{prompt}</p>
        </div>
      </div>

      <div className="card animate-slide-up">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Answer
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Make it funny..."
              className="input-primary text-lg"
              maxLength={100}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!answer.trim()}
            className="btn-primary w-full text-lg py-4"
          >
            Submit Answer
          </button>
        </form>
      </div>
    </div>
  )
}

export default AnswerPhase
