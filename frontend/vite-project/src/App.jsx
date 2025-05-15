import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';     // Import Home
import Login from './screens/Login';     // Import Login   // Import Project
import Register from './screens/Register';
import { UserContext,UserProvider } from './context/user.context';
import Home from './screens/Home';
import Project from './screens/project';
import Coding from './screens/Coding';
const App = () => {
  return (
    <UserProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/project" element={<Project />} />
        <Route path="/code" element={<Coding />} />
      </Routes>
    </Router>
    </UserProvider>
  );
};

export default App;
