import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Check } from 'lucide-react';
import FileUpload from '../components/FileUpload';

export default function ShareFile() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* File Upload Component */}
      <FileUpload />

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
          <ShieldAlert size={18} color="var(--accent-purple-light)" />
          <span>One-Time File Lifecycle</span>
        </h4>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Check size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>Files are assigned cryptographically unguessable filenames and stored in non-public folders on the server.</span>
          </li>
          <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Check size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>When the recipient downloads the file, it is securely streamed and instantly deleted from disk on finish.</span>
          </li>
          <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Check size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>If the recipient never accesses the file within the expiration window, the automated cleanup daemon purges it completely.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
