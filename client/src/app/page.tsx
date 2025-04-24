"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Flame } from "lucide-react"

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 to-indigo-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <Flame className="h-12 w-12 text-orange-500" />
          </div>
          <CardTitle className="text-2xl text-center">Elemental Spell Battle</CardTitle>
          <CardDescription className="text-center">Create or join a battle room to duel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playerName">Your Wizard Name</Label>
            <Input
              id="playerName"
              placeholder="Enter your wizard name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomName">Battle Arena</Label>
            <Input
              id="roomName"
              placeholder="Enter arena name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={handleCreateRoom}
            disabled={!playerName || !roomName}
          >
            Create Battle Arena
          </Button>
          <Button className="w-full" variant="outline" onClick={handleJoinRoom} disabled={!playerName || !roomName}>
            Join Battle Arena
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
