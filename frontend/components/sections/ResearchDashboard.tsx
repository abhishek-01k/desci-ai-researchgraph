'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Brain, Users, TrendingUp, Database, Search } from "lucide-react";

export default function ResearchDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: "Papers Analyzed", value: "12,847", icon: FileText, change: "+23%" },
    { label: "Hypotheses Generated", value: "3,492", icon: Brain, change: "+18%" },
    { label: "Active Researchers", value: "8,234", icon: Users, change: "+12%" },
    { label: "Knowledge Connections", value: "45,678", icon: TrendingUp, change: "+31%" },
  ];

  const recentActivity = [
    {
      type: "analysis",
      title: "CRISPR Gene Editing in Cancer Therapy",
      description: "AI analysis completed with 94% confidence",
      time: "2 hours ago",
      status: "completed"
    },
    {
      type: "hypothesis",
      title: "Novel Protein Folding Mechanisms",
      description: "3 new hypotheses generated for validation",
      time: "4 hours ago",
      status: "pending"
    },
    {
      type: "collaboration",
      title: "Multi-institutional Research Network",
      description: "5 researchers joined the neuroscience project",
      time: "6 hours ago",
      status: "active"
    }
  ];

  return (
    <section className="w-full py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
            Research Analytics Dashboard
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Real-time insights into scientific discovery, AI-powered analysis, and collaborative research networks.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600 mt-1">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
            {['overview', 'analysis', 'knowledge-graph', 'collaboration'].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className="capitalize"
              >
                {tab.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Recent Research Activity
                </CardTitle>
                <CardDescription>
                  Latest analyses, hypotheses, and collaborative activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium truncate">{activity.title}</h4>
                        <Badge variant={
                          activity.status === 'completed' ? 'default' : 
                          activity.status === 'pending' ? 'secondary' : 'outline'
                        }>
                          {activity.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
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
                  <Users className="h-4 w-4 mr-2" />
                  Find Collaborators
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Explore Knowledge Graph
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-sm text-blue-900">Trending Research Area</h5>
                    <p className="text-sm text-blue-700">
                      Quantum computing applications in drug discovery
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-sm text-green-900">Research Opportunity</h5>
                    <p className="text-sm text-green-700">
                      Unexplored connection between microbiome and neuroplasticity
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
} 