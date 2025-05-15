import React, { useState, useEffect } from 'react';  // Make sure to include useEffect here

import { useLocation } from 'react-router-dom';
import axiosInstance from './config/axios';// Import axiosInstance
import { getWebContainer } from './config/WebContainer';
const Coding = () => {
  const location = useLocation();
  const { code } = location.state || {};

  const [sidebarWidth, setSidebarWidth] = useState(80);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isDraggingTerminal, setIsDraggingTerminal] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [ webContainer, setWebContainer ] = useState(null)
  const user = "user"; // Example user, replace it with actual user context if needed

  // Sidebar resizing logic
  const handleMouseMoveSidebar = (e) => {
    if (isDraggingSidebar) {
      const newWidth = e.clientX;
      setSidebarWidth(Math.max(60, Math.min(300, newWidth)));
    }
  };

  const handleMouseUpSidebar = () => {
    setIsDraggingSidebar(false);
    document.removeEventListener('mousemove', handleMouseMoveSidebar);
    document.removeEventListener('mouseup', handleMouseUpSidebar);
  };

  const handleMouseDownSidebar = () => {
    setIsDraggingSidebar(true);
    document.addEventListener('mousemove', handleMouseMoveSidebar);
    document.addEventListener('mouseup', handleMouseUpSidebar);
  };

  // Terminal resizing logic
  const handleMouseMoveTerminal = (e) => {
    if (isDraggingTerminal) {
      const newHeight = window.innerHeight - e.clientY;
      setTerminalHeight(Math.max(100, newHeight));
    }
  };

  const handleMouseUpTerminal = () => {
    setIsDraggingTerminal(false);
    document.removeEventListener('mousemove', handleMouseMoveTerminal);
    document.removeEventListener('mouseup', handleMouseUpTerminal);
  };

  const handleMouseDownTerminal = () => {
    setIsDraggingTerminal(true);
    document.addEventListener('mousemove', handleMouseMoveTerminal);
    document.addEventListener('mouseup', handleMouseUpTerminal);
  };

  const handleSend = async () => {
    if (input.trim() !== '') {
      let messageText = input.trim();
      const aiTrigger = '@ai';

      if (messageText.includes(aiTrigger)) {
        const prompt = messageText.split(aiTrigger)[1]?.trim();
        if (prompt) {
          try {
            const response = await axiosInstance.get('http://localhost:4000/ai/code', {
              params: { prompt },
            });

            const aiMessage = {
              text: response.data || 'No response from AI.',
              sender: 'AI',
              timestamp: new Date().toISOString(),
              fileTree: response.data.fileTree || {}, // Ensure proper structure
            };

            setFileTree(aiMessage.fileTree); // Update the file tree state
            setMessages((prevMessages) => [...prevMessages, aiMessage]);
          } catch (error) {
            console.error('Error calling AI API:', error);
          }
        }
      } else {
        const message = {
          text: messageText,
          sender: user,
          timestamp: new Date().toISOString(),
        };

        setMessages((prevMessages) => [...prevMessages, message]);
        sendMessage('project-message', message);
      }

      setInput(''); // Clear input after sending
    }
  };
  useEffect(() => {
    if (!webContainer) {
      getWebContainer().then(container => {
        setWebContainer(container);
        console.log("container started");
      });
    }
  }, [webContainer]); // Only run this effect when the `webContainer` state changes
  
  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={{ ...styles.sidebar, width: `${sidebarWidth}px` }}>
        <div style={styles.sidebarHeader}>Project Explorer</div>
        {['main.js', 'utils.js', 'app.js'].map((item) => (
          <button key={item} style={styles.sidebarButton}>
            {item}
          </button>
        ))}
        <button style={styles.terminalButton} onClick={() => setIsTerminalVisible(!isTerminalVisible)}>
          Terminal
        </button>
        <div
          style={styles.sidebarResizer}
          onMouseDown={handleMouseDownSidebar}
        />
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.tabBar}>
          <span style={styles.activeTab}>main.js</span>
          <span style={styles.tab}>utils.js</span>
          <span style={styles.tab}>app.js</span>
        </div>
        <pre style={styles.codeBox}>{code || `// Start coding...`}</pre>
      </div>

      {/* Terminal */}
      {isTerminalVisible && (
        <div style={{ ...styles.terminal, height: `${terminalHeight}px` }}>
          <div id="terminal">
            <div id="output" style={styles.output}></div>
            <input
              type="text"
              id="input"
              style={styles.input}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const command = e.target.value;
                  const output = document.getElementById('output');
                  output.innerHTML += `> ${command}<br>`;
                  processCommand(command);
                  e.target.value = '';
                  output.scrollTop = output.scrollHeight;
                }
              }}
            />
          </div>
          <div
            style={styles.terminalResizer}
            onMouseDown={handleMouseDownTerminal}
          />
        </div>
      )}
    </div>
  );

  function processCommand(command) {
    const output = document.getElementById('output');
    const lowerCommand = command.toLowerCase();
    if (lowerCommand === 'hello') {
      output.innerHTML += 'Hello, user!<br>';
    } else if (lowerCommand === 'date') {
      output.innerHTML += new Date().toString() + '<br>';
    } else if (lowerCommand === 'clear') {
      output.innerHTML = '';
    } else {
      output.innerHTML += `Unknown command: ${command}<br>`;
    }
  }
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#121212', // Darker background
    color: '#e0e0e0', // Light text color
    fontFamily: 'Consolas, monospace',
    position: 'relative',
  },

  sidebar: {
    backgroundColor: '#1f1f1f', // Slightly lighter dark background for the sidebar
    display: 'flex',
    flexDirection: 'column',
    padding: '15px',
    borderRight: '2px solid #333', // Thicker border for contrast
    position: 'relative',
    transition: 'width 0.3s ease-in-out',
  },

  sidebarHeader: {
    color: '#80cbc4', // Cool, muted teal for the header
    fontWeight: 'bold',
    marginBottom: '15px',
    fontSize: '18px',
  },

  sidebarButton: {
    backgroundColor: '#1f1f1f',
    color: '#e0e0e0',
    border: '1px solid #333',
    padding: '10px 15px',
    margin: '8px 0',
    borderRadius: '6px',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center',
    fontSize: '16px',
    transition: 'background 0.3s',
  },

  terminalButton: {
    backgroundColor: '#1f1f1f',
    color: '#80cbc4',
    border: '1px solid #333',
    padding: '10px 15px',
    margin: '15px 0',
    borderRadius: '6px',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center',
    fontSize: '16px',
    transition: 'background 0.3s',
  },

  sidebarResizer: {
    backgroundColor: '#80cbc4', // Lighter teal for the resizer handle
    width: '5px',
    cursor: 'ew-resize',
    position: 'absolute',
    right: '0',
    top: '0',
    bottom: '0',
    transition: 'background 0.3s ease-in-out',
  },

  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '15px',
    backgroundColor: '#121212',
    borderLeft: '2px solid #333',
  },

  tabBar: {
    display: 'flex',
    backgroundColor: '#1f1f1f',
    padding: '8px',
    borderBottom: '2px solid #333',
  },

  activeTab: {
    padding: '8px 15px',
    backgroundColor: '#80cbc4', // Highlighted tab color
    color: '#000',
    borderRadius: '6px',
    marginRight: '10px',
    fontWeight: 'bold',
  },

  tab: {
    padding: '8px 15px',
    backgroundColor: '#1f1f1f',
    color: '#e0e0e0',
    borderRadius: '6px',
    marginRight: '10px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },

  codeBox: {
    backgroundColor: '#1f1f1f',
    padding: '20px',
    borderRadius: '8px',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    fontSize: '16px',
    color: '#e0e0e0',
    border: '1px solid #333',
    flex: 1,
    transition: 'background 0.3s',
  },

  runButton: {
    backgroundColor: '#80cbc4',
    color: '#121212',
    padding: '10px 15px',
    marginTop: '20px',
    borderRadius: '6px',
    cursor: 'pointer',
    border: 'none',
    transition: 'background 0.3s',
  },

  terminal: {
    backgroundColor: '#000000', // Dark terminal background
    color: '#e0e0e0',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    bottom: '0',
    width: '100%',
    borderTop: '3px solid #80cbc4', // Lighter teal border
    transition: 'height 0.3s ease-in-out',
  },

  output: {
    background: '#000000',
    color: '#e0e0e0',
    padding: '10px',
    overflowY: 'auto',
    height: '100%',
  },

  input: {
    background: 'transparent',
    border: 'none',
    color: '#e0e0e0',
    outline: 'none',
    fontSize: '16px',
    marginTop: '8px',
    width: '100%',
  },

  terminalResizer: {
    backgroundColor: '#80cbc4',
    height: '5px',
    cursor: 'ns-resize',
    position: 'fixed',
    bottom: '0',
    width: '100%',
    transition: 'background 0.3s',
  },
};

export default Coding;
