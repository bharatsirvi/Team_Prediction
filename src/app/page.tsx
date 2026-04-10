"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const USERS = ["Avirat", "Shaurya", "Devesh", "Rajat", "Sourabh"];

// Verified exact URLs from S3 bucket (case-sensitive per team)
const IPL_TEAMS = [
  {
    id: "CSK", name: "Chennai Super Kings",
    logo: "https://documents.iplt20.com/ipl/CSK/logos/Logooutline/CSKoutline.png",
    primary: "#f5c518", secondary: "#1a3b8c",
  },
  {
    id: "DC", name: "Delhi Capitals",
    logo: "https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png",
    primary: "#17479e", secondary: "#d71920",
  },
  {
    id: "GT", name: "Gujarat Titans",
    logo: "https://documents.iplt20.com/ipl/GT/Logos/Logooutline/GToutline.png",
    primary: "#1c3455", secondary: "#b5965a",
  },
  {
    id: "LSG", name: "Lucknow Super Giants",
    logo: "https://documents.iplt20.com/ipl/LSG/Logos/Logooutline/LSGoutline.png",
    primary: "#a72132", secondary: "#c4a882",
  },
  {
    id: "MI", name: "Mumbai Indians",
    logo: "https://documents.iplt20.com/ipl/MI/Logos/Logooutline/MIoutline.png",
    primary: "#004ba0", secondary: "#c8a951",
  },
  {
    id: "PBKS", name: "Punjab Kings",
    logo: "https://documents.iplt20.com/ipl/PBKS/Logos/Logooutline/PBKSoutline.png",
    primary: "#c8102e", secondary: "#c4a882",
  },
  {
    id: "KKR", name: "Kolkata Knight Riders",
    logo: "https://documents.iplt20.com/ipl/KKR/Logos/Logooutline/KKRoutline.png",
    primary: "#3d1f6e", secondary: "#c8a951",
  },
  {
    id: "RCB", name: "Royal Challengers Bengaluru",
    logo: "https://documents.iplt20.com/ipl/RCB/Logos/Logooutline/RCBoutline.png",
    primary: "#c8102e", secondary: "#1a1a1a",
  },
  {
    id: "RR", name: "Rajasthan Royals",
    logo: "https://documents.iplt20.com/ipl/RR/Logos/Logooutline/RRoutline.png",
    primary: "#e91e8c", secondary: "#254aa5",
  },
  {
    id: "SRH", name: "Sunrisers Hyderabad",
    logo: "https://documents.iplt20.com/ipl/SRH/Logos/Logooutline/SRHoutline.png",
    primary: "#f26522", secondary: "#1a1a1a",
  },
];

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleTeam = (id: string) => {
    if (selectedTeams.includes(id)) {
      setSelectedTeams(prev => prev.filter(t => t !== id));
    } else if (selectedTeams.length < 4) {
      setSelectedTeams(prev => [...prev, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || selectedTeams.length !== 4) return;
    setLoading(true);
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, teams: selectedTeams }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const isSelected = (id: string) => selectedTeams.includes(id);
  const maxReached = selectedTeams.length >= 4;

  return (
    <>
      {/* Navbar */}
      <nav className="ipl-navbar">
        <div className="nav-brand">
          <span className="nav-ipl-badge">🏏</span>
          <div>
            <div className="nav-title-main">TATA IPL</div>
            <div className="nav-title-sub">2026 Prediction</div>
          </div>
        </div>
        <Link href="/dashboard" className="nav-pill-btn">View All Predictions →</Link>
      </nav>

      <main className="page-main">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-watermark">TEAMS</div>
          <p className="hero-eyebrow">
            <span className="eyebrow-line" /> Season 2026 <span className="eyebrow-line" />
          </p>
          <h1 className="hero-h1">Pick Your <em>Top 4</em></h1>
          <p className="hero-desc hindi-desc">
            कृपया, अपने दोस्त की खुशी के लिए, अपनी <em>maturity</em> को एक तरफ रखके, कृपया जवाब दें।
          </p>
        </section>

        <div className="page-container">
          {success ? (
            /* ── Success State ── */
            <div className="success-state">
              <div className="success-trophy">🏆</div>
              <h2>Prediction Locked!</h2>
              <p>Great pick, {username}! Taking you to the board…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* ── Controls Bar ── */}
              <div className="controls-bar">
                {/* Row 1: Name chips */}
                <div className="controls-name-row">
                  <span className="controls-label">Who Are You?</span>
                  
                  {/* Desktop Chips */}
                  <div className="name-chips name-chips-desktop">
                    {USERS.map(u => (
                      <button
                        key={u}
                        type="button"
                        className={`name-chip${username === u ? ' name-chip-active' : ''}`}
                        onClick={() => setUsername(u)}
                      >
                        <span className="name-chip-avatar">{u.charAt(0)}</span>
                        {u}
                      </button>
                    ))}
                  </div>

                  {/* Mobile Dropdown */}
                  <div className="name-dropdown-mobile">
                    <select
                      className="stylish-select"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    >
                      <option value="" disabled>Select your name...</option>
                      {USERS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <div className="select-caret">▼</div>
                  </div>
                </div>

                {/* Row 2: Counter */}
                <div className="controls-counter-row">
                  <span className="counter-label">Teams Selected</span>
                  <div className="counter-pips">
                    {[0,1,2,3].map(i => (
                      <div key={i} className={`pip${i < selectedTeams.length ? ' active' : ''}`} />
                    ))}
                  </div>
                  <span className="counter-num">
                    <strong>{selectedTeams.length}</strong>/4
                  </span>
                </div>
              </div>

              {/* ── Section Label ── */}
              <div className="section-label-row">
                <span className="section-label">Choose 4 Teams for Playoffs</span>
              </div>

              {/* ── Team Grid (IPL Card Design) ── */}
              <div className="ipl-teams-grid">
                {IPL_TEAMS.map(team => {
                  const selected = isSelected(team.id);
                  const disabled = !selected && maxReached;
                  return (
                    <label
                      key={team.id}
                      className={`ipl-card-label${disabled ? ' disabled' : ''}${selected ? ' selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selected}
                        disabled={disabled}
                        onChange={() => toggleTeam(team.id)}
                      />

                      {/* Card itself */}
                      <div
                        className="ipl-card"
                        style={{ '--secondary': team.secondary } as React.CSSProperties}
                      >
                        {/* ─ Top section: primary color + logo + wave ─ */}
                        <div
                          className="ipl-card-top"
                          style={{ background: team.primary }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="ipl-card-logo"
                          />
                        </div>

                        {/* ─ Bottom section: secondary color + name ─ */}
                        <div
                          className="ipl-card-bottom"
                          style={{ background: team.secondary }}
                        >
                          <span className="ipl-card-name">{team.name}</span>
                        </div>

                        {/* ─ Selection overlay ─ */}
                        {selected && (
                          <div className="ipl-card-selected-ring">
                            <div className="ipl-card-check">✓</div>
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* ── Submit Bar ── */}
              <div className="submit-bar">
                <span className={`submit-hint${selectedTeams.length === 4 && username ? ' ready' : ''}`}>
                  {!username
                    ? 'First, select your name above'
                    : selectedTeams.length < 4
                    ? `Select ${4 - selectedTeams.length} more team${4 - selectedTeams.length !== 1 ? 's' : ''}`
                    : '✓ Ready to lock in your prediction!'}
                </span>
                <button
                  type="submit"
                  className="lock-btn"
                  disabled={selectedTeams.length !== 4 || !username || loading}
                >
                  {loading ? (
                    <><span className="lock-btn-spinner" /> Locking In…</>
                  ) : (
                    <>🏆 Lock My Prediction</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
