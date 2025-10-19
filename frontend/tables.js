const urlParams = new URLSearchParams(window.location.search);
const dbName = urlParams.get('db');
const dbTitle = document.getElementById('dbTitle');
const tablesTableBody = document.querySelector('#tablesTable tbody');
const status = document.getElementById('status');

dbTitle.textContent = `Database: ${dbName}`;

/* ---------- LOAD TABLES ---------- */
async function loadTables() {
  try {
    const response = await fetch(`http://localhost:3000/tables/${encodeURIComponent(dbName)}`);
    const data = await response.json();

    if (response.ok && data.success) {
      status.style.display = 'none';
      tablesTableBody.innerHTML = data.tables.map((t, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${t}</td>
        </tr>
      `).join('');
    } else {
      status.classList.replace('alert-info', 'alert-danger');
      status.textContent = data.message || 'Failed to load tables';
    }
  } catch (err) {
    console.error(err);
    status.classList.replace('alert-info', 'alert-danger');
    status.textContent = 'Failed to connect to backend';
  }
}

loadTables();

// BACK BUTTON
document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = 'home.html';
});

// CREATE TABLE 
const confirmCreateTableBtn = document.getElementById('confirmCreateTableBtn');
const cancelCreateTableBtn = document.getElementById('cancelCreateTableBtn');
const newTableName = document.getElementById('newTableName');
const tableColumns = document.getElementById('tableColumns');
const createTableModal = document.getElementById('createTableModal');

confirmCreateTableBtn.addEventListener('click', async () => {
  const tableName = newTableName.value.trim();
  const columnsDef = tableColumns.value.trim();

  if (!tableName || !columnsDef) {
    alert('Please enter table name and columns definition');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/createTable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dbName, tableName, columnsDef }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert(`Table "${tableName}" created successfully!`);
      const modal = bootstrap.Modal.getInstance(createTableModal);
      modal.hide();
      newTableName.value = '';
      tableColumns.value = '';
      loadTables();
    } else {
      alert(`${data.message}`);
    }
  } catch (err) {
    alert(`Failed to create table: ${err}`);
  }
});

cancelCreateTableBtn.addEventListener('click', () => {
  newTableName.value = '';
  tableColumns.value = '';
});
