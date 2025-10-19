async function loadData() {
    const status = document.getElementById('status');
    const dbTableBody = document.querySelector('#dbTable tbody');
    const userTableBody = document.querySelector('#userTable tbody');

    try {
        const response = await fetch('http://localhost:3000/home');
        const data = await response.json();

        if (response.ok && data.success) {
            status.style.display = 'none';

            // Fill databases table
            dbTableBody.innerHTML = data.databases
                .map((db, i) => `
                    <tr class="db-row" data-db="${db}">
                        <td>${i + 1}</td>
                        <td class="text-primary fw-semibold">${db}</td>
                    </tr>
                `).join('');

            // Fill users table
            userTableBody.innerHTML = data.users
                .map((u, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${u.user}</td>
                        <td>${u.host}</td>
                    </tr>
                `).join('');

            // Add clickable behavior to databases
            document.querySelectorAll('.db-row').forEach(row => {
                row.addEventListener('click', () => {
                    const dbName = row.dataset.db;
                    window.location.href = `tables.html?db=${encodeURIComponent(dbName)}`;
                });
            });
        } else {
            status.classList.add('alert-danger');
            status.textContent = data.message || 'Error loading data';
        }
    } catch (err) {
        status.classList.add('alert-danger');
        status.textContent = 'Failed to connect to backend';
        console.error(err);
    }
}

// Load data when page opens
loadData();

// USER CREATION 
const createUserBtn = document.getElementById('createUserBtn');
const cancelUserBtn = document.getElementById('cancelUserBtn');
const userModal = document.getElementById('addUserModal');

const usernameInput = document.getElementById('newUsername');
const passwordInput = document.getElementById('newPassword');
const hostInput = document.getElementById('newHost');
const databaseConnectedInput = document.getElementById('newDatabase');

createUserBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const host = hostInput.value.trim();
    const databaseConnected = databaseConnectedInput.value.trim();

    if (!username || !password || !host || !databaseConnected) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/createUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, host, databaseConnected }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(`User "${username}" created successfully!`);
            const modal = bootstrap.Modal.getInstance(userModal);
            modal.hide();
            loadData();
        } else {
            alert(`Error:  ${data.message}`);
        }
    } catch (err) {
        alert(`Failed to create user: ${err}`);
    } finally {
        usernameInput.value = passwordInput.value = hostInput.value = databaseConnectedInput.value = "";
    }
});

cancelUserBtn.addEventListener('click', () => {
    usernameInput.value = passwordInput.value = hostInput.value = databaseConnectedInput.value = "";
});

// DATABASE CREATION 
const createDatabaseBtn = document.getElementById('createDatabaseBtn');
const cancelDatabaseBtn = document.getElementById('cancelDatabaseBtn');
const dbModal = document.getElementById('addDatabaseModal');
const newDatabaseName = document.getElementById('newDatabaseName');

createDatabaseBtn.addEventListener('click', async () => {
    const databaseName = newDatabaseName.value.trim();
    if (!databaseName) {
        alert('Please enter a database name');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/createDatabase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ databaseName }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(`Database "${databaseName}" created successfully!`);
            const modal = bootstrap.Modal.getInstance(dbModal);
            modal.hide();
            newDatabaseName.value = "";
            loadData();
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (err) {
        alert(`Failed to create database: ${err}`);
    }
});

cancelDatabaseBtn.addEventListener('click', () => {
    newDatabaseName.value = "";
});
