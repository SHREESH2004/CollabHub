import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/user.context';
import axiosInstance from './config/axios';
import { useNavigate } from 'react-router-dom'; // Correct import

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [notification, setNotification] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [projects, setProjects] = useState([]);

  const navigate = useNavigate(); // Correct usage

  const getAuthToken = () => localStorage.getItem('token');

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (projectName.trim() === '') {
      setNotification('❌ Project name cannot be empty!');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    try {
      const response = await axiosInstance.post(
        '/project/create',
        { name: projectName },
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );

      if (response.status === 201) {
        setNotification(`✅ Project "${response.data.name}" created successfully!`);
        setProjectName('');
        setIsModalOpen(false);
        fetchProjects();
      } else {
        setNotification(`❌ ${response.data.message || 'Unexpected server response.'}`);
      }
    } catch (error) {
      console.error('Project creation error:', error);
      setNotification('❌ Failed to create project.');
    } finally {
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get('/project/all', {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setNotification('❌ Failed to load projects.');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const styles = {
    main: {
      padding: '20px',
      backgroundColor: isDarkMode ? '#0d0d0d' : '#101010',
      color: isDarkMode ? '#fff' : '#ddd',
      minHeight: '100vh',
      fontFamily: "'Orbitron', sans-serif",
      transition: 'all 0.5s ease',
      overflow: 'hidden',
    },
    topBar: {
      background: isDarkMode
        ? 'linear-gradient(135deg, #000000, #1a0033)'
        : 'linear-gradient(135deg, #1a1a1a, #333333)',
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: '20px',
      backdropFilter: 'blur(15px)',
      boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
    },
    content: {
      textAlign: 'center',
      marginTop: '50px',
    },
    addButton: {
      backgroundColor: isDarkMode ? '#ff007f' : '#00ffff',
      color: '#fff',
      border: 'none',
      padding: '20px',
      borderRadius: '50%',
      cursor: 'pointer',
      fontSize: '2rem',
      transition: 'transform 0.3s ease, background 0.3s ease',
      boxShadow: '0 0 20px rgba(255, 0, 127, 0.8)',
      margin: '20px auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'glow 1.5s infinite alternate',
    },
    projectsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '20px',
      marginTop: '30px',
    },
    projectBox: {
      background: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(20, 20, 20, 0.8)',
      padding: '20px',
      borderRadius: '15px',
      boxShadow: '0 0 20px rgba(0, 255, 255, 0.6)',
      width: '250px',
      textAlign: 'center',
      transition: 'transform 0.3s ease, background 0.3s ease',
      border: '2px solid #00ffff',
      cursor: 'pointer',
    },
    collaborators: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '10px',
      fontSize: '1rem',
      color: '#00ffff',
      fontWeight: 'bold',
      animation: 'pulse 1.5s infinite',
    },
    userIcon: {
      color: '#ff00ff',
      fontSize: '1.5rem',
      animation: 'glow 1.5s infinite alternate',
    },
    notification: {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#ff00ff',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '5px',
      opacity: notification ? 1 : 0,
      transition: 'opacity 0.5s ease',
      boxShadow: '0 0 20px rgba(255, 0, 255, 0.8)',
    },
  };

  return (
    <main style={styles.main}>
      <div style={styles.topBar}>
        <h1 style={{ color: '#00ffff' }}>🌐 CollabHub</h1>
        <button onClick={toggleTheme} style={{ background: 'none', border: '1px solid #00ffff', color: '#00ffff', padding: '8px 16px', borderRadius: '10px' }}>
          {isDarkMode ? 'Neon Mode' : 'Dark Mode'}
        </button>
      </div>

      <div style={styles.content}>
      <h1>🚀 Welcome to CyberCollab {user ? user.email : 'Guest'}</h1>

        <p>Innovate, Collaborate, Dominate. ⚡</p>
      </div>

      {user && (
        <button onClick={() => setIsModalOpen(true)} style={styles.addButton}>
          <i className="ri-link-unlink-m" style={{ fontSize: '2rem' }}></i>
        </button>
      )}

      <div style={styles.projectsContainer}>
        {projects.map((project) => (
          <div
            key={project.id}
            style={styles.projectBox}
            onClick={() => navigate('/project', { state: { project } })}
          >
            <h3>{project.name}</h3>
            <p>{project.description || 'No description available.'}</p>
            <div style={styles.collaborators}>
              <i className="ri-user-3-line" style={styles.userIcon}></i>
              <span>{project.users.length} Collaborators</span>
            </div>
          </div>
        ))}
      </div>

      {notification && <div style={styles.notification}>{notification}</div>}

      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: isDarkMode ? '#1a0033' : '#000',
              padding: '20px',
              borderRadius: '20px',
              textAlign: 'center',
              width: '300px',
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Create New Project 🚀</h2>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project Name"
              style={{
                width: '100%',
                padding: '15px',
                margin: '10px 0',
                border: '2px solid #00ffff',
                borderRadius: '10px',
                backgroundColor: isDarkMode ? '#121212' : '#1a1a1a',
                color: '#00ffff',
              }}
            />
            <button
              onClick={handleSubmit}
              style={{
                backgroundColor: '#00ffff',
                color: '#000',
                padding: '12px 20px',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: 'bold',
              }}
            >
              Create
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
