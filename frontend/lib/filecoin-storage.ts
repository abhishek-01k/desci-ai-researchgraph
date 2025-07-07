import { createPublicClient, createWalletClient, custom, parseUnits, formatUnits, http } from 'viem'
import { filecoinCalibration } from '@/lib/web3-config'

// Filecoin Storage Service Configuration
export const FILECOIN_CONFIG = {
  STORAGE_PROVIDER_API: 'https://api.calibration.node.glif.io',
  SPARK_CDN_ENDPOINT: 'https://spark.calibration.filecoin.io',
  USDFC_TOKEN_ADDRESS: '0x461E13056a3a3265CEF4c593F01b2e960755dE5' as `0x${string}`,
  STORAGE_MARKET_ADDRESS: '0x2C1AD43b4C1F6AB78A4b8F2B8e7f5b6C3e2F8E9A' as `0x${string}`,
  RESEARCH_STORAGE_CONTRACT: '0x3D2BE54C5E7F6BC89B4A6F3C4e8f7A9D5F2E8C1A' as `0x${string}`,
}

// Storage Plans for Research Data
export const STORAGE_PLANS = [
  {
    id: 'basic',
    name: 'Research Basic',
    storage: '1 TB',
    duration: '1 year',
    price: 10, // USDFC
    features: ['Basic storage', 'Standard retrieval', 'Basic encryption'],
  },
  {
    id: 'premium',
    name: 'Research Premium',
    storage: '10 TB',
    duration: '2 years',
    price: 80, // USDFC
    features: ['Premium storage', 'Fast retrieval', 'Advanced encryption', 'Replication'],
  },
  {
    id: 'enterprise',
    name: 'Research Enterprise',
    storage: '100 TB',
    duration: '5 years',
    price: 500, // USDFC
    features: ['Enterprise storage', 'Instant retrieval', 'Zero-knowledge encryption', 'Global replication'],
  },
]

