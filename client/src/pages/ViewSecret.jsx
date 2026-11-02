import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  Flame,
  File,
  Download,
  Copy,
  Check,
  AlertTriangle,
  XCircle,
  Eye,
  Trash2,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import Loader from '../components/Loader';

export default function ViewSecret() {
  const { token } = useParams();
  const location = useLocation();

  // Determine whether this route is /file/:token or /secret/:token
  const isFileType = location.pathname.startsWith('/file/');

  // States
  const [loading, setLoading] = useState(true);
  const [checkingError, setCheckingError] = useState(null);
  const [itemInfo, setItemInfo] = useState(null);

  // Consumption States
  const [revealing, setRevealing] = useState(false);
  const [revealedMessage, setRevealedMessage] = useState(null);
  const [fileDownloaded, setFileDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. Initial Pre-flight Check on Load
  useEffect(() => {
    let isMounted = true;

    const checkAvailability = async () => {
      try {
        if (!token || token.length !== 64) {
          throw new Error('Invalid or malformed one-time link.');
        }

        if (isFileType) {
          const data = await apiService.getFileInfo(token);
          if (isMounted) setItemInfo(data);
        } else {
          const data = await apiService.getSecretInfo(token);
          if (isMounted) setItemInfo(data);
        }
      } catch (err) {
        if (isMounted) {
          const msg =
            err.response?.data?.message ||
            err.message ||
            'This secret has already been viewed, expired, or does not exist.';
          setCheckingError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAvailability();

    return () => {
      isMounted = false;
    };
  }, [token, isFileType]);

  // Helper format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 2. Reveal Secret Note
  const handleRevealSecret = async () => {
    try {
      setRevealing(true);
      const data = await apiService.claimSecret(token);
      setRevealedMessage(data.message);
      toast.info('Secret revealed! Server copy was permanently destroyed.');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Could not retrieve secret. It may have already been consumed.';
      setCheckingError(msg);
      toast.error(msg);
    } finally {
      setRevealing(false);
    }
  };

  // 3. Claim and Stream Download File
  const handleDownloadFile = async () => {
    try {
      setRevealing(true);
      const claimData = await apiService.claimFile(token);

      // Trigger browser download via stream URL
      const downloadUrl = apiService.getDownloadUrl(claimData.claimTicket);

      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = claimData.originalFilename || 'download';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setFileDownloaded(true);
      toast.success('Download initiated! File is now deleted from the server.');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Download failed. The file may have already been claimed or expired.';
      setCheckingError(msg);
      toast.error(msg);
    } finally {
      setRevealing(false);
    }
  };

  // 4. Copy Decrypted Secret to Clipboard
  const handleCopyMessage = async () => {
    if (!revealedMessage) return;
    try {
      await navigator.clipboard.writeText(revealedMessage);
      setCopied(true);
      toast.success('Copied secret to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Could not copy to clipboard.');
    }
  };

  // 5. Explicitly Destroy Sensitive Data from React State
  const handleDestroyState = () => {
    setRevealedMessage(null);
    setItemInfo(null);
    setCheckingError('This secret was viewed and cleared from your browser.');
    toast.info('Secret wiped from browser memory.');
  };

  // Loading View
  if (loading) {
    return (
      <div className="viewer-wrapper">
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Loader size="lg" text="Verifying one-time token authenticity..." />
        </div>
      </div>
    );
  }

  // Error / Expired / Already Consumed View
  if (checkingError) {
    return (
      <div className="viewer-wrapper">
        <div className="card" style={{ textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div className="card-header-icon icon-danger" style={{ margin: '0 auto 1.5rem' }}>
            <XCircle size={32} />
          </div>

          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
            Content Unavailable
          </h2>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {checkingError}
          </p>

          <div className="warning-banner" style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <AlertTriangle size={20} />
            <div>
              Because WhisperShare enforces strict <strong>burn-on-read</strong> security, once a link is viewed or reaches its expiration timestamp, it is permanently deleted and cannot be restored.
            </div>
          </div>

          <Link to="/" className="btn btn-primary btn-block">
            <ArrowLeft size={16} />
            <span>Create a New Whisper</span>
          </Link>
        </div>
      </div>
    );
  }

  // REVEALED SECRET NOTE VIEW
  if (revealedMessage !== null) {
    return (
      <div className="viewer-wrapper">
        <div className="card card-glow-purple">
          {/* Burned Notification Badge */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div className="burned-badge">
              <Flame size={15} />
              <span>Burned & Scrubbed From Server</span>
            </div>
          </div>

          <h3 style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>
            Confidential Secret Note
          </h3>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            This message was decrypted directly for you. The database record has been permanently deleted.
          </p>

          {/* Secret Message Container */}
          <div className="secret-display-box">
            {revealedMessage}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              onClick={handleCopyMessage}
              className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}
            >
              {copied ? (
                <>
                  <Check size={18} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>Copy Secret</span>
                </>
              )}
            </button>

            <button
              onClick={handleDestroyState}
              className="btn btn-danger"
              title="Clear note from browser screen immediately"
            >
              <Trash2 size={18} />
              <span>Clear Screen</span>
            </button>
          </div>

          {/* Reminder */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Once you close or refresh this tab, this note cannot be retrieved again.
          </div>
        </div>
      </div>
    );
  }

  // FILE DOWNLOADED VIEW
  if (fileDownloaded) {
    return (
      <div className="viewer-wrapper">
        <div className="card card-glow-cyan" style={{ textAlign: 'center' }}>
          <div className="card-header-icon icon-cyan" style={{ margin: '0 auto 1.5rem' }}>
            <Check size={32} />
          </div>

          <div className="burned-badge" style={{ borderColor: 'rgba(6, 182, 212, 0.4)', color: '#67e8f9', background: 'rgba(6, 182, 212, 0.15)' }}>
            <Flame size={15} />
            <span>File Streamed & Wiped from Server</span>
          </div>

          <h2 style={{ fontSize: '1.6rem', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
            Download Complete
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Your file download has started. Per WhisperShare policy, the file has been purged from server storage.
          </p>

          <Link to="/" className="btn btn-outline btn-block">
            <ArrowLeft size={16} />
            <span>Return to WhisperShare Home</span>
          </Link>
        </div>
      </div>
    );
  }

  // PRE-CONFIRMATION SCREEN (Recipient confirms before consuming)
  return (
    <div className="viewer-wrapper">
      <div className="card reveal-box">
        <div className="reveal-icon">
          {isFileType ? <File size={36} /> : <Eye size={36} />}
        </div>

        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
          {isFileType ? 'One-Time File Ready' : 'One-Time Secret Note'}
        </h2>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1rem' }}>
          {isFileType
            ? 'Someone shared a confidential file with you via a secure link.'
            : 'Someone sent you a burn-on-read secret message.'}
        </p>

        {/* File Metadata Preview (if file) */}
        {isFileType && itemInfo && (
          <div className="selected-file-box" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <div className="file-info-group">
              <div className="file-icon-badge">
                <File size={24} />
              </div>
              <div className="file-text-details">
                <div className="file-name" title={itemInfo.originalFilename}>
                  {itemInfo.originalFilename}
                </div>
                <div className="file-meta">
                  <span>{formatFileSize(itemInfo.fileSize)}</span>
                  <span>&bull;</span>
                  <span>{itemInfo.mimeType || 'Binary file'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expiry Notification */}
        {itemInfo?.expiresAt && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <Clock size={15} />
            <span>Expires: {new Date(itemInfo.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
          </div>
        )}

        {/* Burn Warning */}
        <div className="warning-banner" style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <AlertTriangle size={20} />
          <div>
            <strong>Single-Use Guarantee:</strong> Clicking{' '}
            <strong>{isFileType ? 'Download File' : 'Reveal Secret'}</strong> will permanently destroy this link on the server. Make sure you are ready to view or save it now!
          </div>
        </div>

        {/* Primary Action Button */}
        {isFileType ? (
          <button
            onClick={handleDownloadFile}
            className="btn btn-cyan btn-block btn-lg"
            disabled={revealing}
          >
            {revealing ? (
              <Loader size="sm" text="Claiming & Streaming..." />
            ) : (
              <>
                <Download size={20} />
                <span>Download File (One-Time)</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleRevealSecret}
            className="btn btn-primary btn-block btn-lg"
            disabled={revealing}
          >
            {revealing ? (
              <Loader size="sm" text="Decrypting & Destroying Server Copy..." />
            ) : (
              <>
                <Flame size={20} />
                <span>Reveal Secret Note</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
