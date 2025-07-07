'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Database, 
  FileText, 
  Network, 
  Settings, 
  User,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Plus,
  ChevronDown,
  Cloud
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/ui/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';
import { WalletConnectButton } from '@/components/ui/WalletConnect';
import { useAccount } from 'wagmi';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Brain,
    badge: null,
  },
  {
    name: 'Papers',
    href: '/papers',
    icon: FileText,
    badge: null,
  },
  {
    name: 'Analysis',
    href: '/analysis',
    icon: Database,
    badge: 'AI',
  },
  {
    name: 'Knowledge Graph',
    href: '/knowledge-graph',
    icon: Network,
    badge: null,
  },
  {
    name: 'Filecoin Storage',
    href: '/filecoin',
    icon: Cloud,
    badge: 'FVM',
  },
  {
    name: 'Collaborate',
    href: '/collaborate',
    icon: User,
    badge: null,
  },
];

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { address, isConnected } = useAccount();
  
  // Use wallet connection state for authentication
  const walletConnected = isConnected && address;

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              {/* <Logo /> */}
              <span className="text-xl font-bold">ResearchGraph AI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {walletConnected && (
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {walletConnected ? (
              <>
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button size="sm" className="space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>New Analysis</span>
                </Button>
                
                <WalletConnectButton />
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <WalletConnectButton />
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-b">
            {walletConnected ? (
              <>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
                
                <div className="border-t border-border pt-4 pb-3">
                  <div className="flex items-center px-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
                      <div className="text-sm text-muted-foreground">Wallet Connected</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="px-3 py-2">
                      <WalletConnectButton />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <WalletConnectButton />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
} 