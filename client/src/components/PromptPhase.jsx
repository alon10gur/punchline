import { useState } from 'react'

function PromptPhase({ round, judge, scores, isJudge, onSubmitPrompt }) {
  const [prompt, setPrompt] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (prompt.trim().length < 10) return
    onSubmitPrompt(prompt)
    setSubmitted(true)
  }

  const examplePrompts = [
    "The worst thing to hear on a plane is __.",
    "I knew it was a bad date when they ordered __.",
    "My therapist said I need to stop __.",
    "The last thing I expected to find in my fridge was __.",
    "Nothing says 'I'm an adult' like __.",
  ]

  const useExample = (example) => {
    setPrompt(example)
  }

  return (
    <div className="animate-fade-in">
      {/* Judge announcement */}
      <div className="text-center mb-8">
        <div className="inline-block bg-punch-yellow/10 border border-punch-yellow/30 rounded-full px-6 py-2 mb-4">
          <span className="text-punch-yellow font-semibold">
            Round {round}
          </span>
        </div>
        <h2 className="text-3xl font-bold mb-2">
          {isJudge ? "You're the Judge!" : `${judge.name} is the Judge`}
        </h2>
        <p className="text-gray-400">
          {isJudge
            ? 'Write a funny fill-in-the-blank sentence'
            : 'Waiting for the judge to write a prompt...'}
        </p>
      </div>

      {isJudge && !submitted && (
        <div className="card animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="The worst thing to hear on a plane is __."
                className="input-primary min-h-[120px] resize-none text-lg"
                maxLength={200}
                autoFocus
              />
              <p className="text-right text-xs text-gray-500 mt-1">
                {prompt.length}/200
              </p>
            </div>

            {/* Example prompts */}
            <div>
              <p className="text-sm text-gray-400 mb-2">Need inspiration?</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => useExample(example)}
                    className="text-xs bg-dark-600 hover:bg-dark-500 px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={prompt.trim().length < 10}
              className="btn-primary w-full text-lg py-4"
            >
              Submit Prompt
            </button>
          </form>
        </div>
      )}

      {isJudge && submitted && (
        <div className="card text-center animate-scale-in">
          <p className="text-punch-green text-lg font-semibold">
            Prompt submitted! Waiting for answers...
          </p>
        </div>
      )}

      {!isJudge && (
        <div className="card text-center">
          <div className="animate-pulse-glow inline-block p-6 rounded-2xl bg-dark-800">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-gray-400">Waiting for judge...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PromptPhase
