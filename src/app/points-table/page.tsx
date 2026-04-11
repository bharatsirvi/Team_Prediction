"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

const TEAM_LOGOS: Record<string, string> = {
  CSK: "https://documents.iplt20.com/ipl/CSK/logos/Logooutline/CSKoutline.png",
  DC: "https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png",
  GT: "https://documents.iplt20.com/ipl/GT/Logos/Logooutline/GToutline.png",
  LSG: "https://documents.iplt20.com/ipl/LSG/Logos/Logooutline/LSGoutline.png",
  MI: "https://documents.iplt20.com/ipl/MI/Logos/Logooutline/MIoutline.png",
  PBKS: "https://documents.iplt20.com/ipl/PBKS/Logos/Logooutline/PBKSoutline.png",
  KKR: "https://documents.iplt20.com/ipl/KKR/Logos/Logooutline/KKRoutline.png",
  RCB: "https://documents.iplt20.com/ipl/RCB/Logos/Logooutline/RCBoutline.png",
  RR: "https://documents.iplt20.com/ipl/RR/Logos/Logooutline/RRoutline.png",
  SRH: "https://documents.iplt20.com/ipl/SRH/Logos/Logooutline/SRHoutline.png",
};

const TEAM_COLORS: Record<string, string> = {
  CSK: '#f5c518', DC: '#17479e', GT: '#1c3455', LSG: '#a72132',
  MI: '#004ba0', PBKS: '#c8102e', KKR: '#3d1f6e', RCB: '#c8102e',
  RR: '#e91e8c', SRH: '#f26522',
};

