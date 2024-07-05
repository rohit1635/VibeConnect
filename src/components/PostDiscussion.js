import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Discussion.css';

function PostDiscussion() {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [hashtags, setHashtags] = useState('');
  const [discussions, setDiscussions] = useState([]);
  const [searchTags, setSearchTags] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState({ id: 4 }); // Replace with actual user data or use context for authentication

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('text', text);
    if (image) formData.append('image', image);
    formData.append('hashtags', hashtags);

    try {
      await axios.post('http://localhost:5001/api/discussions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Discussion posted successfully!');
      fetchDiscussions();
      setText('');
      setImage(null);
      setHashtags('');
    } catch (error) {
      alert('Error posting discussion.');
    }
  };

  const handleUpdate = async (id) => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('hashtags', hashtags);

    try {
      await axios.put(`http://localhost:5001/api/discussions/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Discussion updated successfully!');
      fetchDiscussions();
    } catch (error) {
      alert('Error updating discussion.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/discussions/${id}`);
      alert('Discussion deleted successfully!');
      fetchDiscussions();
    } catch (error) {
      alert('Error deleting discussion.');
    }
  };

  const fetchDiscussions = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/discussions');
      setDiscussions(response.data);
    } catch (error) {
      alert('Error fetching discussions.');
    }
  };

  const searchByTags = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/discussions/tags?tags=${searchTags}`);
      setSearchResults(response.data);
    } catch (error) {
      alert('Error searching discussions by tags.');
    }
  };

  const searchByText = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/discussions/search?text=${searchText}`);
      setSearchResults(response.data);
    } catch (error) {
      alert('Error searching discussions by text.');
    }
  };

  const incrementViewCount = async (post_id) => {
    try {
      await axios.post(`http://localhost:5001/api/discussions/${post_id}/view`);
      alert('View count incremented');
    } catch (error) {
      alert('Error incrementing view count');
    }
  };

  const createComment = async (post_id) => {
    try {
      await axios.post(`http://localhost:5001/api/discussions/${post_id}/comment`, {
        user_id: user.id,
        text: newComment,
      });
      alert('Comment posted successfully');
      setNewComment('');
      fetchDiscussions();
    } catch (error) {
      alert('Error posting comment');
    }
  };

  const modifyComment = async (comment_id, text) => {
    try {
      await axios.put(`http://localhost:5001/api/discussions/comment/${comment_id}`, { text });
      alert('Comment modified successfully');
      fetchDiscussions();
    } catch (error) {
      alert('Error modifying comment');
    }
  };

  const deleteComment = async (comment_id) => {
    try {
      await axios.delete(`http://localhost:5001/api/discussions/comment/${comment_id}`);
      alert('Comment deleted successfully');
      fetchDiscussions();
    } catch (error) {
      alert('Error deleting comment');
    }
  };

  const likePost = async (post_id) => {
    try {
      await axios.post(`http://localhost:5001/api/discussions/${post_id}/like`, { user_id: user.id });
      alert('Post liked successfully');
      fetchDiscussions();
    } catch (error) {
      alert('Error liking post');
    }
  };

  const likeComment = async (comment_id) => {
    try {
      await axios.post(`http://localhost:5001/api/discussions/comment/${comment_id}/like`, { user_id: user.id });
      alert('Comment liked successfully');
      fetchDiscussions();
    } catch (error) {
      alert('Error liking comment');
    }
  };

  return (
    <div className="discussion-container">
      <form onSubmit={handleSubmit} className="post-form">
        <textarea placeholder="Text" value={text} onChange={(e) => setText(e.target.value)} required></textarea>
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <input type="text" placeholder="Hashtags" value={hashtags} onChange={(e) => setHashtags(e.target.value)} required />
        <button type="submit">Post</button>
      </form>

      <div className="action-buttons">
        <button onClick={fetchDiscussions}>Fetch Discussions</button>
      </div>

      <ul className="discussion-list">
        {discussions.map((discussion) => (
          <li key={discussion.id} className="discussion-item">
            <div className="discussion-info">
              <span className="discussion-text">{discussion.text}</span> - <span className="discussion-hashtags">{discussion.hashtags}</span>
            </div>
            <div className="discussion-buttons">
              <button onClick={() => handleUpdate(discussion.id)}>Update</button>
              <button onClick={() => handleDelete(discussion.id)}>Delete</button>
              <button onClick={() => incrementViewCount(discussion.id)}>Increment View Count</button>
              <button onClick={() => likePost(discussion.id)}>Like Post</button>
              <button onClick={() => createComment(discussion.id)}>Create Comment</button>
              <ul>
                {discussion.comments && discussion.comments.map((comment) => (
                  <li key={comment.id}>
                    {comment.text}
                    <button onClick={() => likeComment(comment.id)}>Like</button>
                    <button onClick={() => modifyComment(comment.id, 'New text')}>Modify</button>
                    <button onClick={() => deleteComment(comment.id)}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>

      <div className="search-section">
        <input type="text" placeholder="Search by tags" value={searchTags} onChange={(e) => setSearchTags(e.target.value)} />
        <button onClick={searchByTags}>Search by Tags</button>
      </div>

      <div className="search-section">
        <input type="text" placeholder="Search by text" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        <button onClick={searchByText}>Search by Text</button>
      </div>

      <ul className="search-results">
        {searchResults && searchResults.map((result) => (
          <li key={result.id}>{result.text} - {result.hashtags}</li>
        ))}
      </ul>
    </div>
  );
}

export default PostDiscussion;
