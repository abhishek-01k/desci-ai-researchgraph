'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Coins,
  FileText,
  Cloud,
  Zap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CONTRACT_ADDRESSES, STORAGE_PLANS } from '@/lib/web3-config';

const USDFC_ABI = [
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}, {"name": "spender", "type": "address"}],
    "name": "allowance", 
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable", 
    "type": "function"
  }
];

const STORAGE_CONTRACT_ABI = [
  {
    "inputs": [
      {"name": "planId", "type": "string"},
      {"name": "dataHash", "type": "string"},
      {"name": "duration", "type": "uint256"}
    ],
    "name": "purchaseStorage",
    "outputs": [{"name": "storageId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

interface USDFCPaymentProps {
  planId?: string;
  dataHash?: string;
  customAmount?: string;
  purpose: 'storage' | 'access' | 'collaboration' | 'custom';
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export function USDFCPayment({ 
  planId = 'basic',
  dataHash,
  customAmount,
  purpose,
  onSuccess,
  onError 
}: USDFCPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(planId);
  const { address, isConnected, chain } = useAccount();
  const { toast } = useToast();
  
  const isFilecoin = chain?.id === 314159; // Filecoin Calibration
  
  // Get USDFC balance
  const { data: usdFCBalance } = useBalance({
    address,
    token: isFilecoin ? CONTRACT_ADDRESSES.USDFC_TOKEN[314159] as `0x${string}` : undefined,
  });

  // Contract write hooks
  const { writeContract: approveUSDFC, data: approveHash } = useWriteContract();
  const { writeContract: purchaseStorage, data: purchaseHash } = useWriteContract();
  
  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  
  const { 
    isLoading: isPurchasing, 
    isSuccess: isPurchaseSuccess,
    isError: isPurchaseError,
    error: purchaseError 
  } = useWaitForTransactionReceipt({
    hash: purchaseHash,
  });

  // Handle transaction success/error
  useEffect(() => {
    if (isPurchaseSuccess && purchaseHash) {
      toast({
        title: 'Payment successful!',
        description: `Your ${purpose} has been activated on Filecoin.`,
      });
      onSuccess?.(purchaseHash);
      setIsProcessing(false);
    }
  }, [isPurchaseSuccess, purchaseHash, purpose, onSuccess, toast]);

  useEffect(() => {
    if (isPurchaseError && purchaseError) {
      toast({
        title: 'Payment failed',
        description: purchaseError.message || 'Transaction failed',
        variant: 'destructive',
      });
      onError?.(purchaseError.message || 'Transaction failed');
      setIsProcessing(false);
    }
  }, [isPurchaseError, purchaseError, onError, toast]);

  const currentPlan = STORAGE_PLANS.find(plan => plan.id === selectedPlan);
  const paymentAmount = customAmount || currentPlan?.price || '0';
  
  const handlePayment = async () => {
    if (!isConnected || !address || !isFilecoin) {
      toast({
        title: 'Please connect to Filecoin',
        description: 'Switch to Filecoin Calibration network to make payments.',
        variant: 'destructive',
      });
      return;
    }

    if (!currentPlan && !customAmount) {
      toast({
        title: 'Invalid payment',
        description: 'Please select a storage plan or specify an amount.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const amount = parseUnits(paymentAmount.toString(), 6); // USDFC has 6 decimals
      
      // Step 1: Approve USDFC spending
      await approveUSDFC({
        address: CONTRACT_ADDRESSES.USDFC_TOKEN[314159] as `0x${string}`,
        abi: USDFC_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.FILECOIN_STORAGE[314159] as `0x${string}`, amount],
      });

      // Step 2: Purchase storage (after approval)
      if (purpose === 'storage' && currentPlan && dataHash) {
        await purchaseStorage({
          address: CONTRACT_ADDRESSES.FILECOIN_STORAGE[314159] as `0x${string}`,
          abi: STORAGE_CONTRACT_ABI,
          functionName: 'purchaseStorage',
          args: [currentPlan.id, dataHash, BigInt(365 * 24 * 60 * 60)], // 1 year in seconds
        });
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  const getPurposeIcon = () => {
    switch (purpose) {
      case 'storage': return <Cloud className="h-5 w-5" />;
      case 'access': return <FileText className="h-5 w-5" />;
      case 'collaboration': return <Zap className="h-5 w-5" />;
      default: return <Coins className="h-5 w-5" />;
    }
  };

  const getPurposeDescription = () => {
    switch (purpose) {
      case 'storage': return 'Store your research data permanently on Filecoin';
      case 'access': return 'Access premium research content and features';
      case 'collaboration': return 'Enable advanced collaboration features';
      default: return 'Complete your transaction using USDFC';
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Wallet Not Connected</h3>
          <p className="text-muted-foreground">Please connect your wallet to make payments with USDFC.</p>
        </CardContent>
      </Card>
    );
  }

  if (!isFilecoin) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Switch to Filecoin</h3>
          <p className="text-muted-foreground">Please switch to Filecoin Calibration network to use USDFC payments.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getPurposeIcon()}
            USDFC Payment
          </CardTitle>
          <CardDescription>
            {getPurposeDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-black justify-between p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div>
              <p className="text-sm text-black font-medium">Your USDFC Balance</p>
              <p className="text-2xl font-bold">
                {usdFCBalance ? formatUnits(usdFCBalance.value, 6) : '0.00'} USDFC
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Network</p>
              <Badge variant="outline" className="text-black">Filecoin Calibration</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Plans (for storage purpose) */}
      {purpose === 'storage' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STORAGE_PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all ${
                  selectedPlan === plan.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="text-2xl font-bold text-blue-600">
                    {plan.price} USDFC
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Storage:</strong> {plan.storage}</p>
                    <p className="text-sm"><strong>Duration:</strong> {plan.duration}</p>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Features:</p>
                      {plan.features.map((feature, index) => (
                        <p key={index} className="text-xs text-muted-foreground">• {feature}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Amount</span>
            <span className="font-bold">{paymentAmount} USDFC</span>
          </div>
          
          {currentPlan && (
            <>
              <div className="flex justify-between items-center">
                <span>Plan</span>
                <span>{currentPlan.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Storage</span>
                <span>{currentPlan.storage}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Duration</span>
                <span>{currentPlan.duration}</span>
              </div>
            </>
          )}
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>{paymentAmount} USDFC</span>
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessing || isApproving || isPurchasing}
            className="w-full"
            size="lg"
          >
            {isProcessing || isApproving || isPurchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isApproving ? 'Approving USDFC...' : 'Processing Payment...'}
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay with USDFC
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>✓ Secure payments on Filecoin</p>
            <p>✓ Permanent storage guarantee</p>
            <p>✓ Decentralized data access</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default USDFCPayment; 