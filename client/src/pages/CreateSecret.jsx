import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Check } from 'lucide-react';
import SecretForm from '../components/SecretForm';

export default function CreateSecret() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Secret Creation Form Component */}
      <SecretForm />

      {/* Additional Privacy Guidance */}
      <div
        style={{
          marginTop: '2.5rem',
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} color="var(--accent-cyan)" />
          <span>How Your Secret Is Protected</span>
        </h4>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Check size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>Encrypted with an authenticated cipher (AES-256-GCM) with unique per-secret nonces before ever saving to disk.</span>
          </li>
          <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Check size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>Only the SHA-256 hash of the token is kept on the server. The raw token in the link is never stored in the database.</span>
          </li>
          <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Check size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>Atomic operations guarantee single-read behavior: the moment the note is read, it is destroyed immediately.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
