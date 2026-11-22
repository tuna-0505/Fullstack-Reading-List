const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data && data.error ? data.error : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

export function fetchBooks(filters = {}, signal) {
  const params = new URLSearchParams();

  if (filters.q) params.set('q', filters.q);
  if (filters.genre) params.set('genre', filters.genre);
  if (filters.read !== '' && filters.read !== undefined) params.set('read', filters.read);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.order) params.set('order', filters.order);

  const queryString = params.toString();
  const path = queryString ? `/api/books?${queryString}` : '/api/books';

  return request(path, { method: 'GET', signal });
}

export function fetchStats(signal) {
  return request('/api/stats', { method: 'GET', signal });
}

export function createBook(bookData) {
  return request('/api/books', {
    method: 'POST',
    body: JSON.stringify(bookData)
  });
}

export function updateBookPut(id, bookData) {
  return request(`/api/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bookData)
  });
}

export function updateBookPatch(id, partialData) {
  return request(`/api/books/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(partialData)
  });
}

export function deleteBook(id) {
  return request(`/api/books/${id}`, {
    method: 'DELETE'
  });
}
