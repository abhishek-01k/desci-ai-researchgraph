'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Brain, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Download,
  Share,
  Bookmark,
  Eye,
  TrendingUp,
  Zap,
  Search,
  Filter
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { useResearchStore } from '@/lib/stores/research-store';

interface AnalysisStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
}

const analysisSteps: AnalysisStep[] = [
  {
    id: 'extraction',
    name: 'Text Extraction',
    description: 'Extracting text and metadata from document',
    status: 'pending',
    progress: 0
  },
  {
    id: 'preprocessing',
    name: 'Text Preprocessing',
    description: 'Cleaning and normalizing extracted text',
    status: 'pending',
    progress: 0
  },
  {
    id: 'entity-extraction',
    name: 'Entity Extraction',
    description: 'Identifying scientific entities and concepts',
    status: 'pending',
    progress: 0
  },
  {
    id: 'analysis',
    name: 'AI Analysis',
    description: 'Performing comprehensive AI-powered analysis',
    status: 'pending',
    progress: 0
  },
  {
    id: 'hypothesis-generation',
    name: 'Hypothesis Generation',
    description: 'Generating research hypotheses and insights',
    status: 'pending',
    progress: 0
  },
  {
    id: 'quality-assessment',
    name: 'Quality Assessment',
    description: 'Evaluating research quality and reproducibility',
    status: 'pending',
    progress: 0
  }
];

