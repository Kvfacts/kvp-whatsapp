import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const socket = io(BACKEND_URL);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode !== '2327') {
      setError('Incorrect passcode! Hint: It is 2327');
      return;
    }
    if (!username) {
      setError('Please select or enter your name.');
      return;
    }
    setIsAuthenticated(true);
    socket.emit('join_room', 'kvp-sanctuary');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') return;

    const messageData = {
      room: 'kvp-sanctuary',
      author: username,
      message: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    socket.emit('send_message', messageData);
    setMessage('');
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <h2 style={{ color: '#075e54', marginBottom: '10px' }}>KVP WhatsApp 💚</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Private Sanctuary for Kiwi & Bujji</p>
          
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Who are you?</label>
              <select 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                style={styles.input}
              >
                <option value="">Select Profile...</option>
                <option value="Kiwi">Kiwi</option>
                <option value="Bujji">Bujji</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Passcode</label>
              <input 
                type="password" 
                placeholder="Enter 4-digit passcode" 
                value={passcode} 
                onChange={(e) => setPasscode(e.target.value)}
                style={styles.input}
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" style={styles.button}>Enter Sanctuary</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.chatContainer}>
      <header style={styles.header}>
        <h3 style={{ margin: 0 }}>KVP WhatsApp 💚</h3>
        <span style={{ fontSize: '14px', background: '#25d366', padding: '4px 10px', borderRadius: '12px', color: '#fff' }}>
          Logged in as: {username}
        </span>
      </header>

      <div style={styles.messageContainer}>
        {messages.map((msg, index) => {
          const isMe = msg.author === username;
          return (
            <div key={index} style={{ ...styles.messageRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{ ...styles.messageBubble, backgroundColor: isMe ? '#dcf8c6' : '#fff' }}>
                <span style={styles.author}>{msg.author}</span>
                <p style={styles.text}>{msg.message}</p>
                <span style={styles.time}>{msg.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={sendMessage} style={styles.chatForm}>
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={message} 
          onChange={(e) => setMessage(e.target.value)}
          style={styles.chatInput}
        />
        <button type="submit" style={styles.sendButton}>Send</button>
      </form>
    </div>
  );
}

const styles = {
  loginContainer: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dadbd4',
  },
  loginCard: {
    background: '#fff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '320px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    textAlign: 'left',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  button: {
    padding: '10px',
    backgroundColor: '#075e54',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  error: {
    color: 'red',
    fontSize: '12px',
    margin: 0,
  },
  chatContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#efeae2',
  },
  header: {
    backgroundColor: '#075e54',
    color: '#fff',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageContainer: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  messageRow: {
    display: 'flex',
  },
  messageBubble: {
    maxWidth: '60%',
    padding: '10px 14px',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    position: 'relative',
  },
  author: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#075e54',
    display: 'block',
    marginBottom: '2px',
  },
  text: {
    margin: '0 0 5px 0',
    fontSize: '14px',
    color: '#111',
    wordBreak: 'break-word',
  },
  time: {
    fontSize: '9px',
    color: '#999',
    float: 'right',
  },
  chatForm: {
    padding: '15px',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    gap: '10px',
  },
  chatInput: {
    flex: 1,
    padding: '12px',
    borderRadius: '20px',
    border: '1px solid #ccc',
    outline: 'none',
    fontSize: '14px',
  },
  sendButton: {
    padding: '10px 20px',
    backgroundColor: '#075e54',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};