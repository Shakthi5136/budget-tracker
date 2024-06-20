const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = 3001;

// Enable CORS middleware
app.use(cors());

// Parse incoming JSON requests
app.use(bodyParser.json());

// Initialize SQLite database
const dbPath = path.resolve(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS user (id TEXT PRIMARY KEY, name TEXT, email TEXT, password TEXT, picture TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS balance (user_id TEXT PRIMARY KEY, balance REAL, FOREIGN KEY(user_id) REFERENCES user(id))");

  // Check if the password column exists
  db.all("PRAGMA table_info(user)", (err, columns) => {
    if (err) {
      console.error('Error getting table info:', err);
      return;
    }
    const columnNames = columns.map(column => column.name);
    if (!columnNames.includes('password')) {
      db.run("ALTER TABLE user ADD COLUMN password TEXT", err => {
        if (err) {
          console.error('Error adding password column:', err);
        } else {
          console.log('Password column added');
        }
      });
    }
  });
});

// Endpoint to store user data
app.post('/api/user', (req, res) => {
  const { id, name, email, password, picture } = req.body;

  // Validate request body
  if (!id || !name || !email || !password) {
    console.error('Missing required fields:', req.body);
    return res.status(400).send('Missing required fields');
  }

  // Hash the password before storing it
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).send('Internal Server Error');
    }

    console.log('Hashed password:', hashedPassword); // Add logging here

    // Check if user already exists
    db.get(`SELECT * FROM user WHERE id = ?`, [id], (err, row) => {
      if (err) {
        console.error('Error checking for existing user:', err);
        return res.status(500).send('Internal Server Error');
      }

      if (row) {
        // User already exists, update the existing record
        db.run(`UPDATE user SET name = ?, email = ?, password = ?, picture = ? WHERE id = ?`, [name, email, hashedPassword, picture, id], function(err) {
          if (err) {
            console.error('Error updating user data:', err);
            return res.status(500).send('Internal Server Error');
          }
          res.status(200).send('User data updated');
        });
      } else {
        // User does not exist, insert a new record
        db.run(`INSERT INTO user (id, name, email, password, picture) VALUES (?, ?, ?, ?, ?)`, [id, name, email, hashedPassword, picture], function(err) {
          if (err) {
            console.error('Error storing user data:', err);
            return res.status(500).send('Internal Server Error');
          }
          res.status(200).send('User data stored');
        });
      }
    });
  });
});

// Endpoint to handle login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Check for required fields
  if (!email || !password) {
    console.error('Missing email or password');
    return res.status(400).send('Missing email or password');
  }

  // Query to find the user by email
  db.get(`SELECT * FROM user WHERE email = ?`, [email], (err, row) => {
    if (err) {
      console.error('Error retrieving user:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (!row) {
      console.error('User not found');
      return res.status(404).send('User not found');
    }

    // Check if row.password is not null or undefined
    if (!row.password) {
      console.error('Stored password is missing');
      return res.status(500).send('Internal Server Error');
    }

    // Compare the provided password with the hashed password stored in the database
    bcrypt.compare(password, row.password, (err, result) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).send('Internal Server Error');
      }

      if (result) {
        // Passwords match, login successful
        res.status(200).json(row);
      } else {
        // Passwords do not match
        console.error('Invalid email or password');
        res.status(401).send('Invalid email or password');
      }
    });
  });
});

// Endpoint to get user data
app.get('/api/user/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM user WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error('Error retrieving user data:', err);
      return res.status(500).send('Internal Server Error');
    }
    if (!row) {
      console.error('User not found');
      return res.status(404).send('User not found');
    }
    res.status(200).json(row);
  });
});

// Endpoint to store or update balance data
app.post('/api/balance', (req, res) => {
  const { userId, balance } = req.body;

  // Validate request body
  if (!userId || balance == null) {
    console.error('Missing required fields:', req.body);
    return res.status(400).send('Missing required fields');
  }

  // Check if balance already exists for the user
  db.get(`SELECT * FROM balance WHERE user_id = ?`, [userId], (err, row) => {
    if (err) {
      console.error('Error checking for existing balance:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (row) {
      // Balance already exists, update the existing record
      db.run(`UPDATE balance SET balance = ? WHERE user_id = ?`, [balance, userId], function(err) {
        if (err) {
          console.error('Error updating balance:', err);
          return res.status(500).send('Internal Server Error');
        }
        res.status(200).send('Balance updated');
      });
    } else {
      // Balance does not exist, insert a new record
      db.run(`INSERT INTO balance (user_id, balance) VALUES (?, ?)`, [userId, balance], function(err) {
        if (err) {
          console.error('Error storing balance:', err);
          return res.status(500).send('Internal Server Error');
        }
        res.status(200).send('Balance stored');
      });
    }
  });
});

// Endpoint to get balance data
app.get('/api/balance/:userId', (req, res) => {
  const { userId } = req.params;
  db.get(`SELECT balance FROM balance WHERE user_id = ?`, [userId], (err, row) => {
    if (err) {
      console.error('Error retrieving balance:', err);
      return res.status(500).send(err.message);
    }
    res.status(200).json(row);
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
