'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Brain, Upload, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/ui/Logo';
import { useToast } from '@/hooks/use-toast';

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter your research query",
        description: "Enter a research topic, question, or upload a paper to get started.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Navigate to analysis page with the search query
      router.push(`/analysis?query=${encodeURIComponent(searchQuery)}`);
      
      toast({
        title: "Starting research analysis",
        description: "Redirecting to the analysis workspace...",
      });
      
    } catch (error) {
      toast({
        title: "Navigation failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'upload':
        router.push('/analysis');
        break;
      case 'explore':
        router.push('/papers');
        break;
      case 'generate':
        router.push('/hypotheses');
        break;
      case 'collaborate':
        router.push('/collaborate');
        break;
      default:
        break;
    }
  };

  return (
    <section className="relative w-full overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/20" />
      <div className="relative mx-auto max-w-5xl text-center">
        <div className="flex justify-center mb-2">
          <Logo animated={true} />
        </div>
        <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
          ResearchGraph AI
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Transform scientific research with AI-powered analysis, blockchain-verified citations, and collaborative knowledge graphs. 
          Accelerate discovery through decentralized science.
        </p>
        
        <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-2xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-0 h-5 w-5 mt-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="text" 
                value={searchQuery}
                onChange={handleInputChange}
                placeholder="Enter your research question or topic..."
                className="h-12 bg-secondary pl-10 border-border"
              />
            </div>
            <Button 
              type="submit"
              size="lg"
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Analyze with AI
                </div>
              )}
            </Button>
          </div>
        </form>

        {/* Quick Action Buttons */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 bg-background/50 backdrop-blur-sm border-border/50"
              onClick={() => handleQuickAction('upload')}
            >
              <Upload className="h-5 w-5 text-blue-600" />
              <span className="text-sm">Upload Paper</span>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 bg-background/50 backdrop-blur-sm border-border/50"
              onClick={() => handleQuickAction('explore')}
            >
              <Search className="h-5 w-5 text-green-600" />
              <span className="text-sm">Explore Papers</span>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 bg-background/50 backdrop-blur-sm border-border/50"
              onClick={() => handleQuickAction('generate')}
            >
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="text-sm">Generate Ideas</span>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 bg-background/50 backdrop-blur-sm border-border/50"
              onClick={() => handleQuickAction('collaborate')}
            >
              <Brain className="h-5 w-5 text-orange-600" />
              <span className="text-sm">Collaborate</span>
            </Button>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">10K+</div>
            <div className="text-sm text-muted-foreground">Papers Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">500+</div>
            <div className="text-sm text-muted-foreground">Researchers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">2K+</div>
            <div className="text-sm text-muted-foreground">Knowledge Graphs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">1M+</div>
            <div className="text-sm text-muted-foreground">Citations Tracked</div>
          </div>
        </div>
      </div>
    </section>
  );
}