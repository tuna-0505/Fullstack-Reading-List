import React, { useState, useEffect } from 'react';

const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];

const BookForm = ({ editingBook, onSubmit, onCancelEdit, submitting }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState(2024);
  const [genre, setGenre] = useState('fiction');
  const [read, setRead] = useState(false);
  const [rating, setRating] = useState('');

  useEffect(() => {
    if (editingBook) {
      setTitle(editingBook.title);
      setAuthor(editingBook.author);
      setYear(editingBook.year);
      setGenre(editingBook.genre);
      setRead(editingBook.read);
      setRating(editingBook.rating !== null ? String(editingBook.rating) : '');
    } else {
      setTitle('');
      setAuthor('');
      setYear(2024);
      setGenre('fiction');
      setRead(false);
      setRating('');
    }
  }, [editingBook]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      author,
      year: Number(year),
      genre,
      read,
      rating: read && rating !== '' ? Number(rating) : null
    };

    const success = await onSubmit(payload, editingBook ? editingBook.id : null);
    if (success && !editingBook) {
      setTitle('');
      setAuthor('');
      setYear(2024);
      setGenre('fiction');
      setRead(false);
      setRating('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '16px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 12px 0' }}>{editingBook ? `Edit Book #${editingBook.id}` : 'Add New Book'}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '12px' }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ padding: '6px 8px' }}
        />
        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          style={{ padding: '6px 8px' }}
        />
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
          style={{ padding: '6px 8px' }}
        />
        <select value={genre} onChange={(e) => setGenre(e.target.value)} style={{ padding: '6px 8px' }}>
          {GENRES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="checkbox"
            checked={read}
            onChange={(e) => {
              setRead(e.target.checked);
              if (!e.target.checked) setRating('');
            }}
          />
          Already Read
        </label>

        {read && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Rating:
            <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ padding: '4px' }}>
              <option value="">No Rating</option>
              <option value="1">1 ★</option>
              <option value="2">2 ★★</option>
              <option value="3">3 ★★★</option>
              <option value="4">4 ★★★★</option>
              <option value="5">5 ★★★★★</option>
            </select>
          </label>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" disabled={submitting} style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {submitting ? 'Saving...' : editingBook ? 'Update Book (PUT)' : 'Add Book (POST)'}
        </button>
        {editingBook && (
          <button type="button" onClick={onCancelEdit} disabled={submitting} style={{ padding: '8px 14px', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default BookForm;
