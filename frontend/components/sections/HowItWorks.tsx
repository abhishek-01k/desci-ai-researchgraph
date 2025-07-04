"use client";

import { Search, Cpu, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search className="h-10 w-10 text-blue-400" />,
      title: "Enter Repository URL",
      description: "Provide the URL of any public GitHub or GitLab repository containing research code or documentation."
    },
    {
      icon: <Cpu className="h-10 w-10 text-purple-400" />,
      title: "LLM Analysis",
      description: "Our fine-tuned language model analyzes the repository contents to extract relevant research metadata."
    },
    {
      icon: <FileText className="h-10 w-10 text-blue-400" />,
      title: "View Results",
      description: "Review the extracted metadata including authors, dependencies, research identifiers, and more."
    }
  ];

  return (
    <section className="w-full py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Extract valuable research metadata in three simple steps.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-lg relative group hover:scale-105 transition-transform duration-300"
            >
              <div className="mb-6 p-3 rounded-full bg-secondary/50 glow-effect">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}