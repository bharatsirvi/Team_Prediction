"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const IPL_TEAMS = [
  { id: "CSK", name: "Chennai Super Kings", logo: "https://documents.iplt20.com/ipl/CSK/logos/Logooutline/CSKoutline.png", primary: "#f5c518", secondary: "#1a3b8c" },
  { id: "DC", name: "Delhi Capitals", logo: "https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png", primary: "#17479e", secondary: "#d71920" },
  { id: "GT", name: "Gujarat Titans", logo: "https://documents.iplt20.com/ipl/GT/Logos/Logooutline/GToutline.png", primary: "#1c3455", secondary: "#b5965a" },
  { id: "LSG", name: "Lucknow Super Giants", logo: "https://documents.iplt20.com/ipl/LSG/Logos/Logooutline/LSGoutline.png", primary: "#a72132", secondary: "#c4a882" },
  { id: "MI", name: "Mumbai Indians", logo: "https://documents.iplt20.com/ipl/MI/Logos/Logooutline/MIoutline.png", primary: "#004ba0", secondary: "#c8a951" },
  { id: "PBKS", name: "Punjab Kings", logo: "https://documents.iplt20.com/ipl/PBKS/Logos/Logooutline/PBKSoutline.png", primary: "#c8102e", secondary: "#c4a882" },
  { id: "KKR", name: "Kolkata Knight Riders", logo: "https://documents.iplt20.com/ipl/KKR/Logos/Logooutline/KKRoutline.png", primary: "#3d1f6e", secondary: "#c8a951" },
  { id: "RCB", name: "Royal Challengers Bengaluru", logo: "https://documents.iplt20.com/ipl/RCB/Logos/Logooutline/RCBoutline.png", primary: "#c8102e", secondary: "#1a1a1a" },
  { id: "RR", name: "Rajasthan Royals", logo: "https://documents.iplt20.com/ipl/RR/Logos/Logooutline/RRoutline.png", primary: "#e91e8c", secondary: "#254aa5" },
  { id: "SRH", name: "Sunrisers Hyderabad", logo: "https://documents.iplt20.com/ipl/SRH/Logos/Logooutline/SRHoutline.png", primary: "#f26522", secondary: "#1a1a1a" },
];

const TEAM_COLORS: Record<string, string> = {
  CSK: '#f5c518', DC: '#17479e', GT: '#1c3455', LSG: '#a72132',
  MI: '#004ba0', PBKS: '#c8102e', KKR: '#3d1f6e', RCB: '#c8102e',
  RR: '#e91e8c', SRH: '#f26522',
};