export default function AnalysisPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisText, setAnalysisText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<AnalysisStep[]>(analysisSteps);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [analysisOptions, setAnalysisOptions] = useState({
    extractEntities: true,
    detectNullResults: true,
    generateSummary: true,
    generateHypotheses: true,
    qualityAssessment: true,
    fairAssessment: true,
  });
  const { toast } = useToast();
  const { addPaper, startAnalysis } = useResearchStore();

  const updateStepProgress = (stepId: string, status: AnalysisStep['status'], progress: number) => {
    setCurrentSteps(steps => 
      steps.map(step => 
        step.id === stepId ? { ...step, status, progress } : step
      )
    );
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile && !analysisText) {
      toast({
        title: 'No content to analyze',
        description: 'Please upload a file or enter text to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setActiveTab('results');
    setAnalysisResults(null);

    // Reset steps
    setCurrentSteps(analysisSteps.map(step => ({ ...step, status: 'pending' as const, progress: 0 })));

    try {
      const formData = new FormData();
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      } else {
        formData.append('text', analysisText);
      }

      // Add analysis options
      formData.append('extractEntities', analysisOptions.extractEntities.toString());
      formData.append('detectNullResults', analysisOptions.detectNullResults.toString());
      formData.append('generateSummary', analysisOptions.generateSummary.toString());
      formData.append('generateHypotheses', analysisOptions.generateHypotheses.toString());
      formData.append('qualityAssessment', analysisOptions.qualityAssessment.toString());
      formData.append('fairAssessment', analysisOptions.fairAssessment.toString());

      // Start analysis steps
      updateStepProgress('extraction', 'processing', 0);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      updateStepProgress('extraction', 'completed', 100);
      updateStepProgress('preprocessing', 'processing', 0);

      const result = await response.json();
      
      // Complete remaining steps
      const stepsToComplete = ['preprocessing', 'entity-extraction', 'analysis', 'hypothesis-generation', 'quality-assessment'];
      
      for (let i = 0; i < stepsToComplete.length; i++) {
        const stepId = stepsToComplete[i];
        updateStepProgress(stepId, 'processing', 0);
        
        // Simulate progress for visual feedback
        for (let progress = 0; progress <= 100; progress += 20) {
          updateStepProgress(stepId, 'processing', progress);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        updateStepProgress(stepId, 'completed', 100);
      }

      // Transform backend response to match frontend expectations
      // The backend response is nested: result.data.data contains the actual analysis
      const backendData = result.data.data || result.data;
      
      const transformedResults = {
        ...backendData,
        // Add summary from paper analysis
        summary: backendData.paper_analysis?.abstract_summary && backendData.paper_analysis.abstract_summary !== 'No abstract provided' 
          ? backendData.paper_analysis.abstract_summary
          : `Research analysis completed with ${backendData.entities ? Object.values(backendData.entities).flat().length : 0} entities extracted and ${backendData.null_results?.detected ? 'null results detected' : 'no null results found'}.`,
        
        // Transform entities from object of arrays to array of objects
        entities: backendData.entities ? Object.entries(backendData.entities).flatMap(([type, items]: [string, any]) =>
          (Array.isArray(items) ? items : []).map((item: string) => ({
            name: item,
            type: type.slice(0, -1), // Remove plural 's'
            confidence: 0.8 // Default confidence
          }))
        ) : [],
        
        // Transform hypotheses to match expected format
        hypotheses: backendData.generated_hypotheses ? 
          backendData.generated_hypotheses.map((h: any) => 
            typeof h === 'string' ? h : h.hypothesis || h
          ) : [],
        
        // Add key findings from null results
        key_findings: backendData.null_results?.findings || [],
        
        // Map quality assessment scores for AI Insights
        quality_score: backendData.quality_assessment?.reproducibility_score || 0,
        methodology_score: backendData.quality_assessment?.methodology_score || 0,
        data_score: backendData.quality_assessment?.data_quality_score || 0,
        overall_quality: backendData.quality_assessment?.overall_score || 0,
        
        // Add null results info
        null_results_detected: backendData.null_results?.detected || false,
        null_results_confidence: backendData.null_results?.confidence || 0,
        
        // Add metadata
        analysis_timestamp: backendData.paper_analysis?.analysis_timestamp,
        content_length: backendData.paper_analysis?.content_length,
        title: backendData.paper_analysis?.title
      };
      
      setAnalysisResults(transformedResults);
      
      toast({
        title: 'Analysis completed!',
        description: 'Your research analysis is ready for review.',
      });

    } catch (error) {
      console.error('Analysis error:', error);
      
      // Mark current step as error
      const processingStep = currentSteps.find(step => step.status === 'processing');
      if (processingStep) {
        updateStepProgress(processingStep.id, 'error', 0);
      }
      
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'An error occurred during analysis.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const handleOptionChange = (option: keyof typeof analysisOptions) => {
    setAnalysisOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleExport = () => {
    if (!analysisResults) return;
    
    const exportData = {
      title: analysisResults.title || 'Analysis Results',
      timestamp: analysisResults.analysis_timestamp,
      summary: analysisResults.summary,
      key_findings: analysisResults.key_findings,
      hypotheses: analysisResults.hypotheses,
      entities: analysisResults.entities,
      quality_metrics: {
        overall_quality: analysisResults.overall_quality,
        methodology_score: analysisResults.methodology_score,
        quality_score: analysisResults.quality_score,
        data_score: analysisResults.data_score
      },
      null_results: {
        detected: analysisResults.null_results_detected,
        confidence: analysisResults.null_results_confidence,
        findings: analysisResults.key_findings
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis-results-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export successful',
      description: 'Analysis results have been downloaded as JSON file.',
    });
  };

  const handleShare = () => {
    if (!analysisResults) return;
    
    const shareText = `🧬 ResearchGraph AI Analysis Results

Title: ${analysisResults.title || 'Research Analysis'}
Quality Score: ${analysisResults.overall_quality || 'N/A'}/10

Key Findings:
${analysisResults.key_findings?.slice(0, 3).map((finding: string, i: number) => `${i + 1}. ${finding}`).join('\n') || 'No key findings'}

Generated Hypotheses: ${analysisResults.hypotheses?.length || 0}
Extracted Entities: ${analysisResults.entities?.length || 0}

Analyzed with ResearchGraph AI 🚀`;

    if (navigator.share) {
      navigator.share({
        title: 'ResearchGraph AI Analysis Results',
        text: shareText,
        url: window.location.href
      }).then(() => {
        toast({
          title: 'Shared successfully',
          description: 'Analysis results have been shared.',
        });
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        toast({
          title: 'Copied to clipboard',
          description: 'Analysis summary has been copied to your clipboard.',
        });
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: 'Copied to clipboard',
        description: 'Analysis summary has been copied to your clipboard.',
      });
    }
  };

  const handleSave = () => {
    if (!analysisResults) return;
    
    // Save to localStorage for now (in a real app, this would save to a database)
    const savedAnalyses = JSON.parse(localStorage.getItem('savedAnalyses') || '[]');
    const analysisToSave = {
      id: Date.now().toString(),
      title: analysisResults.title || 'Untitled Analysis',
      timestamp: analysisResults.analysis_timestamp || new Date().toISOString(),
      summary: analysisResults.summary,
      overall_quality: analysisResults.overall_quality,
      data: analysisResults
    };
    
    savedAnalyses.unshift(analysisToSave);
    // Keep only the last 10 analyses
    if (savedAnalyses.length > 10) {
      savedAnalyses.splice(10);
    }
    
    localStorage.setItem('savedAnalyses', JSON.stringify(savedAnalyses));
    
    toast({
      title: 'Analysis saved',
      description: 'Your analysis has been saved locally and can be accessed later.',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Research Analysis</h1>
          <p className="text-muted-foreground">
            Upload your research papers for comprehensive AI-powered analysis and insights.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search History
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter Results
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload & Input</TabsTrigger>
          <TabsTrigger value="results">Analysis Results</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Research Paper
                </CardTitle>
                <CardDescription>
                  Upload PDF, Word, or text files for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onFilesSelected={(files) => {
                    if (files.length > 0) {
                      setSelectedFile(files[0]);
                      toast({
                        title: 'File selected',
                        description: `${files[0].name} is ready for analysis.`,
                      });
                    } else {
                      setSelectedFile(null);
                    }
                  }}
                  maxFiles={1}
                  maxSize={50 * 1024 * 1024} // 50MB
                />
              </CardContent>
            </Card>

            {/* Text Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Direct Text Input
                </CardTitle>
                <CardDescription>
                  Paste your research text directly for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="analysis-text">Research Text</Label>
                  <Textarea
                    id="analysis-text"
                    placeholder="Paste your research paper text, abstract, or any scientific content here..."
                    value={analysisText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnalysisText(e.target.value)}
                    className="min-h-[200px] resize-none"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{analysisText.length} characters</span>
                  {analysisText.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAnalysisText('')}
                    >
                      Clear text
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Analysis Options
              </CardTitle>
              <CardDescription>
                Configure your analysis preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="hypothesis" 
                    checked={analysisOptions.generateHypotheses}
                    onChange={() => handleOptionChange('generateHypotheses')}
                  />
                  <Label htmlFor="hypothesis">Generate Hypotheses</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="entities" 
                    checked={analysisOptions.extractEntities}
                    onChange={() => handleOptionChange('extractEntities')}
                  />
                  <Label htmlFor="entities">Extract Entities</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="quality" 
                    checked={analysisOptions.qualityAssessment}
                    onChange={() => handleOptionChange('qualityAssessment')}
                  />
                  <Label htmlFor="quality">Quality Assessment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="null-results" 
                    checked={analysisOptions.detectNullResults}
                    onChange={() => handleOptionChange('detectNullResults')}
                  />
                  <Label htmlFor="null-results">Null Results Detection</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="summary" 
                    checked={analysisOptions.generateSummary}
                    onChange={() => handleOptionChange('generateSummary')}
                  />
                  <Label htmlFor="summary">Generate Summary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="fair" 
                    checked={analysisOptions.fairAssessment}
                    onChange={() => handleOptionChange('fairAssessment')}
                  />
                  <Label htmlFor="fair">FAIR Data Assessment</Label>
                </div>
              </div>
              <Button 
                onClick={handleStartAnalysis} 
                className="w-full"
                disabled={isAnalyzing || (!selectedFile && !analysisText)}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Start AI Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {isAnalyzing ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analysis in Progress
                </CardTitle>
                <CardDescription>
                  AI is analyzing your research content...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentSteps.map((step, index) => (
                  <div key={step.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStepIcon(step.status)}
                        <div>
                          <p className="font-medium">{step.name}</p>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      {step.status === 'processing' && (
                        <span className="text-sm font-medium">{step.progress}%</span>
                      )}
                    </div>
                    {step.status === 'processing' && (
                      <Progress value={step.progress} className="h-2" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : analysisResults ? (
            <div className="space-y-6">
              {/* Analysis Results Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Analysis Results
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleSave}>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisResults.summary && (
                      <div>
                        <h4 className="font-medium mb-2">Summary</h4>
                        <p className="text-muted-foreground">{analysisResults.summary}</p>
                      </div>
                    )}
                    
                    {analysisResults.key_findings && (
                      <div>
                        <h4 className="font-medium mb-2">Key Findings</h4>
                        <ul className="space-y-1">
                          {analysisResults.key_findings.map((finding: string, index: number) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {analysisResults.hypotheses && (
                      <div>
                        <h4 className="font-medium mb-2">Generated Hypotheses</h4>
                        <div className="space-y-2">
                          {analysisResults.hypotheses.map((hypothesis: string, index: number) => (
                            <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Hypothesis {index + 1}
                              </p>
                              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                {hypothesis}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {analysisResults.entities && (
                      <div>
                        <h4 className="font-medium mb-2">Extracted Entities</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {analysisResults.entities.map((entity: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <p className="font-medium text-sm">{entity.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{entity.type}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium">{Math.round(entity.confidence * 100)}%</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-600">No analysis results yet</p>
                <p className="text-sm text-muted-foreground">Upload a file or enter text to start analysis</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Research Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Reproducibility</span>
                      <span className="text-sm text-muted-foreground">
                        {analysisResults?.quality_score ? `${analysisResults.quality_score.toFixed(1)}/10` : 'N/A'}
                      </span>
                    </div>
                    <Progress value={analysisResults?.quality_score ? (analysisResults.quality_score / 10) * 100 : 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Methodology Clarity</span>
                      <span className="text-sm text-muted-foreground">
                        {analysisResults?.methodology_score ? `${analysisResults.methodology_score.toFixed(1)}/10` : 'N/A'}
                      </span>
                    </div>
                    <Progress value={analysisResults?.methodology_score ? (analysisResults.methodology_score / 10) * 100 : 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Data Availability</span>
                      <span className="text-sm text-muted-foreground">
                        {analysisResults?.data_score ? `${analysisResults.data_score.toFixed(1)}/10` : 'N/A'}
                      </span>
                    </div>
                    <Progress value={analysisResults?.data_score ? (analysisResults.data_score / 10) * 100 : 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Overall Quality</span>
                      <span className="text-sm text-muted-foreground">
                        {analysisResults?.overall_quality ? `${analysisResults.overall_quality.toFixed(1)}/10` : 'N/A'}
                      </span>
                    </div>
                    <Progress value={analysisResults?.overall_quality ? (analysisResults.overall_quality / 10) * 100 : 0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>FAIR Data Principles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Findable</span>
                    {analysisResults?.title ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Accessible</span>
                    {analysisResults?.summary ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Interoperable</span>
                    {analysisResults?.entities && analysisResults.entities.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reusable</span>
                    {analysisResults?.overall_quality && analysisResults.overall_quality > 7 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Null Results Detection */}
            {analysisResults && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Null Results Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">
                          {analysisResults.null_results_detected ? 'Null results detected' : 'No null results detected'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Confidence: {((analysisResults.null_results_confidence || 0) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        {analysisResults.null_results_detected ? (
                          <AlertCircle className="h-8 w-8 text-yellow-600" />
                        ) : (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        )}
                      </div>
                    </div>
                    
                    {analysisResults.key_findings && analysisResults.key_findings.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Null Result Findings:</h5>
                        <ul className="space-y-1">
                          {analysisResults.key_findings.map((finding: string, index: number) => (
                            <li key={index} className="text-sm text-muted-foreground">• {finding}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
                      <strong>Why this matters:</strong> Null results are important for scientific progress but often go unpublished. 
                      Detecting and properly reporting null results helps prevent publication bias and saves other researchers time.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 