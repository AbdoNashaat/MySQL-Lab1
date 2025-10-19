async function loadData() {
    const status = document.getElementById('status');
    const dbTableBody = document.querySelector('#dbTable tbody');
    const userTableBody = document.querySelector('#userTable tbody');

    try {
        const response = await fetch('http://localhost:3000/home');
        const data = await response.json();

        if (response.ok && data.success) {
            status.style.display = 'none';

            // Fill databases
            dbTableBody.innerHTML = data.databases
                .map((db, i) => `
    <tr>
      <td>${i + 1}</td> <!-- No -->
      <td>${db}</td>
    </tr>
  `)
                .join('');

            // Fill users
            userTableBody.innerHTML = data.users
                .map((u, i) => `
    <tr>
      <td>${i + 1}</td> <!-- No -->
      <td>${u.user}</td>
      <td>${u.host}</td>
    </tr>
  `)
                .join('');

        } else {
            status.textContent = data.message || 'Error loading data';
            status.classList.add('error');
        }
    } catch (err) {
        status.textContent = '❌ Failed to connect to backend';
        status.classList.add('error');
        console.error(err);
    }
}

// Load on page open
loadData();

const addUser = document.getElementById('addUser');
const addDatabase = document.getElementById('addDatabase');
const modal = document.getElementById('addUserModal');
const cancelBtn = document.getElementById('cancelUserBtn');
const createBtn = document.getElementById('createUserBtn');
const usernameInput = document.getElementById('newUsername');
const passwordInput = document.getElementById('newPassword');
const hostInput = document.getElementById('newHost');
const databaseConnectedInput = document.getElementById('newDatabase');

addDatabase.addEventListener('click', async () => {
    const databaseName = prompt('Enter database name: ');
    if (!databaseName) return;

    try {
        const response = await fetch('http://localhost:3000/createDatabase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ databaseName }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(`✅ Database "${databaseName}" created successfully!`);
            loadData(); // refresh list of databases
        } else {
            alert(`❌ ${data.message}`);
        }
    } catch (err) {
        alert(`⚠️ Failed to create database: ${err}`);
    }
})

addUser.addEventListener('click', async () => {
    modal.style.display = 'block';

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        usernameInput.value = passwordInput.value = hostInput.value = databaseConnectedInput.value = "";
    });

    createBtn.addEventListener('click', async () => {
        const username = document.getElementById('newUsername').value.trim();
        const password = document.getElementById('newPassword').value.trim();
        const host = document.getElementById('newHost').value.trim();
        const databaseConnected = document.getElementById('newDatabase').value.trim();

        if (!username || !password || !host || !databaseConnected) {
            alert('⚠️ Please fill in all fields');
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
                alert(`✅ User "${username}" created successfully!`);
                modal.style.display = 'none';
                loadData();
            } else {
                alert(`${data.message}`);
            }
        } catch (err) {
            alert(`⚠️ Failed to create user: ${err}`);
        } finally {
            username.value = password.value = host.value = databaseConnected.value = "777";
        }
    });

})