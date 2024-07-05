import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { UserProvider, UserContext } from './UserContext'; // Import UserContext
import SignUp from './components/SignUp';
import Login from './components/Login';
import Profile from './components/Profile';
import PostDiscussion from './components/PostDiscussion';
import UserManagement from './components/usermanagement';
import './App.css';

function Home() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // Access user context

  const goToSignUp = () => {
    navigate('/signup');
  };
  const goToLogin = () => {
    navigate('/login');
  };
  const goTOUserManagement = () => {
    navigate('/UserManagement');
  };
  const goToProfile = () => {
    if (user) {
      navigate(`/profile/${user.id}`);
    } else {
      navigate('/login'); // Redirect to login if no user is logged in
    }
  };
  const goToPostDiscussion = () => {
    navigate('/post');
  };

  return (
    <div className="home-container">
      <h1>VibeConnect</h1>
      <h4> -bss Vibe match honi chahiye</h4>
      <div className="button-container">
        <button onClick={goToSignUp}>Go to Sign Up</button>
        <button onClick={goToLogin}>Go to Login Page</button>
        <button onClick={goToProfile}>Profile</button>
        <button onClick={goToPostDiscussion}>Post Discussion</button>
        <button onClick={goTOUserManagement}>User Management</button>
      </div>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/post" element={<PostDiscussion />} />
            <Route path="/UserManagement" element={<UserManagement />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
