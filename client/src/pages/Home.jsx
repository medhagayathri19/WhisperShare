import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  FileUp,
  Flame,
  KeyRound,
  EyeOff,
  Clock,
  HardDriveDownload,
  Zap,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-pill">
          <Zap size={14} />
          <span>Next-Generation Ephemeral Data Security</span>
        </div>

        <h1 className="hero-title">
          Share Secrets. <span className="gradient-text">Leave No Trace.</span>
        </h1>

        <p className="hero-subtitle">
          Send confidential messages and files with secure one-time links.
          Once the recipient opens the link, the shared content is permanently burned from the database and storage.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/create-secret" className="btn btn-primary btn-lg">
            <Lock size={20} />
            <span>Share a Secret Note</span>
          </Link>
          <Link to="/share-file" className="btn btn-cyan btn-lg">
            <FileUp size={20} />
            <span>Share a File</span>
          </Link>
        </div>
      </section>

      {/* Two Main Cards Grid */}
      <section className="dual-cards-grid">
        {/* Card 1: Share a Secret Note */}
        <div className="card feature-card card-glow-purple">
          <div className="feature-card-content">
            <div className="card-header-icon icon-purple">
              <Lock size={28} />
            </div>
            <h3>Burn-on-Read Secret Notes</h3>
            <p>
              Encrypt API keys, passwords, private keys, or confidential instructions. Links self-destruct immediately after viewing.
            </p>
            <ul className="feature-bullets">
              <li>
                <CheckCircle2 size={17} />
                <span>Encrypted using authenticated AES-256-GCM</span>
              </li>
              <li>
                <CheckCircle2 size={17} />
                <span>Single-use unguessable 256-bit crypto tokens</span>
              </li>
              <li>
                <CheckCircle2 size={17} />
                <span>Atomic MongoDB deletion prevents race conditions</span>
              </li>
              <li>
                <CheckCircle2 size={17} />
                <span>Configurable expiration: 10m, 1h, or 24h</span>
              </li>
            </ul>
          </div>
          <Link to="/create-secret" className="btn btn-primary btn-block">
            <span>Create Secret Note</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Card 2: Share a File */}
        <div className="card feature-card card-glow-cyan">
          <div className="feature-card-content">
            <div className="card-header-icon icon-cyan">
              <FileUp size={28} />
            </div>
            <h3>One-Time File Sharing</h3>
            <p>
              Securely transmit sensitive files, PDFs, spreadsheets, or archives up to 10 MB. Deleted from disk upon download completion.
            </p>
            <ul className="feature-bullets">
              <li>
                <CheckCircle2 size={17} />
                <span>Supports files up to 10 MB with type validation</span>
              </li>
              <li>
                <CheckCircle2 size={17} />
                <span>Stored in private, unexposed server directories</span>
              </li>
              <li>
                <CheckCircle2 size={17} />
                <span>Stream-and-destroy cleanup upon download finish</span>
              </li>
              <li>
                <CheckCircle2 size={17} />
                <span>Automated hourly orphan cleanup via node-cron</span>
              </li>
            </ul>
          </div>
          <Link to="/share-file" className="btn btn-cyan btn-block">
            <span>Upload Secure File</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section">
        <div className="section-header">
          <span className="section-tag">Process</span>
          <h2 className="section-title">How WhisperShare Works</h2>
          <p className="section-subtitle">
            Three simple steps ensuring military-grade zero-retention secrecy.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">01</span>
            <div className="step-icon-wrap">
              <KeyRound size={24} />
            </div>
            <h4>1. Encrypt & Generate</h4>
            <p>
              Input your message or attach a file. The server computes a 256-bit cryptographic token, encrypts data with AES-256-GCM, and stores only the SHA-256 token hash.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">02</span>
            <div className="step-icon-wrap" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
              <HardDriveDownload size={24} />
            </div>
            <h4>2. Share One-Time Link</h4>
            <p>
              Copy the unique URL containing the original raw token. Send it via chat, email, or SMS. Nobody else can guess or brute-force this link.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">03</span>
            <div className="step-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
              <Flame size={24} />
            </div>
            <h4>3. Burn-on-Read Permanently</h4>
            <p>
              When the recipient confirms and views or downloads the payload, atomic operations completely eradicate the data from memory, disk, and database.
            </p>
          </div>
        </div>
      </section>

      {/* Security Features Section */}
      <section id="security" className="section">
        <div className="section-header">
          <span className="section-tag">Zero-Trust Architecture</span>
          <h2 className="section-title">Engineered for Absolute Privacy</h2>
          <p className="section-subtitle">
            Our multi-layered security protocol guarantees data cannot be recovered once consumed.
          </p>
        </div>

        <div className="security-grid">
          <div className="security-item">
            <Lock className="security-icon" size={26} />
            <h4>AES-256-GCM Encryption</h4>
            <p>
              Industry-standard authenticated encryption ensures confidentiality and prevents unauthorized tampering.
            </p>
          </div>

          <div className="security-item">
            <Flame className="security-icon" size={26} style={{ color: 'var(--danger)' }} />
            <h4>Atomic Deletion</h4>
            <p>
              MongoDB atomic <code>findOneAndDelete</code> eliminates race conditions so multiple concurrent requests cannot duplicate data retrieval.
            </p>
          </div>

          <div className="security-item">
            <EyeOff className="security-icon" size={26} />
            <h4>Token Hashing</h4>
            <p>
              Only SHA-256 hashes of tokens are stored in the database. Even if the database was compromised, raw tokens cannot be recovered.
            </p>
          </div>

          <div className="security-item">
            <Clock className="security-icon" size={26} />
            <h4>Dual Auto-Expiration</h4>
            <p>
              MongoDB TTL indexes automatically remove stale metadata, while scheduled background <code>node-cron</code> tasks clean up disk files.
            </p>
          </div>

          <div className="security-item">
            <ShieldCheck className="security-icon" size={26} />
            <h4>Rate Limiting & Helmet</h4>
            <p>
              Strict API rate limiters defend against brute-force attacks, while Helmet sets hardened HTTP security headers.
            </p>
          </div>

          <div className="security-item">
            <Zap className="security-icon" size={26} />
            <h4>No-Store Cache Control</h4>
            <p>
              All sensitive retrieval endpoints instruct proxies and browsers to avoid disk or memory caching with <code>no-store</code> headers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
