'use client'

import { useState, useEffect } from 'react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Input } from './input'
import { useCollaboration } from '@/components/providers/CollaborationProvider'
import { ProjectRoom } from '@/lib/collaboration-socket'
import { 
  Users, 
  MessageSquare, 
  Eye, 
  Edit3, 
  MousePointer, 
  Wifi, 
  WifiOff,
  Plus,
  X,
  Send
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface CollaborationWidgetProps {
  projectId: string
  projectType: ProjectRoom['type']
  projectName: string
  className?: string
}

export function CollaborationWidget({ 
  projectId, 
  projectType, 
  projectName, 
  className = '' 
}: CollaborationWidgetProps) {
  const {
    isConnected,
    collaborators,
    currentProject,
    joinProject,
    leaveProject,
    sendComment,
    isTyping,
    setIsTyping,
  } = useCollaboration()

  const [isJoined, setIsJoined] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState<Array<{
    id: string
    user: string
    content: string
    timestamp: number
    position?: { x: number; y: number }
  }>>([])

  useEffect(() => {
    setIsJoined(currentProject === projectId)
  }, [currentProject, projectId])

  const handleJoinProject = () => {
    if (isJoined) {
      leaveProject()
    } else {
      joinProject(projectId, projectType)
    }
  }

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const newComment = {
      id: Date.now().toString(),
      user: 'You',
      content: commentText,
      timestamp: Date.now(),
      position: { x: 0, y: 0 }
    }

    setComments(prev => [...prev, newComment])
    sendComment(commentText, { x: 0, y: 0 })
    setCommentText('')
    
    toast({
      title: 'Comment Added',
      description: 'Your comment has been shared with collaborators',
    })
  }

  const getCollaboratorColor = (address: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-red-500',
    ]
    const index = address.slice(-1).charCodeAt(0) % colors.length
    return colors[index]
  }

  const getCollaboratorInitials = (address: string) => {
    return address.slice(2, 4).toUpperCase()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <span>Collaboration</span>
            </div>
            <Badge variant={isJoined ? 'default' : 'secondary'}>
              {isJoined ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {projectName} - {projectType}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={handleJoinProject}
              disabled={!isConnected}
              className="w-full"
              variant={isJoined ? 'outline' : 'default'}
            >
              {isJoined ? 'Leave Session' : 'Join Collaborative Session'}
            </Button>
            
            {!isConnected && (
              <p className="text-sm text-muted-foreground text-center">
                Connect your wallet to join collaborative sessions
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Collaborators */}
      {isJoined && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Users className="h-5 w-5" />
              <span>Active Collaborators</span>
              <Badge variant="secondary">{collaborators.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {collaborators.length > 0 ? (
              <div className="space-y-3">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.address}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getCollaboratorColor(collaborator.address)}`}>
                        {getCollaboratorInitials(collaborator.address)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {collaborator.name || `${collaborator.address.slice(0, 8)}...`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {collaborator.isTyping ? 'Typing...' : 'Active'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {collaborator.cursor && (
                        <MousePointer className="h-4 w-4 text-blue-500" />
                      )}
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No other collaborators online
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      {isJoined && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Comments</span>
                <Badge variant="secondary">{comments.length}</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
              >
                {showComments ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          {showComments && (
            <CardContent>
              <div className="space-y-4">
                {/* Comments List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border-l-2 border-blue-500 pl-3 py-2"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{comment.user}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No comments yet
                      </p>
                    </div>
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleSendComment} className="flex space-x-2">
                  <Input
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => {
                      setCommentText(e.target.value)
                      setIsTyping(e.target.value.length > 0)
                    }}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" disabled={!commentText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Activity Indicators */}
      {isJoined && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Eye className="h-5 w-5" />
              <span>Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Real-time sync</span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cursor tracking</span>
                <div className="flex items-center space-x-2">
                  <MousePointer className="h-4 w-4 text-blue-500" />
                  <span className="text-blue-600">Enabled</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Live editing</span>
                <div className="flex items-center space-x-2">
                  <Edit3 className="h-4 w-4 text-purple-500" />
                  <span className="text-purple-600">Ready</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 