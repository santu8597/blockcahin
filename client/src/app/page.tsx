"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function Home() {
  const [playerName, setPlayerName] = useState("")
  const [roomName, setRoomName] = useState("")
  const router = useRouter()

  const handleCreateRoom = () => {
    if (!playerName || !roomName) return

    // Store player info in localStorage for the game page
    localStorage.setItem("playerName", playerName)
    localStorage.setItem("roomName", roomName)
    localStorage.setItem("isCreator", "true")

    router.push("/game")
  }

  const handleJoinRoom = () => {
    if (!playerName || !roomName) return

    // Store player info in localStorage for the game page
    localStorage.setItem("playerName", playerName)
    localStorage.setItem("roomName", roomName)
    localStorage.setItem("isCreator", "false")

    router.push("/game")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-teal-500 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Rock Paper Scissors</CardTitle>
          <CardDescription className="text-center">Create or join a room to play</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playerName">Your Name</Label>
            <Input
              id="playerName"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomName">Room Name</Label>
            <Input
              id="roomName"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            className="w-full bg-green-500 hover:bg-green-600"
            onClick={handleCreateRoom}
            disabled={!playerName || !roomName}
          >
            Create Room
          </Button>
          <Button className="w-full" variant="outline" onClick={handleJoinRoom} disabled={!playerName || !roomName}>
            Join Room
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
