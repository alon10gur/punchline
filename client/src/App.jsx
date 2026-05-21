import { useState, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import Home from './components/Home'
import Lobby from './components/Lobby'
import Game from './components/Game'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin

function App() {
  const [socket, setSocket] = useState(null)
  const [screen, setScreen] = useState('home')
  const [roomCode, setRoomCode] = useState('')
  const [players, setPlayers] = useState([])
  const [gameState, setGameState] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
    })

    newSocket.on('roomCreated', ({ code, players }) => {
      setRoomCode(code)
      setPlayers(players)
      setScreen('lobby')
      setError('')
    })

    newSocket.on('roomJoined', ({ code, players }) => {
      setRoomCode(code)
      setPlayers(players)
      setScreen('lobby')
      setError('')
    })

    newSocket.on('playerUpdate', ({ players }) => {
      setPlayers(players)
    })

    newSocket.on('gameState', (state) => {
      setGameState(state)
      setScreen('game')
    })

    newSocket.on('answerSubmitted', () => {
      setGameState(prev => ({ ...prev, answerSubmitted: true }))
    })

    newSocket.on('error', ({ message }) => {
      setError(message)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const createRoom = useCallback((name) => {
    setError('')
    socket?.emit('createRoom', { name })
  }, [socket])

  const joinRoom = useCallback((code, name) => {
    setError('')
    socket?.emit('joinRoom', { code, name })
  }, [socket])

  const toggleReady = useCallback(() => {
    socket?.emit('toggleReady')
  }, [socket])

  const startGame = useCallback(() => {
    socket?.emit('startGame')
  }, [socket])

  const submitPrompt = useCallback((prompt) => {
    socket?.emit('submitPrompt', { prompt })
  }, [socket])

  const submitAnswer = useCallback((answer) => {
    socket?.emit('submitAnswer', { answer })
  }, [socket])

  const submitVote = useCallback((playerId) => {
    socket?.emit('submitVote', { playerId })
  }, [socket])

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {screen === 'home' && (
        <Home
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          error={error}
        />
      )}
      {screen === 'lobby' && (
        <Lobby
          roomCode={roomCode}
          players={players}
          onToggleReady={toggleReady}
          onStartGame={startGame}
          error={error}
          socket={socket}
        />
      )}
      {screen === 'game' && gameState && (
        <Game
          gameState={gameState}
          players={players}
          onSubmitPrompt={submitPrompt}
          onSubmitAnswer={submitAnswer}
          onSubmitVote={submitVote}
          socket={socket}
        />
      )}
    </div>
  )
}

export default App