interface SessionUser { email: string; name: string; }

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [existingPrediction, setExistingPrediction] = useState<string[] | null>(null);

  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successTeams, setSuccessTeams] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load session + check if user already predicted
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(async (d) => {
        setUser(d.user);
        if (d.user) {
          // Check if this user already has a prediction
          const predsRes = await fetch('/api/predictions');
          const preds = await predsRes.json();
          if (Array.isArray(preds)) {
            const mine = preds.find(
              (p: any) => p.username.toLowerCase() === d.user.name.toLowerCase()
            );
            if (mine) setExistingPrediction(mine.teams);
          }
        }
        setSessionLoaded(true);
      });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const close = () => setDropdownOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/sign-in');
  };

  const toggleTeam = (id: string) => {
    if (selectedTeams.includes(id)) {
      setSelectedTeams(prev => prev.filter(t => t !== id));
    } else if (selectedTeams.length < 4) {
      setSelectedTeams(prev => [...prev, id]);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    const res = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teams: selectedTeams }),
    });
    if (res.ok) {
      setSuccessTeams(selectedTeams);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 3000);
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to save. Please try again.');
    }
    setLoading(false);
  };

  const isSelected = (id: string) => selectedTeams.includes(id);
  const maxReached = selectedTeams.length >= 4;

  if (!sessionLoaded) {
    return (
      <div className="full-page-loader">
        <div className="spinner" />
      </div>
    );
  }

  const teamById = (id: string) => IPL_TEAMS.find(t => t.id === id);

  return (
    <>

      <main className="page-main">
        <section className="hero">
          <div className="hero-watermark">IPL</div>
          <p className="hero-eyebrow"><span className="eyebrow-line" /> PREDICT &amp; WIN <span className="eyebrow-line" /></p>
          <h1 className="hero-h1">Pick Your <em>Top 4</em></h1>
          <p className="hero-desc hindi-desc">
            {existingPrediction
              ? `धन्यवाद भाई, अपना कीमती समय देने के लिए !`
              : `Hello ${user?.name} ! हाथ जोड़ता हूँ भाई, maturity छोड़ दे !`}
          </p>
        </section>

        <div className="page-container">

          {/* ── ALREADY SUBMITTED ── */}
          {existingPrediction && !success && (
            <div className="already-voted-card">
              <div className="av-icon">🔒</div>
              <h2 className="av-title">Prediction Already Locked!</h2>

              <div className="av-teams-row">
                {existingPrediction.map(teamId => {
                  const team = teamById(teamId);
                  if (!team) return null;
                  return (
                    <div key={teamId} className="av-team-chip" style={{ borderColor: `${TEAM_COLORS[teamId]}55` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={team.logo} alt={team.name} className="av-team-logo" />
                      <span className="av-team-code" style={{ color: TEAM_COLORS[teamId] }}>{teamId}</span>
                    </div>
                  );
                })}
              </div>

              <Link href="/dashboard" className="lock-btn" style={{ display: 'inline-flex', marginTop: 8 }}>
                View All Predictions
              </Link>
            </div>
          )}

          {/* ── JUST SUBMITTED SUCCESS ── */}
          {success && (
            <div className="success-state">
              <div className="success-trophy">🏆</div>
              <h2>Prediction Locked!</h2>
              <div className="av-teams-row" style={{ justifyContent: 'center', marginTop: 8 }}>
                {successTeams.map(teamId => {
                  const team = teamById(teamId);
                  if (!team) return null;
                  return (
                    <div key={teamId} className="av-team-chip" style={{ borderColor: `${TEAM_COLORS[teamId]}55` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={team.logo} alt={team.name} className="av-team-logo" />
                      <span className="av-team-code" style={{ color: TEAM_COLORS[teamId] }}>{teamId}</span>
                    </div>
                  );
                })}
              </div>
              <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Redirecting to the board…</p>
            </div>
          )}

          {/* ── TEAM SELECTION ── */}
          {!existingPrediction && !success && (
            <>

              <div className="ipl-teams-grid">
                {IPL_TEAMS.map(team => (
                  <label
                    key={team.id}
                    className={`ipl-card-label${(!isSelected(team.id) && maxReached) ? ' disabled' : ''}${isSelected(team.id) ? ' selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected(team.id)}
                      disabled={!isSelected(team.id) && maxReached}
                      onChange={() => toggleTeam(team.id)}
                    />
                    <div className="ipl-card" style={{ '--secondary': team.secondary } as React.CSSProperties}>
                      <div className="ipl-card-top" style={{ background: team.primary }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={team.logo} alt={team.name} className="ipl-card-logo" />
                      </div>
                      <div className="ipl-card-bottom" style={{ background: team.secondary }}>
                        <span className="ipl-card-name">{team.name}</span>
                      </div>
                      {isSelected(team.id) && (
                        <div className="ipl-card-selected-ring">
                          <div className="ipl-card-check">✓</div>
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {/* UNIFIED COMMAND BAR (Replaces bulky submit-bar) */}
              <div className="unified-footer-bar">
                <div className="footer-inner">
                  <Link href="/points-table" className="footer-stats-link">
                    <span className="desktop-label">Point Table</span>
                    <span className="mobile-label">Table</span>
                  </Link>

                  <div className="footer-divider" />

                  <div className="footer-progress">
                    <div className="progress-labels">
                      <span className="label-text">TEAMS</span>
                      <span className="label-text">SELECTED</span>
                    </div>
                    <div className="progress-dashes">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`dash ${i <= selectedTeams.length ? 'active' : ''}`}
                          style={{ backgroundColor: i <= selectedTeams.length ? IPL_TEAMS.find(t => t.id === selectedTeams[i - 1])?.primary : '' }}
                        />
                      ))}
                    </div>
                    <div className="progress-count">
                      <span className="count-num">{selectedTeams.length}</span>/4
                    </div>
                  </div>

                  <div className="footer-divider" />

                  <button
                    className="footer-lock-btn"
                    disabled={selectedTeams.length !== 4 || loading}
                    onClick={handleSubmit}
                  >
                    {loading ? '...' : 'LOCK'}
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </>
  );
}
