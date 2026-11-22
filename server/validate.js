export const VALID_GENRES = [
  'fiction',
  'non-fiction',
  'science',
  'history',
  'fantasy',
  'other'
];

export const VALID_SORT_FIELDS = ['id', 'title', 'author', 'year', 'rating'];
export const VALID_ORDERS = ['asc', 'desc'];

export function parsePositiveId(rawId) {
  if (!/^[1-9]\d*$/.test(String(rawId))) {
    return null;
  }
  const num = Number(rawId);
  return Number.isSafeInteger(num) && num > 0 ? num : null;
}

export function validateCompleteBook(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Request body must be a JSON object.' };
  }

  const currentYear = new Date().getFullYear();

  if (typeof input.title !== 'string') {
    return { error: 'Title must be a string.' };
  }
  const title = input.title.trim();
  if (title.length < 1 || title.length > 100) {
    return { error: 'Title must be between 1 and 100 characters after trimming.' };
  }

  if (typeof input.author !== 'string') {
    return { error: 'Author must be a string.' };
  }
  const author = input.author.trim();
  if (author.length < 1 || author.length > 100) {
    return { error: 'Author must be between 1 and 100 characters after trimming.' };
  }

  if (typeof input.year !== 'number' || !Number.isInteger(input.year)) {
    return { error: 'Year must be an integer.' };
  }
  if (input.year < 1000 || input.year > currentYear) {
    return { error: `Year must be between 1000 and ${currentYear}.` };
  }

  if (typeof input.genre !== 'string' || !VALID_GENRES.includes(input.genre)) {
    return { error: `Genre must be one of: ${VALID_GENRES.join(', ')}.` };
  }

  const read = input.read === undefined ? false : input.read;
  if (typeof read !== 'boolean') {
    return { error: 'Read status must be a boolean.' };
  }

  const rating = input.rating === undefined ? null : input.rating;
  if (rating !== null) {
    if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { error: 'Rating must be an integer between 1 and 5, or null.' };
    }
    if (!read) {
      return { error: 'A rating is allowed only when read is true.' };
    }
  }

  return {
    value: { title, author, year: input.year, genre: input.genre, read, rating }
  };
}

export function validatePatchAndMerge(existingBook, patchInput) {
  if (!patchInput || typeof patchInput !== 'object' || Array.isArray(patchInput)) {
    return { error: 'Request body must be a JSON object.' };
  }

  const allowedKeys = ['title', 'author', 'year', 'genre', 'read', 'rating'];
  const merged = { ...existingBook };

  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(patchInput, key)) {
      merged[key] = patchInput[key];
    }
  }

  // If read is explicitly set to false and rating wasn't explicitly sent, clear rating
  if (patchInput.read === false && !Object.prototype.hasOwnProperty.call(patchInput, 'rating')) {
    merged.rating = null;
  }

  return validateCompleteBook(merged);
}

export function validateListQuery(query) {
  const keys = ['genre', 'read', 'q', 'sort', 'order', 'limit', 'page'];
  for (const key of keys) {
    if (Array.isArray(query[key])) {
      return { error: `Repeated query parameter '${key}' is not allowed.` };
    }
  }

  let genre = null;
  if (query.genre !== undefined && query.genre !== '') {
    if (!VALID_GENRES.includes(query.genre)) {
      return { error: `Invalid genre filter. Allowed: ${VALID_GENRES.join(', ')}.` };
    }
    genre = query.genre;
  }

  let read = null;
  if (query.read !== undefined && query.read !== '') {
    if (query.read !== 'true' && query.read !== 'false') {
      return { error: "Query parameter 'read' must be 'true' or 'false'." };
    }
    read = query.read === 'true';
  }

  const q = query.q !== undefined ? String(query.q).trim().toLowerCase() : '';

  const sort = query.sort !== undefined && query.sort !== '' ? query.sort : 'id';
  if (!VALID_SORT_FIELDS.includes(sort)) {
    return { error: `Invalid sort field. Allowed: ${VALID_SORT_FIELDS.join(', ')}.` };
  }

  const order = query.order !== undefined && query.order !== '' ? query.order : 'asc';
  if (!VALID_ORDERS.includes(order)) {
    return { error: "Invalid order. Allowed: 'asc' or 'desc'." };
  }

  let limit = 50;
  if (query.limit !== undefined && query.limit !== '') {
    if (!/^[1-9]\d*$/.test(String(query.limit))) {
      return { error: 'Limit must be an integer between 1 and 50.' };
    }
    limit = Number(query.limit);
    if (limit < 1 || limit > 50) {
      return { error: 'Limit must be between 1 and 50.' };
    }
  }

  let page = 1;
  if (query.page !== undefined && query.page !== '') {
    if (!/^[1-9]\d*$/.test(String(query.page))) {
      return { error: 'Page must be a positive integer.' };
    }
    page = Number(query.page);
  }

  return {
    value: { genre, read, q, sort, order, limit, page }
  };
}
