'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  FileText, 
  Network, 
  TrendingUp, 
  Users, 
  Database,
  Search,
  Plus,
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useResearchStore } from '@/lib/stores/research-store';

const stats = [
  { 
    label: "Papers Analyzed", 
    value: "127", 
    change: "+23%", 
    icon: FileText, 
    color: "text-blue-600",
    trend: "up"
  },
  { 
    label: "Hypotheses Generated", 
    value: "34", 
    change: "+18%", 
    icon: Brain, 
    color: "text-purple-600",
    trend: "up"
  },
  { 
    label: "Knowledge Connections", 
    value: "456", 
    change: "+31%", 
    icon: Network, 
    color: "text-green-600",
    trend: "up"
  },
  { 
    label: "Collaboration Score", 
    value: "92", 
    change: "+12%", 
    icon: Users, 
    color: "text-orange-600",
    trend: "up"
  },
];

const recentActivity = [
  {
    id: 1,
    type: "analysis",
    title: "CRISPR Gene Editing in Cancer Therapy",
    description: "AI analysis completed with 94% confidence score",
    time: "2 hours ago",
    status: "completed",
    icon: Brain,
    color: "text-green-600"
  },
  {
    id: 2,
    type: "hypothesis",
    title: "Novel Protein Folding Mechanisms",
    description: "3 new hypotheses generated for validation",
    time: "4 hours ago",
    status: "pending",
    icon: Zap,
    color: "text-yellow-600"
  },
  {
    id: 3,
    type: "collaboration",
    title: "Multi-institutional Research Network",
    description: "5 researchers joined the neuroscience project",
    time: "6 hours ago",
    status: "active",
    icon: Users,
    color: "text-blue-600"
  },
  {
    id: 4,
    type: "paper",
    title: "Quantum Computing in Drug Discovery",
    description: "New paper uploaded and metadata extracted",
    time: "1 day ago",
    status: "completed",
    icon: FileText,
    color: "text-purple-600"
  }
];

const trendingTopics = [
  { name: "CRISPR Gene Editing", count: 234, growth: "+45%" },
  { name: "Quantum Computing", count: 189, growth: "+32%" },
  { name: "Protein Folding", count: 156, growth: "+28%" },
  { name: "Machine Learning", count: 143, growth: "+21%" },
  { name: "Neuroscience", count: 134, growth: "+19%" }
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { papers, analyses, knowledgeGraphs } = useResearchStore();
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'active':
        return <Activity className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Researcher'}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your research activity and insights.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button size="sm" variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search Papers
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-600 mt-1">
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest research activities and AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div 
                    key={activity.id} 
                    className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium truncate">{activity.title}</h4>
                        {getStatusIcon(activity.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Analytics Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Research Analytics
              </CardTitle>
              <CardDescription>
                Weekly analysis activity and discovery trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Analytics chart will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Analyze New Paper
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Brain className="h-4 w-4 mr-2" />
                Generate Hypotheses
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Network className="h-4 w-4 mr-2" />
                Build Knowledge Graph
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Find Collaborators
              </Button>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Research Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trendingTopics.map((topic, index) => (
                <div key={topic.name} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{topic.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {topic.growth}
                      </Badge>
                    </div>
                    <Progress value={(topic.count / 250) * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <h5 className="font-medium text-sm text-blue-900 dark:text-blue-100">
                    Research Opportunity
                  </h5>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Unexplored connection between quantum computing and protein folding
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <h5 className="font-medium text-sm text-green-900 dark:text-green-100">
                    Collaboration Suggestion
                  </h5>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    3 researchers working on similar CRISPR applications
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 