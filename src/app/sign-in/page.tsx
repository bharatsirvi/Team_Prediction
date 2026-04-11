"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Step = 'email' | 'otp';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [step, setStep] = useState<Step>('email');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(180);

  // OTP Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Name Validation only for Signup
    if (authMode === 'signup') {
      const nameTrimmed = name.trim();
      if (nameTrimmed.length < 3) {
        setError('Please enter your full name (at least 3 characters).');
        return;
      }
      if (!/^[a-zA-Z\s]{2,50}$/.test(nameTrimmed)) {
        setError('Name should only contain letters and spaces.');
        return;
      }
    }

    // Email Validation
    const emailTrimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailTrimmed, mode: authMode }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to send OTP.');
    } else {
      setStep('otp');
      setTimer(180); // Reset timer
      setCode('');   // Clear old code
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: email.toLowerCase(), 
        code, 
        name: authMode === 'signup' ? name.trim() : '',
        mode: authMode 
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Invalid code.');
    } else {
      router.push(redirect);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="signin-wrapper">
      {/* Background glow effects */}
      <div className="signin-glow-1" />
      <div className="signin-glow-2" />

      <div className="signin-card">
        {/* Logo */}
        <div className="signin-logo">
          <span className="signin-logo-icon">🏏</span>
          <div>
            <div className="signin-logo-title">TATA IPL</div>
            <div className="signin-logo-sub">2026 Prediction</div>
          </div>
        </div>

        {step === 'email' ? (
          <>
            <div className="auth-tabs">
              <button 
                className={`tab-btn ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => { setAuthMode('signup'); setError(''); }}
              >
                Sign Up
              </button>
              <button 
                className={`tab-btn ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthMode('login'); setError(''); }}
              >
                Sign In
              </button>
            </div>

            <h1 className="signin-heading">
              {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="signin-subheading">
              {authMode === 'signup' 
                ? 'Register your name and email to start predicting.' 
                : 'Enter your email to sign in to your account.'}
            </p>

            <form onSubmit={handleSendOtp} className="signin-form">
              {authMode === 'signup' && (
                <div className="signin-field">
                  <label className="signin-label">Full Name</label>
                  <input
                    type="text"
                    className="signin-input"
                    placeholder="e.g. Bharat Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                    disabled={loading}
                  />
                </div>
              )}

              <div className="signin-field">
                <label className="signin-label">Email Address</label>
                <input
                  type="email"
                  className="signin-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus={authMode === 'login'}
                  disabled={loading}
                />
              </div>

              {error && <div className="signin-error">⚠ {error}</div>}

              <button type="submit" className="signin-btn" disabled={loading}>
                {loading ? <span className="signin-spinner" /> : '📧 Send OTP to My Email'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="signin-heading">Check Your Email</h1>
            <p className="signin-subheading">
              We sent a 6-digit code to<br /><strong className="signin-email-highlight">{email}</strong>
            </p>

            <form onSubmit={handleVerifyOtp} className="signin-form">
              <div className="signin-field">
                <div className="signin-field-header">
                  <label className="signin-label">One-Time Password</label>
                  <span className={`otp-timer ${timer < 30 ? 'urgent' : ''}`}>
                    {timer > 0 ? `Expires in ${formatTime(timer)}` : 'Code Expired'}
                  </span>
                </div>
                <input
                  type="text"
                  className="signin-input signin-otp-input"
                  placeholder="_ _ _ _ _ _"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  autoFocus
                  maxLength={6}
                  disabled={loading || timer === 0}
                />
              </div>

              {error && <div className="signin-error">⚠ {error}</div>}
              {timer === 0 && !error && (
                <div className="signin-error">⚠ Request a new code to continue.</div>
              )}

              <button 
                type="submit" 
                className="signin-btn" 
                disabled={loading || code.length < 6 || timer === 0}
              >
                {loading ? <span className="signin-spinner" /> : '✓ Verify & Continue'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError(''); }}
                className="signin-back-btn"
              >
                ← Try a different email
              </button>
            </form>

            <p className="signin-resend">
              Didn't get it?{' '}
              <button className="signin-link-btn" onClick={() => handleSendOtp({ preventDefault: () => {} } as React.FormEvent)} disabled={loading}>
                Resend code
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
