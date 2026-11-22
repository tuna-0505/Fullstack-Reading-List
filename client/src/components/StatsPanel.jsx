import React from 'react';

const StatsPanel = ({ stats }) => {
  if (!stats) return null;

  return (
    <div style={{ padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '20px', border: '1px solid #cbd5e1' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Library Statistics</h3>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px' }}>
        <span><strong>Total:</strong> {stats.total}</span>
        <span><strong>Read:</strong> {stats.read}</span>
        <span><strong>Unread:</strong> {stats.unread}</span>
        <span><strong>Avg Rating:</strong> {stats.averageRating !== null ? `${stats.averageRating} / 5` : 'N/A'}</span>
      </div>
      {Object.keys(stats.byGenre).length > 0 && (
        <div style={{ marginTop: '8px', fontSize: '13px', color: '#475569' }}>
          <strong>By Genre:</strong>{' '}
          {Object.entries(stats.byGenre)
            .map(([genre, count]) => `${genre}: ${count}`)
            .join(' | ')}
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
