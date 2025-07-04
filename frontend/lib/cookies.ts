import { cookies } from 'next/headers';
import { type SerializeOptions as CookieOptions } from 'cookie';

const TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 30,
  path: '/'
};

export function getTokenFromCookies(platform: 'github' | 'gitlab'): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get(`vcs-token-${platform}`)?.value;
}