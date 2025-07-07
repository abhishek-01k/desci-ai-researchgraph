'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { RESEARCH_IP_NFT_ABI } from '@/lib/contracts/research-ip-nft'
import { CONTRACT_ADDRESSES } from '@/lib/web3-config'
import { useChainId } from 'wagmi'
import { toast } from '@/hooks/use-toast'

export interface ResearchIP {
  tokenId: number
  title: string
  ipfsHash: string
  contributors: string[]
  contributionShares: number[]
  licensePrice: bigint
  isOpenAccess: boolean
  ontologyCategory: string
  createdAt: number
  validatedAt: number
  isValidated: boolean
  doi: string
}

export interface Citation {
  citingTokenId: number
  citedTokenId: number
  citedAt: number
  citationType: string
}

export function useResearchIPNFT() {
  const chainId = useChainId()
  const contractAddress = CONTRACT_ADDRESSES.RESEARCH_IP_NFT[chainId as keyof typeof CONTRACT_ADDRESSES.RESEARCH_IP_NFT] as `0x${string}`
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  // Mint Research IP NFT
  const mintResearchIP = async (
    title: string,
    ipfsHash: string,
    contributors: string[],
    shares: number[],
    licensePrice: string,
    isOpenAccess: boolean,
    ontologyCategory: string,
    doi: string
  ) => {
    try {
      const result = await writeContract({
        address: contractAddress,
        abi: RESEARCH_IP_NFT_ABI,
        functionName: 'mintResearchIP',
        args: [
          contributors[0] as `0x${string}`, // to address (first contributor)
          title,
          ipfsHash,
          contributors as `0x${string}`[],
          shares.map(s => BigInt(s)),
          parseEther(licensePrice),
          isOpenAccess,
          ontologyCategory,
          doi,
        ],
      })
      
      toast({
        title: 'Transaction Submitted',
        description: 'Your research IP NFT is being minted...',
      })
      
      return result
    } catch (error) {
      console.error('Error minting research IP:', error)
      toast({
        title: 'Transaction Failed',
        description: 'Failed to mint research IP NFT. Please try again.',
      })
      throw error
    }
  }

  // Add Citation
  const addCitation = async (
    citingTokenId: number,
    citedTokenId: number,
    citationType: string
  ) => {
    try {
      const result = await writeContract({
        address: contractAddress,
        abi: RESEARCH_IP_NFT_ABI,
        functionName: 'addCitation',
        args: [BigInt(citingTokenId), BigInt(citedTokenId), citationType],
      })
      
      toast({
        title: 'Citation Added',
        description: 'Citation relationship has been recorded on-chain.',
      })
      
      return result
    } catch (error) {
      console.error('Error adding citation:', error)
      toast({
        title: 'Citation Failed',
        description: 'Failed to add citation. Please try again.',
      })
      throw error
    }
  }

  // License Research IP
  const licenseTo = async (tokenId: number, licenseType: string, amount: string) => {
    try {
      const result = await writeContract({
        address: contractAddress,
        abi: RESEARCH_IP_NFT_ABI,
        functionName: 'licenseTo',
        args: [BigInt(tokenId), licenseType],
        value: parseEther(amount),
      })
      
      toast({
        title: 'License Granted',
        description: 'Research IP license has been purchased.',
      })
      
      return result
    } catch (error) {
      console.error('Error licensing research IP:', error)
      toast({
        title: 'License Failed',
        description: 'Failed to license research IP. Please try again.',
      })
      throw error
    }
  }

  // Validate Research IP
  const validateResearchIP = async (tokenId: number) => {
    try {
      const result = await writeContract({
        address: contractAddress,
        abi: RESEARCH_IP_NFT_ABI,
        functionName: 'validateResearchIP',
        args: [BigInt(tokenId)],
      })
      
      toast({
        title: 'Validation Submitted',
        description: 'Research IP validation is being processed...',
      })
      
      return result
    } catch (error) {
      console.error('Error validating research IP:', error)
      toast({
        title: 'Validation Failed',
        description: 'Failed to validate research IP. Please try again.',
      })
      throw error
    }
  }

  return {
    mintResearchIP,
    addCitation,
    licenseTo,
    validateResearchIP,
    isLoading: isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
  }
}

// Hook to read research IP data
export function useResearchIPData(tokenId: number) {
  const chainId = useChainId()
  const contractAddress = CONTRACT_ADDRESSES.RESEARCH_IP_NFT[chainId as keyof typeof CONTRACT_ADDRESSES.RESEARCH_IP_NFT] as `0x${string}`
  
  const { data: researchIP, isError, isLoading } = useReadContract({
    address: contractAddress,
    abi: RESEARCH_IP_NFT_ABI,
    functionName: 'researchIPs',
    args: [BigInt(tokenId)],
  })

  return {
    researchIP: researchIP as unknown as ResearchIP,
    isError,
    isLoading,
  }
}

// Hook to read citations for a token
export function useCitations(tokenId: number) {
  const chainId = useChainId()
  const contractAddress = CONTRACT_ADDRESSES.RESEARCH_IP_NFT[chainId as keyof typeof CONTRACT_ADDRESSES.RESEARCH_IP_NFT] as `0x${string}`
  
  const { data: citations, isError, isLoading } = useReadContract({
    address: contractAddress,
    abi: RESEARCH_IP_NFT_ABI,
    functionName: 'citations',
    args: [BigInt(tokenId)],
  })

  return {
    citations: citations as unknown as Citation[],
    isError,
    isLoading,
  }
}

// Hook to read researcher's works
export function useResearcherWorks(address: string) {
  const chainId = useChainId()
  const contractAddress = CONTRACT_ADDRESSES.RESEARCH_IP_NFT[chainId as keyof typeof CONTRACT_ADDRESSES.RESEARCH_IP_NFT] as `0x${string}`
  
  const { data: tokenIds, isError, isLoading } = useReadContract({
    address: contractAddress,
    abi: RESEARCH_IP_NFT_ABI,
    functionName: 'researcherWorks',
    args: [address as `0x${string}`],
  })

  return {
    tokenIds: tokenIds as unknown as number[],
    isError,
    isLoading,
  }
} 