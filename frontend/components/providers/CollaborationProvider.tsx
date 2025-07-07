'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { collaborationSocket, Collaborator, ProjectRoom } from '@/lib/collaboration-socket'
import { toast } from '@/hooks/use-toast'

interface CollaborationContextType {
  isConnected: boolean
  collaborators: Collaborator[]
  currentProject: string | null
  joinProject: (projectId: string, projectType: ProjectRoom['type']) => void
  leaveProject: () => void
  sendCursorMove: (x: number, y: number, section?: string) => void
  sendTextEdit: (section: string, content: string, selection?: { start: number; end: number }) => void
  sendComment: (content: string, position: { x: number; y: number }, section?: string) => void
  isTyping: boolean
  setIsTyping: (typing: boolean) => void
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined)

export function useCollaboration() {
  const context = useContext(CollaborationContext)
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider')
  }
  return context
}

interface CollaborationProviderProps {
  children: ReactNode
}

export function CollaborationProvider({ children }: CollaborationProviderProps) {
  const { address, isConnected: walletConnected } = useAccount()
  const [isConnected, setIsConnected] = useState(false)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [currentProject, setCurrentProject] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  // Initialize connection when wallet is connected
  useEffect(() => {
    if (walletConnected && address) {
      const socket = collaborationSocket.connect()
      
      if (socket) {
        socket.on('connect', () => {
          setIsConnected(true)
          collaborationSocket.setUser({
            address,
            name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          })
        })

        socket.on('disconnect', () => {
          setIsConnected(false)
          setCollaborators([])
          setCurrentProject(null)
        })

        // Set up collaboration event listeners
        collaborationSocket.onCollaboratorJoin((collaborator) => {
          setCollaborators(prev => {
            const exists = prev.find(c => c.address === collaborator.address)
            if (exists) {
              return prev.map(c => c.address === collaborator.address ? collaborator : c)
            }
            return [...prev, collaborator]
          })
          
          toast({
            title: 'Collaborator Joined',
            description: `${collaborator.name || collaborator.address.slice(0, 8)}... joined the project`,
          })
        })

        collaborationSocket.onCollaboratorLeave((address) => {
          setCollaborators(prev => prev.filter(c => c.address !== address))
          
          toast({
            title: 'Collaborator Left',
            description: `Collaborator left the project`,
          })
        })

        collaborationSocket.onProjectState((project) => {
          setCollaborators(project.collaborators)
          setCurrentProject(project.id)
        })

        collaborationSocket.onCursorMove((data) => {
          setCollaborators(prev => 
            prev.map(c => 
              c.address === data.address 
                ? { ...c, cursor: { x: data.x, y: data.y, section: data.section } }
                : c
            )
          )
        })

        collaborationSocket.onTextEdit((data) => {
          // Handle text edit events from other collaborators
          // This would typically update a shared document state
          console.log('Text edit from collaborator:', data)
        })

        collaborationSocket.onComment((data) => {
          toast({
            title: 'New Comment',
            description: `Comment from ${data.address.slice(0, 8)}...`,
          })
        })
      }
    }

    return () => {
      if (walletConnected && address) {
        collaborationSocket.disconnect()
        setIsConnected(false)
        setCollaborators([])
        setCurrentProject(null)
      }
    }
  }, [walletConnected, address])

  const joinProject = (projectId: string, projectType: ProjectRoom['type']) => {
    try {
      collaborationSocket.joinProject(projectId, projectType)
      setCurrentProject(projectId)
      
      toast({
        title: 'Joined Project',
        description: `Connected to collaborative ${projectType} session`,
      })
    } catch (error) {
      console.error('Failed to join project:', error)
      toast({
        title: 'Connection Failed',
        description: 'Failed to join collaborative session',
      })
    }
  }

  const leaveProject = () => {
    collaborationSocket.leaveProject()
    setCurrentProject(null)
    setCollaborators([])
  }

  const sendCursorMove = (x: number, y: number, section?: string) => {
    if (isConnected) {
      collaborationSocket.sendCursorMove(x, y, section)
    }
  }

  const sendTextEdit = (section: string, content: string, selection?: { start: number; end: number }) => {
    if (isConnected) {
      collaborationSocket.sendTextEdit(section, content, selection)
    }
  }

  const sendComment = (content: string, position: { x: number; y: number }, section?: string) => {
    if (isConnected) {
      collaborationSocket.sendComment(content, position, section)
    }
  }

  const value: CollaborationContextType = {
    isConnected,
    collaborators,
    currentProject,
    joinProject,
    leaveProject,
    sendCursorMove,
    sendTextEdit,
    sendComment,
    isTyping,
    setIsTyping,
  }

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  )
} 