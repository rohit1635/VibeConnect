const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    const db = req.db;

    // Check if user already exists
    const selectQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(selectQuery, [email], async (err, results) => {
      if (err) {
        console.error('Error checking existing user:', err);
        return res.status(500).send({ error: 'Server error' });
      }

      if (results.length > 0) {
        return res.status(400).send({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 8);

      // Create new user
      const insertQuery = 'INSERT INTO users (name, email, mobile, password) VALUES (?, ?, ?, ?)';
      db.query(insertQuery, [name, email, mobile, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).send({ error: 'Server error' });
        }
        console.log('User created successfully');
        const user= { id: result.insertId, name, email, mobile };
        res.status(201).send({user});
      });
    });
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(400).send({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = req.db;

    // Find user by email
    const selectQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(selectQuery, [email], async (err, results) => {
      if (err) {
        console.error('Error finding user:', err);
        return res.status(500).send({ error: 'Server error' });
      }

      if (results.length === 0) {
        return res.status(404).send({ error: 'Invalid login credentials' });
      }

      const user = results[0];

      // Compare passwords
      console.log(password)
      console.log(user.password)
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(isMatch)
      if (!isMatch) {
        return res.status(400).send({ error: 'Invalid l credentials' });
      }

      // Generate token
      const token = jwt.sign({ id: user.id }, 'secretkey'); // Replace 'secretkey' with your actual secret key
      res.send({ token , user});
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
