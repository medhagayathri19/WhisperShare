import React, { useState } from 'react';
import { Lock, Clock, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import CopyLink from './CopyLink';
import Loader from './Loader';

const MAX_CHARS = 50000;

export default function SecretForm() {
  const [message, setMessage] = useState('');
  const [expiresIn, setExpiresIn] = useState('1h');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.warning('Please enter a secret message to encrypt.');
      return;
    }

    try {
      setLoading(true);
      const data = await apiService.createSecret(message.trim(), expiresIn);
      
      const shareUrl = `${window.location.origin}/secret/${data.token}`;
      setResult({
        link: shareUrl,
        expiresAt: data.expiresAt,
      });

      toast.success('Secret encrypted & one-time link generated!');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to generate secure link. Please try again.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessage('');
    setExpiresIn('1h');
    setResult(null);
  };

  if (result) {
    return (
      <CopyLink
        link={result.link}
        expiresAt={result.expiresAt}
        type="secret"
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="card card-glow-purple">
      <div className="card-header-icon icon-purple">
        <Lock size={28} />
      </div>

      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
        Create a <span className="gradient-text">Burn-on-Read Secret</span>
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Your message is encrypted with military-grade AES-256-GCM. Once decrypted by the recipient, it is permanently wiped from the database.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Message Input */}
        <div className="form-group">
          <div className="form-label">
            <span>Confidential Message</span>
            <span className="form-counter" style={{ color: message.length > MAX_CHARS * 0.9 ? 'var(--danger)' : 'var(--text-muted)' }}>
              {message.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
            </span>
          </div>
          <textarea
            className="form-textarea"
            placeholder="Type or paste passwords, private keys, sensitive notes, or credentials here..."
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
            rows={7}
            disabled={loading}
            autoFocus
          />
        </div>

        {/* Expiration Selector */}
        <div className="form-group">
          <label className="form-label">
            <span>Self-Destruct Lifetime</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              (If unopened, disappears automatically)
            </span>
          </label>
          <div className="expiry-options">
            <button
              type="button"
              className={`expiry-pill ${expiresIn === '10m' ? 'active' : ''}`}
              onClick={() => setExpiresIn('10m')}
              disabled={loading}
            >
              <Clock size={16} />
              <span>10 Minutes</span>
            </button>
            <button
              type="button"
              className={`expiry-pill ${expiresIn === '1h' ? 'active' : ''}`}
              onClick={() => setExpiresIn('1h')}
              disabled={loading}
            >
              <Clock size={16} />
              <span>1 Hour</span>
            </button>
            <button
              type="button"
              className={`expiry-pill ${expiresIn === '24h' ? 'active' : ''}`}
              onClick={() => setExpiresIn('24h')}
              disabled={loading}
            >
              <Clock size={16} />
              <span>24 Hours</span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={loading || !message.trim()}
        >
          {loading ? (
            <Loader size="sm" text="Encrypting & Locking with AES-256-GCM..." />
          ) : (
            <>
              <Sparkles size={18} />
              <span>Generate Secure Link</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
