const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid'); // for generating unique IDs

const JWT_SECRET = process.env.JWT_SECRET || 'hifour-admin'; // secret key

const app = express();
const port = 3002;

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
  db.run("CREATE TABLE IF NOT EXISTS admin (id TEXT PRIMARY KEY, name TEXT, email TEXT, password TEXT, picture TEXT)");

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
    return res.status(400).send('Missing required fields');
  }

  // Hash the password before storing it
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }

    // Check if user already exists
    db.get(`SELECT * FROM user WHERE id = ?`, [id], (err, row) => {
      if (err) {
        return res.status(500).send('Internal Server Error');
      }

      if (row) {
        // User already exists, update the existing record
        db.run(`UPDATE user SET name = ?, email = ?, password = ?, picture = ? WHERE id = ?`, [name, email, hashedPassword, picture, id], function(err) {
          if (err) {
            return res.status(500).send('Internal Server Error');
          }
          res.status(200).send('User data updated');
        });
      } else {
        // User does not exist, insert a new record
        db.run(`INSERT INTO user (id, name, email, password, picture) VALUES (?, ?, ?, ?, ?)`, [id, name, email, hashedPassword, picture], function(err) {
          if (err) {
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
    return res.status(400).send('Missing email or password');
  }

  // Query to find the user by email
  db.get(`SELECT * FROM user WHERE email = ?`, [email], (err, row) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }

    if (!row || !row.password) {
      return res.status(404).send('User not found');
    }

    // Compare the provided password with the hashed password stored in the database
    bcrypt.compare(password, row.password, (err, result) => {
      if (err) {
        return res.status(500).send('Internal Server Error');
      }

      if (result) {
        // Passwords match, login successful
        res.status(200).json(row);
      } else {
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
      return res.status(500).send('Internal Server Error');
    }
    if (!row) {
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
    return res.status(400).send('Missing required fields');
  }

  // Check if balance already exists for the user
  db.get(`SELECT * FROM balance WHERE user_id = ?`, [userId], (err, row) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }

    if (row) {
      // Balance already exists, update the existing record
      db.run(`UPDATE balance SET balance = ? WHERE user_id = ?`, [balance, userId], function(err) {
        if (err) {
          return res.status(500).send('Internal Server Error');
        }
        res.status(200).send('Balance updated');
      });
    } else {
      // Balance does not exist, insert a new record
      db.run(`INSERT INTO balance (user_id, balance) VALUES (?, ?)`, [userId, balance], function(err) {
        if (err) {
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
      return res.status(500).send('Internal Server Error');
    }
    res.status(200).json(row);
  });
});

// Endpoint to handle admin signup
app.post('/api/admin/signup', (req, res) => {
  const { id, name, email, password, secret, picture } = req.body;

  // Validate request body
  if (!id || !name || !email || !password || !secret) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if the secret is correct
  const predefinedSecret = process.env.ADMIN_SECRET || 'hifour-admin'; // Replace with your predefined secret, manage using env variables
  if (secret !== predefinedSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Hash the password before storing it
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Check if admin already exists
    db.get(`SELECT * FROM admin WHERE id = ?`, [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (row) {
        // Admin already exists, update the existing record
        db.run(`UPDATE admin SET name = ?, email = ?, password = ?, picture = ? WHERE id = ?`, [name, email, hashedPassword, picture, id], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
          }
          res.status(200).json({ message: 'Admin data updated' });
        });
      } else {
        // Admin does not exist, insert a new record
        db.run(`INSERT INTO admin (id, name, email, password, picture) VALUES (?, ?, ?, ?, ?)`, [id, name, email, hashedPassword, picture], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
          }
          res.status(200).json({ message: 'Admin data stored' });
        });
      }
    });
  });
});

// Endpoint to handle admin login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;

  // Validate request body
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  // Query to find the admin by email
  db.get(`SELECT * FROM admin WHERE email = ?`, [email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (!row || !row.password) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Compare the provided password with the hashed password stored in the database
    bcrypt.compare(password, row.password, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (result) {
        // Passwords match, login successful
        const token = jwt.sign({ id: row.id, email: row.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
      } else {
        res.status(401).json({ error: 'Invalid email or password' });
      }
    });
  });
});

// Endpoint to get admin data
app.get('/api/admin/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM admin WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.status(200).json(row);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
