import { NextResponse } from 'next/server';
import { saveOtp, getUser } from '@/lib/db';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email, mode } = await request.json();
    const emailTrimmed = email?.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const existingUser = await getUser(emailTrimmed);

    if (mode === 'login' && !existingUser) {
      return NextResponse.json({ error: 'Account not found. Please sign up instead.' }, { status: 404 });
    }

    if (mode === 'signup' && existingUser) {
      return NextResponse.json({ error: 'Email already registered. Please sign in instead.' }, { status: 400 });
    }

    const code = generateOtp();
    await saveOtp(email, code, 600); // 10 min expiry

    const mailOptions = {
      from: `"IPL Prediction" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Your IPL Prediction OTP: ${code}`,
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;background:#0d1b3e;color:#fff;border-radius:12px;">
          <h2 style="color:#f5a623;margin:0 0 8px">🏏 TATA IPL 2026 Prediction</h2>
          <p style="color:#aaa;margin:0 0 24px">Your one-time login code:</p>
          <div style="font-size:2.5rem;font-weight:900;letter-spacing:0.3em;color:#f5a623;text-align:center;padding:20px;background:rgba(245,166,35,0.1);border-radius:8px;border:1px solid rgba(245,166,35,0.3);">
            ${code}
          </div>
          <p style="color:#888;font-size:0.8rem;margin:16px 0 0;text-align:center;">Expires in 10 minutes. Do not share this code.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Nodemailer error:', err);
    return NextResponse.json({ error: 'Failed to send OTP email.' }, { status: 500 });
  }
}
