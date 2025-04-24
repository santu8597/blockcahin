import { io, type Socket } from "socket.io-client"

// This service can be used to manage socket connections
class SocketService {
  private socket: Socket | null = null
  private socketServerUrl: string

  constructor() {
    this.socketServerUrl = process.env.NODE_ENV === "production" ? window.location.origin : "http://localhost:3001"
  }

  connect() {
    if (!this.socket) {
      this.socket = io(this.socketServerUrl)
    }
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket() {
    if (!this.socket) {
      return this.connect()
    }
    return this.socket
  }
}

export default new SocketService()
