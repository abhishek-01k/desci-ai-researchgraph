'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  User, 
  ExternalLink,
  Download,
  BookOpen,
  Brain,
  Network,
  ChevronRight,
  Loader2,
  Plus,
  RefreshCw,
  Eye
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  publishedDate: string;
  pmid?: string;
  doi?: string;
  citations: number;
  keywords: string[];
  status: 'published' | 'preprint' | 'submitted';
}

export default function PapersPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    author: '',
    journal: '',
    startDate: '',
    endDate: '',
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'local' | 'pubmed'>('local');

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'search') {
      // Auto-focus search input
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }
    
    // Load initial papers
    loadPapers();
  }, [searchParams]);

  const loadPapers = async () => {
    try {
      const response = await fetch('/api/papers?limit=20');
      if (response.ok) {
        const data = await response.json();
        setPapers(data);
      }
    } catch (error) {
      console.error('Failed to load papers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load papers. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      let endpoint = '';
      let params = new URLSearchParams();

      if (searchType === 'pubmed') {
        endpoint = '/api/pubmed';
        params.append('query', searchQuery);
        if (searchFilters.author) params.append('author', searchFilters.author);
        if (searchFilters.journal) params.append('journal', searchFilters.journal);
        if (searchFilters.startDate) params.append('startDate', searchFilters.startDate);
        if (searchFilters.endDate) params.append('endDate', searchFilters.endDate);
      } else {
        endpoint = '/api/papers';
        params.append('query', searchQuery);
      }

      const response = await fetch(`${endpoint}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results = await response.json();
      setPapers(results);
      
      toast({
        title: 'Search Complete',
        description: `Found ${results.length} papers matching your search.`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search Failed',
        description: 'Failed to search papers. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePaperAction = async (paperId: string, action: 'analyze' | 'download' | 'view') => {
    try {
      switch (action) {
        case 'analyze':
          // Redirect to analysis page with paper ID
          window.location.href = `/analysis?paperId=${paperId}`;
          break;
        case 'download':
          // Download paper logic
          const response = await fetch(`/api/papers/${paperId}/download`);
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `paper-${paperId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
          }
          break;
        case 'view':
          // View paper details
          window.location.href = `/papers/${paperId}`;
          break;
      }
    } catch (error) {
      console.error('Paper action error:', error);
      toast({
        title: 'Action Failed',
        description: 'Failed to perform action. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'preprint':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Research Papers</h1>
          <p className="text-muted-foreground">
            Search, analyze, and manage your research paper collection
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadPapers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => window.location.href = '/analysis'}>
            <Plus className="h-4 w-4 mr-2" />
            Add Paper
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Papers
          </CardTitle>
          <CardDescription>
            Search your local collection or PubMed for research papers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={searchType === 'local' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType('local')}
            >
              Local Papers
            </Button>
            <Button
              variant={searchType === 'pubmed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType('pubmed')}
            >
              PubMed Search
            </Button>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="search-input"
                  type="text"
                  placeholder="Search papers by title, keywords, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? (
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

            {searchType === 'pubmed' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    type="text"
                    placeholder="Author name"
                    value={searchFilters.author}
                    onChange={(e) => setSearchFilters({ ...searchFilters, author: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="journal">Journal</Label>
                  <Input
                    id="journal"
                    type="text"
                    placeholder="Journal name"
                    value={searchFilters.journal}
                    onChange={(e) => setSearchFilters({ ...searchFilters, journal: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={searchFilters.startDate}
                    onChange={(e) => setSearchFilters({ ...searchFilters, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={searchFilters.endDate}
                    onChange={(e) => setSearchFilters({ ...searchFilters, endDate: e.target.value })}
                  />
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {papers.length > 0 ? `${papers.length} Papers Found` : 'No Papers Found'}
          </h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
              Showing {papers.length} results
            </span>
          </div>
        </div>

        {papers.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  No papers found
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search terms or upload new papers to analyze.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {papers.map((paper, index) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-6 hover:text-blue-600 transition-colors">
                          {paper.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className={getStatusColor(paper.status)}>
                            {paper.status}
                          </Badge>
                          {paper.pmid && (
                            <Badge variant="outline">
                              PMID: {paper.pmid}
                            </Badge>
                          )}
                          {paper.citations > 0 && (
                            <Badge variant="outline">
                              {paper.citations} citations
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePaperAction(paper.id, 'analyze')}
                        >
                          <Brain className="h-4 w-4 mr-1" />
                          Analyze
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePaperAction(paper.id, 'view')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {paper.authors.slice(0, 3).join(', ')}
                          {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(paper.publishedDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {paper.journal}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {paper.abstract}
                      </p>
                      
                      {paper.keywords && paper.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {paper.keywords.slice(0, 5).map((keyword, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {paper.keywords.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{paper.keywords.length - 5} more
                            </Badge>
                          )}
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
    </div>
  );
} 