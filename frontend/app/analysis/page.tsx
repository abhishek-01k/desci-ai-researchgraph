'use client';

import { useState, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addPaper, startAnalysis } = useResearchStore();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'text/plain' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setSelectedFile(file);
        toast({
          title: 'File selected',
          description: `${file.name} is ready for analysis.`,
        });
      } else {
        toast({
          title: 'Unsupported file type',
          description: 'Please select a PDF, Word document, or text file.',
          variant: 'destructive',
        });
      }
    }
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

    // Simulate analysis steps
    const steps = [...currentSteps];
    
    for (let i = 0; i < steps.length; i++) {
      steps[i].status = 'processing';
      setCurrentSteps([...steps]);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Update progress
      for (let progress = 0; progress <= 100; progress += 10) {
        steps[i].progress = progress;
        setCurrentSteps([...steps]);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      steps[i].status = 'completed';
      steps[i].progress = 100;
      setCurrentSteps([...steps]);
    }

    // Mock analysis results
    const mockResults = {
      summary: "This research paper investigates novel approaches to CRISPR gene editing in cancer therapy, demonstrating significant improvements in targeting accuracy and reduced off-target effects.",
      keyFindings: [
        "Novel guide RNA design improves targeting specificity by 87%",
        "Reduced off-target effects observed in 94% of test cases",
        "Potential for clinical application in solid tumor treatment",
        "Cost-effective implementation compared to existing methods"
      ],
      hypotheses: [
        "Enhanced guide RNA stability could further improve targeting accuracy",
        "Combination with immunotherapy may amplify therapeutic effects",
        "Application to other cancer types beyond solid tumors shows promise"
      ],
      qualityScore: 8.7,
      nullResultsDetected: false,
      entities: [
        { name: "CRISPR-Cas9", type: "method", confidence: 0.95, mentions: 23 },
        { name: "Guide RNA", type: "chemical", confidence: 0.92, mentions: 18 },
        { name: "Cancer therapy", type: "disease", confidence: 0.89, mentions: 15 },
        { name: "Off-target effects", type: "method", confidence: 0.88, mentions: 12 }
      ],
      metadata: {
        methodology: ["Experimental design", "In vitro studies", "Statistical analysis"],
        datasets: ["Cell line data", "Patient samples", "Control groups"],
        tools: ["CRISPR-Cas9", "Flow cytometry", "qPCR"],
        reproducibility: {
          score: 8.5,
          factors: ["Clear methodology", "Available data", "Detailed protocols"]
        },
        fairness: {
          findable: true,
          accessible: true,
          interoperable: false,
          reusable: true
        }
      }
    };

    setAnalysisResults(mockResults);
    setIsAnalyzing(false);

    toast({
      title: 'Analysis completed!',
      description: 'Your research analysis is ready for review.',
    });
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
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium">
                    {selectedFile ? selectedFile.name : 'Drop your file here or click to browse'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Supports PDF, DOC, DOCX, and TXT files up to 50MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFile && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-800 dark:text-green-200">
                        File ready for analysis: {selectedFile.name}
                      </span>
                    </div>
                  </div>
                )}
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
                    onChange={(e) => setAnalysisText(e.target.value)}
                    className="min-h-[200px] resize-none"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {analysisText.length} characters
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
                  <input type="checkbox" id="hypothesis" defaultChecked />
                  <Label htmlFor="hypothesis">Generate Hypotheses</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="entities" defaultChecked />
                  <Label htmlFor="entities">Extract Entities</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="quality" defaultChecked />
                  <Label htmlFor="quality">Quality Assessment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="null-results" defaultChecked />
                  <Label htmlFor="null-results">Null Results Detection</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="reproducibility" defaultChecked />
                  <Label htmlFor="reproducibility">Reproducibility Check</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="fair" defaultChecked />
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
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Analysis Summary
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm">
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {analysisResults.summary}
                  </p>
                  <div className="flex items-center space-x-4 mt-4">
                    <Badge variant="secondary">
                      Quality Score: {analysisResults.qualityScore}/10
                    </Badge>
                    <Badge variant={analysisResults.nullResultsDetected ? "destructive" : "default"}>
                      {analysisResults.nullResultsDetected ? "Null Results Detected" : "No Null Results"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Key Findings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Key Findings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResults.keyFindings.map((finding: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Generated Hypotheses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Generated Hypotheses
                  </CardTitle>
                  <CardDescription>
                    AI-generated research hypotheses based on your content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
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
                </CardContent>
              </Card>

              {/* Extracted Entities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Extracted Entities
                  </CardTitle>
                  <CardDescription>
                    Scientific entities identified in your research
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResults.entities.map((entity: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{entity.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{entity.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{Math.round(entity.confidence * 100)}%</p>
                          <p className="text-xs text-muted-foreground">{entity.mentions} mentions</p>
                        </div>
                      </div>
                    ))}
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
                      <span className="text-sm text-muted-foreground">8.5/10</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Methodology Clarity</span>
                      <span className="text-sm text-muted-foreground">9.2/10</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Data Availability</span>
                      <span className="text-sm text-muted-foreground">7.8/10</span>
                    </div>
                    <Progress value={78} className="h-2" />
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
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Accessible</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Interoperable</span>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reusable</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 