'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  Search, 
  Filter, 
  MapPin, 
  Mail, 
  Phone, 
  Globe,
  BookOpen,
  Award,
  Calendar,
  MessageSquare,
  UserPlus,
  ExternalLink,
  Heart,
  Star,
  Loader2,
  RefreshCw,
  ChevronRight,
  Building,
  GraduationCap,
  TrendingUp
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  institution: string;
  department: string;
  researchAreas: string[];
  publications: number;
  citations: number;
  hIndex: number;
  profilePicture: string | null;
  bio: string;
  matchScore: number;
  collaborationHistory: string[];
  availabilityStatus: 'available' | 'busy' | 'unavailable';
  preferredCollaborationTypes: string[];
  contactPreference: 'email' | 'phone' | 'platform';
  timezone: string;
  languages: string[];
  expertise: string[];
  interests: string[];
  currentProjects: string[];
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    googleScholar?: string;
    orcid?: string;
  };
}

export default function CollaboratePage() {
  const { toast } = useToast();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    domain: '',
    institution: '',
    availabilityStatus: 'all',
    minPublications: '',
    minCitations: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);

  useEffect(() => {
    loadCollaborators();
  }, []);

  const loadCollaborators = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (filters.domain) params.append('domain', filters.domain);
      if (filters.institution) params.append('institution', filters.institution);

      const response = await fetch(`/api/collaborators?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.collaborators || data);
      }
    } catch (error) {
      console.error('Failed to load collaborators:', error);
      toast({
        title: 'Error',
        description: 'Failed to load collaborators. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollaboratorAction = async (collaboratorId: string, action: 'connect' | 'message' | 'favorite' | 'invite') => {
    try {
      const response = await fetch('/api/collaborators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          collaboratorId,
          message: action === 'connect' ? 'I would like to connect for potential collaboration.' : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to perform action');
      }

      const result = await response.json();
      
      let actionText = '';
      switch (action) {
        case 'connect':
          actionText = 'Connection request sent';
          break;
        case 'message':
          actionText = 'Message sent';
          break;
        case 'favorite':
          actionText = 'Added to favorites';
          break;
        case 'invite':
          actionText = 'Collaboration invite sent';
          break;
      }

      toast({
        title: 'Success',
        description: actionText,
      });
    } catch (error) {
      console.error('Collaborator action error:', error);
      toast({
        title: 'Action Failed',
        description: 'Failed to perform action. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredCollaborators = collaborators.filter(collaborator => {
    const matchesSearch = collaborator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         collaborator.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         collaborator.researchAreas.some(area => area.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         collaborator.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesAvailability = filters.availabilityStatus === 'all' || collaborator.availabilityStatus === filters.availabilityStatus;
    const matchesInstitution = !filters.institution || collaborator.institution.toLowerCase().includes(filters.institution.toLowerCase());
    const matchesMinPublications = !filters.minPublications || collaborator.publications >= parseInt(filters.minPublications);
    const matchesMinCitations = !filters.minCitations || collaborator.citations >= parseInt(filters.minCitations);
    
    return matchesSearch && matchesAvailability && matchesInstitution && matchesMinPublications && matchesMinCitations;
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find Collaborators</h1>
          <p className="text-muted-foreground">
            Connect with researchers and build meaningful collaborations
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadCollaborators} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Collaborators
          </CardTitle>
          <CardDescription>
            Find researchers by name, institution, research areas, or expertise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by name, institution, or research area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={loadCollaborators} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="domain">Research Domain</Label>
              <Input
                id="domain"
                type="text"
                placeholder="e.g., AI, Biology"
                value={filters.domain}
                onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                type="text"
                placeholder="University name"
                value={filters.institution}
                onChange={(e) => setFilters({ ...filters, institution: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="availability">Availability</Label>
              <select
                id="availability"
                className="w-full p-2 border rounded-md"
                value={filters.availabilityStatus}
                onChange={(e) => setFilters({ ...filters, availabilityStatus: e.target.value })}
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            <div>
              <Label htmlFor="minPublications">Min Publications</Label>
              <Input
                id="minPublications"
                type="number"
                placeholder="0"
                value={filters.minPublications}
                onChange={(e) => setFilters({ ...filters, minPublications: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="minCitations">Min Citations</Label>
              <Input
                id="minCitations"
                type="number"
                placeholder="0"
                value={filters.minCitations}
                onChange={(e) => setFilters({ ...filters, minCitations: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filteredCollaborators.length > 0 ? `${filteredCollaborators.length} Collaborators Found` : 'No Collaborators Found'}
          </h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
              Showing {filteredCollaborators.length} results
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading collaborators...</span>
          </div>
        ) : filteredCollaborators.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  No collaborators found
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredCollaborators.map((collaborator, index) => (
              <motion.div
                key={collaborator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                          {collaborator.profilePicture ? (
                            <img 
                              src={collaborator.profilePicture} 
                              alt={collaborator.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <Users className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{collaborator.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {collaborator.institution} • {collaborator.department}
                          </CardDescription>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className={getAvailabilityColor(collaborator.availabilityStatus)}>
                              {collaborator.availabilityStatus}
                            </Badge>
                            <Badge variant="outline" className={getMatchScoreColor(collaborator.matchScore)}>
                              {Math.round(collaborator.matchScore * 100)}% match
                            </Badge>
                            <Badge variant="outline">
                              H-index: {collaborator.hIndex}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCollaborator(collaborator)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCollaboratorAction(collaborator.id, 'favorite')}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleCollaboratorAction(collaborator.id, 'connect')}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {collaborator.bio}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span>{collaborator.publications} publications</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>{collaborator.citations} citations</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span>{collaborator.languages.join(', ')}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Research Areas:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {collaborator.researchAreas.slice(0, 3).map((area, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                            {collaborator.researchAreas.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{collaborator.researchAreas.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Expertise:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {collaborator.expertise.slice(0, 4).map((exp, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {exp}
                              </Badge>
                            ))}
                            {collaborator.expertise.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{collaborator.expertise.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Collaborator Detail Modal */}
      {selectedCollaborator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{selectedCollaborator.name}</h2>
              <Button variant="outline" onClick={() => setSelectedCollaborator(null)}>
                Close
              </Button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                  {selectedCollaborator.profilePicture ? (
                    <img 
                      src={selectedCollaborator.profilePicture} 
                      alt={selectedCollaborator.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Users className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{selectedCollaborator.name}</h3>
                  <p className="text-muted-foreground">{selectedCollaborator.institution} • {selectedCollaborator.department}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className={getAvailabilityColor(selectedCollaborator.availabilityStatus)}>
                      {selectedCollaborator.availabilityStatus}
                    </Badge>
                    <Badge variant="outline" className={getMatchScoreColor(selectedCollaborator.matchScore)}>
                      {Math.round(selectedCollaborator.matchScore * 100)}% match
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Bio</h4>
                <p className="text-muted-foreground">{selectedCollaborator.bio}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Research Areas</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCollaborator.researchAreas.map((area, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCollaborator.expertise.map((exp, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Current Projects</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {selectedCollaborator.currentProjects.map((project, idx) => (
                    <li key={idx}>{project}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">Publications</p>
                  <p className="text-muted-foreground">{selectedCollaborator.publications}</p>
                </div>
                <div>
                  <p className="font-medium">Citations</p>
                  <p className="text-muted-foreground">{selectedCollaborator.citations}</p>
                </div>
                <div>
                  <p className="font-medium">H-Index</p>
                  <p className="text-muted-foreground">{selectedCollaborator.hIndex}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleCollaboratorAction(selectedCollaborator.id, 'connect')}
                  className="flex-1"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Connect
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleCollaboratorAction(selectedCollaborator.id, 'message')}
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleCollaboratorAction(selectedCollaborator.id, 'invite')}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Invite to Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 