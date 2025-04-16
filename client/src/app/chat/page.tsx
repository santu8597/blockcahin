"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Paperclip, Send } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ChatApp() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [username, setUsername] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize socket connection
  useEffect(() => {
    if (isLoggedIn) {
      const newSocket = io("http://localhost:3001")
      setSocket(newSocket)

      // Announce new user
      newSocket.emit("new_user", { user: username })

      // Clean up on unmount
      return () => {
        newSocket.disconnect()
      }
    }
  }, [isLoggedIn, username])

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return

    // Handle incoming messages
    socket.on("recieve_message", (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    // Handle typing indicators
    socket.on("user_typing", (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => (prev.includes(data.user) ? prev : [...prev, data.user]))
      } else {
        setTypingUsers((prev) => prev.filter((user) => user !== data.user))
      }
    })

    // Handle new user notifications
    socket.on("new_user", (user) => {
      setMessages((prev) => [
        ...prev,
        {
          type: "notification",
          content: `${user} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ])
    })

    return () => {
      socket.off("recieve_message")
      socket.off("user_typing")
      socket.off("new_user")
    }
  }, [socket])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!socket || (!message.trim() && !file)) return

    const timestamp = new Date().toISOString()

    // Handle file upload
    if (file) {
      setIsUploading(true)

      // Convert file to base64 for transmission
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const fileMessage = {
          user: username,
          content: message.trim() || `Shared a file: ${file.name}`,
          file: {
            name: file.name,
            type: file.type,
            data: reader.result,
          },
          timestamp,
        }

        socket.emit("send_message", fileMessage)
        setMessages((prev) => [...prev, fileMessage])
        setFile(null)
        setIsUploading(false)
      }
    } else {
      // Send text message
      const newMessage = {
        user: username,
        content: message,
        timestamp,
      }

      socket.emit("send_message", newMessage)
      setMessages((prev) => [...prev, newMessage])
    }

    setMessage("")

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      socket.emit("user_typing", { user: username, isTyping: false })
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    if (!socket) return

    // Send typing indicator
    socket.emit("user_typing", { user: username, isTyping: true })

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set timeout to clear typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("user_typing", { user: username, isTyping: false })
    }, 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      setIsLoggedIn(true)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Join Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Join
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle>Chat Room</CardTitle>
            <Badge variant="outline">{username}</Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-grow overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index}>
                {msg.type === "notification" ? (
                  <Alert className="bg-gray-100 border-none">
                    <AlertDescription className="text-center text-sm text-gray-500">{msg.content}</AlertDescription>
                  </Alert>
                ) : (
                  <div className={`flex ${msg.user === username ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex ${msg.user === username ? "flex-row-reverse" : "flex-row"} items-start gap-2 max-w-[80%]`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${msg.user.charAt(0)}`} />
                        <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                      </Avatar>

                      <div className={`space-y-1 ${msg.user === username ? "items-end" : "items-start"}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{msg.user}</span>
                          <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                        </div>

                        <div
                          className={`rounded-lg p-3 ${
                            msg.user === username ? "bg-primary text-primary-foreground" : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>

                          {msg.file && (
                            <div className="mt-2">
                              {msg.file.type.startsWith("image/") ? (
                                <div className="mt-2">
                                  <img
                                    src={msg.file.data || "/placeholder.svg"}
                                    alt={msg.file.name}
                                    className="max-w-full rounded-md max-h-60 object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                                  <Paperclip className="h-4 w-4" />
                                  <span className="text-sm truncate">{msg.file.name}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex space-x-1">
                  <div
                    className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "600ms" }}
                  ></div>
                </div>
                <span>
                  {typingUsers.length === 1
                    ? `${typingUsers[0]} is typing...`
                    : `${typingUsers.length} people are typing...`}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        <CardFooter className="border-t p-4">
          {file && (
            <div className="w-full mb-2 p-2 bg-gray-100 rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <Paperclip className="h-4 w-4" />
                <span className="text-sm truncate">{file.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                ✕
              </Button>
            </div>
          )}

          <div className="flex w-full items-end gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            <Button variant="outline" size="icon" onClick={triggerFileInput} disabled={isUploading}>
              <Paperclip className="h-4 w-4" />
            </Button>

            <div className="flex-grow">
              <Textarea
                placeholder="Type your message..."
                value={message}
                onChange={handleTyping}
                className="resize-none min-h-[60px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
            </div>

            <Button onClick={handleSendMessage} disabled={(!message.trim() && !file) || isUploading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

