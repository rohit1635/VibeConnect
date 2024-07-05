const express = require('express');
const discussionRouter = require('./routes/discussionRoutes');
const cors = require('cors');
const mysql = require('mysql2');
const config = require('./config.json');

const app = express();
app.use(express.json());
app.use(cors()); 

const db = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use('/api/discussions', discussionRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Discussion Service running on port ${PORT}`);
});
