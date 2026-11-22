# Web Technologies Laboratory - Assignment 9 (Full-Stack Reading List)

**Student Name:** Tunahan Mutlu  
**Student ID:** 230408002  

## 1. Installation & Running Instructions

### Server (`server/`)
1. Navigate to the server directory and install dependencies:
   ```bash
   cd server
   npm install

   ## 4. Section 8: Reasoning Questions
1. **Parameters:** A book's `id` uniquely identifies a single resource in the REST hierarchy (`/api/books/:id`), whereas `genre` and `sort` are optional modifiers applied to a collection. Putting `id` in the query string would turn single-resource endpoints (`PUT`, `PATCH`, `DELETE`) into ambiguous collection operations.
2. **Body parsing (Experiment):** Moving `express.json()` below the routes left `req.body` as `undefined` inside `POST /api/books`. Consequently, `validateCompleteBook(req.body)` rejected the request with `400 Bad Request` (`"Request body must be a JSON object."`).
3. **One response (Experiment):** Removing `return` before `res.status(404).json(...)` caused Express to continue executing the rest of the handler and attempt sending a second `200 OK` response, crashing the request lifecycle with `ERR_HTTP_HEADERS_SENT: Cannot set headers after they are sent to the client`.
4. **PUT and PATCH:** `PATCH /api/books/:id` is ideal when toggling `read` or changing `rating` from a list card because only the changed field is transmitted. `PUT /api/books/:id` is better when submitting the full edit form so every field (`title`, `author`, `year`, `genre`, `read`, `rating`) is atomically replaced and validated together.
5. **CORS (Experiment):** Setting `CLIENT_ORIGIN` to `http://localhost:9999` caused the browser console to block the response with `Access-Control-Allow-Origin` mismatch errors. The server still received and logged the request, and `curl` continued to work because CORS is strictly enforced by web browsers, not command-line HTTP clients.
6. **Validation:** Client-side checks improve user experience but can be bypassed easily via `curl`, Postman, or browser DevTools. The server is the single source of truth and must validate all inputs to protect data integrity and enforce business rules.
7. **State:** Restarting the server reset all added, edited, or deleted books back to the 6 initial seed books. This proves the data lives solely in volatile RAM inside the Node.js process; persisting data across restarts requires a database (such as PostgreSQL, MongoDB, or SQLite).

## 5. Self-Study Notes & Challenges
- **Safe Query Strings (`URLSearchParams`):** Used `new URLSearchParams()` in `client/src/api/books.js` to append active filters and automatically percent-encode special characters in search queries.
- **Alphabetical Sorting (`localeCompare`):** Used `a[sort].localeCompare(b[sort], undefined, { sensitivity: 'base' })` so titles and authors sort alphabetically regardless of uppercase/lowercase differences.
- **Vite Environment Variables (`import.meta.env`):** Read `import.meta.env.VITE_API_URL`; Vite requires the `VITE_` prefix so only explicitly exposed variables are bundled into public client JavaScript.
- **Empty `204` Responses in Express 5:** Used `res.status(204).send()` on `DELETE` and checked `response.status === 204` in `books.js` before calling `response.json()` to avoid JSON parse errors on empty bodies.
- **Cancelling Stale Fetches (`AbortController`):** Passed an `AbortSignal` to `fetchBooks` inside `useEffect` and ignored `err.name === 'AbortError'` in cleanup so rapid typing in the search bar never lets an older slow response overwrite newer results.
