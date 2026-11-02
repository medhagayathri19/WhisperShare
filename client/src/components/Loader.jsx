import React from 'react';

export default function Loader({ size = 'md', text = 'Securing transmission...' }) {
  const isLarge = size === 'lg';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', gap: '1rem' }}>
      <div className={`spinner ${isLarge ? 'spinner-lg' : ''}`} />
      {text && (
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.3px' }}>
          {text}
        </span>
      )}
    </div>
  );
}
