import React from 'react';

const BookItem = ({ book, onToggleRead, onRate, onEdit, onDelete, busy }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#ffffff', flexWrap: 'wrap', gap: '10px' }}>
      <div>
        <h4 style={{ margin: '0 0 4px 0' }}>
          {book.title} <span style={{ fontWeight: 'normal', color: '#64748b', fontSize: '14px' }}>({book.year})</span>
        </h4>
        <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
          by <strong>{book.author}</strong> &bull; Genre: <em>{book.genre}</em>
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => onToggleRead(book)}
          disabled={busy}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            border: '1px solid #cbd5e1',
            backgroundColor: book.read ? '#dcfce7' : '#f1f5f9',
            color: book.read ? '#166534' : '#334155',
            cursor: 'pointer'
          }}
        >
          {book.read ? '✓ Read' : 'Mark Read'}
        </button>

        {book.read && (
          <select
            value={book.rating !== null ? String(book.rating) : ''}
            onChange={(e) => onRate(book.id, e.target.value === '' ? null : Number(e.target.value))}
            disabled={busy}
            style={{ padding: '5px', borderRadius: '4px' }}
          >
            <option value="">Unrated</option>
            <option value="1">1 ★</option>
            <option value="2">2 ★★</option>
            <option value="3">3 ★★★</option>
            <option value="4">4 ★★★★</option>
            <option value="5">5 ★★★★★</option>
          </select>
        )}

        <button
          onClick={() => onEdit(book)}
          disabled={busy}
          style={{ padding: '5px 10px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(book.id)}
          disabled={busy}
          style={{ padding: '5px 10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default BookItem;
