"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { io, type Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Flame, Snowflake, Wind } from "lucide-react"
import { useMobile } from "@/components/hooks/use-mobile"
import { motion } from "framer-motion"

// Types
type Player = {
  id: string
  name: string
  choice: string | null
  ready: boolean
  health: number
}

type GameState = {
  roomName: string
  playerName: string
  players: Player[]
  gameStatus: "waiting" | "ready" | "playing" | "finished"
  result: {
    winner: string | null
    message: string
    damage?: number
    target?: string
    gameOverMessage?: string
  } | null
  spells: Record<string, string>
  health: Record<string, number>
  round: number
  message: string
  gameOver: boolean
  gameWinner: string | null
}

let socket: Socket

export default function GamePage() {
  const router = useRouter()
  const isMobile = useMobile()
  const [gameState, setGameState] = useState<GameState>({
    roomName: "",
    playerName: "",
    players: [],
    gameStatus: "waiting",
    result: null,
    spells: {},
    health: {},
    round: 1,
    message: "Waiting for opponent...",
    gameOver: false,
    gameWinner: null,
  })
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [showDamageAnimation, setShowDamageAnimation] = useState<string | null>(null)

  useEffect(() => {
    // Initialize game state from localStorage
    const roomName = localStorage.getItem("roomName") || ""
    const playerName = localStorage.getItem("playerName") || ""
    const isCreator = localStorage.getItem("isCreator") === "true"

    if (!roomName || !playerName) {
      router.push("/")
      return
    }

    setGameState((prev) => ({
      ...prev,
      roomName,
      playerName,
    }))

    // Connect to Socket.IO server
    const socketServerUrl = process.env.NODE_ENV === "production" ? window.location.origin : "http://localhost:3001"

    socket = io(socketServerUrl)

    // Socket event handlers
    socket.on("connect", () => {
      setIsConnected(true)
      console.log("Connected to server")

      // Create or join room
      if (isCreator) {
        socket.emit("createRoom", { roomName, playerName })
      } else {
        socket.emit("joinRoom", { roomName, playerName })
      }
    })

    socket.on("roomCreated", ({ roomName, players }) => {
      setGameState((prev) => ({
        ...prev,
        players,
        message: "Battle arena created! Waiting for opponent...",
      }))
    })

    socket.on("roomError", ({ message }) => {
      setGameState((prev) => ({
        ...prev,
        message,
      }))

      // Redirect back to home after error
      setTimeout(() => {
        router.push("/")
      }, 3000)
    })

    socket.on("playerJoined", ({ players, message }) => {
      setGameState((prev) => ({
        ...prev,
        players,
        message,
      }))
    })

    socket.on("gameReady", ({ message }) => {
      setGameState((prev) => ({
        ...prev,
        gameStatus: "ready",
        message,
      }))
    })

    socket.on("playerReady", ({ playerId, playerName }) => {
      setGameState((prev) => ({
        ...prev,
        message: `${playerName} has cast their spell!`,
      }))
    })

    socket.on("spellCast", ({ spell }) => {
      setGameState((prev) => ({
        ...prev,
        message: "Waiting for opponent's spell...",
      }))
    })

    socket.on("roundResult", ({ result, spells, health, round, gameOver, gameWinner }) => {
      // Show damage animation if damage was dealt
      if (result.damage && result.target) {
        setShowDamageAnimation(result.target)

        // Clear animation after a delay
        setTimeout(() => {
          setShowDamageAnimation(null)
        }, 1000)
      }

      setGameState((prev) => ({
        ...prev,
        gameStatus: gameOver ? "finished" : "ready",
        result,
        spells,
        health,
        round,
        message: gameOver ? result.gameOverMessage || result.message : result.message,
        gameOver,
        gameWinner,
      }))
      setSelectedSpell(null)
    })

    socket.on("newGame", ({ message }) => {
      setGameState((prev) => ({
        ...prev,
        gameStatus: "ready",
        result: null,
        spells: {},
        health: {},
        round: 1,
        message,
        gameOver: false,
        gameWinner: null,
      }))
    })

    socket.on("playerLeft", ({ message, players }) => {
      setGameState((prev) => ({
        ...prev,
        players,
        gameStatus: "waiting",
        message,
      }))
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
      setGameState((prev) => ({
        ...prev,
        message: "Disconnected from server",
      }))
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
    }
  }, [router])

  const castSpell = (spell: string) => {
    if (gameState.gameStatus !== "ready" || selectedSpell) return

    setSelectedSpell(spell)
    socket.emit("castSpell", { spell })
  }

  const playAgain = () => {
    socket.emit("playAgain")
    setGameState((prev) => ({
      ...prev,
      message: "Waiting for opponent to play again...",
    }))
  }

  const leaveRoom = () => {
    socket.disconnect()
    localStorage.removeItem("roomName")
    localStorage.removeItem("playerName")
    localStorage.removeItem("isCreator")
    router.push("/")
  }

  // Get current player and opponent
  const currentPlayer = gameState.players.find((p) => p.name === gameState.playerName)
  const opponent = gameState.players.find((p) => p.name !== gameState.playerName)

  // Render spell icon
  const renderSpellIcon = (spell: string, size = 8) => {
    switch (spell) {
      case "fire":
        return <Flame className={`h-${size} w-${size} text-orange-500`} />
      case "ice":
        return <Snowflake className={`h-${size} w-${size} text-blue-400`} />
      case "wind":
        return <Wind className={`h-${size} w-${size} text-green-400`} />
      default:
        return null
    }
  }

  // Get health color based on remaining health
  const getHealthColor = (health: number) => {
    if (health > 70) return "bg-green-500"
    if (health > 30) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 to-indigo-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Badge variant="outline">Arena: {gameState.roomName}</Badge>
            <Badge variant="outline">Round: {gameState.round}</Badge>
          </div>
          <CardTitle className="text-2xl text-center mt-2">Elemental Spell Battle</CardTitle>
          <CardDescription className="text-center">{gameState.message}</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Players */}
          <div className="flex justify-between mb-6">
            <div className="text-center w-[45%]">
              <Badge variant="secondary" className="mb-1">
                You
              </Badge>
              <p>{gameState.playerName}</p>

              {/* Health bar */}
              {currentPlayer && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Health</span>
                    <span>{gameState.health[currentPlayer.id] || currentPlayer.health || 100}/100</span>
                  </div>
                  <Progress
                    value={gameState.health[currentPlayer.id] || currentPlayer.health || 100}
                    max={100}
                    className={`h-2 ${getHealthColor(gameState.health[currentPlayer.id] || currentPlayer.health || 100)}`}
                  />
                </div>
              )}

              {/* Spell cast */}
              {gameState.result && gameState.spells[currentPlayer?.id || ""] && (
                <div className="mt-4 flex flex-col items-center">
                  <div className="mb-1">Your spell:</div>
                  {renderSpellIcon(gameState.spells[currentPlayer?.id || ""], 10)}
                  <span className="capitalize mt-1">{gameState.spells[currentPlayer?.id || ""]}</span>
                </div>
              )}
            </div>

            {opponent ? (
              <div
                className={`text-center w-[45%] relative ${showDamageAnimation === opponent.id ? "animate-shake" : ""}`}
              >
                <Badge variant="secondary" className="mb-1">
                  Opponent
                </Badge>
                <p>{opponent.name}</p>

                {/* Health bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Health</span>
                    <span>{gameState.health[opponent.id] || opponent.health || 100}/100</span>
                  </div>
                  <Progress
                    value={gameState.health[opponent.id] || opponent.health || 100}
                    max={100}
                    className={`h-2 ${getHealthColor(gameState.health[opponent.id] || opponent.health || 100)}`}
                  />
                </div>

                {/* Damage animation */}
                {showDamageAnimation === opponent.id && (
                  <motion.div
                    className="absolute inset-0 bg-red-500 opacity-30 rounded-md"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                )}

                {/* Spell cast */}
                {gameState.result && gameState.spells[opponent.id] && (
                  <div className="mt-4 flex flex-col items-center">
                    <div className="mb-1">Opponent's spell:</div>
                    {renderSpellIcon(gameState.spells[opponent.id], 10)}
                    <span className="capitalize mt-1">{gameState.spells[opponent.id]}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center w-[45%]">
                <Badge variant="outline" className="mb-1">
                  Waiting
                </Badge>
                <p>No opponent yet</p>
              </div>
            )}
          </div>

          {/* Game controls */}
          {gameState.gameStatus === "ready" && !selectedSpell && !gameState.gameOver && (
            <div className="space-y-4">
              <p className="text-center font-medium">Cast your spell:</p>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-4 border-orange-500 hover:bg-orange-500/10"
                  onClick={() => castSpell("fire")}
                >
                  <Flame className="h-8 w-8 mb-1 text-orange-500" />
                  <span className="text-orange-500">Fire</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-4 border-blue-400 hover:bg-blue-500/10"
                  onClick={() => castSpell("ice")}
                >
                  <Snowflake className="h-8 w-8 mb-1 text-blue-400" />
                  <span className="text-blue-400">Ice</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-4 border-green-400 hover:bg-green-500/10"
                  onClick={() => castSpell("wind")}
                >
                  <Wind className="h-8 w-8 mb-1 text-green-400" />
                  <span className="text-green-400">Wind</span>
                </Button>
              </div>
            </div>
          )}

          {selectedSpell && gameState.gameStatus === "ready" && !gameState.gameOver && (
            <div className="text-center space-y-2">
              <p>You cast:</p>
              <div className="flex justify-center">{renderSpellIcon(selectedSpell, 12)}</div>
              <p className="capitalize">{selectedSpell}</p>
            </div>
          )}

          {gameState.gameOver && gameState.result && (
            <div className="text-center mt-4">
              <p className="text-xl font-bold mb-2">{gameState.result.gameOverMessage || "Battle ended!"}</p>
              {gameState.gameWinner === currentPlayer?.id && (
                <Badge className="bg-green-500 text-lg px-4 py-2">Victory!</Badge>
              )}
              {gameState.gameWinner === opponent?.id && <Badge className="bg-red-500 text-lg px-4 py-2">Defeat!</Badge>}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          {gameState.gameOver && (
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={playAgain}>
              Battle Again
            </Button>
          )}
          <Button variant="outline" className="w-full" onClick={leaveRoom}>
            Leave Arena
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
