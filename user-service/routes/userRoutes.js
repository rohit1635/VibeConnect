const express = require('express');
const router = express.Router();

// Create User
router.post('/', async (req, res) => {
  const { name, email, mobile, password } = req.body;
  const db = req.db;

  try {
    const insertQuery = 'INSERT INTO users (name, email, mobile, password) VALUES (?, ?, ?, ?)';
    const values = [name, email, mobile, password];

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(400).json({ error: err.message });
      }
      console.log('User created successfully');
      res.status(201).json({ id: result.insertId, name, email, mobile });
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update User
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, mobile, password } = req.body;
  const db = req.db;

  try {
    const updateQuery = 'UPDATE users SET name=?, email=?, mobile=?, password=? WHERE id=?';
    const values = [name, email, mobile, password, id];

    db.query(updateQuery, values, (err, result) => {
      if (err) {
        console.error('Error updating user:', err);
        return res.status(400).json({ error: err.message });
      }
      console.log('User updated successfully');
      res.status(200).json({ id, name, email, mobile });
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete User
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const db = req.db;

  try {
    const deleteQuery = 'DELETE FROM users WHERE id=?';

    db.query(deleteQuery, [id], (err, result) => {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(400).json({ error: err.message });
      }
      console.log('User deleted successfully');
      res.status(200).json({ message: 'User deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(400).json({ error: error.message });
  }
});

// List Users
router.get('/', async (req, res) => {
  const db = req.db;

  try {
    const selectQuery = 'SELECT * FROM users';

    db.query(selectQuery, (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(400).json({ error: err.message });
      }
      console.log('Users fetched successfully');
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(400).json({ error: error.message });
  }
});

// Search Users by Name
router.get('/search', async (req, res) => {
  const { name } = req.query;
  const db = req.db;

  try {
    const searchQuery = 'SELECT * FROM users WHERE name LIKE ?';
    const searchValue = `%${name}%`;

    db.query(searchQuery, [searchValue], (err, results) => {
      if (err) {
        console.error('Error searching users:', err);
        return res.status(400).json({ error: err.message });
      }
      console.log('Users searched successfully');
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(400).json({ error: error.message });
  }
});

// Follow User
router.post('/follow', async (req, res) => {
  const { follower_id, followed_id } = req.body;
  const sql = 'INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)';
  req.db.query(sql, [follower_id, followed_id], (error, results) => {
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ follower_id, followed_id });
  });
});

// Unfollow User
router.delete('/follow/unfollow', async (req, res) => {
  const { follower_id, followed_id } = req.body;
  const sql = 'DELETE FROM follows WHERE follower_id = ? AND followed_id = ?';
  req.db.query(sql, [follower_id, followed_id], (error, results) => {
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ follower_id, followed_id });
  });
});

//user profile
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const db = req.db;

  try {
    // Fetch user info
    const userQuery = 'SELECT id, name, email, mobile FROM users WHERE id = ?';
    const user = await db.promise().query(userQuery, [id]);

    if (user[0].length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch followers
    const followersQuery = 'SELECT u.id, u.name FROM follows f JOIN users u ON f.follower_id = u.id WHERE f.followed_id = ?';
    const followers = await db.promise().query(followersQuery, [id]);

    // Fetch following
    const followingQuery = 'SELECT u.id, u.name FROM follows f JOIN users u ON f.followed_id = u.id WHERE f.follower_id = ?';
    const following = await db.promise().query(followingQuery, [id]);

    // Fetch user posts with comments, likes, and view count
    const postsQuery = `
      SELECT d.*, 
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = d.id) AS comments_count,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = d.id) AS likes_count,
        viewCount
      FROM discussions d WHERE user_id = ?
    `;
    const posts = await db.promise().query(postsQuery, [id]);

    res.status(200).json({
      user: user[0][0],
      followers: followers[0],
      following: following[0],
      posts: posts[0]
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
