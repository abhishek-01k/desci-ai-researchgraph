"use client";

import { Github, BookOpen, MessageCircle, Star, GitBranch, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Community() {
  const communityLinks = [
    {
      icon: <Github className="h-6 w-6" />,
      title: "Source Code",
      description: "Explore the codebase, report issues, or contribute to the project",
      link: "https://github.com/smutyala1at/fair-metadata-extractor",
      buttonText: "View on GitHub",
      color: "text-gray-400"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Documentation",
      description: "Learn how to deploy, configure, and extend the tool",
      link: "https://github.com/smutyala1at/fair-metadata-extractor#readme",
      buttonText: "Read Docs",
      color: "text-blue-400"
    },
    {
      icon: <Bug className="h-6 w-6" />,
      title: "Report Issues",
      description: "Found a bug or have a feature request? Let us know!",
      link: "https://github.com/smutyala1at/fair-metadata-extractor/issues",
      buttonText: "Report Issue",
      color: "text-red-400"
    },
    {
      icon: <GitBranch className="h-6 w-6" />,
      title: "Contribute",
      description: "Help improve the project with your contributions",
      link: "https://github.com/smutyala1at/fair-metadata-extractor/blob/main/CONTRIBUTING.md",
      buttonText: "Contribute",
      color: "text-green-400"
    }
  ];

  const stats = [
    { label: "Open Source", value: "MIT License" },
    { label: "Model", value: "LLaMA 8B" },
    { label: "Metadata Elements", value: "8 Types" },
    { label: "Self-Hosted", value: "100% Free" }
  ];

  return (
    <section className="w-full py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      <div className="container relative mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6"
          >
            Join Our Open Source Community
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground mb-8"
          >
            This project is completely open source and self-hosted. Join our community of researchers and developers working to improve research software discoverability.
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
        
        {/* Community Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {communityLinks.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-6 rounded-lg group hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full bg-secondary/50 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-primary">{item.title}</h3>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(item.link, '_blank')}
                  >
                    {item.buttonText}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass-card p-8 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-yellow-400 mr-2" />
              <span className="text-lg font-semibold">Show Your Support</span>
            </div>
            <p className="text-muted-foreground mb-6">
              If this tool helps your research, consider starring the repository and sharing it with your colleagues!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => window.open('https://github.com/smutyala1at/fair-metadata-extractor', '_blank')}
              >
                <Github className="h-5 w-5 mr-2" />
                Star on GitHub
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
