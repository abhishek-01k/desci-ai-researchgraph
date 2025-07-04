"use client";

import { Tag, Users, Package, FileCode, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function ResultsPreview() {
  return (
    <section className="w-full py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Results Preview
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            See what metadata our analyzer extracts from research repositories.
          </p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Card className="glass-card border-0">
            <CardHeader className="space-y-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg border-b border-border">
              <CardTitle className="text-2xl text-primary">Climate Change Analysis Tool</CardTitle>
              <CardDescription className="flex items-center text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" className="mr-2">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                github.com/example/climate-analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Authors */}
                <div className="space-y-2">
                  <div className="flex items-center text-primary">
                    <Users className="h-5 w-5 mr-2" />
                    <h3 className="font-semibold">Authors</h3>
                  </div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>Dr. Sarah Johnson (lead)</li>
                    <li>Michael Chen</li>
                    <li>Dr. James Rodriguez</li>
                  </ul>
                </div>
                
                {/* Dependencies */}
                <div className="space-y-2">
                  <div className="flex items-center text-primary">
                    <Package className="h-5 w-5 mr-2" />
                    <h3 className="font-semibold">Dependencies</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20">numpy</Badge>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20">pandas</Badge>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20">matplotlib</Badge>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20">xarray</Badge>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20">scikit-learn</Badge>
                  </div>
                </div>
                
                {/* Installation */}
                <div className="space-y-2">
                  <div className="flex items-center text-primary">
                    <FileCode className="h-5 w-5 mr-2" />
                    <h3 className="font-semibold">Installation</h3>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-md font-mono text-sm text-muted-foreground">
                    git clone https://github.com/example/climate-analysis<br />
                    cd climate-analysis<br />
                    pip install -r requirements.txt
                  </div>
                </div>
                
                {/* Research Identifiers */}
                <div className="space-y-2">
                  <div className="flex items-center text-primary">
                    <BookOpen className="h-5 w-5 mr-2" />
                    <h3 className="font-semibold">Research Identifiers</h3>
                  </div>
                  <div className="text-muted-foreground">
                    <p>DOI: 10.1234/climate.2023.001</p>
                    <p>ORCID: 0000-0002-1825-0097</p>
                  </div>
                </div>
                
                {/* Keywords */}
                <div className="col-span-full space-y-2">
                  <div className="flex items-center text-primary">
                    <Tag className="h-5 w-5 mr-2" />
                    <h3 className="font-semibold">Keywords</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">climate change</Badge>
                    <Badge className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">data analysis</Badge>
                    <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">machine learning</Badge>
                    <Badge className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">environmental science</Badge>
                    <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">time series</Badge>
                    <Badge className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">visualization</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}