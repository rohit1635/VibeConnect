import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [nameQuery, setNameQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Handle error
    }
  };

  const createUser = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/users', formData);
      console.log('User created successfully:', response.data);
      alert('User Created.');
      fetchUsers(); // Refresh user list after creation
    } catch (error) {
      console.error('Error creating user:', error);
      alert('User already exists.');
      // Handle error
    }
  };

  const updateUser = async (userId) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/users/${userId}`, formData);
      console.log('User updated successfully:', response.data);
      alert('User Updated.');
      fetchUsers(); // Refresh user list after update
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user.');
      // Handle error
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/users/${userId}`);
      console.log('User deleted successfully:', response.data.message);
      fetchUsers(); // Refresh user list after deletion
    } catch (error) {
      console.error('Error deleting user:', error);
      // Handle error
    }
  };

  const searchUsers = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/search?name=${nameQuery}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
      // Handle error
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="user-management-container">
      <h2>User Management</h2>

      <div className="section-container">
        <h3>Create User</h3>
        <div className="input-group">
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
          <input type="text" name="mobile" placeholder="Mobile" value={formData.mobile} onChange={handleInputChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
          <button onClick={createUser}>Create User</button>
        </div>
      </div>

      <div className="section-container">
        <h3>Update User</h3>
        {users.map((user) => (
          <div key={user.id} className="input-group">
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} />
            <input type="text" name="mobile" placeholder="Mobile" value={formData.mobile} onChange={handleInputChange} />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} />
            <button onClick={() => updateUser(user.id)}>Update</button>
            <button onClick={() => deleteUser(user.id)}>Delete</button>
          </div>
        ))}
      </div>

      <div className="section-container">
        <h3>Search Users</h3>
        <div className="input-group">
          <input type="text" placeholder="Search by name" value={nameQuery} onChange={(e) => setNameQuery(e.target.value)} />
          <button onClick={searchUsers}>Search</button>
        </div>
      </div>

      <div className="section-container">
        <h3>User List</h3>
        <ul className="user-list">
          {users.map((user) => (
            <li key={user.id}>{user.name} - {user.email} - {user.mobile}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default UserManagement;
