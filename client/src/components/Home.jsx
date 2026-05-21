import { useState } from 'react'

function Home({ onCreateRoom, onJoinRoom, error }) {
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [mode, setMode] = useState('create') // create or join

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    if (mode === 'create') {
      onCreateRoom(name.trim())
    } else {
      if (!roomCode.trim()) return
      onJoinRoom(roomCode.trim(), name.trim())
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-6xl font-black mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span className="text-accent">PUNCH</span>
            <span className="text-punch-yellow">LINE</span>
          </h1>
          <p className="text-gray-400 text-lg">The party game where everyone's a comedian</p>
        </div>

        {/* Card */}
        <div className="card animate-scale-in">
          {/* Mode toggle */}
          <div className="flex gap-2 mb-6 bg-dark-800 rounded-xl p-1">
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                mode === 'create'
                  ? 'bg-accent text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Room
            </button>
            <button
              onClick={() => setMode('join')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                mode === 'join'
                  ? 'bg-accent text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Join Room
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="input-primary"
                maxLength={20}
                autoFocus
              />
            </div>

            {mode === 'join' && (
              <div className="animate-slide-down">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ABCDE"
                  className="input-primary text-center text-2xl font-mono tracking-widest uppercase"
                  maxLength={5}
                />
              </div>
            )}

            {error && (
              <div className="bg-punch-red/10 border border-punch-red/30 text-punch-red px-4 py-3 rounded-xl text-sm animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!name.trim() || (mode === 'join' && !roomCode.trim())}
              className="btn-primary w-full text-lg py-4"
            >
              {mode === 'create' ? 'Create Room' : 'Join Room'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          3-10 players • First to 10 points wins
        </p>
      </div>
    </div>
  )
}

export default Home
