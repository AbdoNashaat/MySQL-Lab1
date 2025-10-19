import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let db;

// login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Missing username or password" });

  if (username !== 'root')
    return res.status(400).json({ message: "Only root allowed access" });

  try {
    db = mysql.createConnection({
      host: "localhost",
      user: username,
      password: password
    });

    db.connect(err => {
      if (err) {
        console.error("MySQL connection failed:");
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
      else {
        console.log("Connected to MySQL!");
        res.json({ success: true, message: "Login successful" });
      }
    });
  } catch (err) {
    console.log('Error: ', err);
  }
});

app.get("/home", (req, res) => {
  if (!db) return res.status(400).json({ message: "Not connected to MySQL" });

  try {
    db.query("SHOW DATABASES", (err, dbResults) => {
      if (err) {
        console.error("Error fetching databases:", err);
        return res.status(500).json({ message: "Error fetching databases" });
      }

      db.query("SELECT user, host FROM mysql.user", (err, userResults) => {
        if (err) {
          console.error("Error fetching users:", err);
          return res.status(500).json({ message: "Error fetching users" });
        }

        res.json({
          success: true,
          databases: dbResults.map((r) => r.Database),
          users: userResults,
        });
      });
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/createDatabase', (req, res) => {
  const { databaseName } = req.body;

  if (!db)
    return res.status(400).json({ success: false, message: "Not connected to MySQL" });

  if (!databaseName)
    return res.status(400).json({ success: false, message: "Database name required" });

  db.query(`CREATE DATABASE ??`, [databaseName], (err) => {
    if (err) {
      console.error("Error creating database:", err);
      return res.status(500).json({ success: false, message: err.message });
    }

    console.log(`Database "${databaseName}" created.`);
    res.json({ success: true, message: "Database created successfully" });
  });

})

app.post("/createUser", (req, res) => {
  const { username, password, host, databaseConnected } = req.body;

  if (!db)
    return res.status(400).json({ success: false, message: "Not connected to MySQL" });

  if (!username || !password || !host || !databaseConnected)
    return res.status(400).json({ success: false, message: "Missing user details" });

  //  Check if the database exists
  db.query(`SHOW DATABASES LIKE ?`, [databaseConnected], (err, results) => {
    if (err) {
      console.error("Error checking database:", err);
      return res.status(500).json({ success: false, message: err.message });
    }

    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Database "${databaseConnected}" does not exist.`,
      });
    }

    // Create user (if not exists)
    db.query(`CREATE USER IF NOT EXISTS ?@? IDENTIFIED BY ?`, [username, host, password], (err2) => {
      if (err2 && err2.code !== "ER_CANNOT_USER") {
        console.error("Error creating user:", err2);
        return res.status(500).json({ success: false, message: err2.message });
      }

      if (err2 && err2.code === "ER_CANNOT_USER") {
        console.warn(`User ${username}@${host} already exists. Skipping CREATE.`);
      }

      // Grant privileges
      db.query(`GRANT ALL PRIVILEGES ON ?? . * TO ?@?`, [databaseConnected, username, host], (err3) => {
        if (err3) {
          console.error("Error granting privileges:", err3);
          return res.status(500).json({ success: false, message: err3.message });
        }

        console.log(`User ${username}@${host} granted access to ${databaseConnected}`);
        res.json({
          success: true,
          message: `User '${username}' created and granted access to '${databaseConnected}'`,
        });
      });
    });
  });
});

app.get('/getTables', (req, res) => {
  const dbName = req.query.db;

  if (!db) {
    return res.status(500).json({ success: false, message: 'Database connection not initialized' });
  }

  if (!dbName) {
    return res.status(400).json({ success: false, message: 'Missing database name' });
  }

  db.query(`SHOW TABLES FROM ??`, [dbName], (err, results) => {
    if (err) {
      console.error('❌ Error fetching tables:', err);
      return res.status(500).json({ success: false, message: err.message });
    }

    const tables = results.map(row => Object.values(row)[0]);
    res.json({ success: true, tables });
  });
});

// GET all tables in a selected database
app.get("/tables/:dbName", (req, res) => {
  const dbName = req.params.dbName;

  db.query(`SHOW TABLES FROM \`${dbName}\``, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }

    const tables = results.map(r => Object.values(r)[0]);
    res.json({ success: true, tables });
  });
});


// Create new table inside a selected database
app.post("/createTable", (req, res) => {
  const { dbName, tableName, columnsDef } = req.body;

  if (!dbName || !tableName || !columnsDef)
    return res.status(400).json({ success: false, message: "Missing required fields" });

  const sql = `CREATE TABLE \`${dbName}\`.\`${tableName}\` (${columnsDef})`;

  db.query(sql, (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: `Table '${tableName}' created in database '${dbName}'` });
  });
});



app.listen(3000, () => console.log("🚀 Server running at http://localhost:3000"));
