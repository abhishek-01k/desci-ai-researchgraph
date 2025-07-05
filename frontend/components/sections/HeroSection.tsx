'use client';

import { useState } from "react";
import { Search, ArrowRight, Package, FileCode, Users, UserPlus, BookOpen, Scale, Tag, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { validateRepoUrl, getPlatformFromUrl } from "@/lib/validators";
import FloatingMetadataCard from "@/components/ui/FloatingMetadataCard";
import TokenInput from "@/components/ui/TokenInput";
import AnalysisResults from "@/components/ui/AnalysisResults";
import Logo from "../ui/Logo";

export default function HeroSection() {
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [analysisResults, setAnalysisResults] = useState(null);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setRepoUrl(url);
    setIsValid(url === "" || validateRepoUrl(url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoUrl) {
      toast({
        title: "URL required",
        description: "Please enter a GitHub or GitLab repository URL",
        variant: "destructive",
      });
      return;
    }

    if (!validateRepoUrl(repoUrl)) {
      setIsValid(false);
      toast({
        title: "Invalid URL",
        description: "Please enter a valid GitHub or GitLab repository URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysisResults(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: repoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Extraction failed');
      }

      setAnalysisResults(data.data);
      toast({
        title: "Extraction complete",
        description: "Repository metadata has been extracted successfully",
      });
    } catch (error) {
      toast({
        title: "Extraction failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const platform = getPlatformFromUrl(repoUrl);

  return (
    <section className="relative w-full overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/20" />
      <div className="relative mx-auto max-w-5xl text-center">
        <div className="flex justify-center mb-2">
          <Logo animated={true} />
        </div>
        <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
          ResearchGraph AI FAIR Metadata Extractor
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Part of the ResearchGraph AI ecosystem - Enhancing research software discoverability through automated extraction of FAIR-compliant metadata using fine-tuned LLaMA models.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-2xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-0 h-5 w-5 mt-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="url"
                value={repoUrl}
                onChange={handleInputChange}
                placeholder="Enter GitHub or GitLab repository URL"
                className={`h-12 bg-secondary pl-10 ${!isValid ? 'border-destructive focus-visible:ring-destructive' : 'border-border'}`}
              />
              {!isValid && (
                <p className="mt-2 text-left text-sm text-destructive">
                  Please enter a valid GitHub or GitLab repository URL
                </p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-12 min-w-[140px] bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="mr-2 animate-spin">⟳</span> Extracting...
                </span>
              ) : (
                <span className="flex items-center">
                  Extract <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              )}
            </Button>
          </div>

          <TokenInput platform={platform} />
        </form>

        {!analysisResults && !isLoading && (
          <div className="relative mt-32 h-[500px]">
            <FloatingMetadataCard
              position={{ top: '15%', left: '10%', transform: 'rotate(-3deg)' } as any}
              delay={0}
              icon={<Package className="h-5 w-5" />}
              data={{
                type: "dependencies",
                content: "numpy, pandas, scikit-learn"
              }}
            />
            <FloatingMetadataCard
              position={{ top: '35%', left: '25%', transform: 'rotate(2deg)' } as any}
              delay={0.3}
              icon={<Users className="h-5 w-5" />}
              data={{
                type: "authors",
                content: "Dr. Jane Smith, Alex Johnson"
              }}
            />
            <FloatingMetadataCard
              position={{ bottom: '20%', left: '15%', transform: 'rotate(-2deg)' } as any}
              delay={0.6}
              icon={<BookOpen className="h-5 w-5" />}
              data={{
                type: "DOI",
                content: "10.1000/xyz123"
              }}
            />
            <FloatingMetadataCard
              position={{ top: '20%', right: '20%', transform: 'rotate(3deg)' } as any}
              delay={0.9}
              icon={<FileCode className="h-5 w-5" />}
              data={{
                type: "installation",
                content: "pip install -r requirements.txt"
              }}
            />
            <FloatingMetadataCard
              position={{ top: '45%', right: '30%', transform: 'rotate(-2deg)' } as any}
              delay={1.2}
              icon={<UserPlus className="h-5 w-5" />}
              data={{
                type: "contributors",
                content: "Maria Garcia, Tom Wilson"
              }}
            />
            <FloatingMetadataCard
              position={{ bottom: '25%', right: '15%', transform: 'rotate(10deg)' } as any}
              delay={1.5}
              icon={<Scale className="h-5 w-5" />}
              data={{
                type: "license",
                content: "MIT License"
              }}
            />
            <FloatingMetadataCard
              position={{ top: '60%', left: '35%', transform: 'rotate(-5deg)' } as any}
              delay={1.8}
              icon={<Tag className="h-5 w-5" />}
              data={{
                type: "keywords",
                content: "machine learning, data analysis"
              }}
            />
            <FloatingMetadataCard
              position={{ top: '25%', left: '45%', transform: 'rotate(1deg)' } as any}
              delay={2.1}
              icon={<Coins className="h-5 w-5" />}
              data={{
                type: "funding",
                content: "NSF Grant #123456"
              }}
            />
          </div>
        )}

        {analysisResults && (
          <AnalysisResults data={analysisResults} />
        )}
      </div>
    </section>
  );
}