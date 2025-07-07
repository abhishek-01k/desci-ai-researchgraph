'use client'

import { io, Socket } from 'socket.io-client'

export interface CollaborationEvent {
  type: 'cursor_move' | 'text_edit' | 'comment_add' | 'user_join' | 'user_leave' | 'hypothesis_update' | 'analysis_update'
  data: any
  user: {
    address: string
    name?: string
  }
  timestamp: number
  projectId: string
}

export interface Collaborator {
  address: string
  name?: string
  cursor?: {
    x: number
    y: number
    section?: string
  }
  lastSeen: number
  isTyping?: boolean
}

export interface ProjectRoom {
  id: string
  name: string
  type: 'analysis' | 'hypothesis' | 'paper' | 'knowledge_graph'
  collaborators: Collaborator[]
  lastActivity: number
}

class CollaborationSocket {
  private socket: Socket | null = null
  private currentProject: string | null = null
  private user: { address: string; name?: string } | null = null

  connect(serverUrl: string = 'http://localhost:8001') {
    if (this.socket?.connected) {
      return this.socket
    }

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    })

    this.socket.on('connect', () => {
      console.log('Connected to collaboration server')
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from collaboration server')
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  setUser(user: { address: string; name?: string }) {
    this.user = user
    if (this.socket?.connected) {
      this.socket.emit('user_info', user)
    }
  }

  joinProject(projectId: string, projectType: ProjectRoom['type']) {
    if (!this.socket?.connected || !this.user) {
      throw new Error('Socket not connected or user not set')
    }

    if (this.currentProject) {
      this.leaveProject()
    }

    this.currentProject = projectId
    this.socket.emit('join_project', {
      projectId,
      projectType,
      user: this.user,
    })
  }

  leaveProject() {
    if (!this.socket?.connected || !this.currentProject) {
      return
    }

    this.socket.emit('leave_project', {
      projectId: this.currentProject,
      user: this.user,
    })

    this.currentProject = null
  }

  // Real-time collaboration events
  sendCursorMove(x: number, y: number, section?: string) {
    this.emitEvent('cursor_move', { x, y, section })
  }

  sendTextEdit(section: string, content: string, selection?: { start: number; end: number }) {
    this.emitEvent('text_edit', { section, content, selection })
  }

  sendComment(content: string, position: { x: number; y: number }, section?: string) {
    this.emitEvent('comment_add', { content, position, section })
  }

  sendHypothesisUpdate(hypothesisId: string, updates: any) {
    this.emitEvent('hypothesis_update', { hypothesisId, updates })
  }

  sendAnalysisUpdate(analysisId: string, updates: any) {
    this.emitEvent('analysis_update', { analysisId, updates })
  }

  private emitEvent(type: CollaborationEvent['type'], data: any) {
    if (!this.socket?.connected || !this.currentProject || !this.user) {
      return
    }

    const event: CollaborationEvent = {
      type,
      data,
      user: this.user,
      timestamp: Date.now(),
      projectId: this.currentProject,
    }

    this.socket.emit('collaboration_event', event)
  }

  // Event listeners
  onCollaboratorJoin(callback: (collaborator: Collaborator) => void) {
    this.socket?.on('collaborator_join', callback)
  }

  onCollaboratorLeave(callback: (address: string) => void) {
    this.socket?.on('collaborator_leave', callback)
  }

  onCursorMove(callback: (data: { address: string; x: number; y: number; section?: string }) => void) {
    this.socket?.on('cursor_move', callback)
  }

  onTextEdit(callback: (data: { address: string; section: string; content: string; selection?: any }) => void) {
    this.socket?.on('text_edit', callback)
  }

  onComment(callback: (data: { address: string; content: string; position: any; section?: string }) => void) {
    this.socket?.on('comment_add', callback)
  }

  onHypothesisUpdate(callback: (data: { address: string; hypothesisId: string; updates: any }) => void) {
    this.socket?.on('hypothesis_update', callback)
  }

  onAnalysisUpdate(callback: (data: { address: string; analysisId: string; updates: any }) => void) {
    this.socket?.on('analysis_update', callback)
  }

  onProjectState(callback: (project: ProjectRoom) => void) {
    this.socket?.on('project_state', callback)
  }

  // Utility methods
  getSocket() {
    return this.socket
  }

  isConnected() {
    return this.socket?.connected || false
  }

  getCurrentProject() {
    return this.currentProject
  }
}

export const collaborationSocket = new CollaborationSocket() 