import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"

// Game state management
const rooms = new Map()

// Initialize Express app and Socket.IO server
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin:["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`)

  // Create a new room
  socket.on("createRoom", ({ roomName, playerName }) => {
    // Check if room already exists
    if (rooms.has(roomName)) {
      socket.emit("roomError", { message: "Room already exists" })
      return
    }

    // Create new room
    rooms.set(roomName, {
      players: [{ id: socket.id, name: playerName, choice: null, ready: false }],
      gameState: "waiting", // waiting, playing, finished
      round: 1,
    })

    // Join the socket to the room
    socket.join(roomName)

    // Store room info in socket for easy access
    socket.data.currentRoom = roomName
    socket.data.playerName = playerName

    // Notify client
    socket.emit("roomCreated", {
      roomName,
      players: rooms.get(roomName).players,
    })

    console.log(`Room created: ${roomName} by ${playerName}`)
  })

  // Join an existing room
  socket.on("joinRoom", ({ roomName, playerName }) => {
    // Check if room exists
    if (!rooms.has(roomName)) {
      socket.emit("roomError", { message: "Room does not exist" })
      return
    }

    const room = rooms.get(roomName)

    // Check if room is full (max 2 players)
    if (room.players.length >= 2) {
      socket.emit("roomError", { message: "Room is full" })
      return
    }

    // Add player to room
    room.players.push({ id: socket.id, name: playerName, choice: null, ready: false })

    // Join the socket to the room
    socket.join(roomName)

    // Store room info in socket
    socket.data.currentRoom = roomName
    socket.data.playerName = playerName

    // Notify all clients in the room
    io.to(roomName).emit("playerJoined", {
      players: room.players,
      message: `${playerName} has joined the room`,
    })

    // If we now have 2 players, the game can start
    if (room.players.length === 2) {
      room.gameState = "ready"
      io.to(roomName).emit("gameReady", { message: "Game is ready to start" })
    }

    console.log(`${playerName} joined room: ${roomName}`)
  })

  // Player makes a choice (rock, paper, scissors)
  socket.on("makeChoice", ({ choice }) => {
    const roomName = socket.data.currentRoom

    if (!roomName || !rooms.has(roomName)) {
      socket.emit("gameError", { message: "Room not found" })
      return
    }

    const room = rooms.get(roomName)
    const player = room.players.find((p) => p.id === socket.id)

    if (!player) {
      socket.emit("gameError", { message: "Player not found in room" })
      return
    }

    // Update player's choice
    player.choice = choice
    player.ready = true

    // Notify the player their choice was recorded
    socket.emit("choiceConfirmed", { choice })

    // Check if all players have made their choices
    const allPlayersReady = room.players.every((p) => p.ready)

    if (allPlayersReady && room.players.length === 2) {
      // Determine the winner
      const [player1, player2] = room.players
      let result

      if (player1.choice === player2.choice) {
        result = { winner: null, message: "It's a tie!" }
      } else if (
        (player1.choice === "rock" && player2.choice === "scissors") ||
        (player1.choice === "paper" && player2.choice === "rock") ||
        (player1.choice === "scissors" && player2.choice === "paper")
      ) {
        result = { winner: player1.id, message: `${player1.name} wins!` }
      } else {
        result = { winner: player2.id, message: `${player2.name} wins!` }
      }

      // Send results to all players in the room
      io.to(roomName).emit("roundResult", {
        result,
        choices: {
          [player1.id]: player1.choice,
          [player2.id]: player2.choice,
        },
        round: room.round,
      })

      // Reset for next round
      room.players.forEach((p) => {
        p.choice = null
        p.ready = false
      })

      room.round += 1
    } else {
      // Notify the other player that this player is ready
      socket.to(roomName).emit("playerReady", {
        playerId: socket.id,
        playerName: player.name,
      })
    }
  })

  // Player wants to play again
  socket.on("playAgain", () => {
    const roomName = socket.data.currentRoom

    if (!roomName || !rooms.has(roomName)) return

    const room = rooms.get(roomName)
    const player = room.players.find((p) => p.id === socket.id)

    if (!player) return

    player.ready = true

    // Check if all players are ready for a new game
    const allPlayersReady = room.players.every((p) => p.ready)

    if (allPlayersReady) {
      // Reset game state
      room.players.forEach((p) => {
        p.choice = null
        p.ready = false
      })

      room.gameState = "playing"

      // Notify all players that a new game is starting
      io.to(roomName).emit("newGame", { message: "New game starting" })
    } else {
      // Notify the other player that this player is ready for a new game
      socket.to(roomName).emit("playerReadyForNewGame", {
        playerId: socket.id,
        playerName: player.name,
      })
    }
  })

  // Get available rooms
  socket.on("getRooms", () => {
    const availableRooms = []

    rooms.forEach((room, roomName) => {
      if (room.players.length < 2 && room.gameState === "waiting") {
        availableRooms.push({
          name: roomName,
          players: room.players.length,
        })
      }
    })

    socket.emit("roomList", { rooms: availableRooms })
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    const roomName = socket.data.currentRoom

    if (roomName && rooms.has(roomName)) {
      const room = rooms.get(roomName)

      // Remove player from room
      room.players = room.players.filter((p) => p.id !== socket.id)

      if (room.players.length === 0) {
        // If no players left, delete the room
        rooms.delete(roomName)
        console.log(`Room deleted: ${roomName}`)
      } else {
        // Notify remaining players
        io.to(roomName).emit("playerLeft", {
          message: `${socket.data.playerName || "A player"} has left the room`,
          players: room.players,
        })

        // Reset game state
        room.gameState = "waiting"
        room.players.forEach((p) => {
          p.choice = null
          p.ready = false
        })
      }
    }

    console.log(`User disconnected: ${socket.id}`)
  })
})

// Start the server
const PORT = 3001
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default httpServer
