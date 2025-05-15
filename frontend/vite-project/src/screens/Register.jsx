import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from './config/axios'; // Import the configured Axios instance

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState('dark');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/users/register', {
        email,
        password,
      });

      console.log('Registration Successful:', response.data);
      alert('Registration successful! Please log in.');
      navigate('/login'); // Redirect to login after successful registration
    } catch (error) {
      console.error('Registration Failed:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const styles = {
    body: {
      background: theme === 'dark' 
        ? 'linear-gradient(135deg, #0f0f0f, #1a1a1a)' 
        : '#f5f5f5',
      color: theme === 'dark' ? '#fff' : '#000',
      fontFamily: "'Orbitron', sans-serif",
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      margin: 0,
      padding: '20px',
      transition: 'background 0.5s, color 0.5s',
    },
    container: {
      width: '400px',
      background: theme === 'dark' ? 'rgba(20, 20, 20, 0.9)' : '#fff',
      padding: '40px 30px',
      borderRadius: '20px',
      boxShadow: theme === 'dark' 
        ? '0 0 40px rgba(0, 255, 255, 0.5)' 
        : '0 0 30px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      position: 'relative',
      backdropFilter: theme === 'dark' ? 'blur(10px)' : 'none',
      overflow: 'hidden',
      transition: 'all 0.5s',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#00FFFF',
      letterSpacing: '2px',
      marginBottom: '10px',
      textShadow: theme === 'dark' ? '0 0 20px #00FFFF' : 'none',
    },
    subtitle: {
      fontSize: '1rem',
      color: theme === 'dark' ? '#A9A9A9' : '#555',
      fontWeight: '500',
      marginBottom: '20px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    input: {
      width: '100%',
      padding: '14px 18px',
      borderRadius: '12px',
      border: `2px solid ${theme === 'dark' ? '#00FFFF' : '#000'}`,
      background: theme === 'dark' ? 'transparent' : '#f9f9f9',
      color: theme === 'dark' ? '#fff' : '#000',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.3s ease',
      boxShadow: `0 0 10px ${theme === 'dark' ? 'rgba(0, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.1)'}`,
    },
    button: {
      background: theme === 'dark' 
        ? 'linear-gradient(90deg, #ff00ff, #00ffff)' 
        : '#4CAF50',
      color: '#fff',
      padding: '16px',
      border: 'none',
      borderRadius: '20px',
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.4s ease-in-out',
      width: '100%',
      boxShadow: theme === 'dark' 
        ? '0 0 20px rgba(255, 0, 255, 0.8)' 
        : '0 0 20px rgba(76, 175, 80, 0.8)',
    },
    link: {
      color: theme === 'dark' ? '#ff00ff' : '#4CAF50',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: '0.9rem',
      transition: 'color 0.3s ease-in-out',
    },
    themeToggle: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: theme === 'dark' ? '#00FFFF' : '#ff00ff',
      color: '#000',
      padding: '8px 16px',
      borderRadius: '20px',
      cursor: 'pointer',
      transition: 'background 0.3s',
    },
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.themeToggle} onClick={toggleTheme}>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        <h1 style={styles.title}>CollabHub</h1>
        <p style={styles.subtitle}>Futuristic Collaboration Hub</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            style={styles.input}
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>
            Register
          </button>
        </form>

        <p style={{ marginTop: '15px' }}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
