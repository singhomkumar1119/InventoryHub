# InventoryHub

A full-stack inventory management demo app (Express.js backend + vanilla JS front-end) built to
practice front-end/back-end integration, JSON API design, debugging, and performance optimization
with Microsoft Copilot.

## Project Structure

```
InventoryHub/
├── backend/
│   ├── server.js       # Express API server
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── app.js           # Fetches data from the API and renders the UI
│   └── style.css
└── README.md
```

## Running the project

```bash
# 1. Start the backend
cd backend
npm install
npm start
# API now running at http://localhost:4000

# 2. Serve the frontend (in a separate terminal)
cd frontend
npx serve .
# or simply open index.html in a browser
```

## JSON API Structure

Every endpoint returns a consistent response envelope:

```json
{
  "success": true,
  "data": { },
  "error": null,
  "meta": { }
}
```

### Example: GET /api/products

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Wireless Mouse", "category": "Electronics", "price": 19.99, "stock": 120 },
    { "id": 2, "name": "Bluetooth Speaker", "category": "Electronics", "price": 45.5, "stock": 35 }
  ],
  "error": null,
  "meta": { "total": 5, "page": 1, "limit": 10 }
}
```

### Example: Error response (POST /api/products with missing fields)

```json
{
  "success": false,
  "data": null,
  "error": "Missing required fields: name, category, price, stock",
  "meta": {}
}
```

## Endpoints

| Method | Route                | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | /api/products          | List products (supports `category`, `page`, `limit`) |
| GET    | /api/products/:id       | Get a single product                 |
| POST   | /api/products           | Create a new product                 |
| PUT    | /api/products/:id       | Update an existing product           |
| DELETE | /api/products/:id       | Delete a product                     |
| GET    | /api/health             | Health check                         |

## Debugging Notes

Two integration issues came up while connecting the front-end to the back-end, both resolved with
Copilot's help:

1. **CORS blocking requests** — the browser blocked calls to `localhost:4000` from the front-end
   origin. Copilot suggested adding the `cors` middleware package to the Express app rather than
   hand-rolling response headers.
2. **Race condition on page load** — the products table sometimes rendered empty because the DOM
   update ran before the JSON body had resolved. Copilot pointed out a missing `await` on the
   `response.json()` call inside a `.then()` chain; switching to a fully `async/await` structure
   in `apiRequest()` fixed it.

## Performance Optimizations

- **In-memory caching** on `GET /api/products` (10s TTL) to avoid recomputing the full list on
  every request; cache is invalidated on any write (POST/PUT/DELETE).
- **Pagination** (`page`, `limit` query params) so the front-end never pulls more data than it
  needs, which matters once the inventory table grows large.
- **Centralized fetch helper** (`apiRequest`) on the front-end to eliminate duplicated try/catch
  blocks and reduce the number of separate error-handling code paths.

## Reflective Summary: How Copilot Assisted

- **Front-end/back-end communication:** Copilot scaffolded the initial Express routes and the
  `fetch()`-based API helper on the front-end, and suggested a consistent JSON response envelope
  (`success/data/error/meta`) so the two sides could be built and tested independently.
- **Resolving integration issues:** Copilot helped diagnose the CORS failure and the async race
  condition described above, explaining the root cause of each rather than just patching the
  symptom.
- **Structuring JSON responses:** Copilot suggested standardizing every endpoint's response shape
  and adding a `meta` field for pagination info, which made the front-end parsing logic simpler
  and more predictable.
- **Optimizing performance:** Copilot recommended the caching layer and pagination approach, and
  flagged that the front-end was duplicating error-handling logic across multiple functions,
  leading to the `apiRequest()` refactor.

Overall, Copilot was most useful for catching subtle bugs (the missing `await`, the CORS
misconfiguration) quickly, and for suggesting conventions (response envelope, caching) that kept
the codebase consistent as it grew.
