const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid'); // for generating unique IDs 
const util = require('util')

const JWT_SECRET = process.env.JWT_SECRET || 'hifour-admin'; // secret key

const app = express();
const port = 5000;

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
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cardNumber TEXT NOT NULL,
    name TEXT NOT NULL,
    merchant TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    userId INTEGER NOT NULL,
    FOREIGN KEY(userId) REFERENCES user(id)
)`);

  db.run(`CREATE TABLE IF NOT EXISTS income (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    senderName TEXT NOT NULL,
    incomeType TEXT NOT NULL,
    amountReceived REAL NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES user(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS family_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES user(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS spending (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_member_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY(family_member_id) REFERENCES family_members(id)
  )`);

  
});
const dbAll = util.promisify(db.all).bind(db);
const dbRun = util.promisify(db.run).bind(db);

const dbGet = util.promisify(db.get).bind(db);

// Endpoint to get spending by family member
app.get('/api/spending_by_family_member/:userId', async (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT family_members.name, SUM(transactions.amount) as totalSpent
    FROM transactions
    JOIN family_members ON transactions.name = family_members.name
    WHERE family_members.userId = ?
    GROUP BY family_members.name
  `;
  try {
    const rows = await dbAll(query, [userId]);
    console.log('Fetched rows:', rows); // Add this line to log fetched rows
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching spending data:', err);
    res.status(500).json({ error: 'Failed to fetch spending data' });
  }
});




// Define the endpoint to add a family member
app.post('/api/additional_users', (req, res) => {
  const { userId, name } = req.body;
  
  if (!userId || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `INSERT INTO family_members (userId, name) VALUES (?, ?)`;
  db.run(query, [userId, name], function (err) {
    if (err) {
      console.error('Error adding family member:', err);
      return res.status(500).json({ error: 'Failed to add family member' });
    }
    res.status(200).json({ id: this.lastID, userId, name });
  });
});

// Endpoint to get family members
app.get('/api/family_members/:userId', (req, res) => {
  const { userId } = req.params;
  
  const query = `SELECT * FROM family_members WHERE userId = ?`;
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching family members:', err);
      return res.status(500).json({ error: 'Failed to fetch family members' });
    }
    res.status(200).json(rows);
  });
});

app.post('/api/spending', (req, res) => {
  const { family_member_id, amount, date, description } = req.body;
  
  if (!family_member_id || !amount || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `INSERT INTO spending (family_member_id, amount, date, description) VALUES (?, ?, ?, ?)`;
  db.run(query, [family_member_id, amount, date, description], function (err) {
    if (err) {
      console.error('Error adding spending data:', err);
      return res.status(500).json({ error: 'Failed to add spending data' });
    }
    res.status(200).json({ id: this.lastID, family_member_id, amount, date, description });
  });
});

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

// Endpoint to get the top 10 most recent transactions (both income and expenses)
app.get('/api/recent-transactions/:userId', (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT 'income' AS type, id, senderName AS name, amountReceived AS amount, date
    FROM income WHERE user_id = ?
    UNION ALL
    SELECT 'expense' AS type, id, merchant AS name, amount, date
    FROM transactions WHERE userId = ?
    ORDER BY date DESC
    LIMIT 10
  `;
  db.all(query, [userId, userId], (err, rows) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }
    res.status(200).json(rows);
  });
});

// Endpoint to add new income
app.post('/api/income', (req, res) => {
  const { userId, senderName, incomeType, amountReceived, date } = req.body;

  const query = `INSERT INTO income (user_id, senderName, incomeType, amountReceived, date) VALUES (?, ?, ?, ?, ?)`;
  const params = [userId, senderName, incomeType, amountReceived, date];

  db.serialize(() => {
    db.run(query, params, function (err) {
      if (err) {
        console.error('Error inserting income:', err);
        return res.status(500).json({ error: 'Failed to add income' });
      }
      
      // Update balance after adding new income
      db.run(`UPDATE balance SET balance = balance + ? WHERE user_id = ?`, [amountReceived, userId], function (err) {
        if (err) {
          console.error('Error updating balance:', err);
          return res.status(500).json({ error: 'Failed to update balance' });
        }
        res.status(200).json({
          id: this.lastID,
          userId,
          senderName,
          incomeType,
          amountReceived,
          date
        });
      });
    });
  });
});


// Endpoint to fetch all income
app.get('/api/income/:userId', (req, res) => {
  const { userId } = req.params;
  db.all(`SELECT * FROM income WHERE user_id = ?`, [userId], (err, rows) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }
    res.status(200).json(rows);
  });
});


// Endpoint to add transactions
app.post('/api/transactions', (req, res) => {
  const { cardNumber, name, merchant, amount, date, status, userId } = req.body;
  const query = `INSERT INTO transactions (cardNumber, name, merchant, amount, date, status, userId) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = [cardNumber, name, merchant, amount, date, status, userId];
  
  db.run(query, params, function (err) {
    if (err) {
      console.error('Error inserting transaction:', err);
      return res.status(500).json({ error: 'Failed to add transaction' });
    }
    console.log('Transaction inserted:', this.lastID);
    res.status(200).json({
      id: this.lastID,
      cardNumber,
      name,
      merchant,
      amount,
      date,
      status,
      userId
    });
  });
});




// Endpoint to get all transactions
app.get('/api/transactions/:userId', (req, res) => {
  const { userId } = req.params;
  db.all(`SELECT * FROM transactions WHERE userId = ?`, [userId], (err, rows) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }
    res.status(200).json(rows);
  });
});


app.post('/api/user', (req, res) => {
  const { id, name, email, password, picture } = req.body;

  // Validate request body
  if (!id || !name || !email) {
    console.error('Missing required fields:', { id, name, email, password });
    return res.status(400).send('Missing required fields');
  }

  // Function to upsert user data
  const upsertUser = (hashedPassword) => {
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
  };

  // Hash the password if provided
  if (password) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).send('Internal Server Error');
      }
      upsertUser(hashedPassword);
    });
  } else {
    upsertUser(null);
  }
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
    if (!row) {
      return res.status(404).json({ balance: 0 }); // Return valid JSON even if balance is not found
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
  const predefinedSecret = process.env.ADMIN_SECRET || 'hifour-admin'; // secret key
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