// Research Storage Contract ABI
export const RESEARCH_STORAGE_ABI = [
  {
    "inputs": [
      {"name": "dataHash", "type": "bytes32"},
      {"name": "size", "type": "uint256"},
      {"name": "duration", "type": "uint256"},
      {"name": "metadata", "type": "string"}
    ],
    "name": "storeResearchData",
    "outputs": [{"name": "dealId", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "dealId", "type": "uint256"},
      {"name": "accessKey", "type": "bytes32"}
    ],
    "name": "requestDataAccess",
    "outputs": [{"name": "retrievalUrl", "type": "string"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "dealId", "type": "uint256"}
    ],
    "name": "getStorageDetails",
    "outputs": [
      {"name": "owner", "type": "address"},
      {"name": "dataHash", "type": "bytes32"},
      {"name": "size", "type": "uint256"},
      {"name": "expirationTime", "type": "uint256"},
      {"name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "owner", "type": "address"}
    ],
    "name": "getUserDeals",
    "outputs": [{"name": "dealIds", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "dealId", "type": "uint256"},
      {"name": "additionalDuration", "type": "uint256"}
    ],
    "name": "renewStorage",
    "outputs": [{"name": "newExpirationTime", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  }
] as const

// Types for Research Storage
export interface ResearchStorageData {
  paperId: string
  title: string
  content: string
  metadata: {
    authors: string[]
    keywords: string[]
    abstract: string
    citations: string[]
    doi?: string
  }
  analysisResults?: {
    entities: any[]
    insights: string[]
    hypotheses: string[]
    quality_score: number
  }
}

export interface StorageDeal {
  dealId: number
  owner: string
  dataHash: string
  size: number
  expirationTime: number
  isActive: boolean
  metadata: ResearchStorageData
}

// Filecoin Storage Service Class
export class FilecoinStorageService {
  private publicClient: any
  private walletClient: any | null = null

  constructor() {
    // Only initialize client-side to avoid SSR issues
    if (typeof window !== 'undefined' && window.ethereum) {
      this.publicClient = createPublicClient({
        chain: filecoinCalibration,
        transport: custom(window.ethereum)
      })
    } else {
      // Fallback for SSR - use HTTP transport
      this.publicClient = createPublicClient({
        chain: filecoinCalibration,
        transport: http()
      })
    }
  }

  // Initialize wallet client
  async initializeWallet() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.walletClient = createWalletClient({
        chain: filecoinCalibration,
        transport: custom(window.ethereum)
      })
    }
  }

  // Store research data on Filecoin
  async storeResearchData(
    data: ResearchStorageData,
    planId: string,
    paymentToken: `0x${string}`,
    userAddress: `0x${string}`
  ): Promise<{dealId: number, dataHash: string, retrievalUrl: string}> {
    try {
      // Prepare data for storage
      const serializedData = JSON.stringify(data)
      const dataBuffer = Buffer.from(serializedData, 'utf8')
      const dataHash = this.generateDataHash(dataBuffer)
      
      // Get storage plan
      const plan = STORAGE_PLANS.find(p => p.id === planId)
      if (!plan) throw new Error('Invalid storage plan')

      // Calculate storage duration (in seconds)
      const duration = this.parseDuration(plan.duration)
      
      // Store data via FVM contract
      const dealId = await this.createStorageDeal(
        dataHash,
        dataBuffer.length,
        duration,
        JSON.stringify(data.metadata)
      )

      // Upload to Filecoin network
      const uploadResponse = await this.uploadToFilecoin(dataBuffer, dealId)
      
      return {
        dealId: dealId,
        dataHash: dataHash,
        retrievalUrl: uploadResponse.retrievalUrl
      }
    } catch (error) {
      console.error('Failed to store research data:', error)
      throw error
    }
  }

  // Retrieve research data from Filecoin
  async retrieveResearchData(dealId: number, accessKey?: string): Promise<ResearchStorageData> {
    try {
      // Get storage details from contract
      const storageDetails = await this.getStorageDetails(dealId)
      
      if (!storageDetails.isActive) {
        throw new Error('Storage deal is not active')
      }

      // Request data access (may require payment)
      const retrievalUrl = await this.requestDataAccess(dealId, accessKey)
      
      // Fetch data from Filecoin
      const response = await fetch(retrievalUrl)
      if (!response.ok) {
        throw new Error('Failed to retrieve data from Filecoin')
      }

      const data = await response.json()
      return data as ResearchStorageData
    } catch (error) {
      console.error('Failed to retrieve research data:', error)
      throw error
    }
  }

  // Get user's storage deals
  async getUserDeals(userAddress: `0x${string}`): Promise<StorageDeal[]> {
    try {
      const dealIds = await this.publicClient.readContract({
        address: FILECOIN_CONFIG.RESEARCH_STORAGE_CONTRACT,
        abi: RESEARCH_STORAGE_ABI,
        functionName: 'getUserDeals',
        args: [userAddress],
      })

      const deals = await Promise.all(
        dealIds.map(async (dealId: number) => {
          const details = await this.getStorageDetails(dealId)
          return {
            dealId,
            ...details,
          }
        })
      )

      return deals
    } catch (error) {
      console.error('Failed to get user deals:', error)
      throw error
    }
  }

  // Renew storage deal
  async renewStorage(dealId: number, additionalDuration: string): Promise<number> {
    try {
      if (!this.walletClient) await this.initializeWallet()
      
      const duration = this.parseDuration(additionalDuration)
      
      const { request } = await this.publicClient.simulateContract({
        address: FILECOIN_CONFIG.RESEARCH_STORAGE_CONTRACT,
        abi: RESEARCH_STORAGE_ABI,
        functionName: 'renewStorage',
        args: [dealId, duration],
      })

      const hash = await this.walletClient!.writeContract(request)
      
      // Wait for transaction confirmation
      await this.publicClient.waitForTransactionReceipt({ hash })
      
      return Date.now() + duration * 1000 // Return new expiration timestamp
    } catch (error) {
      console.error('Failed to renew storage:', error)
      throw error
    }
  }

  // Private helper methods
  private generateDataHash(data: Buffer): string {
    // Simple hash generation (in production, use a proper cryptographic hash)
    return `0x${Buffer.from(data).toString('hex').slice(0, 64)}`
  }

  private parseDuration(duration: string): number {
    // Parse duration string to seconds
    const parts = duration.split(' ')
    const value = parseInt(parts[0])
    const unit = parts[1]

    switch (unit) {
      case 'day':
      case 'days':
        return value * 24 * 60 * 60
      case 'month':
      case 'months':
        return value * 30 * 24 * 60 * 60
      case 'year':
      case 'years':
        return value * 365 * 24 * 60 * 60
      default:
        return value
    }
  }

  private async createStorageDeal(
    dataHash: string,
    size: number,
    duration: number,
    metadata: string
  ): Promise<number> {
    if (!this.walletClient) await this.initializeWallet()

    const { request } = await this.publicClient.simulateContract({
      address: FILECOIN_CONFIG.RESEARCH_STORAGE_CONTRACT,
      abi: RESEARCH_STORAGE_ABI,
      functionName: 'storeResearchData',
      args: [dataHash, size, duration, metadata],
    })

    const hash = await this.walletClient!.writeContract(request)
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash })
    
    // Extract deal ID from transaction logs
    const dealId = this.extractDealIdFromReceipt(receipt)
    return dealId
  }

  private async uploadToFilecoin(data: Buffer, dealId: number): Promise<{retrievalUrl: string}> {
    // In a real implementation, this would upload to Filecoin storage providers
    // For now, we'll simulate the upload
    return {
      retrievalUrl: `${FILECOIN_CONFIG.SPARK_CDN_ENDPOINT}/retrieve/${dealId}`
    }
  }

  private async getStorageDetails(dealId: number): Promise<any> {
    return await this.publicClient.readContract({
      address: FILECOIN_CONFIG.RESEARCH_STORAGE_CONTRACT,
      abi: RESEARCH_STORAGE_ABI,
      functionName: 'getStorageDetails',
      args: [dealId],
    })
  }

  private async requestDataAccess(dealId: number, accessKey?: string): Promise<string> {
    const key = accessKey || '0x0000000000000000000000000000000000000000000000000000000000000000'
    
    return await this.publicClient.readContract({
      address: FILECOIN_CONFIG.RESEARCH_STORAGE_CONTRACT,
      abi: RESEARCH_STORAGE_ABI,
      functionName: 'requestDataAccess',
      args: [dealId, key],
    })
  }

  private extractDealIdFromReceipt(receipt: any): number {
    // Extract deal ID from transaction receipt logs
    // This is a simplified implementation
    return Math.floor(Math.random() * 1000000) // Mock deal ID
  }
}

// Export singleton instance
export const filecoinStorage = new FilecoinStorageService() 