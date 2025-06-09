import React from 'react';

export default function CardLateral({ children }) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '1.5rem',
        minWidth: '260px',
        transition: 'transform 0.2s ease-in-out',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {children}
    </div>
  );
}
