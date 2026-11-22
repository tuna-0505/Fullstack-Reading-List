import express from 'express';
import cors from 'cors';
import {
  getAllBooks,
  getBookById,
  hasDuplicate,
  createBook,
  replaceBook,
  deleteBook,
  computeStats
} from './booksStore.js';
import {
  parsePositiveId,
  validateCompleteBook,
  validatePatchAndMerge,
  validateListQuery
} from './validate.js';

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Restricted single-origin CORS middleware
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    exposedHeaders: ['Location']
  })
);

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Parse JSON body before routes
app.use(express.json());

// Handle malformed JSON syntax errors cleanly with JSON 400
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON in request body.' });
  }
  return next(err);
});

// GET /api/books -> Filter, sort, paginate
app.get('/api/books', async (req, res, next) => {
  try {
    const queryCheck = validateListQuery(req.query);
    if (queryCheck.error) {
      return res.status(400).json({ error: queryCheck.error });
    }

    const { genre, read, q, sort, order, limit, page } = queryCheck.value;
    let list = await getAllBooks();

    if (genre !== null) {
      list = list.filter((b) => b.genre === genre);
    }
    if (read !== null) {
      list = list.filter((b) => b.read === read);
    }
    if (q) {
      list = list.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }

    // Sort a copy immutably
    const sorted = [...list].sort((a, b) => {
      if (sort === 'rating') {
        if (a.rating === null && b.rating === null) return 0;
        if (a.rating === null) return 1; // unrated always last
        if (b.rating === null) return -1;
        return order === 'asc' ? a.rating - b.rating : b.rating - a.rating;
      }

      if (sort === 'title' || sort === 'author') {
        const cmp = a[sort].localeCompare(b[sort], undefined, { sensitivity: 'base' });
        return order === 'asc' ? cmp : -cmp;
      }

      const diff = a[sort] - b[sort];
      return order === 'asc' ? diff : -diff;
    });

    const startIndex = (page - 1) * limit;
    const paginated = sorted.slice(startIndex, startIndex + limit);

    return res.status(200).json(paginated);
  } catch (err) {
    return next(err);
  }
});

// GET /api/books/:id -> Single book
app.get('/api/books/:id', async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Book ID must be a positive integer.' });
    }

    const book = await getBookById(id);
    if (!book) {
      return res.status(404).json({ error: `Book with ID ${id} not found.` });
    }

    return res.status(200).json(book);
  } catch (err) {
    return next(err);
  }
});

// POST /api/books -> Create book
app.post('/api/books', async (req, res, next) => {
  try {
    const validation = validateCompleteBook(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const duplicate = await hasDuplicate(validation.value.title, validation.value.author);
    if (duplicate) {
      return res.status(409).json({ error: 'A book with the same title and author already exists.' });
    }

    const created = await createBook(validation.value);
    return res
      .status(201)
      .location(`/api/books/${created.id}`)
      .json(created);
  } catch (err) {
    return next(err);
  }
});

// PUT /api/books/:id -> Replace book completely
app.put('/api/books/:id', async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Book ID must be a positive integer.' });
    }

    const existing = await getBookById(id);
    if (!existing) {
      return res.status(404).json({ error: `Book with ID ${id} not found.` });
    }

    const validation = validateCompleteBook(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const duplicate = await hasDuplicate(validation.value.title, validation.value.author, id);
    if (duplicate) {
      return res.status(409).json({ error: 'Another book with the same title and author already exists.' });
    }

    const updated = await replaceBook(id, validation.value);
    return res.status(200).json(updated);
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/books/:id -> Partial update
app.patch('/api/books/:id', async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Book ID must be a positive integer.' });
    }

    const existing = await getBookById(id);
    if (!existing) {
      return res.status(404).json({ error: `Book with ID ${id} not found.` });
    }

    const validation = validatePatchAndMerge(existing, req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const duplicate = await hasDuplicate(validation.value.title, validation.value.author, id);
    if (duplicate) {
      return res.status(409).json({ error: 'Another book with the same title and author already exists.' });
    }

    const updated = await replaceBook(id, validation.value);
    return res.status(200).json(updated);
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/books/:id -> Delete book
app.delete('/api/books/:id', async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Book ID must be a positive integer.' });
    }

    const deleted = await deleteBook(id);
    if (!deleted) {
      return res.status(404).json({ error: `Book with ID ${id} not found.` });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

// GET /api/stats -> Computed statistics
app.get('/api/stats', async (req, res, next) => {
  try {
    const stats = await computeStats();
    return res.status(200).json(stats);
  } catch (err) {
    return next(err);
  }
});

// Deliberate async error test route (documented in README)
app.get('/api/crash', async (req, res, next) => {
  try {
    throw new Error('Simulated asynchronous server failure');
  } catch (err) {
    return next(err);
  }
});

// Express 5 compatible 404 fallback for unmatched /api routes
app.use('/api', (req, res) => {
  return res.status(404).json({ error: 'Not found' });
});

// 4-parameter global error-handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  return res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Reading List API server running at http://localhost:${PORT}`);
  console.log(`Accepting CORS requests from: ${CLIENT_ORIGIN}`);
});
