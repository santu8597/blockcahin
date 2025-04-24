"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { io, type Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scissors, FileText, Hand } from "lucide-react"
import { useMobile } from "@/components/hooks/use-mobile"

// Types
type Player = {
  id: string
  name: string
  choice: string | null
  ready: boolean
}

type GameState = {
  roomName: string
  playerName: string
  players: Player[]
  gameStatus: "waiting" | "ready" | "playing" | "finished"
  result: {
    winner: string | null
    message: string
  } | null
  choices: Record<string, string>
  round: number
  message: string
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
    choices: {},
    round: 1,
    message: "Waiting for opponent...",
  })
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

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
        message: "Room created! Waiting for opponent...",
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
        message: `${playerName} has made their choice!`,
      }))
    })

    socket.on("choiceConfirmed", ({ choice }) => {
      setGameState((prev) => ({
        ...prev,
        message: "Waiting for opponent's choice...",
      }))
    })

    socket.on("roundResult", ({ result, choices, round }) => {
      setGameState((prev) => ({
        ...prev,
        gameStatus: "finished",
        result,
        choices,
        round,
        message: result.message,
      }))
      setSelectedChoice(null)
    })

    socket.on("newGame", ({ message }) => {
      setGameState((prev) => ({
        ...prev,
        gameStatus: "ready",
        result: null,
        choices: {},
        message,
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

  const makeChoice = (choice: string) => {
    if (gameState.gameStatus !== "ready" || selectedChoice) return

    setSelectedChoice(choice)
    socket.emit("makeChoice", { choice })
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

  // Render choice icon
  const renderChoiceIcon = (choice: string) => {
    switch (choice) {
      case "rock":
        return <Hand className="h-8 w-8" />
      case "paper":
        return <FileText className="h-8 w-8" />
      case "scissors":
        return <Scissors className="h-8 w-8" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-teal-500 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Badge variant="outline">Room: {gameState.roomName}</Badge>
            <Badge variant="outline">Round: {gameState.round}</Badge>
          </div>
          <CardTitle className="text-2xl text-center mt-2">Rock Paper Scissors</CardTitle>
          <CardDescription className="text-center">{gameState.message}</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Players */}
          <div className="flex justify-between mb-6">
            <div className="text-center">
              <Badge variant="secondary" className="mb-1">
                You
              </Badge>
              <p>{gameState.playerName}</p>
              {gameState.result && gameState.choices[currentPlayer?.id || ""] && (
                <div className="mt-2">{renderChoiceIcon(gameState.choices[currentPlayer?.id || ""])}</div>
              )}
            </div>

            {opponent ? (
              <div className="text-center">
                <Badge variant="secondary" className="mb-1">
                  Opponent
                </Badge>
                <p>{opponent.name}</p>
                {gameState.result && gameState.choices[opponent.id] && (
                  <div className="mt-2">{renderChoiceIcon(gameState.choices[opponent.id])}</div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Badge variant="outline" className="mb-1">
                  Waiting
                </Badge>
                <p>No opponent yet</p>
              </div>
            )}
          </div>

          {/* Game controls */}
          {gameState.gameStatus === "ready" && !selectedChoice && (
            <div className="space-y-4">
              <p className="text-center font-medium">Make your choice:</p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" className="flex flex-col items-center p-4" onClick={() => makeChoice("rock")}>
                  <Hand className="h-8 w-8 mb-1" />
                  <span>Rock</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-4"
                  onClick={() => makeChoice("paper")}
                >
                  <FileText className="h-8 w-8 mb-1" />
                  <span>Paper</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-4"
                  onClick={() => makeChoice("scissors")}
                >
                  <Scissors className="h-8 w-8 mb-1" />
                  <span>Scissors</span>
                </Button>
              </div>
            </div>
          )}

          {selectedChoice && gameState.gameStatus === "ready" && (
            <div className="text-center space-y-2">
              <p>You chose:</p>
              <div className="flex justify-center">{renderChoiceIcon(selectedChoice)}</div>
              <p className="capitalize">{selectedChoice}</p>
            </div>
          )}

          {gameState.gameStatus === "finished" && gameState.result && (
            <div className="text-center mt-4">
              <p className="text-xl font-bold mb-2">{gameState.result.message}</p>
              {gameState.result.winner === currentPlayer?.id && <Badge className="bg-green-500">You won!</Badge>}
              {gameState.result.winner === opponent?.id && <Badge className="bg-red-500">You lost!</Badge>}
              {gameState.result.winner === null && <Badge className="bg-yellow-500">It's a tie!</Badge>}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          {gameState.gameStatus === "finished" && (
            <Button className="w-full bg-green-500 hover:bg-green-600" onClick={playAgain}>
              Play Again
            </Button>
          )}
          <Button variant="outline" className="w-full" onClick={leaveRoom}>
            Leave Room
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
