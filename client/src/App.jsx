import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchBooks,
  fetchStats,
  createBook,
  updateBookPut,
  updateBookPatch,
  deleteBook
} from './api/books.js';
import StatsPanel from './components/StatsPanel.jsx';
import FilterBar from './components/FilterBar.jsx';
import BookForm from './components/BookForm.jsx';
import BookItem from './components/BookItem.jsx';

function App() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    q: '',
    genre: '',
    read: '',
    sort: 'id',
    order: 'asc'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const loadStats = useCallback(async (signal) => {
    try {
      const data = await fetchStats(signal);
      setStats(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to load stats:', err);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchBooks(filters, controller.signal)
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      });

    loadStats(controller.signal);

    return () => controller.abort();
  }, [filters, loadStats]);

  const refreshData = async () => {
    const [latestBooks, latestStats] = await Promise.all([
      fetchBooks(filters),
      fetchStats()
    ]);
    setBooks(latestBooks);
    setStats(latestStats);
  };

  const handleFormSubmit = async (payload, editId) => {
    setSubmitting(true);
    setActionError(null);
    try {
      if (editId) {
        await updateBookPut(editId, payload);
        setEditingBook(null);
      } else {
        await createBook(payload);
      }
      await refreshData();
      return true;
    } catch (err) {
      setActionError(err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRead = async (book) => {
    setSubmitting(true);
    setActionError(null);
    try {
      const nextRead = !book.read;
      await updateBookPatch(book.id, {
        read: nextRead,
        rating: nextRead ? book.rating : null
      });
      await refreshData();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = async (id, rating) => {
    setSubmitting(true);
    setActionError(null);
    try {
      await updateBookPatch(id, { rating });
      await refreshData();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setSubmitting(true);
    setActionError(null);
    try {
      await deleteBook(id);
      if (editingBook && editingBook.id === id) {
        setEditingBook(null);
      }
      await refreshData();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '24px', fontFamily: 'Segoe UI, sans-serif', color: '#1e293b' }}>
      <h1 style={{ marginBottom: '20px' }}>Reading List Manager</h1>

      <StatsPanel stats={stats} />

      {actionError && (
        <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '16px', border: '1px solid #f87171' }}>
          <strong>Server Error:</strong> {actionError}
        </div>
      )}

      <BookForm
        editingBook={editingBook}
        onSubmit={handleFormSubmit}
        onCancelEdit={() => setEditingBook(null)}
        submitting={submitting}
      />

      <FilterBar filters={filters} onChange={setFilters} />

      {loading && <p>Loading books from server...</p>}
      {error && <p style={{ color: '#dc2626' }}>Error loading list: {error}</p>}

      {!loading && !error && books.length === 0 && (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
          No books match the current filters.
        </p>
      )}

      {!loading && !error && books.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {books.map((book) => (
            <BookItem
              key={book.id}
              book={book}
              onToggleRead={handleToggleRead}
              onRate={handleRate}
              onEdit={setEditingBook}
              onDelete={handleDelete}
              busy={submitting}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
