'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X,
  Lightbulb,
  Search,
  FileText,
  Network,
  Minimize2,
  Maximize2,
  Sparkles,
  Brain,
  BookOpen,
  HelpCircle
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'action';
  metadata?: {
    suggestions?: string[];
    actions?: { label: string; action: string; data?: any }[];
  };
}

interface ResearchAssistantProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  className?: string;
}

const QUICK_ACTIONS = [
  {
    label: 'Generate Hypotheses',
    description: 'Create research hypotheses from your text',
    icon: Lightbulb,
    action: 'generate_hypotheses',
    prompt: 'I want to generate research hypotheses from my research text.'
  },
  {
    label: 'Analyze Paper',
    description: 'Get insights from research papers',
    icon: FileText,
    action: 'analyze_paper',
    prompt: 'Help me analyze a research paper for key insights.'
  },
  {
    label: 'Create Knowledge Graph',
    description: 'Build interactive knowledge networks',
    icon: Network,
    action: 'create_graph',
    prompt: 'I want to create a knowledge graph from my research data.'
  },
  {
    label: 'Find Related Papers',
    description: 'Discover relevant research papers',
    icon: Search,
    action: 'find_papers',
    prompt: 'Help me find papers related to my research topic.'
  }
];

const SAMPLE_RESPONSES = {
  greeting: {
    content: "Hi! I'm your AI Research Assistant. I can help you generate hypotheses, analyze papers, create knowledge graphs, and guide you through ResearchGraph AI. What would you like to explore today?",
    suggestions: [
      "Generate research hypotheses",
      "Analyze a research paper", 
      "Create a knowledge graph",
      "Find related papers",
      "Explain platform features"
    ]
  },
  generate_hypotheses: {
    content: "I can help you generate research hypotheses! First, I'll need some research context. You can either:\n\n1. **Paste your research text** directly into the analysis page\n2. **Upload a research paper** for analysis\n3. **Describe your research area** and I'll help formulate hypotheses\n\nWhat research domain are you working in?",
    actions: [
      { label: "Go to Analysis Page", action: "navigate", data: { page: "/analysis" } },
      { label: "Go to Hypotheses Page", action: "navigate", data: { page: "/hypotheses" } }
    ]
  },
  analyze_paper: {
    content: "Perfect! Paper analysis is one of our core features. Here's how to analyze your research paper:\n\n✨ **Quick Analysis Steps:**\n1. Go to the Analysis page\n2. Paste your paper text or upload a PDF\n3. Click 'Analyze' to get:\n   - Key insights and summary\n   - Entity extraction\n   - Research gaps identification\n   - Citation analysis\n\nWould you like me to guide you through this process?",
    actions: [
      { label: "Start Analysis", action: "navigate", data: { page: "/analysis" } },
      { label: "See Example", action: "show_example", data: { type: "analysis" } }
    ]
  },
  create_graph: {
    content: "Knowledge graphs are amazing for visualizing research connections! Here's how to create one:\n\n🧠 **Graph Creation Process:**\n1. Visit the Knowledge Graph page\n2. Enter your research text or concepts\n3. Choose visualization preferences (2D/3D)\n4. Watch as AI builds interactive connections\n\nThe graphs show relationships between concepts, papers, authors, and institutions.",
    actions: [
      { label: "Create Graph", action: "navigate", data: { page: "/knowledge-graph" } },
      { label: "View Examples", action: "show_example", data: { type: "graph" } }
    ]
  },
  find_papers: {
    content: "I can help you discover relevant research papers! Our system can:\n\n📚 **Paper Discovery Features:**\n- Search by keywords and topics\n- Find papers similar to your research\n- Analyze citation networks\n- Suggest collaboration opportunities\n\nWhat research topic are you interested in?",
    actions: [
      { label: "Browse Papers", action: "navigate", data: { page: "/papers" } },
      { label: "Advanced Search", action: "show_search" }
    ]
  },
  platform_features: {
    content: "Here's what ResearchGraph AI can do for you:\n\n🔬 **Core Features:**\n- **AI Analysis**: Extract insights from research papers\n- **Hypothesis Generation**: Create testable research hypotheses\n- **Knowledge Graphs**: Visualize research connections in 3D\n- **Paper Discovery**: Find relevant research and collaborators\n- **Research Dashboard**: Track your research progress\n\n🚀 **Advanced Features:**\n- Real-time collaboration\n- Citation tracking\n- Research templates\n- Export capabilities\n\nWhich feature interests you most?",
    suggestions: [
      "Show me the dashboard",
      "Explain knowledge graphs",
      "How does collaboration work?",
      "Tell me about AI analysis"
    ]
  }
};

