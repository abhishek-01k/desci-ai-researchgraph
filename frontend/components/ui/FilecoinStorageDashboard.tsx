'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  Database, 
  FileText, 
  DollarSign, 
  Clock,
  Shield,
  Zap,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Coins,
  HardDrive,
  Globe,
  Lock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import USDFCPayment from '@/components/ui/USDFCPayment';
import { 
  filecoinStorage, 
  STORAGE_PLANS, 
  type StorageDeal, 
  type ResearchStorageData 
} from '@/lib/filecoin-storage';

export default function FilecoinStorageDashboard() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  
  const [userDeals, setUserDeals] = useState<StorageDeal[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [storageStats, setStorageStats] = useState({
    totalStorage: 0,
    usedStorage: 0,
    activeDeals: 0,
    totalCost: 0,
    dataRetrievals: 0,
    avgRetrievalTime: 0
  });

  // Load user's storage deals
  useEffect(() => {
    if (isConnected && address) {
      loadUserDeals();
    }
  }, [isConnected, address]);

  const loadUserDeals = async () => {
    try {
      setIsLoading(true);
      const deals = await filecoinStorage.getUserDeals(address!);
      setUserDeals(deals);
      
      // Calculate storage statistics
      const stats = deals.reduce((acc, deal) => {
        if (deal.isActive) {
          acc.totalStorage += deal.size;
          acc.usedStorage += deal.size;
          acc.activeDeals += 1;
          // Mock additional stats
          acc.totalCost += Math.floor(Math.random() * 100);
          acc.dataRetrievals += Math.floor(Math.random() * 50);
        }
        return acc;
      }, {
        totalStorage: 0,
        usedStorage: 0,
        activeDeals: 0,
        totalCost: 0,
        dataRetrievals: 0,
        avgRetrievalTime: 2.5 // Mock average in seconds
      });

      setStorageStats(stats);
    } catch (error) {
      console.error('Failed to load user deals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your storage deals',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreData = async (planId: string) => {
    try {
      setIsLoading(true);
      
      // Mock research data
      const mockData: ResearchStorageData = {
        paperId: `paper_${Date.now()}`,
        title: 'AI-Powered Research Analysis on Filecoin',
        content: 'This paper demonstrates how AI can enhance research workflows using decentralized storage...',
        metadata: {
          authors: ['Dr. Jane Smith', 'Dr. John Doe'],
          keywords: ['AI', 'Research', 'Filecoin', 'Decentralized Storage'],
          abstract: 'A comprehensive analysis of AI integration with Filecoin storage systems...',
          citations: ['doi:10.1000/123456', 'doi:10.1000/789012'],
          doi: 'doi:10.1000/example123'
        },
        analysisResults: {
          entities: ['artificial intelligence', 'machine learning', 'blockchain'],
          insights: ['Novel approach to data storage', 'Improved retrieval performance'],
          hypotheses: ['Decentralized storage improves research accessibility'],
          quality_score: 8.5
        }
      };

      const result = await filecoinStorage.storeResearchData(
        mockData,
        planId,
        '0x461E13056a3a3265CEF4c593F01b2e960755dE5', // USDFC token
        address!
      );

      toast({
        title: 'Research Data Stored!',
        description: `Your research has been stored on Filecoin with Deal ID: ${result.dealId}`,
      });

      // Refresh user deals
      await loadUserDeals();
    } catch (error) {
      console.error('Failed to store data:', error);
      toast({
        title: 'Storage Failed',
        description: 'Failed to store your research data on Filecoin',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrieveData = async (dealId: number) => {
    try {
      setIsLoading(true);
      const data = await filecoinStorage.retrieveResearchData(dealId);
      
      toast({
        title: 'Data Retrieved!',
        description: `Successfully retrieved: ${data.title}`,
      });
      
      // In a real app, you would display or process the retrieved data
      console.log('Retrieved data:', data);
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      toast({
        title: 'Retrieval Failed',
        description: 'Failed to retrieve data from Filecoin',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenewStorage = async (dealId: number, duration: string) => {
    try {
      setIsLoading(true);
      const newExpiration = await filecoinStorage.renewStorage(dealId, duration);
      
      toast({
        title: 'Storage Renewed!',
        description: `Storage extended until ${new Date(newExpiration).toLocaleDateString()}`,
      });
      
      await loadUserDeals();
    } catch (error) {
      console.error('Failed to renew storage:', error);
      toast({
        title: 'Renewal Failed',
        description: 'Failed to renew storage deal',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatStorageSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeRemaining = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days`;
    return `${hours} hours`;
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Cloud className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Connect to Filecoin</CardTitle>
            <CardDescription>
              Connect your wallet to access Filecoin storage features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = '/connect'}>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 text-black">
        <div className="flex items-center justify-center gap-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Filecoin Storage Dashboard</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Store and retrieve your research data on Filecoin with programmable storage contracts and USDFC payments
        </p>
      </div>

      {/* Storage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatStorageSize(storageStats.totalStorage)}</div>
            <p className="text-xs text-muted-foreground">
              {formatStorageSize(storageStats.usedStorage)} used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storageStats.activeDeals}</div>
            <p className="text-xs text-muted-foreground">
              On Filecoin network
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storageStats.totalCost} USDFC</div>
            <p className="text-xs text-muted-foreground">
              Lifetime payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retrievals</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storageStats.dataRetrievals}</div>
            <p className="text-xs text-muted-foreground">
              Avg {storageStats.avgRetrievalTime}s response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Storage Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Storage Plans
          </CardTitle>
          <CardDescription>
            Choose a storage plan for your research data with USDFC payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STORAGE_PLANS.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedPlan === plan.id 
                    ? 'border-blue-500 bg-blue-50/50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {selectedPlan === plan.id && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{plan.storage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{plan.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{plan.price} USDFC</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex gap-4">
            <Button
              onClick={() => setShowPayment(true)}
              disabled={!selectedPlan || isLoading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Store Research Data
            </Button>
            <Button
              variant="outline"
              onClick={loadUserDeals}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Storage Deals */}
      {userDeals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Your Storage Deals
            </CardTitle>
            <CardDescription>
              Manage your research data stored on Filecoin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userDeals.map((deal) => (
                <div
                  key={deal.dealId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">Deal #{deal.dealId}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatStorageSize(deal.size)} • {formatTimeRemaining(deal.expirationTime)} remaining
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={deal.isActive ? 'default' : 'secondary'}
                      className="flex items-center gap-1"
                    >
                      {deal.isActive ? (
                        <><CheckCircle className="w-3 h-3" /> Active</>
                      ) : (
                        <><AlertCircle className="w-3 h-3" /> Expired</>
                      )}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetrieveData(deal.dealId)}
                      disabled={!deal.isActive || isLoading}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Retrieve
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRenewStorage(deal.dealId, '1 year')}
                      disabled={isLoading}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Renew
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filecoin Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Filecoin Network Status
          </CardTitle>
          <CardDescription>
            Current network performance and integration status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Network Status</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Filecoin Calibration Testnet - Online
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Avg. Storage Time</span>
              </div>
              <p className="text-sm text-muted-foreground">
                ~15 minutes for deal confirmation
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Security</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Cryptographic proofs + replication
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowPayment(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <USDFCPayment
                selectedPlan={selectedPlan}
                purpose="research storage"
                onSuccess={(txHash) => {
                  setShowPayment(false);
                  handleStoreData(selectedPlan);
                }}
                onError={(error) => {
                  setShowPayment(false);
                  toast({
                    title: 'Payment Failed',
                    description: error,
                    variant: 'destructive',
                  });
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 