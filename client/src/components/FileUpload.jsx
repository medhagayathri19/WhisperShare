import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, Clock, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import CopyLink from './CopyLink';
import Loader from './Loader';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.com', '.vbs', '.msi', '.scr',
  '.jar', '.pif', '.hta', '.cpl', '.msc', '.wsf', '.vb', '.reg',
];

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [expiresIn, setExpiresIn] = useState('1h');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    // Check size limit
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File size exceeds 10 MB limit (${formatFileSize(selectedFile.size)}). Please choose a smaller file.`);
      return false;
    }

    // Check restricted executable extensions
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      toast.error(`Executable files (${ext}) are not permitted for security reasons.`);
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && validateFile(selected)) {
      setFile(selected);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.warning('Please select a file to share.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(1);

      const data = await apiService.uploadFile(file, expiresIn, (percent) => {
        setUploadProgress(percent);
      });

      const shareUrl = `${window.location.origin}/file/${data.token}`;
      setResult({
        link: shareUrl,
        expiresAt: data.expiresAt,
        fileName: data.originalFilename,
      });

      toast.success('File uploaded and secured! Save your one-time download link.');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'File upload failed. Please try again.';
      toast.error(errMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    removeFile();
    setExpiresIn('1h');
    setResult(null);
  };

  if (result) {
    return (
      <CopyLink
        link={result.link}
        expiresAt={result.expiresAt}
        type="file"
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="card card-glow-cyan">
      <div className="card-header-icon icon-cyan">
        <UploadCloud size={28} />
      </div>

      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
        Share a <span className="gradient-text-cyan">One-Time File</span>
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Upload any document, image, or archive (up to 10 MB). The file is stored privately on the server and wiped immediately after download.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Drag and Drop Zone */}
        {!file && (
          <div
            className={`file-dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="dropzone-icon">
              <UploadCloud size={32} />
            </div>
            <div className="dropzone-title">
              Drag & Drop file here, or <span style={{ color: 'var(--accent-cyan)' }}>Browse</span>
            </div>
            <div className="dropzone-sub">
              Supports documents, images, audio, data & archives up to 10 MB
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Select File
            </button>
          </div>
        )}

        {/* Selected File Details Box */}
        {file && (
          <div className="selected-file-box">
            <div className="file-info-group">
              <div className="file-icon-badge">
                <File size={24} />
              </div>
              <div className="file-text-details">
                <div className="file-name" title={file.name}>{file.name}</div>
                <div className="file-meta">
                  <span>{formatFileSize(file.size)}</span>
                  <span>&bull;</span>
                  <span>{file.type || 'Binary file'}</span>
                </div>
              </div>
            </div>

            {!uploading && (
              <button
                type="button"
                className="btn-remove-file"
                onClick={removeFile}
                title="Remove selected file"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Upload Progress Indicator */}
        {uploading && (
          <div className="progress-container">
            <div className="progress-label-bar">
              <span>Securing & Uploading File...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Expiration Selector */}
        <div className="form-group" style={{ marginTop: '1.75rem' }}>
          <label className="form-label">
            <span>Link Expiration Window</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              (Unclaimed files are purged by scheduler)
            </span>
          </label>
          <div className="expiry-options">
            <button
              type="button"
              className={`expiry-pill ${expiresIn === '10m' ? 'active' : ''}`}
              onClick={() => setExpiresIn('10m')}
              disabled={uploading}
            >
              <Clock size={16} />
              <span>10 Minutes</span>
            </button>
            <button
              type="button"
              className={`expiry-pill ${expiresIn === '1h' ? 'active' : ''}`}
              onClick={() => setExpiresIn('1h')}
              disabled={uploading}
            >
              <Clock size={16} />
              <span>1 Hour</span>
            </button>
            <button
              type="button"
              className={`expiry-pill ${expiresIn === '24h' ? 'active' : ''}`}
              onClick={() => setExpiresIn('24h')}
              disabled={uploading}
            >
              <Clock size={16} />
              <span>24 Hours</span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-cyan btn-block btn-lg"
          disabled={!file || uploading}
          style={{ marginTop: '1rem' }}
        >
          {uploading ? (
            <Loader size="sm" text={`Uploading ${uploadProgress}%...`} />
          ) : (
            <>
              <Sparkles size={18} />
              <span>Generate One-Time Download Link</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
