'use client';

import { motion } from "framer-motion";

interface FloatingMetadataCardProps {
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    transform?: string;
  };
  delay: number;
  icon: React.ReactNode;
  data: {
    type: string;
    content: string;
  };
}

export default function FloatingMetadataCard({ position, delay, icon, data }: FloatingMetadataCardProps) {
  return (
    <motion.div
      className="absolute glass-card p-4 rounded-lg shadow-lg cursor-grab active:cursor-grabbing"
      style={{
        ...position,
        transform: typeof position === 'object' && position !== null && 'transform' in position ? (position as any).transform : undefined,
        maxWidth: '250px',
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 100
      }}
      drag
      dragConstraints={{
        top: -50,
        left: -50,
        right: 50,
        bottom: 50,
      }}
      dragElastic={0.1}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 p-2 bg-primary/10 rounded-full">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-primary capitalize mb-1">
            {data.type}
          </h3>
          <p className="text-sm text-muted-foreground">
            {data.content}
          </p>
        </div>
      </div>
    </motion.div>
  );
}