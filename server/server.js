const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Game state storage
const rooms = new Map();

// Helper: generate room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Helper: get room or create
function getRoom(code) {
  return rooms.get(code.toUpperCase());
}

function createRoom(hostId, hostName) {
  let code;
  do {
    code = generateRoomCode();
  } while (rooms.has(code));

  const room = {
    code,
    players: new Map(),
    state: 'lobby', // lobby, prompt, answering, voting, result, gameover
    judge: null,
    judgeIndex: 0,
    currentPrompt: '',
    answers: new Map(), // playerId -> answer
    votes: new Map(), // playerId -> votedPlayerId
    round: 0,
    maxRounds: 10,
    timer: null,
    timerEnd: null,
  };

  room.players.set(hostId, {
    id: hostId,
    name: hostName,
    score: 0,
    isJudge: false,
    isHost: true,
    ready: false,
  });

  rooms.set(code, room);
  return room;
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create room
  socket.on('createRoom', ({ name }) => {
    const room = createRoom(socket.id, name);
    socket.join(room.code);
    socket.emit('roomCreated', {
      code: room.code,
      players: Array.from(room.players.values()),
    });
    console.log(`Room created: ${room.code} by ${name}`);
  });

  // Join room
  socket.on('joinRoom', ({ code, name }) => {
    const roomCode = code.toUpperCase();
    const room = getRoom(roomCode);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.state !== 'lobby') {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }

    if (room.players.has(socket.id)) {
      socket.emit('error', { message: 'You are already in this room' });
      return;
    }

    // Check if name is taken
    const nameTaken = Array.from(room.players.values()).some(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (nameTaken) {
      socket.emit('error', { message: 'Name already taken' });
      return;
    }

    room.players.set(socket.id, {
      id: socket.id,
      name,
      score: 0,
      isJudge: false,
      isHost: false,
      ready: false,
    });

    socket.join(roomCode);
    socket.emit('roomJoined', {
      code: room.code,
      players: Array.from(room.players.values()),
    });

    io.to(roomCode).emit('playerUpdate', {
      players: Array.from(room.players.values()),
    });

    console.log(`${name} joined room ${roomCode}`);
  });

  // Toggle ready
  socket.on('toggleReady', () => {
    const room = findPlayerRoom(socket.id);
    if (!room || room.state !== 'lobby') return;

    const player = room.players.get(socket.id);
    if (player) {
      player.ready = !player.ready;
      io.to(room.code).emit('playerUpdate', {
        players: Array.from(room.players.values()),
      });
    }
  });

  // Start game
  socket.on('startGame', () => {
    const room = findPlayerRoom(socket.id);
    if (!room) return;

    const host = room.players.get(socket.id);
    if (!host || !host.isHost) return;

    // Check all players ready
    const allReady = Array.from(room.players.values()).every((p) => p.ready);
    if (!allReady) {
      socket.emit('error', { message: 'All players must be ready' });
      return;
    }

    if (room.players.size < 3) {
      socket.emit('error', { message: 'Need at least 3 players' });
      return;
    }

    startNewRound(room);
  });

  // Submit prompt (judge only)
  socket.on('submitPrompt', ({ prompt }) => {
    const room = findPlayerRoom(socket.id);
    if (!room || room.state !== 'prompt') return;

    const player = room.players.get(socket.id);
    if (!player || !player.isJudge) return;

    if (!prompt || prompt.trim().length < 10) {
      socket.emit('error', { message: 'Prompt must be at least 10 characters' });
      return;
    }

    room.currentPrompt = prompt.trim();
    room.state = 'answering';
    room.timerEnd = Date.now() + 60000; // 60 seconds

    io.to(room.code).emit('gameState', {
      state: 'answering',
      prompt: room.currentPrompt,
      timerEnd: room.timerEnd,
      isJudge: false,
    });

    // Tell judge their prompt was submitted
    io.to(socket.id).emit('gameState', {
      state: 'answering',
      prompt: room.currentPrompt,
      timerEnd: room.timerEnd,
      isJudge: true,
    });

    console.log(`Prompt submitted in room ${room.code}`);
  });

  // Submit answer
  socket.on('submitAnswer', ({ answer }) => {
    const room = findPlayerRoom(socket.id);
    if (!room || room.state !== 'answering') return;

    const player = room.players.get(socket.id);
    if (!player || player.isJudge) return;

    if (!answer || answer.trim().length < 1) {
      socket.emit('error', { message: 'Answer cannot be empty' });
      return;
    }

    room.answers.set(socket.id, answer.trim());
    socket.emit('answerSubmitted');

    // Check if all non-judge players have answered
    const nonJudges = Array.from(room.players.values()).filter((p) => !p.isJudge);
    if (room.answers.size >= nonJudges.length) {
      startVoting(room);
    }
  });

  // Vote for answer
  socket.on('submitVote', ({ playerId }) => {
    const room = findPlayerRoom(socket.id);
    if (!room || room.state !== 'voting') return;

    const player = room.players.get(socket.id);
    if (!player || !player.isJudge) return;

    // Validate voted player is not the judge and has an answer
    if (playerId === socket.id) {
      socket.emit('error', { message: 'Cannot vote for yourself' });
      return;
    }

    if (!room.answers.has(playerId)) {
      socket.emit('error', { message: 'Invalid vote' });
      return;
    }

    room.votes.set(socket.id, playerId);
    resolveRound(room);
  });

  // Disconnect
  socket.on('disconnect', () => {
    const room = findPlayerRoom(socket.id);
    if (room) {
      room.players.delete(socket.id);
      room.answers.delete(socket.id);

      if (room.players.size === 0) {
        rooms.delete(room.code);
        console.log(`Room ${room.code} deleted (empty)`);
      } else {
        io.to(room.code).emit('playerUpdate', {
          players: Array.from(room.players.values()),
        });

        // If host left, assign new host
        if (!Array.from(room.players.values()).some((p) => p.isHost)) {
          const newHost = room.players.values().next().value;
          newHost.isHost = true;
          io.to(room.code).emit('playerUpdate', {
            players: Array.from(room.players.values()),
          });
        }

        // If judge left during game, handle it
        if (room.state !== 'lobby') {
          const judge = Array.from(room.players.values()).find((p) => p.isJudge);
          if (!judge) {
            // Reset to lobby
            room.state = 'lobby';
            room.answers.clear();
            room.votes.clear();
            io.to(room.code).emit('gameState', { state: 'lobby' });
          }
        }
      }
    }
    console.log(`Player disconnected: ${socket.id}`);
  });
});

