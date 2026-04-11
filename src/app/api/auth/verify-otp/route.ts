import { NextResponse } from 'next/server';
import { verifyOtp, getUser, createUser } from '@/lib/db';
import { createSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { email, code, name, mode } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required.' }, { status: 400 });
    }

    const valid = await verifyOtp(email, code.trim());
    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired OTP. Try again.' }, { status: 401 });
    }

    let finalName = '';
    const emailLower = email.toLowerCase();
    const existingUser = await getUser(emailLower);

    if (mode === 'signup') {
      if (existingUser) {
        return NextResponse.json({ error: 'Email already registered. Use Sign In.' }, { status: 400 });
      }
      if (!name || name.trim().length < 3) {
        return NextResponse.json({ error: 'Full name (min 3 chars) is required for sign up.' }, { status: 400 });
      }
      await createUser(emailLower, name.trim());
      finalName = name.trim();
    } else {
      if (!existingUser) {
        return NextResponse.json({ error: 'Account not found. Please sign up first.' }, { status: 404 });
      }
      finalName = existingUser.name;
    }

    await createSession({ email: emailLower, name: finalName });

    return NextResponse.json({ success: true, name: finalName });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
