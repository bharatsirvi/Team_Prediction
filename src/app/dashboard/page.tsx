"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Prediction = { id: number; username: string; teams: string[]; timestamp: string; };

const TEAM_LOGOS: Record<string, string> = {
  CSK:  "https://documents.iplt20.com/ipl/CSK/logos/Logooutline/CSKoutline.png",
  DC:   "https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png",
  GT:   "https://documents.iplt20.com/ipl/GT/Logos/Logooutline/GToutline.png",
  LSG:  "https://documents.iplt20.com/ipl/LSG/Logos/Logooutline/LSGoutline.png",
  MI:   "https://documents.iplt20.com/ipl/MI/Logos/Logooutline/MIoutline.png",
  PBKS: "https://documents.iplt20.com/ipl/PBKS/Logos/Logooutline/PBKSoutline.png",
  KKR:  "https://documents.iplt20.com/ipl/KKR/Logos/Logooutline/KKRoutline.png",
  RCB:  "https://documents.iplt20.com/ipl/RCB/Logos/Logooutline/RCBoutline.png",
  RR:   "https://documents.iplt20.com/ipl/RR/Logos/Logooutline/RRoutline.png",
  SRH:  "https://documents.iplt20.com/ipl/SRH/Logos/Logooutline/SRHoutline.png",
};

const TEAM_COLORS: Record<string, string> = {
  CSK: '#f5c518', DC: '#17479e', GT: '#1c3455', LSG: '#a72132',
  MI: '#004ba0', PBKS: '#c8102e', KKR: '#3d1f6e', RCB: '#c8102e',
  RR: '#e91e8c', SRH: '#f26522',
};

const USER_GRADIENTS: Record<string, [string,string]> = {
  Avirat:  ['#f5a623','#ff6b1a'],
  Shaurya: ['#00c6ff','#0066ff'],
  Devesh:  ['#a855f7','#6d28d9'],
  Rajat:   ['#22c55e','#15803d'],
  Sourabh: ['#f43f5e','#be123c'],
};

function fmtDate(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function Dashboard() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/predictions')
      .then(r => r.json())
      .then(d => { setPredictions(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const mostPicked = (() => {
    const freq: Record<string, number> = {};
    predictions.forEach(p => p.teams.forEach(t => { freq[t] = (freq[t]||0)+1; }));
    if (Object.keys(freq).length === 0) return [] as string[];
    const maxCount = Math.max(...Object.values(freq));
    return Object.entries(freq)
      .filter(([, count]) => count === maxCount)
      .map(([team]) => team);
  })();

  return (
    <>
      <nav className="ipl-navbar">
        <div className="nav-brand">
          <span className="nav-ipl-badge">🏏</span>
          <div>
            <div className="nav-title-main">TATA IPL</div>
            <div className="nav-title-sub">2026 Prediction</div>
          </div>
        </div>
        <Link href="/" className="nav-pill-btn">← Make Prediction</Link>
      </nav>

      <main className="page-main">
        <div className="db-hero">
          <div className="hero-watermark">PICKS</div>
          <p className="hero-eyebrow">
            <span className="eyebrow-line" /> Live Results <span className="eyebrow-line" />
          </p>
          <h1 className="hero-h1">Predictions <em>Board</em></h1>
          <p className="hero-desc hindi-desc">बहुत बहुत धन्यवाद, मेरे लिए <em>unmature</em> बनने के लिए</p>
        </div>

        {!loading && predictions.length > 0 && (
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-number">{predictions.length}</div>
              <div className="stat-label">Total Predictions</div>
            </div>
            <div className="stat-card">
              <div className="stat-most-picked">
                {mostPicked.length === 0 ? (
                  <span style={{ color: 'var(--ipl-gold)' }}>—</span>
                ) : (
                  mostPicked.map(team => (
                    <span
                      key={team}
                      className="most-picked-chip"
                      style={{ color: TEAM_COLORS[team] ?? 'var(--ipl-gold)', borderColor: `${TEAM_COLORS[team] ?? '#f5a623'}44` }}
                    >
                      {team}
                    </span>
                  ))
                )}
              </div>
              <div className="stat-label">Most Popular Pick{mostPicked.length > 1 ? 's' : ''}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="center-box">
            <div className="spinner" />
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Loading predictions…</p>
          </div>
        ) : predictions.length === 0 ? (
          <div className="center-box">
            <div className="empty-icon">🏏</div>
            <div className="empty-title">No Predictions Yet</div>
            <p className="empty-sub">Be the first to lock in your Top 4 teams for IPL 2026!</p>
            <Link href="/" className="lock-btn" style={{ marginTop: 8 }}>
              Make First Prediction →
            </Link>
          </div>
        ) : (
          <div className="pred-grid">
            {predictions.map((pred, idx) => {
              const [g1, g2] = USER_GRADIENTS[pred.username] ?? ['#f5a623','#ff6b1a'];
              return (
                <div key={pred.id} className="pred-card">
                  <div className="pred-user-row">
                    <div
                      className="pred-avatar"
                      style={{ background: `linear-gradient(135deg,${g1},${g2})` }}
                    >
                      {pred.username.charAt(0)}
                    </div>
                    <div>
                      <div className="pred-name">{pred.username}</div>
                      <div className="pred-time" suppressHydrationWarning>{fmtDate(pred.timestamp)}</div>
                    </div>
                  </div>
                  <div className="pred-teams-row">
                    {pred.teams.map(team => (
                      <div
                        key={team}
                        className="pred-team-chip"
                        style={{ borderColor: `${TEAM_COLORS[team] ?? '#fff'}33` }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={TEAM_LOGOS[team]}
                          alt={team}
                          className="pred-team-logo"
                          onError={e => { (e.target as HTMLImageElement).style.display='none'; }}
                        />
                        <div
                          className="pred-team-code"
                          style={{ color: TEAM_COLORS[team] ?? 'rgba(255,255,255,0.5)' }}
                        >
                          {team}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
