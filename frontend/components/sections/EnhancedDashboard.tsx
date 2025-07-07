'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Brain, 
  Network,
  Zap,
  Target,
  Clock,
  Star,
  Award,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Calendar,
  BarChart3,
  Activity,
  Globe,
  Lightbulb,
  BookOpen,
  Share2,
  Download
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalAnalyses: number;
  totalHypotheses: number;
  totalGraphs: number;
  totalPapers: number;
  weeklyGrowth: number;
  activeCollaborators: number;
  researchImpact: number;
  citationCount: number;
}

interface RecentActivity {
  id: string;
  type: 'analysis' | 'hypothesis' | 'graph' | 'collaboration';
  title: string;
  description: string;
  timestamp: Date;
  status: 'completed' | 'in_progress' | 'published';
  collaborators?: string[];
}

interface ResearchTrend {
  category: string;
  count: number;
  growth: number;
  color: string;
}

export default function EnhancedDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalAnalyses: 0,
    totalHypotheses: 0,
    totalGraphs: 0,
    totalPapers: 0,
    weeklyGrowth: 0,
    activeCollaborators: 0,
    researchImpact: 0,
    citationCount: 0,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [researchTrends, setResearchTrends] = useState<ResearchTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalAnalyses: 42,
        totalHypotheses: 18,
        totalGraphs: 8,
        totalPapers: 156,
        weeklyGrowth: 23.5,
        activeCollaborators: 7,
        researchImpact: 8.7,
        citationCount: 234,
      });

      setRecentActivity([
        {
          id: '1',
          type: 'analysis',
          title: 'Deep Learning in Medical Imaging',
          description: 'Analyzed research paper on CNN applications in radiology',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          status: 'completed',
        },
        {
          id: '2',
          type: 'hypothesis',
          title: 'Gene Therapy Effectiveness',
          description: 'Generated 3 hypotheses on CRISPR delivery methods',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          status: 'completed',
        },
        {
          id: '3',
          type: 'graph',
          title: 'AI Ethics Knowledge Graph',
          description: 'Created interactive graph with 89 nodes and 156 connections',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          status: 'published',
          collaborators: ['Dr. Smith', 'Prof. Johnson'],
        },
        {
          id: '4',
          type: 'collaboration',
          title: 'Quantum Computing Research',
          description: 'Shared hypothesis with quantum research team',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          status: 'in_progress',
          collaborators: ['Dr. Chen', 'Prof. Wilson'],
        },
      ]);

      setResearchTrends([
        { category: 'Artificial Intelligence', count: 45, growth: 15.2, color: '#3B82F6' },
        { category: 'Biotechnology', count: 32, growth: 8.7, color: '#10B981' },
        { category: 'Quantum Computing', count: 18, growth: 22.1, color: '#8B5CF6' },
        { category: 'Climate Science', count: 27, growth: 12.3, color: '#F59E0B' },
        { category: 'Medicine', count: 38, growth: 18.9, color: '#EF4444' },
      ]);

      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  const handleQuickAction = (action: string) => {
    const actions = {
      'analyze': '/analysis',
      'hypothesize': '/hypotheses',
      'visualize': '/knowledge-graph',
      'discover': '/papers',
      'collaborate': '/collaborate',
    };

    const route = actions[action as keyof typeof actions];
    if (route) {
      window.location.href = route;
    } else {
      toast({
        title: 'Action Available Soon',
        description: `${action} functionality will be available in the next update.`,
      });
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'analysis': return <FileText className="h-4 w-4" />;
      case 'hypothesis': return <Lightbulb className="h-4 w-4" />;
      case 'graph': return <Network className="h-4 w-4" />;
      case 'collaboration': return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'analysis': return 'text-blue-600 bg-blue-100';
      case 'hypothesis': return 'text-yellow-600 bg-yellow-100';
      case 'graph': return 'text-purple-600 bg-purple-100';
      case 'collaboration': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'completed': 'bg-green-100 text-green-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'published': 'bg-purple-100 text-purple-800',
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Research Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your research activity and insights.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => handleQuickAction('discover')}>
            <Search className="h-4 w-4 mr-2" />
            Discover Papers
          </Button>
          <Button onClick={() => handleQuickAction('analyze')}>
            <Plus className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Total Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAnalyses}</div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{stats.weeklyGrowth}% this week
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                Hypotheses Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHypotheses}</div>
              <div className="flex items-center text-sm text-blue-600">
                <Brain className="h-3 w-3 mr-1" />
                {Math.round(stats.totalHypotheses / stats.totalAnalyses * 100)}% success rate
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Network className="h-4 w-4 text-purple-600" />
                Knowledge Graphs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGraphs}</div>
              <div className="flex items-center text-sm text-purple-600">
                <Globe className="h-3 w-3 mr-1" />
                Interactive 3D networks
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                Active Collaborators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCollaborators}</div>
              <div className="flex items-center text-sm text-green-600">
                <Share2 className="h-3 w-3 mr-1" />
                Research partnerships
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Jump into your research workflow with these common actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { action: 'analyze', label: 'Analyze Paper', description: 'Extract insights from research', icon: FileText, color: 'blue' },
              { action: 'hypothesize', label: 'Generate Hypotheses', description: 'Create research questions', icon: Lightbulb, color: 'yellow' },
              { action: 'visualize', label: 'Create Graph', description: 'Build knowledge networks', icon: Network, color: 'purple' },
              { action: 'discover', label: 'Find Papers', description: 'Discover relevant research', icon: Search, color: 'green' },
              { action: 'collaborate', label: 'Collaborate', description: 'Work with researchers', icon: Users, color: 'pink' },
            ].map((item, index) => (
              <motion.div
                key={item.action}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleQuickAction(item.action)}>
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-${item.color}-100 flex items-center justify-center`}>
                      <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{item.label}</h3>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest research activities and collaborations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm truncate">{activity.title}</h4>
                      <Badge variant="secondary" className={`text-xs ${getStatusBadge(activity.status)}`}>
                        {activity.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {activity.collaborators && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {activity.collaborators.slice(0, 2).join(', ')}
                            {activity.collaborators.length > 2 && ` +${activity.collaborators.length - 2}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Research Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Research Trends
            </CardTitle>
            <CardDescription>
              Popular research categories and growth metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {researchTrends.map((trend, index) => (
                <motion.div
                  key={trend.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: trend.color }}
                      />
                      <span className="font-medium text-sm">{trend.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{trend.count}</span>
                      <span className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{trend.growth}%
                      </span>
                    </div>
                  </div>
                  <Progress value={(trend.count / 50) * 100} className="h-2" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Research Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Research Impact
          </CardTitle>
          <CardDescription>
            Your contributions to the scientific community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.researchImpact}</div>
              <div className="text-sm text-muted-foreground">Impact Score</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.citationCount}</div>
              <div className="text-sm text-muted-foreground">Citations Generated</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.totalPapers}</div>
              <div className="text-sm text-muted-foreground">Papers Analyzed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 