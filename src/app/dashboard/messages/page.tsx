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
  user: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    isOnline?: boolean; // Added for online indicator
  };
  lastMessage?: {
    content: string;
    created_at: string;
    is_read: boolean;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_id: string;
  receiver_id: string;
  sender?: {
    id: string;
    name: string;
    avatar: string;
  };
  receiver?: {
    id: string;
    name: string;
    avatar: string;
  };
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
  const [error, setError] = useState<string | null>(null);
  const [toxicity, setToxicity] = useState<{ label: string; score: number; feedback: string } | null>(null);
  const [toxicityLoading, setToxicityLoading] = useState(false);

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
    loadChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (!message.trim()) {
      setToxicity(null);
      return;
    }
    let active = true;
    setToxicityLoading(true);
    const checkToxicity = setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append('message', message);
        const res = await fetch('http://localhost:8000/check-toxicity', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Toxicity check failed');
        const data = await res.json();
        if (active) setToxicity(data);
      } catch (err) {
        if (active) setToxicity(null);
      } finally {
        if (active) setToxicityLoading(false);
      }
    }, 500); // debounce
    return () => {
      active = false;
      clearTimeout(checkToxicity);
    };
  }, [message]);

  const loadChats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load accepted connections to create chat list
      const response = await fetch('/api/connections?status=accepted');
      const data = await response.json();

      if (response.ok) {
        // Transform connections into chats
        const chatList = data.connections?.map((connection: any) => ({
          id: connection.user.id,
          user: connection.user,
          lastMessage: undefined, // Will be loaded separately
          unreadCount: 0 // Will be calculated separately
        })) || [];
        setChats(chatList);
      } else {
        setError(data.error || 'Failed to load chats');
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/messages?userId=${session?.user?.id}&otherUserId=${chatId}`);
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages || []);
      } else {
        console.error('Failed to load messages:', data.error);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: session?.user?.id,
          receiverId: selectedChat,
          content: message,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, {
          id: newMessage.id,
          content: message,
          created_at: new Date().toISOString(),
          is_read: false,
          sender_id: session?.user?.id || '',
          receiver_id: selectedChat,
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
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                tabIndex={0}
              >
                <div className="chat-avatar">
                  <span>{chat.user.avatar || chat.user.name?.[0] || '?'}</span>
                  {/* Online indicator */}
                  {chat.user.isOnline && <span className="online-dot" />}
                </div>
                <div className="chat-info">
                  <div className="chat-header">
                    <h3 className="chat-name">{chat.user.name}</h3>
                    <span className="chat-time">
                      {chat.lastMessage ? new Date(chat.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div className="chat-preview">
                    <p className="last-message">{chat.lastMessage?.content || 'No messages yet'}</p>
                    {chat.unreadCount > 0 && (
                      <span className="unread-badge">{chat.unreadCount}</span>
                    )}
                  </div>
                  <span className="chat-role">{chat.user.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Divider */}
        <div className="chat-divider" />
        {/* Chat Area */}
        <div className="chat-area">
          {selectedChatData ? (
            <>
              <div className="chat-header chat-header-main">
                <div className="chat-user-info">
                  <div className="chat-avatar large">
                    <span>{selectedChatData.user.avatar || selectedChatData.user.name?.[0] || '?'}</span>
                    {selectedChatData.user.isOnline && <span className="online-dot" />}
                  </div>
                  <div className="user-details">
                    <h3 className="user-name">{selectedChatData.user.name}</h3>
                    <span className="user-role">{selectedChatData.user.role}</span>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="action-btn" title="Audio Call">
                    <Phone size={16} />
                  </button>
                  <button className="action-btn" title="Video Call">
                    <Video size={16} />
                  </button>
                  <button className="action-btn" title="More">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
              <div className="messages-bg">
                <div className="messages-list">
                  {messages.map((msg) => {
                    const isSent = msg.sender_id === session?.user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`message ${isSent ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">
                          <p>{msg.content}</p>
                          <div className="message-meta">
                            <span className="message-time">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isSent && (
                              <div className="message-status">
                                {msg.is_read ? (
                                  <CheckCheck size={14} className="read" />
                                ) : (
                                  <Check size={14} className="sent" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="message-input-container">
                <form onSubmit={handleSendMessage} className="message-form modern-message-form">
                  <div className="input-wrapper modern-input-wrapper">
                    <button type="button" className="action-btn attach-btn" title="Attach file">
                      <Paperclip size={18} />
                    </button>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="message-input"
                      disabled={sending}
                    />
                    {/* Toxicity feedback */}
                    {toxicityLoading && message.trim() && (
                      <div className="toxicity-feedback nontoxic">Checking toxicity...</div>
                    )}
                    {toxicity && message.trim() && (
                      <div className={`toxicity-feedback ${toxicity.label.toLowerCase() === 'toxic' ? 'toxic' : 'nontoxic'}`}>
                        {toxicity.feedback} (Score: {toxicity.score})
                      </div>
                    )}
                    <button type="button" className="action-btn emoji-btn" title="Emoji">
                      <Smile size={18} />
                    </button>
                    <button 
                      type="submit" 
                      className="send-btn modern-send-btn" 
                      disabled={!message.trim() || sending || !!(toxicity && toxicity.label.toLowerCase() === 'toxic')}
                      title="Send"
                    >
                      <Send size={18} />
                    </button>
                  </div>
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