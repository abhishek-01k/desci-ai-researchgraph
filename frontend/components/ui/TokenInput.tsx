'use client';

import { useState } from 'react';
import { Eye, EyeOff, Github, Gitlab } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTokens } from '@/hooks/use-tokens';
import { validateGithubToken, validateGitlabToken } from '@/lib/validators';
import { useToast } from '@/hooks/use-toast';

interface TokenInputProps {
  platform?: 'github' | 'gitlab' | null;
}

export default function TokenInput({ platform }: TokenInputProps) {
  const { tokens, saveToken, clearToken } = useTokens();
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showGitlabToken, setShowGitlabToken] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [gitlabToken, setGitlabToken] = useState('');
  const { toast } = useToast();

  const handleSaveToken = async (platform: 'github' | 'gitlab') => {
    const token = platform === 'github' ? githubToken : gitlabToken;
    const validator = platform === 'github' ? validateGithubToken : validateGitlabToken;

    if (!token) {
      toast({
        title: 'Token required',
        description: `Please enter a ${platform === 'github' ? 'GitHub' : 'GitLab'} token`,
        variant: 'destructive',
      });
      return;
    }

    if (!validator(token)) {
      toast({
        title: 'Invalid token',
        description: `Please enter a valid ${platform === 'github' ? 'GitHub' : 'GitLab'} token`,
        variant: 'destructive',
      });
      return;
    }

    try {
      await saveToken(platform, token);
      toast({
        title: 'Token saved',
        description: `${platform === 'github' ? 'GitHub' : 'GitLab'} token has been saved successfully`,
      });
      if (platform === 'github') {
        setGithubToken('');
        setShowGithubToken(false);
      } else {
        setGitlabToken('');
        setShowGitlabToken(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save token',
        variant: 'destructive',
      });
    }
  };

  const handleClearToken = async (platform: 'github' | 'gitlab') => {
    try {
      await clearToken(platform);
      toast({
        title: 'Token cleared',
        description: `${platform === 'github' ? 'GitHub' : 'GitLab'} token has been removed`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear token',
        variant: 'destructive',
      });
    }
  };

  const renderTokenInput = (type: 'github' | 'gitlab') => {
    const isGithub = type === 'github';
    const Icon = isGithub ? Github : Gitlab;
    const showToken = isGithub ? showGithubToken : showGitlabToken;
    const setShowToken = isGithub ? setShowGithubToken : setShowGitlabToken;
    const token = isGithub ? githubToken : gitlabToken;
    const setToken = isGithub ? setGithubToken : setGitlabToken;
    const hasToken = tokens[type];

    if (!platform || platform === type) {
      return (
        <div className="relative" key={type}>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <span className="font-medium">{isGithub ? 'GitHub' : 'GitLab'} Token:</span>
            {hasToken ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleClearToken(type)}
              >
                Clear Token
              </Button>
            ) : (
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder={`Enter ${isGithub ? 'GitHub' : 'GitLab'} token (optional)`}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showToken ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <Button
                  type="button"
                  onClick={() => handleSaveToken(type)}
                >
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 text-left">
      {renderTokenInput('github')}
      {renderTokenInput('gitlab')}
    </div>
  );
}