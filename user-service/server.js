const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
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

app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
