import React, { useState } from 'react';
import { Copy, Check, AlertTriangle, ExternalLink, RefreshCw, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CopyLink({ link, expiresAt, type = 'secret', onReset }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = link;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Failed to copy automatically. Please copy the link manually.');
    }
  };

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
    : 'in the specified window';

  return (
    <div className="copy-link-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h4 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="gradient-text">Your One-Time Link is Ready!</span>
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Clock size={15} />
          <span>Expires: {formattedExpiry}</span>
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem' }}>
        Send this link to the intended recipient. Once they open and reveal it, the content will be permanently burned from existence.
      </p>

      {/* Copy Link Input Bar */}
      <div className="link-input-group">
        <input
          type="text"
          readOnly
          value={link}
          className="link-input"
          onClick={(e) => e.target.select()}
        />
        <button
          onClick={handleCopy}
          className={`btn btn-sm ${copied ? 'btn-success' : 'btn-primary'}`}
          style={{ whiteSpace: 'nowrap' }}
        >
          {copied ? (
            <>
              <Check size={16} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>

      {/* Warning Notice */}
      <div className="warning-banner" style={{ marginBottom: '1.5rem' }}>
        <AlertTriangle size={20} />
        <div>
          <strong>Burn-on-Read Warning:</strong> This link can only be accessed once. Do not test-open this link yourself, or it will be permanently deleted and the intended recipient will not be able to retrieve it!
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.85rem' }}
        >
          <ExternalLink size={15} />
          <span>Open Link Directly</span>
        </a>

        {onReset && (
          <button onClick={onReset} className="btn btn-primary btn-sm">
            <RefreshCw size={15} />
            <span>Create Another {type === 'file' ? 'File' : 'Secret'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
