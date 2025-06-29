import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Package, Users, FileText, Tag, Book, Coins, FileCode, Link, Code } from "lucide-react";
import { hasValidData } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AnalysisResultsProps {
  data: {
    Dependencies?: string[] | string;
    InstallationInstructions?: string[] | string;
    Authors?: string[] | string;
    Contributors?: string[] | string;
    Funding?: string[] | string; 
    DOI?: string[] | string;     
    License?: string;
    Keywords?: string[] | string;
    parsingError?: boolean;
    message?: string;
    rawResponse?: string;
    [key: string]: any;
  };
}

export default function AnalysisResults({ data }: AnalysisResultsProps) {
  const [showRawResponse, setShowRawResponse] = useState(false);
  
  if (!data) {
    return null; 
  }
  
  if (data.parsingError) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-12"
      >
        <Card className="glass-card border-0">
          <CardHeader className="space-y-1 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-t-lg border-b border-border">
            <CardTitle className="text-2xl text-primary">Repository Metadata Extraction Error</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <p className="text-muted-foreground">{data.message}</p>
            <div className="bg-secondary/50 p-3 rounded-md">
              <h3 className="font-semibold mb-2">Raw Response</h3>
              <pre className="text-xs overflow-auto max-h-[300px] whitespace-pre-wrap">
                {data.rawResponse}
              </pre>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-12"
    >
      <Card className="glass-card border-0">
        <CardHeader className="space-y-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg border-b border-border">
          <CardTitle className="text-2xl text-primary">Repository Metadata Extraction Results</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Authors */}
            <div className="space-y-2">
              <div className="flex items-center text-primary">
                <Users className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Authors</h3>
              </div>
              {hasValidData(data.Authors) ? (
                <ul className="space-y-1 text-muted-foreground">
                  {Array.isArray(data.Authors) 
                    ? data.Authors.map((author: string, index: number) => (
                        <li key={index}>{author}</li>
                      ))
                    : <li>{String(data.Authors)}</li>
                  }
                </ul>
              ) : (
                <p className="text-muted-foreground italic">No author information available.</p>
              )}
            </div>

            {/* Contributors */}
            <div className="space-y-2">
              <div className="flex items-center text-primary">
                <Users className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Contributors</h3>
              </div>
              {hasValidData(data.Contributors) ? (
                <ul className="space-y-1 text-muted-foreground">
                  {Array.isArray(data.Contributors) 
                    ? data.Contributors.map((contributor: string, index: number) => (
                        <li key={index}>{contributor}</li>
                      ))
                    : <li>{String(data.Contributors)}</li>
                  }
                </ul>
              ) : (
                <p className="text-muted-foreground italic">No contributor information available.</p>
              )}
            </div>

            {/* Dependencies */}
            <div className="space-y-2">
              <div className="flex items-center text-primary">
                <Package className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Dependencies</h3>
              </div>
              {hasValidData(data.Dependencies) ? (
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(data.Dependencies) 
                    ? data.Dependencies.map((dep: string, index: number) => (
                        <Badge 
                          key={index}
                          variant="outline" 
                          className={index % 2 === 0 
                            ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20"
                            : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20"
                          }
                        >
                          {dep}
                        </Badge>
                      ))
                    : <Badge variant="outline" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20">
                        {String(data.Dependencies)}
                      </Badge>
                  }
                </div>
              ) : (
                <p className="text-muted-foreground italic">No dependency information available.</p>
              )}
            </div>

            {/* Installation Instructions */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center text-primary">
                <FileCode className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Installation Instructions</h3>
              </div>
              {hasValidData(data.InstallationInstructions) ? (
                <ul className="list-disc list-inside space-y-1 bg-secondary/50 p-3 rounded-md text-muted-foreground">
                  {Array.isArray(data.InstallationInstructions)
                    ? data.InstallationInstructions.map((instruction: string, index: number) => (
                        <li key={index} className="font-mono text-sm whitespace-pre-wrap">{instruction}</li>
                      ))
                    : <li className="font-mono text-sm whitespace-pre-wrap">{String(data.InstallationInstructions)}</li>
                  }
                </ul>
              ) : (
                <p className="text-muted-foreground italic bg-secondary/50 p-3 rounded-md">No installation instructions available.</p>
              )}
            </div>

            {/* Funding */}
            <div className="space-y-2">
              <div className="flex items-center text-primary">
                <Coins className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Funding</h3>
              </div>
              {hasValidData(data.Funding) ? (
                <>
                  {typeof data.Funding === 'string' ? (
                    <p className="text-muted-foreground">{data.Funding}</p>
                  ) : Array.isArray(data.Funding) ? (
                    <ul className="space-y-1 text-muted-foreground">
                      {data.Funding.map((fund, index) => (
                        <li key={index}>{fund}</li>
                      ))}
                    </ul>
                  ) : null}
                </>
              ) : (
                <p className="text-muted-foreground italic">No funding information available.</p>
              )}
            </div>

            {/* DOI */}
            <div className="space-y-2">
              <div className="flex items-center text-primary">
                <Link className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">DOI</h3>
              </div>
              {hasValidData(data.DOI) ? (
                <p className="text-muted-foreground">
                  {Array.isArray(data.DOI) ? data.DOI.join(', ') : data.DOI}
                </p>
              ) : (
                <p className="text-muted-foreground italic">No DOI information available.</p>
              )}
            </div>

            {/* License */}
            <div className="space-y-2">
              <div className="flex items-center text-primary">
                <Book className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">License</h3>
              </div>
              {hasValidData(data.License) ? (
                <p className="text-muted-foreground">{data.License}</p>
              ) : (
                <p className="text-muted-foreground italic">No license information available.</p>
              )}
            </div>

            {/* Keywords */}
            <div className="col-span-full space-y-2">
              <div className="flex items-center text-primary">
                <Tag className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Keywords</h3>
              </div>
              {hasValidData(data.Keywords) ? (
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(data.Keywords)
                    ? data.Keywords.map((keyword: string, index: number) => (
                        <Badge 
                          key={index}
                          className={index % 2 === 0 
                            ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                            : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                          }
                        >
                          {keyword}
                        </Badge>
                      ))
                    : <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
                        {String(data.Keywords)}
                      </Badge>
                  }
                </div>
              ) : (
                <p className="text-muted-foreground italic">No keyword information available.</p>
              )}
            </div>
            
            {/* Raw Response Toggle */}
            {data.rawResponse && (
              <div className="col-span-full mt-4 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowRawResponse(!showRawResponse)}
                  className="flex items-center gap-2"
                >
                  <Code className="h-4 w-4" />
                  {showRawResponse ? "Hide Raw Response" : "Show Raw Response"}
                </Button>
                
                {showRawResponse && (
                  <div className="mt-4 bg-secondary/50 p-3 rounded-md">
                    <h3 className="font-semibold mb-2">Raw Response</h3>
                    <pre className="text-xs overflow-auto max-h-[300px] whitespace-pre-wrap">
                      {data.rawResponse}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}