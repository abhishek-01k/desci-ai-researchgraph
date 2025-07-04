'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Network, Zap, Eye, Download } from "lucide-react";

export default function KnowledgeGraphDemo() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
            Interactive Knowledge Graph
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore scientific connections in 3D space. Discover hidden relationships between research concepts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Demo Visualization */}
          <div className="order-2 lg:order-1">
            <Card className="relative overflow-hidden h-96">
              <CardContent className="p-0 h-full">
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-purple-50">
                  {isLoading ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Generating knowledge graph...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Network className="h-16 w-16 text-primary mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Interactive 3D visualization will appear here</p>
                      <Button onClick={handleDemo} className="mt-4">
                        <Zap className="h-4 w-4 mr-2" />
                        Generate Demo Graph
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="order-1 lg:order-2 space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4">Powerful Graph Analytics</h3>
              <p className="text-muted-foreground mb-6">
                Our AI-powered knowledge graphs reveal hidden connections in scientific literature, 
                enabling breakthrough discoveries and novel research directions.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">3D Visualization</h4>
                  <p className="text-sm text-muted-foreground">
                    Immersive exploration of research connections in three-dimensional space
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Network className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Real-time Updates</h4>
                  <p className="text-sm text-muted-foreground">
                    Live collaboration with instant synchronization across research teams
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Download className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Export Options</h4>
                  <p className="text-sm text-muted-foreground">
                    Multiple format support: JSON, GraphML, PNG, SVG for external analysis
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4">
              <Badge variant="secondary">Entity Extraction</Badge>
              <Badge variant="secondary">Relationship Mapping</Badge>
              <Badge variant="secondary">Path Discovery</Badge>
              <Badge variant="secondary">Semantic Search</Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 