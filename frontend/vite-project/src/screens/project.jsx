import React, { useState, useEffect,useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from './config/axios';
import { initializeSocket ,sendMessage,receiveMessage} from './config/socket';
import { UserContext } from '../context/user.context';
import { useNavigate } from 'react-router-dom';
import { getWebContainer } from './config/WebContainer';
const Project = () => {
  const location = useLocation();
  const project = location.state?.project;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [lastSender, setLastSender] = useState(null);
  const [fileTree, setFileTree] = useState({});


  // Modal for removing collaborator
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);

  useEffect(() => {
    const projectId = project?.id || location.state?.project._id;
    const socket = initializeSocket(projectId);
  
    socket.on('project-message', (message) => {
      const sender = message.sender;
    
      setMessages((prevMessages) => {
        const updatedMessages = [
          ...prevMessages,
          {
            ...message,
            showSender: sender !== lastSender, // Only show sender if it's different
          },
        ];
        setLastSender(sender); // Update the last sender
        return updatedMessages;
      });
    
      handleSenderInfo(sender);
    });
    
  
    fetchUsers();
  
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [project, location.state?.project._id]);
  const navigate = useNavigate(); // ✅ Correct usage
  
  const handleSendToCode = (text) => {
      navigate('/code', { state: { code: text } }); // ✅ Use navigate here
    };
  
  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users/all');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  const handleSenderInfo = (sender) => {
    console.log('Handling sender:', sender);
    // Perform any action you need with sender info
    // For example, you could update state or trigger an API call
  };
  const ProjectFiles = ({ fileTree }) => {
    const renderFiles = (tree) => {
      return Object.entries(tree).map(([fileName, fileData]) => (
        <div key={fileName} style={styles.fileContainer}>
          <h4>{fileName}</h4>
          <pre style={styles.fileContent}>{fileData.file.contents}</pre>
          {fileData.fileTree && (
            <div style={styles.nestedFiles}>
              {renderFiles(fileData.fileTree)}
            </div>
          )}
        </div>
      ));
    };
  
    return (
      <div style={styles.fileTreeSection}>
        {Object.keys(fileTree).length > 0 ? renderFiles(fileTree) : <p>No files available yet.</p>}
      </div>
    );
  };
  
  const getUserIdByEmail = async (email) => {
    try {
      const response = await axiosInstance.get('/users/getid', {
        params: { email: email },
      });
      return response.data.userId;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      return null;
    }
  };
  const { user } = useContext(UserContext);
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
  
            setFileTree(aiMessage.fileTree); 
            // Update the file tree state
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
  
  const handleUserClick = async (user) => {
    try {
      const userId = await getUserIdByEmail(user.email);
      const projectId = project?.id || location.state?.project._id;

      if (!projectId || !userId) {
        console.error('Missing projectId or userId:', { projectId, userId });
        return;
      }

      await axiosInstance.put('/project/add-user', {
        projectId,
        users: [userId],
      });

      setCollaborators((prev) => [...prev, user]);

      console.log('User added successfully.');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }
  };

  const handleRemoveClick = (user) => {
    setUserToRemove(user);
    setIsRemoveModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (userToRemove) {
      try {
        const userId = await getUserIdByEmail(userToRemove.email);
        const projectId = project?.id || location.state?.project._id;

        if (!projectId || !userId) {
          console.error('Missing projectId or userId:', { projectId, userId });
          return;
        }

        await axiosInstance.put('/project/remove-user', {
          projectId,
          users: [userId],
        });

        setCollaborators((prev) =>
          prev.filter((user) => user.id !== userToRemove.id)
        );

        console.log('Collaborator removed successfully.');
        setIsRemoveModalOpen(false);
        setUserToRemove(null);
      } catch (error) {
        console.error('Error:', error.response?.data || error.message);
      }
    }
  };

  if (!project) {
    return (
      <div style={styles.container}>
        <h2>No project details available.</h2>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (user) =>
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={styles.container}>
      <div style={styles.chatbox}>
        <div style={styles.chatHeader}>
          <i className="ri-chat-ai-line" style={styles.chatIcon}></i>
        </div>
        <div style={styles.chatWindow}>
        {messages.map((msg, index) => {
  const senderInfo = typeof msg.sender === 'object' ? msg.sender : { name: msg.sender, email: msg.sender };

  let text = typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text, null, 2);
  text = text.replace(/javascript|`|``` /gi, '');

  const formattedText = msg.sender === 'AI'
    ? text.split(/(;|{|})/g).flatMap((part, idx, arr) => {
        const trimmedPart = part.trim();
        if (trimmedPart) {
          const separator = arr[idx + 1];
          return [
            <span key={idx}>{trimmedPart}</span>,
            separator && [';', '{', '}'].includes(separator) ? null : null,
            separator && separator !== ',' && separator !== ';' ? (
              <br key={`${idx}-br`} />
            ) : null,
          ];
        }
        return [];
      })
    : text;

  const formattedTimestamp = new Date(msg.timestamp).toLocaleString();

  // Determine if the message is from the current user
  const isCurrentUser = msg.sender === user?.email;

  return (
    <div
      key={msg._id || msg.timestamp}
      style={isCurrentUser ? styles.yourMessage : styles.otherMessage}
    >
      {msg.sender !== 'AI' && !isCurrentUser && (
        <strong style={{ color: 'cyan' }}>
          {senderInfo.name || senderInfo.email}
        </strong>
      )}
      {msg.sender === 'AI' && (
        <strong style={{ color: 'cyan' }}>AI</strong>
      )}
      <span>{formattedText}</span>

      {/* Send to Code Button */}
      {msg.sender === 'AI' && (
        <button
          style={styles.codeButton}
          onClick={() => handleSendToCode(msg.text)}
        >
          Send to Code
        </button>
      )}

      <div style={{ fontSize: '10px', color: '#aaa', marginTop: '5px' }}>
        {formattedTimestamp}
      </div>
    </div>
  );
})}


        </div>
        <div style={styles.inputContainer}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            style={styles.input}
          />
          <button onClick={handleSend} style={styles.sendButton}>
            <i className="ri-user-line" style={styles.userIcon}></i>
          </button>
        </div>
      </div>

      <div style={styles.projectContent}>
        <div style={styles.topbar}>
          <h1 style={styles.title}>{project.name}</h1>
          <button onClick={() => setIsModalOpen(true)} style={styles.addCollaboratorBtn}>
            <i className="ri-user-add-line" style={styles.addIcon}></i> Add Collaborator
          </button>
        </div>
        

        <p style={styles.description}>{project.description || 'No description available.'}</p>

        <div style={styles.collaborators}>
          <h3>Collaborators:</h3>
          {collaborators.length > 0 ? (
            <ul>
              {collaborators.map((user) => (
              <li key={user.id} style={styles.userItem}>
              {user.name} ({user.email})
              <button onClick={() => handleRemoveClick(user)} style={styles.unselectBtn}>
              Remove Collaborator
              </button>
              </li>
            ))}

            </ul>
          ) : (
            <p>No collaborators yet.</p>
          )}
        </div>
        <div style={styles.fileTreeSection}>
        <h3>Project File Tree</h3>
        {Object.keys(fileTree).length > 0 ? (
          <ProjectFiles fileTree={fileTree} />
        ) : (
          <p>No files available yet.</p>
        )}
      </div>
    </div>

      {/* Add Collaborator Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Select a User</h2>
            <input
              type="text"
              placeholder="Search user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <ul style={styles.userList}>
              {filteredUsers.map((user) => (
                <li
                  key={user.id}
                  style={styles.userTile}
                  onClick={() => handleUserClick(user)}
                >
                  {user.name} ({user.email})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Remove Collaborator Confirmation Modal */}
      {isRemoveModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsRemoveModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Removal</h2>
            <p>Are you sure you want to remove {userToRemove?.name}?</p>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
              <button onClick={handleConfirmRemove} style={styles.addCollaboratorBtn}>
                Yes, Remove
              </button>
              <button onClick={() => setIsRemoveModalOpen(false)} style={styles.unselectBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
    fileTreeSection: {
      backgroundColor: '#1a1a1a',
      padding: '20px',
      borderRadius: '10px',
      marginTop: '20px',
      color: '#fff',
      overflowY: 'auto',
      maxHeight: '400px',
    },
    fileContainer: {
      marginBottom: '15px',
    },
    fileContent: {
      backgroundColor: '#333',
      padding: '10px',
      borderRadius: '5px',
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap',
      overflowX: 'auto',
    },
    nestedFiles: {
      marginLeft: '20px',
    },
  
  container: {
    display: 'flex',
    padding: '20px',
    backgroundColor: '#0d0d0d',
    color: '#fff',
    minHeight: '100vh',
    fontFamily: "'Orbitron', sans-serif",
  },
  chatbox: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: '15px',
    padding: '15px',
    boxShadow: '0 0 30px rgba(255, 0, 255, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    justifyContent: 'space-between',
    marginRight: '20px',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '10px',
  },
  chatIcon: {
    fontSize: '1.8rem',
    color: '#00ffff',
  },
  chatWindow: {
    padding: '10px',
    borderRadius: '10px',
    maxHeight: '150vh',
    overflowY: 'auto',
  },
  yourMessage: {  
    color: '#ffffff',           
    padding: '12px',
    borderRadius: '10px',
    margin: '8px 0',
    textAlign: 'right',
    fontSize: '14px',
    fontFamily: '"Times New Roman", Times, serif', // Times New Roman font
    lineHeight: '1.5',
  },
  
  otherMessage: {
     // Soft pink for contrast
    color: '#ffffff',
    padding: '12px',
    borderRadius: '10px',
    margin: '8px 0',
    textAlign: 'left',
    fontSize: '14px',
    fontFamily: '"Times New Roman", Times, serif',
    lineHeight: '1.5',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '10px',
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    outline: 'none',
    backgroundColor: '#333',
    color: '#fff',
  },
  sendButton: {
    backgroundColor: '#ff00ff',
    border: 'none',
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    marginLeft: '5px',
  },
  userIcon: {
    fontSize: '1.5rem',
    color: '#fff',
  },
  projectContent: {
    flex: 2,
    backgroundColor: '#1a1a1a',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
    color: '#fff',
  },
  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#00ffff',
  },
  addCollaboratorBtn: {
    backgroundColor: '#00ffff',
    border: 'none',
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    color: '#000',
  },
  addIcon: {
    marginRight: '5px',
  },
  description: {
    margin: '10px 0',
  },
  collaborators: {
    marginTop: '20px',
  },
  userItem: {
    margin: '5px 0',
    padding: '10px',
    backgroundColor: '#333',
    borderRadius: '5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unselectBtn: {
    backgroundColor: '#ff00ff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    color: '#fff',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: '20px',
    borderRadius: '10px',
    minWidth: '300px',
    color: '#fff',
    boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
  },
  searchInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    marginBottom: '10px',
    backgroundColor: '#333',
    color: '#fff',
  },
  userList: {
    listStyle: 'none',
    padding: 0,
  },
  userTile: {
    padding: '10px',
    backgroundColor: '#333',
    margin: '5px 0',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default Project;
