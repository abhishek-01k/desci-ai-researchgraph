'use client'

import { useState } from 'react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Input } from './input'
import { Label } from './label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { useResearchIPNFT, useCitations, useResearcherWorks } from '@/hooks/useResearchIPNFT'
import { useAccount } from 'wagmi'
import { CITATION_TYPES } from '@/lib/web3-config'
import { FileText, ExternalLink, Plus, Award, Users, Calendar } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface CitationTrackerProps {
  paperId?: string
  tokenId?: number
}

export function CitationTracker({ paperId, tokenId }: CitationTrackerProps) {
  const [showAddCitation, setShowAddCitation] = useState(false)
  const [citedTokenId, setCitedTokenId] = useState('')
  const [citationType, setCitationType] = useState('')
  
  const { address } = useAccount()
  const { addCitation, isLoading } = useResearchIPNFT()
  const { citations, isLoading: citationsLoading } = useCitations(tokenId || 0)
  const { tokenIds } = useResearcherWorks(address || '')

  const handleAddCitation = async () => {
    if (!tokenId || !citedTokenId || !citationType) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields to add a citation.',
      })
      return
    }

    try {
      await addCitation(tokenId, parseInt(citedTokenId), citationType)
      setShowAddCitation(false)
      setCitedTokenId('')
      setCitationType('')
    } catch (error) {
      console.error('Failed to add citation:', error)
    }
  }

  const getCitationIcon = (type: string) => {
    switch (type) {
      case 'reference':
        return <FileText className="h-4 w-4" />
      case 'builds_upon':
        return <Plus className="h-4 w-4" />
      case 'extends':
        return <ExternalLink className="h-4 w-4" />
      case 'validates':
        return <Award className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getCitationColor = (type: string) => {
    switch (type) {
      case 'reference':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'builds_upon':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'extends':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'validates':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'refutes':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'contradicts':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Citation Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Citation Overview</span>
          </CardTitle>
          <CardDescription>
            Track and manage citations for this research work
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {citations?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Citations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {citations?.filter(c => c.citationType === 'validates').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Validations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {citations?.filter(c => c.citationType === 'builds_upon').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Build Upon</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {citations?.filter(c => c.citationType === 'reference').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">References</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Citation */}
      {tokenId && address && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Add Citation</span>
              <Button
                onClick={() => setShowAddCitation(!showAddCitation)}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Citation
              </Button>
            </CardTitle>
          </CardHeader>
          {showAddCitation && (
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cited-token">Referenced Research ID</Label>
                  <Input
                    id="cited-token"
                    placeholder="Enter token ID of cited research"
                    value={citedTokenId}
                    onChange={(e) => setCitedTokenId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="citation-type">Citation Type</Label>
                  <Select value={citationType} onValueChange={setCitationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select citation type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITATION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center space-x-2">
                            {getCitationIcon(type)}
                            <span className="capitalize">{type.replace('_', ' ')}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleAddCitation}
                    disabled={isLoading || !citedTokenId || !citationType}
                  >
                    {isLoading ? 'Adding...' : 'Add Citation'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddCitation(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Citations List */}
      <Card>
        <CardHeader>
          <CardTitle>Citations</CardTitle>
          <CardDescription>
            Citations and references for this research work
          </CardDescription>
        </CardHeader>
        <CardContent>
          {citationsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-muted-foreground">Loading citations...</p>
            </div>
          ) : citations && citations.length > 0 ? (
            <div className="space-y-4">
              {citations.map((citation, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={getCitationColor(citation.citationType)}>
                        {getCitationIcon(citation.citationType)}
                        <span className="ml-1 capitalize">
                          {citation.citationType.replace('_', ' ')}
                        </span>
                      </Badge>
                      <span className="font-medium">
                        Research #{citation.citedTokenId}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(citation.citedAt * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Citation relationship between Research #{citation.citingTokenId} and Research #{citation.citedTokenId}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No citations found</p>
              <p className="text-sm text-muted-foreground">
                Citations will appear here once they are added
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Research Portfolio */}
      {address && tokenIds && tokenIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Your Research Portfolio</span>
            </CardTitle>
            <CardDescription>
              Your tokenized research works
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tokenIds.map((id) => (
                <div
                  key={id}
                  className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium">Research #{id}</div>
                  <div className="text-sm text-muted-foreground">
                    Token ID: {id}
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 