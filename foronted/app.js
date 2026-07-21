/**
 * InventoryHub - Front-end Integration Logic
 * -------------------------------------------
 * Handles all communication between the UI and the backend API.
 *
 * Copilot assisted in:
 *  - Generating the initial fetch() wrapper for API calls
 *  - Suggesting the try/catch structure for error handling
 *  - Debugging a race condition where the table rendered before
 *    the JSON response had fully resolved (fixed by awaiting fetch
 *    properly instead of chaining a bare .then without a return)
 */

const API_BASE = 'http://localhost:4000/api';

const productsBody = document.getElementById('productsBody');
const statusEl = document.getElementById('status');
const categoryFilter = document.getElementById('categoryFilter');
const refreshBtn = document.getElementById('refreshBtn');

// Generic API request helper — centralizes error handling so every
// call to the backend follows the same pattern (this was refactored
// with Copilot after duplicated try/catch blocks were flagged as
// a code smell during the integration review).
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.error || `Request failed with status ${response.status}`);
    }

    return json;
  } catch (err) {
    // Network errors (e.g. backend not running) land here too
    setStatus(`Error: ${err.message}`, true);
    throw err;
  }
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = isError ? 'error' : 'success';
}

function renderProducts(products) {
  productsBody.innerHTML = '';
  products.forEach((p) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>$${p.price.toFixed(2)}</td>
      <td>${p.stock}</td>
    `;
    productsBody.appendChild(row);
  });
}

async function loadProducts() {
  setStatus('Loading products...');
  const category = categoryFilter.value;
  const query = category ? `?category=${encodeURIComponent(category)}` : '';

  try {
    const json = await apiRequest(`/products${query}`);
    renderProducts(json.data);
    setStatus(`Loaded ${json.data.length} of ${json.meta.total} products.`);
  } catch {
    // apiRequest already set the error status; nothing more to do here
  }
}

refreshBtn.addEventListener('click', loadProducts);
categoryFilter.addEventListener('change', loadProducts);

// Initial load
document.addEventListener('DOMContentLoaded', loadProducts);
