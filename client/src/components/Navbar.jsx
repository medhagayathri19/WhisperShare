import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, FileUp, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMobileOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={closeMenu}>
          <div className="brand-icon">
            <ShieldCheck size={22} />
          </div>
          <span>Whisper<span className="gradient-text">Share</span></span>
          <span className="brand-badge">Burn-On-Read</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={closeMenu}
          >
            Home
          </Link>
          <a
            href="/#how-it-works"
            className="nav-link"
            onClick={closeMenu}
          >
            How It Works
          </a>
          <a
            href="/#security"
            className="nav-link"
            onClick={closeMenu}
          >
            Security
          </a>

          <Link
            to="/create-secret"
            className={`nav-btn ${location.pathname === '/create-secret' ? 'active-btn' : ''}`}
            onClick={closeMenu}
          >
            <Lock size={16} />
            <span>New Secret</span>
          </Link>

          <Link
            to="/share-file"
            className={`nav-btn ${location.pathname === '/share-file' ? 'active-btn' : ''}`}
            style={{ borderColor: 'rgba(6, 182, 212, 0.4)', background: 'rgba(6, 182, 212, 0.12)' }}
            onClick={closeMenu}
          >
            <FileUp size={16} color="#38bdf8" />
            <span style={{ color: '#bae6fd' }}>Share File</span>
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