export default function ResearchAssistant({ 
  isOpen = false, 
  onToggle,
  className = ""
}: ResearchAssistantProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      const welcomeMessage: Message = {
        id: '0',
        content: SAMPLE_RESPONSES.greeting.content,
        role: 'assistant',
        timestamp: new Date(),
        type: 'suggestion',
        metadata: {
          suggestions: SAMPLE_RESPONSES.greeting.suggestions
        }
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string = inputValue) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response (in real implementation, this would call an AI service)
    setTimeout(() => {
      const assistantMessage = generateResponse(content.trim());
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const generateResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    
    let responseKey = 'platform_features';
    
    if (input.includes('hypothesis') || input.includes('hypotheses')) {
      responseKey = 'generate_hypotheses';
    } else if (input.includes('analyze') || input.includes('paper') || input.includes('analysis')) {
      responseKey = 'analyze_paper';
    } else if (input.includes('graph') || input.includes('knowledge') || input.includes('visualization')) {
      responseKey = 'create_graph';
    } else if (input.includes('find') || input.includes('search') || input.includes('papers') || input.includes('discover')) {
      responseKey = 'find_papers';
    } else if (input.includes('feature') || input.includes('help') || input.includes('what') || input.includes('how')) {
      responseKey = 'platform_features';
    }

    const response = SAMPLE_RESPONSES[responseKey as keyof typeof SAMPLE_RESPONSES] || SAMPLE_RESPONSES.platform_features;

    return {
      id: Date.now().toString(),
      content: response.content,
      role: 'assistant',
      timestamp: new Date(),
      type: response.actions ? 'action' : response.suggestions ? 'suggestion' : 'text',
      metadata: {
        suggestions: response.suggestions,
        actions: response.actions
      }
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleActionClick = (action: { label: string; action: string; data?: any }) => {
    if (action.action === 'navigate' && action.data?.page) {
      window.location.href = action.data.page;
    } else if (action.action === 'show_example') {
      toast({
        title: 'Example Feature',
        description: 'This would show an example of the requested feature.',
      });
    } else if (action.action === 'show_search') {
      toast({
        title: 'Advanced Search',
        description: 'Advanced search functionality would open here.',
      });
    }
  };

  const handleQuickAction = (action: any) => {
    handleSendMessage(action.prompt);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => onToggle?.(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 ${className}`}
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 ${className}`}
    >
      <Card className={`w-96 h-[600px] shadow-2xl ${isMinimized ? 'h-16' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot className="h-6 w-6 text-blue-600" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <CardTitle className="text-lg">AI Research Assistant</CardTitle>
                <CardDescription className="text-sm">Here to help with your research</CardDescription>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle?.(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex flex-col h-[500px] p-0">
            {/* Quick Actions */}
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm font-medium mb-2">Quick Actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className="h-auto p-2 flex flex-col items-start text-left"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <action.icon className="h-3 w-3" />
                      <span className="text-xs font-medium">{action.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{action.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        
                        {/* Suggestions */}
                        {message.metadata?.suggestions && (
                          <div className="mt-3 space-y-1">
                            {message.metadata.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="mr-2 mb-1 text-xs h-7 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        {/* Actions */}
                        {message.metadata?.actions && (
                          <div className="mt-3 space-y-1">
                            {message.metadata.actions.map((action, index) => (
                              <Button
                                key={index}
                                size="sm"
                                onClick={() => handleActionClick(action)}
                                className="mr-2 mb-1 text-xs h-7 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask me anything about research..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
} 