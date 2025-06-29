"use client";

import { BarChart2, Code, GitBranch, Microscope, Zap, Award } from "lucide-react";
import FeatureCard from "@/components/ui/FeatureCard";

export default function FeaturesGrid() {
  const features = [
    {
      icon: <Award className="h-10 w-10 text-blue-400" />,
      title: "FAIR Metadata Standards",
      description: "Automatically extract Findable, Accessible, Interoperable, and Reusable metadata following established research data standards."
    },
    {
      icon: <Zap className="h-10 w-10 text-purple-400" />,
      title: "AI-Powered Intelligence",
      description: "Our language model analyze code structure, documentation, and context to generate comprehensive metadata insights."
    },
    {
      icon: <GitBranch className="h-10 w-10 text-blue-400" />,
      title: "GitHub & GitLab Integration",
      description: "Works with any public GitHub and GitLab repository - just paste a URL and get instant metadata extraction across all programming languages."
    },
    {
      icon: <Microscope className="h-10 w-10 text-purple-400" />,
      title: "Reproducibility Support",
      description: "Automatically extract dependencies and installation guides to help researchers reproduce scientific work."
    },
    {
      icon: <BarChart2 className="h-10 w-10 text-blue-400" />,
      title: "Self-Hosted Deployment",
      description: "Deploy our LLM model on Colab or Kaggle for complete control over your metadata extraction process."
    },
    {
      icon: <Code className="h-10 w-10 text-purple-400" />,
      title: "Open Source Community",
      description: "Fully open source with active community contributions. Help us improve research discoverability for everyone."
    }
  ];

  return (
    <section className="w-full py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Decode Any Research Repository
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Extract comprehensive metadata from any research repository with our intelligent extraction tool designed specifically for the scientific community.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto auto-rows-fr">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              icon={feature.icon} 
              title={feature.title} 
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}