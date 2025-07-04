export function validateRepoUrl(url: string): boolean {
  const githubRegex = /^https?:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9._-]+\/?$/;
  
  const gitlabRegex = /^https:\/\/[\w.-]+\/[\w.-]+(\/[\w.-]+)*\/?(?:\.git)?$/;
  
  return githubRegex.test(url) || gitlabRegex.test(url);
}


export function validateGithubToken(token: string): boolean {
  const tokenRegex = /^ghp_[a-zA-Z0-9]{36}$/;
  return tokenRegex.test(token);
}


export function validateGitlabToken(token: string): boolean {
  const tokenRegex = /^glpat-[a-zA-Z0-9-_]{20}$/;
  return tokenRegex.test(token);
}


export function getPlatformFromUrl(url: string): 'github' | 'gitlab' | null {
  if (!url) return null;
  if (url.includes('github.com')) return 'github';
  
  const gitlabRegex = /^https:\/\/[\w.-]+\/[\w.-]+(\/[\w.-]+)*\/?(?:\.git)?$/;
  if (gitlabRegex.test(url) && !url.includes('github.com')) {
    return 'gitlab';
  }
  
  return null;
}