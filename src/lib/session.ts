import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'ipl-prediction-secret-change-in-production'
);
const COOKIE = 'ipl_session';

export interface SessionUser {
  email: string;
  name: string;
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    return { email: payload.email as string, name: payload.name as string };
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}
