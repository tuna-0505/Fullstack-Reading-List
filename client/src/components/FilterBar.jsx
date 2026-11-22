import React from 'react';

const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];

const FilterBar = ({ filters, onChange }) => {
  const handleField = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', padding: '12px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <input
        type="text"
        placeholder="Search title or author..."
        value={filters.q}
        onChange={(e) => handleField('q', e.target.value)}
        style={{ padding: '6px 10px', flex: 1, minWidth: '180px' }}
      />

      <select value={filters.genre} onChange={(e) => handleField('genre', e.target.value)} style={{ padding: '6px' }}>
        <option value="">All Genres</option>
        {GENRES.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      <select value={filters.read} onChange={(e) => handleField('read', e.target.value)} style={{ padding: '6px' }}>
        <option value="">All Status</option>
        <option value="true">Read</option>
        <option value="false">Unread</option>
      </select>

      <select value={filters.sort} onChange={(e) => handleField('sort', e.target.value)} style={{ padding: '6px' }}>
        <option value="id">Sort: Default (ID)</option>
        <option value="title">Sort: Title</option>
        <option value="author">Sort: Author</option>
        <option value="year">Sort: Year</option>
        <option value="rating">Sort: Rating</option>
      </select>

      <select value={filters.order} onChange={(e) => handleField('order', e.target.value)} style={{ padding: '6px' }}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  );
};

export default FilterBar;
