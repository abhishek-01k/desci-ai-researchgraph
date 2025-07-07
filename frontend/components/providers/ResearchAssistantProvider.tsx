'use client';

import { useState } from 'react';
import ResearchAssistant from '@/components/ui/ResearchAssistant';

export default function ResearchAssistantProvider() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ResearchAssistant 
      isOpen={isOpen} 
      onToggle={setIsOpen}
    />
  );
} 