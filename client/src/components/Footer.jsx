import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import apiService from '../services/api';

const currentYear = new Date().getFullYear();

export default function Footer() {
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;
    apiService
      .checkHealth()
      .then((data) => {
        if (isMounted) {
          setServerStatus(data.database?.connected ? 'online' : 'degraded');
        }
      })
      .catch(() => {
        if (isMounted) setServerStatus('offline');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Information */}
        <div className="footer-brand">
          <Link to="/" className="brand-logo" style={{ marginBottom: '0.75rem' }}>
            <div className="brand-icon">
              <ShieldCheck size={20} />
            </div>
            <span>Whisper<span className="gradient-text">Share</span></span>
          </Link>
          <p>
            Zero-knowledge, burn-on-read messaging and file distribution. Once opened,
            all traces are permanently scrubbed from the database and storage.
          </p>

          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: serverStatus === 'online' ? '#10b981' : serverStatus === 'degraded' ? '#f59e0b' : '#ef4444',
                boxShadow: serverStatus === 'online' ? '0 0 8px #10b981' : 'none',
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>
              Backend & DB:{' '}
              <strong style={{ color: serverStatus === 'online' ? '#34d399' : '#f87171' }}>
                {serverStatus.toUpperCase()}
              </strong>
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h5>Core Features</h5>
          <ul className="footer-links">
            <li><Link to="/create-secret">Share Secret Note</Link></li>
            <li><Link to="/share-file">One-Time File Upload</Link></li>
            <li><a href="/#how-it-works">How It Works</a></li>
            <li><a href="/#security">Security Architecture</a></li>
          </ul>
        </div>

        {/* Security Disclaimers */}
        <div className="footer-col">
          <h5>Privacy Guarantee</h5>
          <ul className="footer-links">
            <li><span style={{ color: 'var(--text-muted)' }}>AES-256-GCM Encryption</span></li>
            <li><span style={{ color: 'var(--text-muted)' }}>Atomic Deletion</span></li>
            <li><span style={{ color: 'var(--text-muted)' }}>Automatic TTL Expiry</span></li>
            <li><span style={{ color: 'var(--text-muted)' }}>No Persistent Storage</span></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          &copy; {currentYear} WhisperShare. Secure Confidential Communication.
        </div>
        <div>
          Built with React &bull; Express &bull; MongoDB &bull; Node.js Crypto
        </div>
      </div>
    </footer>
  );
}
