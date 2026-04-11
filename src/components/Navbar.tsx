"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user));

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' });
    router.push('/sign-in');
    router.refresh();
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Point Table', href: '/points-table' },
    { name: 'Board', href: '/dashboard' },
  ];

  return (
    <>
      <nav className={`unified-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <Link href="/" className="nav-brand-pill">
            <span className="brand-emoji">🏏</span>
            <span className="brand-text-desktop">TATA IPL</span>
          </Link>

          <div className="nav-tabs-pill">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isPointsTable = link.name === 'Point Table';
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-tab ${isActive ? 'active' : ''} ${isPointsTable ? 'hide-mobile' : ''}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="nav-user-pill">
            {user ? (
              <div className="user-dropdown-container">
                <button className="user-trigger" onClick={() => setShowMenu(!showMenu)}>
                  <div className="user-avatar-bubble">
                    <span className="user-initial">{user.name.charAt(0)}</span>
                  </div>
                  <span className="user-name-desktop desktop-label">{user.name}</span>
                </button>
                {showMenu && (
                  <div className="user-dropdown-menu">
                    <div className="menu-info">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <div className="menu-divider" />
                    <button onClick={handleSignOut} className="menu-item logout">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/sign-in" className="login-btn-pill">Login</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile FAB (Only on Board/Dashboard, hidden on Home as it has the footer) */}
      {pathname !== '/points-table' && pathname !== '/' && (
        <Link href="/points-table" className="mobile-stats-fab">
          <span className="fab-text">Points Table</span>
        </Link>
      )}
    </>
  );
}
