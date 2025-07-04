"use client";

import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

export default function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="glass-card rounded-xl p-6 group hover:ring-1 hover:ring-primary/20 h-full flex flex-col"
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-4 flex-shrink-0">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors flex-shrink-0">
          {title}
        </h3>
        <p className="text-muted-foreground flex-grow leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}