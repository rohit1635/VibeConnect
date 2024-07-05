const express = require('express');
const multer = require('multer');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Create Discussion
router.post('/', upload.single('image'), async (req, res) => {
  const { text, hashtags, user_id } = req.body;
  const image = req.file ? req.file.path : null;
  const createdOn = new Date();

  const sql = 'INSERT INTO discussions (text, image, hashtags, createdOn, user_id) VALUES (?, ?, ?, ?, ?)';
  const values = [text, image, hashtags, createdOn, user_id];

  req.db.query(sql, values, (error, results) => {
    if (error) return res.status(400).send(error);
    res.status(201).send({ id: results.insertId, ...req.body, image, createdOn });
  });
});

// Update Discussion
router.put('/:id', async (req, res) => {
  const { text, hashtags, user } = req.body;
  const { id } = req.params;

  const sql = 'UPDATE discussions SET text = ?, hashtags = ? WHERE id = ?';
  const values = [text, hashtags, id];

  req.db.query(sql, values, (error, results) => {
    if (error) return res.status(400).send(error);
    res.send({ id, ...req.body });
  });
});

// Delete Discussion
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM discussions WHERE id = ?';
  req.db.query(sql, [id], (error, results) => {
    if (error) return res.status(400).send(error);
    res.send({ id });
  });
});

// List Discussions
router.get('/', async (req, res) => {
  const sql = 'SELECT * FROM discussions';
  req.db.query(sql, (error, results) => {
    if (error) return res.status(400).send(error);
    res.send(results);
  });
});

// Increment View Count
router.post('/:id/view', async (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE discussions SET viewCount = viewCount + 1 WHERE id = ?';
  req.db.query(sql, [id], (error, results) => {
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ message: 'View count incremented' });
  });
});

//comment
router.post('/:post_id/comment', async (req, res) => {
  const { post_id } = req.params;
  const { user_id, text } = req.body;
  const sql = 'INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)';
  req.db.query(sql, [post_id, user_id, text], (error, results) => {
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ id: results.insertId, post_id, user_id, text });
  });
});

router.put('/comment/:id', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const sql = 'UPDATE comments SET text = ? WHERE id = ?';
  req.db.query(sql, [text, id], (error, results) => {
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ id, text });
  });
});

router.delete('/comment/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM comments WHERE id = ?';
  req.db.query(sql, [id], (error, results) => {
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ message: 'Comment deleted' });
  });
});

//like post 
router.post('/:post_id/like', async (req, res) => {
  const { post_id } = req.params;
  const { user_id } = req.body;
  const sql = 'INSERT INTO likes (user_id, post_id) VALUES (?, ?)';
  req.db.query(sql, [user_id, post_id], (error, results) => {
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ user_id, post_id });
  });
});

//like comment
router.post('/comment/:comment_id/like', async (req, res) => {
  const { comment_id } = req.params;
  const { user_id } = req.body;
  const sql = 'INSERT INTO likes (user_id, comment_id) VALUES (?, ?)';
  req.db.query(sql, [user_id, comment_id], (error, results) => {
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ user_id, comment_id });
  });
});

// Search Discussions by Tags
router.get('/tags', async (req, res) => {
  const tags = req.query.tags.split(',');
  const db = req.db;

  // Adjust the query to check for tags within the JSON array
  const placeholders = tags.map(() => 'JSON_SEARCH(hashtags, "one", ?) IS NOT NULL').join(' OR ');
  const sql = `SELECT * FROM discussions WHERE ${placeholders}`;
  
  db.query(sql, tags, (error, results) => {
    if (error) {
      console.error('Error searching discussions by tags:', error);
      return res.status(400).json({ error: error.message });
    }
    res.json(results);
  });
});


// Search Discussions by Text
router.get('/search', async (req, res) => {
  const text = `%${req.query.text}%`;
  const sql = 'SELECT * FROM discussions WHERE text LIKE ?';
  req.db.query(sql, [text], (error, results) => {
    if (error) return res.status(400).send(error);
    res.send(results);
  });
});

module.exports = router;

