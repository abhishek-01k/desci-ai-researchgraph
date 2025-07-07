import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { cookieStorage, createStorage } from 'wagmi'
import { mainnet, sepolia, polygon, polygonMumbai } from 'wagmi/chains'

// Add Filecoin Calibration Testnet
export const filecoinCalibration = {
  id: 314159,
  name: 'Filecoin Calibration',
  network: 'filecoin-calibration',
  nativeCurrency: {
    decimals: 18,
    name: 'Filecoin',
    symbol: 'tFIL',
  },
  rpcUrls: {
    public: { http: ['https://api.calibration.node.glif.io/rpc/v1'] },
    default: { http: ['https://api.calibration.node.glif.io/rpc/v1'] },
  },
  blockExplorers: {
    default: { name: 'Filfox', url: 'https://calibration.filfox.info/en' },
  },
  testnet: true,
} as const

// Web3Modal project configuration
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-project-id'

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'ResearchGraph AI',
  description: 'Decentralized Science Platform for Research Collaboration with Filecoin Storage',
  url: 'https://researchgraph.ai',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Contract addresses for different networks (including Filecoin)
export const CONTRACT_ADDRESSES = {
  RESEARCH_DAO: {
    [mainnet.id]: '0x1234567890123456789012345678901234567890',
    [sepolia.id]: '0x2345678901234567890123456789012345678901',
    [polygon.id]: '0x3456789012345678901234567890123456789012',
    [polygonMumbai.id]: '0x4567890123456789012345678901234567890123',
    [filecoinCalibration.id]: '0x5678901234567890123456789012345678901234', // FVM contract
  },
  RESEARCH_IP_NFT: {
    [mainnet.id]: '0x1234567890123456789012345678901234567890',
    [sepolia.id]: '0x2345678901234567890123456789012345678901',
    [polygon.id]: '0x3456789012345678901234567890123456789012',
    [polygonMumbai.id]: '0x4567890123456789012345678901234567890123',
    [filecoinCalibration.id]: '0x6789012345678901234567890123456789012345', // FVM contract
  },
  USDFC_TOKEN: {
    [filecoinCalibration.id]: '0x7890123456789012345678901234567890123456', // USDFC on Filecoin
  },
  FILECOIN_STORAGE: {
    [filecoinCalibration.id]: '0x8901234567890123456789012345678901234567', // Storage contract
  }
}

// Citation types for the platform
export const CITATION_TYPES = [
  'reference',
  'builds_upon', 
  'extends',
  'validates',
  'refutes',
  'contradicts'
]

// Research categories for the platform
export const RESEARCH_CATEGORIES = [
  'Biology',
  'Chemistry',
  'Physics',
  'Computer Science',
  'Mathematics',
  'Medicine',
  'Engineering',
  'Environmental Science',
  'Psychology',
  'Social Sciences',
  'Economics',
  'Other'
]

// Create wagmi config with Filecoin Calibration included
export const config = defaultWagmiConfig({
  chains: [mainnet, sepolia, polygon, polygonMumbai, filecoinCalibration],
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  })
})

// License types for research IP
export const LICENSE_TYPES = [
  'commercial',
  'academic',
  'open',
  'exclusive',
  'non_exclusive'
]

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

// Declare window.ethereum type
declare global {
  interface Window {
    ethereum?: any
  }
} 