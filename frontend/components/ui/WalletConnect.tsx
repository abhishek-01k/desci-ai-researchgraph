'use client'

import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect, useEnsName } from 'wagmi'
import { Button } from './button'
import { Wallet, LogOut, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from '@/hooks/use-toast'

export function WalletConnect() {
  const { open } = useWeb3Modal()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const [copied, setCopied] = useState(false)

  const handleConnect = () => {
    open()
  }

  const handleDisconnect = () => {
    disconnect()
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected from the application.',
    })
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard.',
      })
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">
            {ensName || formatAddress(address!)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyAddress}
            className="h-6 w-6 p-0 hover:bg-white/20"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
      <Button
        onClick={handleDisconnect}
        variant="outline"
        size="sm"
        className="border-red-300 text-red-600 hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function WalletConnectButton() {
  const { open } = useWeb3Modal()
  const { isConnected } = useAccount()

  if (isConnected) {
    return <WalletConnect />
  }

  return (
    <Button
      onClick={() => open()}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  )
} 