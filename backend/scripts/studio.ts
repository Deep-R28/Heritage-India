/**
 * Heritage India Database Studio
 * Lightweight visual database browser for backend/dev.db (SQLite)
 * Runs on http://localhost:5555
 */
import http from "node:http";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, "../dev.db");
const db = new Database(dbPath);

const PORT = 5555;

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Heritage India — Database Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0c0d12;
      --surface: #14161f;
      --surface-hover: #1b1e2b;
      --border: #232738;
      --accent: #d4af37;
      --accent-light: #f3e5ab;
      --text: #f0f2f5;
      --text-muted: #8b92a5;
      --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    /* Sidebar */
    .sidebar {
      width: 260px;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    .brand {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .brand-icon {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #d4af37, #8c7322);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;
      font-weight: 700;
      font-size: 14px;
    }
    .brand-title {
      font-weight: 700;
      font-size: 15px;
      letter-spacing: -0.01em;
    }
    .table-list {
      flex: 1;
      overflow-y: auto;
      padding: 0.75rem;
    }
    .table-btn {
      width: 100%;
      text-align: left;
      padding: 0.6rem 0.85rem;
      border-radius: 6px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.15s;
      margin-bottom: 2px;
    }
    .table-btn:hover {
      background: var(--surface-hover);
      color: var(--text);
    }
    .table-btn.active {
      background: rgba(212, 175, 55, 0.15);
      color: var(--accent);
      font-weight: 600;
    }
    .table-badge {
      font-size: 11px;
      font-family: var(--font-mono);
      background: rgba(255, 255, 255, 0.06);
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--text-muted);
    }
    .table-btn.active .table-badge {
      background: rgba(212, 175, 55, 0.25);
      color: var(--accent);
    }
    /* Main Area */
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--bg);
    }
    .header {
      padding: 1rem 1.75rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      background: var(--surface);
    }
    .title-area h2 {
      font-size: 18px;
      font-weight: 700;
    }
    .title-area p {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .search-box {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.5rem 0.85rem;
      color: var(--text);
      font-size: 13px;
      width: 260px;
      outline: none;
    }
    .search-box:focus {
      border-color: var(--accent);
    }
    /* Content */
    .table-wrapper {
      flex: 1;
      overflow: auto;
      padding: 1.5rem 1.75rem;
    }
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 13px;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      background: var(--surface);
    }
    th {
      background: #181a24;
      padding: 10px 14px;
      text-align: left;
      font-weight: 600;
      color: var(--accent-light);
      border-bottom: 1px solid var(--border);
      border-right: 1px solid var(--border);
      white-space: nowrap;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    th:last-child { border-right: none; }
    td {
      padding: 9px 14px;
      border-bottom: 1px solid var(--border);
      border-right: 1px solid var(--border);
      color: var(--text);
      max-width: 320px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: var(--font-mono);
      font-size: 12px;
    }
    td:last-child { border-right: none; }
    tr:last-child td { border-bottom: none; }
    tr:hover td {
      background: var(--surface-hover);
    }
    .null-val { color: #5a6275; font-style: italic; }
    .footer {
      padding: 0.75rem 1.75rem;
      border-top: 1px solid var(--border);
      background: var(--surface);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--text-muted);
    }
    .pagination {
      display: flex;
      gap: 6px;
    }
    .pg-btn {
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 4px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .pg-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  </style>
</head>
<body>
  <div class="sidebar">
    <div class="brand">
      <div class="brand-icon">H</div>
      <div class="brand-title">Database Studio</div>
    </div>
    <div class="table-list" id="tableList">
      <!-- Populated via JS -->
    </div>
  </div>

  <div class="main">
    <div class="header">
      <div class="title-area">
        <h2 id="currentTableName">Select a table</h2>
        <p id="tableStats">dev.db</p>
      </div>
      <input type="text" id="searchInput" class="search-box" placeholder="Filter rows…">
    </div>

    <div class="table-wrapper">
      <table id="dataTable">
        <thead id="tableHead"></thead>
        <tbody id="tableBody"></tbody>
      </table>
    </div>

    <div class="footer">
      <span id="rowCount">0 rows</span>
      <div class="pagination">
        <button id="prevBtn" class="pg-btn" disabled>Previous</button>
        <button id="nextBtn" class="pg-btn" disabled>Next</button>
      </div>
    </div>
  </div>

  <script>
    let currentTable = "";
    let rawRows = [];
    let page = 0;
    const pageSize = 50;

    async function init() {
      const res = await fetch("/api/tables");
      const tables = await res.json();
      const listEl = document.getElementById("tableList");
      listEl.innerHTML = "";

      tables.forEach((t, i) => {
        const btn = document.createElement("button");
        btn.className = "table-btn" + (i === 0 ? " active" : "");
        btn.innerHTML = '<span>' + t.name + '</span><span class="table-badge">' + t.count.toLocaleString() + '</span>';
        btn.onclick = () => selectTable(t.name, btn);
        listEl.appendChild(btn);
      });

      if (tables.length > 0) {
        selectTable(tables[0].name, listEl.firstChild);
      }
    }

    async function selectTable(name, btn) {
      document.querySelectorAll(".table-btn").forEach(b => b.classList.remove("active"));
      if (btn) btn.classList.add("active");
      currentTable = name;
      document.getElementById("currentTableName").textContent = name;
      page = 0;
      await fetchRows();
    }

    async function fetchRows() {
      const res = await fetch('/api/rows?table=' + encodeURIComponent(currentTable));
      rawRows = await res.json();
      render();
    }

    function render() {
      const q = document.getElementById("searchInput").value.toLowerCase().trim();
      const filtered = q
        ? rawRows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)))
        : rawRows;

      const total = filtered.length;
      const start = page * pageSize;
      const pageRows = filtered.slice(start, start + pageSize);

      document.getElementById("rowCount").textContent = 
        'Showing ' + (total > 0 ? (start + 1) : 0) + '–' + Math.min(start + pageSize, total) + ' of ' + total.toLocaleString() + ' records';
      document.getElementById("tableStats").textContent = total + ' rows in table ' + currentTable;

      const thead = document.getElementById("tableHead");
      const tbody = document.getElementById("tableBody");

      if (pageRows.length === 0) {
        thead.innerHTML = "";
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--text-muted)">No records found</td></tr>';
        return;
      }

      const cols = Object.keys(pageRows[0]);
      thead.innerHTML = '<tr>' + cols.map(c => '<th>' + c + '</th>').join('') + '</tr>';

      tbody.innerHTML = pageRows.map(row => {
        return '<tr>' + cols.map(col => {
          const val = row[col];
          if (val === null || val === undefined) return '<td class="null-val">null</td>';
          if (typeof val === 'object') return '<td title="' + JSON.stringify(val).replace(/"/g, '&quot;') + '">' + JSON.stringify(val) + '</td>';
          return '<td title="' + String(val).replace(/"/g, '&quot;') + '">' + String(val) + '</td>';
        }).join('') + '</tr>';
      }).join('');

      document.getElementById("prevBtn").disabled = page === 0;
      document.getElementById("nextBtn").disabled = start + pageSize >= total;
    }

    document.getElementById("searchInput").addEventListener("input", () => {
      page = 0;
      render();
    });

    document.getElementById("prevBtn").addEventListener("click", () => {
      if (page > 0) { page--; render(); }
    });

    document.getElementById("nextBtn").addEventListener("click", () => {
      page++; render();
    });

    init();
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(htmlContent);
  }

  if (url.pathname === "/api/tables") {
    try {
      const tables = db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%' ORDER BY name ASC"
        )
        .all() as { name: string }[];

      const result = tables.map((t) => {
        const countRow = db.prepare(`SELECT COUNT(*) as count FROM "${t.name}"`).get() as { count: number };
        return { name: t.name, count: countRow.count };
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(result));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error reading tables";
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: msg }));
    }
  }

  if (url.pathname === "/api/rows") {
    const table = url.searchParams.get("table");
    if (!table) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Table name is required" }));
    }

    try {
      // Validate table name against sqlite_master
      const exists = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
        .get(table);

      if (!exists) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Table not found" }));
      }

      const rows = db.prepare(`SELECT * FROM "${table}" LIMIT 5000`).all();
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(rows));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error reading rows";
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: msg }));
    }
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  🚀 Heritage India — Database Studio is LIVE!");
  console.log(`  👉 Open in your browser: http://localhost:${PORT}`);
  console.log("══════════════════════════════════════════════════════════\n");
});
