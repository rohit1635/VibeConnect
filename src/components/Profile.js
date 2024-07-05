import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { UserContext } from '../UserContext';
import './Profile.css';

const Profile = () => {
  const { userId } = useParams();
  const { user } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [hoveredPostId, setHoveredPostId] = useState(null);
  const [newPostText, setNewPostText] = useState('');
  const [newPostHashtags, setNewPostHashtags] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [editPostId, setEditPostId] = useState(null);
  const [editPostText, setEditPostText] = useState('');
  const [editPostHashtags, setEditPostHashtags] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchHashtags, setSearchHashtags] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const followUser = async (follower_id, followed_id) => {
    try {
      await axios.post('http://localhost:5000/api/users/follow', { follower_id, followed_id });
      alert('User followed successfully');
      fetchProfile();
    } catch (error) {
      alert('Error following user');
    }
  };

  const unfollowUser = async (follower_id, followed_id) => {
    try {
      await axios.delete('http://localhost:5000/api/users/follow/unfollow', { data: { follower_id, followed_id } });
      alert('User unfollowed successfully');
      fetchProfile();
    } catch (error) {
      alert('Error unfollowing user');
    }
  };

  const likePost = async (post_id) => {
    try {
      await axios.post(`http://localhost:5001/api/discussions/${post_id}/like`, { user_id: profile.user.id });
      alert('Post liked successfully');
      fetchProfile();
    } catch (error) {
      alert('Error liking post');
    }
  };

  const incrementViewCount = async (post_id) => {
    try {
      await axios.post(`http://localhost:5001/api/discussions/${post_id}/view`);
      fetchProfile();
    } catch (error) {
      alert('Error incrementing view count');
    }
  };

  const createComment = async (post_id) => {
    try {
      await axios.post(`http://localhost:5001/api/discussions/${post_id}/comment`, {
        user_id: profile.user.id,
        text: newComment,
      });
      alert('Comment posted successfully');
      setNewComment('');
      fetchProfile();
    } catch (error) {
      alert('Error posting comment');
    }
  };

  const createPost = async () => {
    try {
      const formData = new FormData();
      formData.append('text', newPostText);
      formData.append('hashtags', newPostHashtags);
      formData.append('user_id', profile.user.id);
      if (newPostImage) {
        formData.append('image', newPostImage);
      }
  
      await axios.post('http://localhost:5001/api/discussions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      alert('Post created successfully');
      setNewPostText('');
      setNewPostHashtags('');
      setNewPostImage(null);
      fetchProfile();
    } catch (error) {
      alert('Error creating post');
    }
  };
  

  const updatePost = async () => {
    try {
      const formData = new FormData();
      formData.append('text', editPostText);
      formData.append('hashtags', editPostHashtags);

      await axios.put(`http://localhost:5001/api/discussions/${editPostId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Post updated successfully');
      setEditPostId(null);
      setEditPostText('');
      setEditPostHashtags('');
      fetchProfile();
    } catch (error) {
      alert('Error updating post');
    }
  };

  const deletePost = async (post_id) => {
    try {
      await axios.delete(`http://localhost:5001/api/discussions/${post_id}`);
      alert('Post deleted successfully');
      fetchProfile();
    } catch (error) {
      alert('Error deleting post');
    }
  };

  const searchPostsByText = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/discussions/search?text=${searchText}`);
      setSearchResults(response.data);
    } catch (error) {
      alert('Error searching posts');
    }
  };

  const searchPostsByHashtags = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/discussions/tags?tags=${searchHashtags}`);
      setSearchResults(response.data);
    } catch (error) {
      alert('Error searching posts');
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <h1>{profile.user.name}'s Profile</h1>
      <p>Email: {profile.user.email}</p>
      <p>Mobile: {profile.user.mobile}</p>

      <h2>Followers</h2>
      <ul>
        {profile.followers.map(follower => (
          <li key={follower.id}>
            {follower.name}
            {profile.user && profile.user.id !== follower.id && (
              <button onClick={() => followUser(profile.user.id, follower.id)}>Follow</button>
            )}
          </li>
        ))}
      </ul>

      <h2>Following</h2>
      <ul>
        {profile.following.map(following => (
          <li key={following.id}>
            {following.name}
            {profile.user && profile.user.id !== following.id && (
              <button onClick={() => unfollowUser(profile.user.id, following.id)}>Unfollow</button>
            )}
          </li>
        ))}
      </ul>

      <h2>Posts</h2>
      <div className="post-form">
        <textarea
          placeholder="What's on your mind?"
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
        ></textarea>
        <input
          type="text"
          placeholder="Hashtags"
          value={newPostHashtags}
          onChange={(e) => setNewPostHashtags(e.target.value)}
        />
         <input
              type="file"
              onChange={(e) => setNewPostImage(e.target.files[0])}
            />
        <button onClick={createPost}>Post</button>
      </div>

      <div className="search-form">
        <input
          type="text"
          placeholder="Search posts by text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button onClick={searchPostsByText}>Search</button>
        <input
          type="text"
          placeholder="Search posts by hashtags"
          value={searchHashtags}
          onChange={(e) => setSearchHashtags(e.target.value)}
        />
        <button onClick={searchPostsByHashtags}>Search</button>
      </div>

      {searchResults.length > 0 ? (
        searchResults.map(post => (
          <div
            key={post.id}
            className="post"
            onMouseEnter={() => {
              setHoveredPostId(post.id);
              incrementViewCount(post.id);
            }}
            onMouseLeave={() => setHoveredPostId(null)}
          >
            <p>Posted by (user_id): {post.user_id}</p>
            <p>{post.text}</p>
            <p>Hashtags: {post.hashtags}</p>
            <p>Comments: {post.comments_count}</p>
            <p>Likes: {post.likes_count}</p>
            <p>Views: {post.viewCount}</p>
            <button onClick={() => likePost(post.id)}>Like Post</button>
            <button onClick={() => {
              setEditPostId(post.id);
              setEditPostText(post.text);
              setEditPostHashtags(post.hashtags);
            }}>Edit</button>
            <button onClick={() => deletePost(post.id)}>Delete</button>

            {editPostId === post.id && (
              <div className="edit-form">
                <textarea
                  value={editPostText}
                  onChange={(e) => setEditPostText(e.target.value)}
                ></textarea>
                <input
                  type="text"
                  value={editPostHashtags}
                  onChange={(e) => setEditPostHashtags(e.target.value)}
                />
                <button onClick={updatePost}>Update Post</button>
                <button onClick={() => {
                  setEditPostId(null);
                  setEditPostText('');
                  setEditPostHashtags('');
                }}>Cancel</button>
              </div>
            )}

            <div className="comment-section">
              <textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
              <button onClick={() => createComment(post.id)}>Post Comment</button>
              {post.comments && post.comments.map(comment => (
                <div key={comment.id} className="comment">
                  <p><strong>{comment.user_name}:</strong> {comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        profile.posts.map(post => (
          <div
            key={post.id}
            className="post"
            onMouseEnter={() => {
              setHoveredPostId(post.id);
              incrementViewCount(post.id);
            }}
            onMouseLeave={() => setHoveredPostId(null)}
          >
            <p>Posted by (user_id): {post.user_id}</p>
            <p>{post.text}</p>
            <p>Hashtags: {post.hashtags}</p>
            <p>Comments: {post.comments_count}</p>
            <p>Likes: {post.likes_count}</p>
            <p>Views: {post.viewCount}</p>
            <button onClick={() => likePost(post.id)}>Like Post</button>
            <button onClick={() => {
              setEditPostId(post.id);
              setEditPostText(post.text);
              setEditPostHashtags(post.hashtags);
            }}>Edit</button>
            <button onClick={() => deletePost(post.id)}>Delete</button>

            {editPostId === post.id && (
              <div className="edit-form">
                <textarea
                  value={editPostText}
                  onChange={(e) => setEditPostText(e.target.value)}
                ></textarea>
                <input
                  type="text"
                  value={editPostHashtags}
                  onChange={(e) => setEditPostHashtags(e.target.value)}
                />
                <button onClick={updatePost}>Update Post</button>
                <button onClick={() => {
                  setEditPostId(null);
                  setEditPostText('');
                  setEditPostHashtags('');
                }}>Cancel</button>
              </div>
            )}

            <div className="comment-section">
              <textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
              <button onClick={() => createComment(post.id)}>Post Comment</button>
              {post.comments && post.comments.map(comment => (
                <div key={comment.id} className="comment">
                  <p><strong>{comment.user_name}:</strong> {comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Profile;
