'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Image, 
  Paperclip,
  Smile,
  Mic,
  Check,
  CheckCheck
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import '../../../styles/messages.scss';

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  role: string;
  userId: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  sent: boolean;
  delivered: boolean;
  read: boolean;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Remove mock data for demo
  // const mockChats: Chat[] = [
  //   {
  //     id: '1',
  //     name: 'Sarah Wilson',
  //     avatar: 'SW',
  //     lastMessage: 'Thanks for the career advice!',
  //     time: '2:30 PM',
  //     unread: 2,
  //     online: true,
  //     role: 'Alumni',
  //     userId: 'user1'
  //   },
  //   {
  //     id: '2',
  //     name: 'Mike Johnson',
  //     avatar: 'MJ',
  //     lastMessage: 'When can we schedule the project discussion?',
  //     time: '1:45 PM',
  //     unread: 0,
  //     online: false,
  //     role: 'Student',
  //     userId: 'user2'
  //   },
  //   {
  //     id: '3',
  //     name: 'Emily Brown',
  //     avatar: 'EB',
  //     lastMessage: 'The resume looks great!',
  //     time: '11:20 AM',
  //     unread: 0,
  //     online: true,
  //     role: 'Professor',
  //     userId: 'user3'
  //   },
  //   {
  //     id: '4',
  //     name: 'Alex Chen',
  //     avatar: 'AC',
  //     lastMessage: 'Looking forward to our mentorship session',
  //     time: 'Yesterday',
  //     unread: 1,
  //     online: false,
  //     role: 'Student',
  //     userId: 'user4'
  //   }
  // ];

  // const mockMessages: Message[] = [
  //   {
  //     id: '1',
  //     sender: 'Sarah Wilson',
  //     content: 'Hi! I saw your profile and would love to connect.',
  //     time: '2:15 PM',
  //     sent: false,
  //     delivered: true,
  //     read: true
  //   },
  //   {
  //     id: '2',
  //     sender: 'You',
  //     content: 'Hello Sarah! Thanks for reaching out. I\'d be happy to connect.',
  //     time: '2:18 PM',
  //     sent: true,
  //     delivered: true,
  //     read: true
  //   },
  //   {
  //     id: '3',
  //     sender: 'Sarah Wilson',
  //     content: 'Great! I\'m looking for some career guidance. Do you have time for a quick chat?',
  //     time: '2:20 PM',
  //     sent: false,
  //     delivered: true,
  //     read: true
  //   },
  //   {
  //     id: '4',
  //     sender: 'You',
  //     content: 'Absolutely! I\'d be happy to help. What specific areas are you looking to discuss?',
  //     time: '2:25 PM',
  //     sent: true,
  //     delivered: true,
  //     read: true
  //   },
  //   {
  //     id: '5',
  //     sender: 'Sarah Wilson',
  //     content: 'Thanks for the career advice!',
  //     time: '2:30 PM',
  //     sent: false,
  //     delivered: true,
  //     read: false
  //   }
  // ];

  useEffect(() => {
    // Load chats from API
    loadChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
    }
  }, [selectedChat]);

  const loadChats = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      setChats([]);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      // For now, use mock data
      // const response = await fetch(`/api/messages?userId=${chatId}`);
      // const data = await response.json();
      // setMessages(data.messages);
      setMessages([]);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    setSending(true);
    try {
      // Send message to API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedChat,
          content: message,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, {
          id: newMessage.id,
          sender: 'You',
          content: message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sent: true,
          delivered: true,
          read: false
        }]);
        setMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChatData = chats.find(chat => chat.id === selectedChat);

  return (
    <div className="messages-page">
      <div className="messages-container">
        {/* Chat List Sidebar */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>
            <div className="search-container">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="chat-list">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${selectedChat === chat.id ? 'active' : ''}`}
                onClick={() => setSelectedChat(chat.id)}
              >
                <div className="chat-avatar">
                  <span>{chat.avatar}</span>
                  {chat.online && <div className="online-indicator" />}
                </div>
                <div className="chat-info">
                  <div className="chat-header">
                    <h3 className="chat-name">{chat.name}</h3>
                    <span className="chat-time">{chat.time}</span>
                  </div>
                  <div className="chat-preview">
                    <p className="last-message">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="unread-badge">{chat.unread}</span>
                    )}
                  </div>
                  <span className="chat-role">{chat.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedChatData ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-avatar">
                    <span>{selectedChatData.avatar}</span>
                    {selectedChatData.online && <div className="online-indicator" />}
                  </div>
                  <div className="user-details">
                    <h3 className="user-name">{selectedChatData.name}</h3>
                    <span className="user-role">{selectedChatData.role}</span>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="action-btn">
                    <Phone size={16} />
                  </button>
                  <button className="action-btn">
                    <Video size={16} />
                  </button>
                  <button className="action-btn">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <div className="messages-container">
                <div className="messages-list">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message ${msg.sent ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <p>{msg.content}</p>
                        <div className="message-meta">
                          <span className="message-time">{msg.time}</span>
                          {msg.sent && (
                            <div className="message-status">
                              {msg.read ? (
                                <CheckCheck size={14} className="read" />
                              ) : msg.delivered ? (
                                <CheckCheck size={14} className="delivered" />
                              ) : (
                                <Check size={14} className="sent" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="message-input-container">
                <form onSubmit={handleSendMessage} className="message-form">
                  <div className="input-actions">
                    <button type="button" className="action-btn">
                      <Paperclip size={18} />
                    </button>
                    <button type="button" className="action-btn">
                      <Image size={18} />
                    </button>
                  </div>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="message-input"
                      disabled={sending}
                    />
                    <button type="button" className="action-btn">
                      <Smile size={18} />
                    </button>
                  </div>
                  <button 
                    type="submit" 
                    className="send-btn" 
                    disabled={!message.trim() || sending}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-content">
                <h3>Select a conversation</h3>
                <p>Choose a chat from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 