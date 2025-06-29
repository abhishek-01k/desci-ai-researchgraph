'use client';

import { useState, useEffect } from 'react';

interface Tokens {
  github?: string;
  gitlab?: string;
}

export function useTokens() {
  const [tokens, setTokens] = useState<Tokens>({});

  const saveToken = async (platform: 'github' | 'gitlab', token: string) => {
    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, token }),
      });

      if (response.ok) {
        setTokens(prev => ({ ...prev, [platform]: token }));
      }
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  };

  const clearToken = async (platform: 'github' | 'gitlab') => {
    try {
      const response = await fetch('/api/tokens', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });

      if (response.ok) {
        setTokens(prev => {
          const newTokens = { ...prev };
          delete newTokens[platform];
          return newTokens;
        });
      }
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  };

  return { tokens, saveToken, clearToken };
}