import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { platform, token } = await request.json();
    
    if (!platform || !token || !['github', 'gitlab'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const cookieStore = cookies();
    cookieStore.set(`vcs-token-${platform}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { platform } = await request.json();
    
    if (!platform || !['github', 'gitlab'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const cookieStore = cookies();
    cookieStore.delete(`vcs-token-${platform}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}