// Helper: find room for player
function findPlayerRoom(playerId) {
  for (const room of rooms.values()) {
    if (room.players.has(playerId)) {
      return room
    }
  }
  return null
}

// Start a new round
function startNewRound(room) {
  room.round++;
  room.state = 'prompt';
  room.answers.clear();
  room.votes.clear();

  // Rotate judge
  const players = Array.from(room.players.values());
  const prevJudgeIndex = players.findIndex((p) => p.isJudge);
  room.judgeIndex = (prevJudgeIndex + 1) % players.length;

  players.forEach((p, i) => {
    p.isJudge = i === room.judgeIndex;
  });

  const judge = players[room.judgeIndex];

  io.to(room.code).emit('gameState', {
    state: 'prompt',
    round: room.round,
    judge: {
      id: judge.id,
      name: judge.name,
    },
    scores: players.map((p) => ({ id: p.id, name: p.name, score: p.score })),
  });

  console.log(`Round ${room.round} started in room ${room.code}. Judge: ${judge.name}`);
}

// Start voting phase
function startVoting(room) {
  room.state = 'voting';
  room.timerEnd = Date.now() + 30000; // 30 seconds to vote

  const answers = Array.from(room.answers.entries()).map(([playerId, answer]) => {
    const player = room.players.get(playerId);
    return {
      playerId,
      playerName: player.name,
      answer,
    };
  });

  // Shuffle answers
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }

  io.to(room.code).emit('gameState', {
    state: 'voting',
    answers,
    timerEnd: room.timerEnd,
  });
}

// Resolve round after judge votes
function resolveRound(room) {
  const winnerId = room.votes.get(
    Array.from(room.players.keys()).find((id) => room.players.get(id).isJudge)
  );

  const winner = room.players.get(winnerId);
  winner.score++;

  const winningAnswer = room.answers.get(winnerId);

  room.state = 'result';

  const scores = Array.from(room.players.values()).map((p) => ({
    id: p.id,
    name: p.name,
    score: p.score,
  }));

  // Check for game winner
  const gameWinner = scores.find((p) => p.score >= room.maxRounds);

  io.to(room.code).emit('gameState', {
    state: 'result',
    winner: {
      id: winnerId,
      name: winner.name,
      answer: winningAnswer,
    },
    scores,
    gameWinner: gameWinner ? { id: gameWinner.id, name: gameWinner.name, score: gameWinner.score } : null,
  });

  console.log(`Round result: ${winner.name} wins! Score: ${winner.score}`);

  // Auto-advance after 5 seconds
  setTimeout(() => {
    const currentRoom = rooms.get(room.code)
    if (!currentRoom || currentRoom.state === 'lobby') return

    if (gameWinner) {
      currentRoom.state = 'gameover';
      io.to(currentRoom.code).emit('gameState', {
        state: 'gameover',
        winner: {
          id: gameWinner.id,
          name: gameWinner.name,
          score: gameWinner.score,
        },
        scores: Array.from(currentRoom.players.values()).map((p) => ({
          id: p.id,
          name: p.name,
          score: p.score,
        })),
      });
    } else {
      startNewRound(currentRoom);
    }
  }, 5000);
}

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Punchline server running on port ${PORT}`);
});
