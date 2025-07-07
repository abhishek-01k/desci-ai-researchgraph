'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Lightbulb, 
  Search, 
  Plus, 
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Target,
  Beaker,
  Eye,
  Share,
  Download,
  Filter,
  Loader2
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Hypothesis {
  id: string;
  title: string;
  description: string;
  confidence: number;
  status: 'draft' | 'testing' | 'validated' | 'rejected';
  domain: string;
  relatedPapers: string[];
  supportingEvidence: string[];
  potentialExperiments: string[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

export default function HypothesesPage() {
  const { toast } = useToast();
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationText, setGenerationText] = useState('');
  const [selectedHypothesis, setSelectedHypothesis] = useState<Hypothesis | null>(null);

  const domains = [
    'all',
    'biology',
    'chemistry',
    'physics',
    'medicine',
    'computer_science',
    'psychology',
    'environmental_science',
    'engineering',
    'mathematics'
  ];

  useEffect(() => {
    loadHypotheses();
  }, []);

  const loadHypotheses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hypotheses');
      if (response.ok) {
        const data = await response.json();
        setHypotheses(data);
      }
    } catch (error) {
      console.error('Failed to load hypotheses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load hypotheses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateHypotheses = async () => {
    if (!generationText.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter some text to generate hypotheses from.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/hypotheses/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: generationText,
          domain: selectedDomain === 'all' ? 'general' : selectedDomain,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate hypotheses');
      }

      const result = await response.json();
      toast({
        title: 'Hypotheses Generated!',
        description: `Generated ${result.hypotheses?.length || 0} new research hypotheses.`,
      });

      // Reload hypotheses to show the new ones
      loadHypotheses();
      setGenerationText('');
    } catch (error) {
      console.error('Hypothesis generation error:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate hypotheses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHypothesisAction = async (hypothesisId: string, action: 'view' | 'test' | 'validate' | 'reject' | 'share') => {
    try {
      const hypothesis = hypotheses.find(h => h.id === hypothesisId);
      if (!hypothesis) return;

      switch (action) {
        case 'view':
          setSelectedHypothesis(hypothesis);
          break;
        case 'test':
          // Update status to testing
          const updatedHypotheses = hypotheses.map(h => 
            h.id === hypothesisId ? { ...h, status: 'testing' as const } : h
          );
          setHypotheses(updatedHypotheses);
          toast({
            title: 'Hypothesis Testing',
            description: 'Hypothesis marked as under testing.',
          });
          break;
        case 'validate':
          // Update status to validated
          const validatedHypotheses = hypotheses.map(h => 
            h.id === hypothesisId ? { ...h, status: 'validated' as const } : h
          );
          setHypotheses(validatedHypotheses);
          toast({
            title: 'Hypothesis Validated',
            description: 'Hypothesis marked as validated.',
          });
          break;
        case 'reject':
          // Update status to rejected
          const rejectedHypotheses = hypotheses.map(h => 
            h.id === hypothesisId ? { ...h, status: 'rejected' as const } : h
          );
          setHypotheses(rejectedHypotheses);
          toast({
            title: 'Hypothesis Rejected',
            description: 'Hypothesis marked as rejected.',
          });
          break;
        case 'share':
          // Share hypothesis
          if (navigator.share) {
            await navigator.share({
              title: hypothesis.title,
              text: hypothesis.description,
              url: `${window.location.origin}/hypotheses/${hypothesisId}`,
            });
          } else {
            await navigator.clipboard.writeText(`${window.location.origin}/hypotheses/${hypothesisId}`);
            toast({
              title: 'Link Copied',
              description: 'Hypothesis link copied to clipboard.',
            });
          }
          break;
      }
    } catch (error) {
      console.error('Hypothesis action error:', error);
      toast({
        title: 'Action Failed',
        description: 'Failed to perform action. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'testing':
        return 'bg-blue-100 text-blue-800';
      case 'validated':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'testing':
        return <Beaker className="h-4 w-4" />;
      case 'validated':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredHypotheses = hypotheses.filter(hypothesis => {
    const matchesSearch = hypothesis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hypothesis.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hypothesis.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDomain = selectedDomain === 'all' || hypothesis.domain === selectedDomain;
    
    return matchesSearch && matchesDomain;
  });

  const stats = {
    total: hypotheses.length,
    draft: hypotheses.filter(h => h.status === 'draft').length,
    testing: hypotheses.filter(h => h.status === 'testing').length,
    validated: hypotheses.filter(h => h.status === 'validated').length,
    rejected: hypotheses.filter(h => h.status === 'rejected').length,
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Research Hypotheses</h1>
          <p className="text-muted-foreground">
            Generate, track, and validate research hypotheses with AI assistance
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadHypotheses} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Draft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Beaker className="h-4 w-4" />
              Testing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.testing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Validated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.validated}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Generate New Hypotheses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Generate New Hypotheses
          </CardTitle>
          <CardDescription>
            Enter research text or questions to generate new hypotheses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="generation-text">Research Context</Label>
            <Textarea
              id="generation-text"
              placeholder="Enter research findings, questions, or context to generate hypotheses from..."
              value={generationText}
              onChange={(e) => setGenerationText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="domain">Research Domain</Label>
              <select
                id="domain"
                className="w-full p-2 border rounded-md"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                {domains.map(domain => (
                  <option key={domain} value={domain}>
                    {domain.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={generateHypotheses} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Generate Hypotheses
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search hypotheses by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="p-2 border rounded-md"
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
            >
              {domains.map(domain => (
                <option key={domain} value={domain}>
                  {domain.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Hypotheses List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filteredHypotheses.length > 0 ? `${filteredHypotheses.length} Hypotheses` : 'No Hypotheses Found'}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading hypotheses...</span>
          </div>
        ) : filteredHypotheses.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  No hypotheses found
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Generate your first hypothesis by entering research context above.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredHypotheses.map((hypothesis, index) => (
              <motion.div
                key={hypothesis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-6">{hypothesis.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className={getStatusColor(hypothesis.status)}>
                            {getStatusIcon(hypothesis.status)}
                            <span className="ml-1 capitalize">{hypothesis.status}</span>
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(hypothesis.priority)}>
                            {hypothesis.priority} priority
                          </Badge>
                          <Badge variant="outline">
                            {hypothesis.domain.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {hypothesis.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleHypothesisAction(hypothesis.id, 'view')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleHypothesisAction(hypothesis.id, 'test')}
                        >
                          <Beaker className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleHypothesisAction(hypothesis.id, 'share')}
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">{hypothesis.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Supporting Evidence:</p>
                          <p className="text-muted-foreground">
                            {hypothesis.supportingEvidence.length} pieces of evidence
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Related Papers:</p>
                          <p className="text-muted-foreground">
                            {hypothesis.relatedPapers.length} papers
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Potential Experiments:</p>
                          <p className="text-muted-foreground">
                            {hypothesis.potentialExperiments.length} experiments
                          </p>
                        </div>
                      </div>
                      
                      {hypothesis.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {hypothesis.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Hypothesis Detail Modal */}
      {selectedHypothesis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{selectedHypothesis.title}</h2>
              <Button variant="outline" onClick={() => setSelectedHypothesis(null)}>
                Close
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={getStatusColor(selectedHypothesis.status)}>
                  {getStatusIcon(selectedHypothesis.status)}
                  <span className="ml-1 capitalize">{selectedHypothesis.status}</span>
                </Badge>
                <Badge variant="outline" className={getPriorityColor(selectedHypothesis.priority)}>
                  {selectedHypothesis.priority} priority
                </Badge>
                <Badge variant="outline">
                  {selectedHypothesis.confidence}% confidence
                </Badge>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedHypothesis.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Supporting Evidence</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {selectedHypothesis.supportingEvidence.map((evidence, idx) => (
                      <li key={idx}>{evidence}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Potential Experiments</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {selectedHypothesis.potentialExperiments.map((experiment, idx) => (
                      <li key={idx}>{experiment}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleHypothesisAction(selectedHypothesis.id, 'validate')}
                  disabled={selectedHypothesis.status === 'validated'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleHypothesisAction(selectedHypothesis.id, 'reject')}
                  disabled={selectedHypothesis.status === 'rejected'}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 