function fmtDt(ts: string) {
  if (!ts) return '';
  const d = new Date(parseInt(ts));
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function PointsTablePage() {
  const [pointsTable, setPointsTable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user));

    fetch('/api/stats/points-table')
      .then(r => r.json())
      .then(data => {
        if (data.pointsTable && data.pointsTable[0]) {
          setPointsTable(data.pointsTable[0].pointsTableInfo || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openTeamDetail = (team: any) => {
    setSelectedTeam(team);
    setShowSheet(true);
  };

  return (
    <>
      <Navbar />

      <main className="page-main">
        <div className="db-hero">
          <div className="hero-watermark">STATS</div>
          <p className="hero-eyebrow"><span className="eyebrow-line" /> TATA IPL 2026 <span className="eyebrow-line" /></p>
          <h1 className="hero-h1">Live <em>Standings</em></h1>
        </div>

        <div className="points-table-container">
          {!user ? (
            <div className="center-box auth-locked-box">
              <div className="lock-icon">🔒</div>
              <h3>Private Standings</h3>
              <p>Please login to view the live tournament statistics and match outcomes.</p>
              <Link href="/sign-in?redirect=/points-table" className="lock-btn">Sign In to View →</Link>
            </div>
          ) : loading ? (
            <div className="center-box"><div className="spinner" /></div>
          ) : (
            <div className="table-wrapper">
              <table className="stylish-table">
                <thead>
                  <tr>
                    <th className="th-center">POS</th>
                    <th>Team</th>
                    <th className="th-center">P</th>
                    <th className="th-center">W</th>
                    <th className="th-center">L</th>
                    <th className="th-center">NR</th>
                    <th className="th-center hide-mobile">NRR</th>
                    <th className="th-center">Points</th>
                    <th className="th-center hide-mobile">Form</th>
                  </tr>
                </thead>
                <tbody>
                  {pointsTable.map((team, idx) => {
                    const code = team.teamName;
                    const logo = TEAM_LOGOS[code] || '';
                    const color = TEAM_COLORS[code] || '#f5a623';
                    const formArray = Array.isArray(team.form) ? team.form.slice(-5) : [];

                    return (
                      <tr key={team.teamId} className={idx < 4 ? 'top-4' : ''}>
                        <td className="td-pos">{idx + 1}</td>
                        <td className="td-team">
                          <div className="team-cell">
                            <div className="team-logo-card" style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}>
                              {logo ? <img src={logo} alt={code} className="table-team-logo" /> : <span style={{ color, fontWeight: 900 }}>{code}</span>}
                            </div>
                            <div className="team-info">
                              <span className="team-full desktop-label">{team.teamFullName || 'Unknown'}</span>
                              <span className="team-short mobile-label" style={{ color }}>{code}</span>
                            </div>
                          </div>
                        </td>
                        <td className="td-center">{team.matchesPlayed || 0}</td>
                        <td className="td-center">{team.matchesWon || 0}</td>
                        <td className="td-center">{team.matchesLost || 0}</td>
                        <td className="td-center">{team.noRes || 0}</td>
                        <td className="td-center nrr hide-mobile">{team.nrr || '0.000'}</td>
                        <td className="td-center td-pts">
                          <div className="pts-info-flex">
                            <strong>{team.points || 0}</strong>
                            <button className="info-circle-btn" onClick={() => openTeamDetail(team)}>
                              ⓘ
                            </button>
                          </div>
                        </td>
                        <td className="td-center hide-mobile">
                          <div className="form-row">
                            {formArray.map((res: string, i: number) => (
                              <span key={i} className={`form-badge ${res.toUpperCase()}`} style={{ backgroundColor: res.toUpperCase() === 'W' ? '#22c55e' : (res.toUpperCase() === 'L' ? '#ef4444' : (res.toUpperCase() === 'N' ? '#64748b' : '#334155')) }}>
                                {res.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* REFINED GAPLESS PREMIUM BOTTOM SHEET */}
      <div className={`bottom-sheet-overlay ${showSheet ? 'active' : ''}`} onClick={() => setShowSheet(false)}>
        <div className={`bottom-sheet ${showSheet ? 'active' : ''}`} style={{ padding: 0 }} onClick={e => e.stopPropagation()}>
          {selectedTeam && (
            <div className="sheet-inner">
              <div className="sheet-hero-banner gapless-header" style={{ background: `linear-gradient(135deg, ${TEAM_COLORS[selectedTeam.teamName]}, ${TEAM_COLORS[selectedTeam.teamName]}cc)`, paddingTop: '30px' }}>
                <div className="floating-sheet-handle" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
                  <img src={TEAM_LOGOS[selectedTeam.teamName]} alt="" className="hero-sheet-logo" />
                  <div className="hero-titles">
                    <h2>{selectedTeam.teamFullName || 'Team Details'}</h2>
                    <div className="hero-rank-badge">RANK #{pointsTable.indexOf(selectedTeam) + 1}</div>
                  </div>
                </div>
                <button className="sheet-abs-close" onClick={() => setShowSheet(false)}>×</button>
              </div>

              <div className="sheet-body">
                <div className="premium-stats-grid">
                  <div className="p-stat-card">
                    <span className="p-val">{selectedTeam.matchesPlayed || 0}</span>
                    <span className="p-lab">MATCHES</span>
                  </div>
                  <div className="p-stat-card win">
                    <span className="p-val">{selectedTeam.matchesWon || 0}</span>
                    <span className="p-lab">WINS</span>
                  </div>
                  <div className="p-stat-card loss">
                    <span className="p-val">{selectedTeam.matchesLost || 0}</span>
                    <span className="p-lab">LOSSES</span>
                  </div>
                  <div className="p-stat-card pts-main">
                    <span className="p-val">{selectedTeam.points || 0}</span>
                    <span className="p-lab">POINTS</span>
                  </div>
                </div>

                <div className="sheet-section-title">Match Performance History</div>
                <div className="history-timeline">
                  {selectedTeam.teamMatches?.length > 0 ? selectedTeam.teamMatches.map((match: any, i: number) => {
                    const isWin = match.winner === selectedTeam.teamId;
                    const isFinished = !!match.result;
                    const isNoResult = match.result?.toLowerCase().includes('no result');
                    
                    return (
                      <div key={i} className={`timeline-item ${!isFinished ? 'upcoming' : ''}`}>
                        <div className="item-left">
                          <div className={`status-marker ${isFinished ? (isNoResult ? 'N' : (isWin ? 'W' : 'L')) : 'U'}`}>
                            {isFinished ? (isNoResult ? 'N' : (isWin ? 'W' : 'L')) : '•'}
                          </div>
                          <div className="item-line" />
                        </div>
                        <div className="item-right">
                          <div className="item-head">
                            <span className="vs-opponent">vs {match.opponent || 'Unknown'}</span>
                            <span className="match-tag">{match.matchName || 'Match'}</span>
                          </div>
                          <div className="item-foot">
                            <span className="match-result-text">{match.result || 'Fixture Scheduled'}</span>
                            <span className="match-timestamp">{fmtDt(match.startdt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="no-data-msg">No matches found for this team.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
