import axios from 'axios';
import { MessageCircle, Paperclip, Send, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user, token, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Load History when chat is opened
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadHistory();
    }
  }, [isOpen, isAuthenticated]);

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const history: Message[] = res.data.flatMap((chat: any) => [
        { role: "user", content: chat.question },
        { role: "assistant", content: chat.answer }
      ]);
      setMessages(history);
    } catch (err) {
      console.error("Failed to load history");
    }
  };

  const clearHistory = async () => {
    if (!window.confirm("Clear all chat history?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([]);
    } catch (err) {
      alert("Failed to clear history");
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/ask`, 
        { question: input },
        { headers: { Authorization: token ? `Bearer ${token}` : "" } }
      );
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: res.data.answer,
        sources: res.data.sources 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I had trouble connecting." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      await axios.post(`${API_BASE_URL}/upload-pdf`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Document indexed successfully! 🚀");
    } catch (error: any) {
      alert(error.response?.data?.detail || "Upload failed. Admins only.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="chat-widget-container" style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999 }}>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'hsl(var(--primary))', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 30px hsla(var(--primary), 0.4)',
          border: 'none', cursor: 'pointer', transition: 'all 0.3s'
        }}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="glass-effect chat-window" style={{
          position: 'absolute', bottom: '80px', right: 0,
          width: '400px', height: '600px', borderRadius: '24px',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', padding: '4px' }}>
              <img src="/csec-logo-black.jpg" style={{ width: '100%' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0 }}>CSEC Assistant</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.7 }}>{isAuthenticated ? `Welcome, ${user?.username}` : 'Guest Mode'}</p>
            </div>
            {isAuthenticated && (
              <button 
                onClick={clearHistory}
                style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', opacity: 0.7 }}
                title="Clear History"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.6 }}>
                <MessageCircle size={40} style={{ marginBottom: '1rem' }} />
                <p>Ask me anything about CSEC ASTU!</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`message-wrapper ${msg.role}`}>
                <div className="message-bubble" style={{ 
                  padding: '1rem', borderRadius: '14px', fontSize: '0.9rem',
                  background: msg.role === 'user' ? 'hsl(var(--primary))' : 'var(--bg-card)',
                  color: 'white', maxWidth: '90%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  {msg.content}
                   {msg.sources && msg.sources.length > 0 && (
                    <div style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.7, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.4rem' }}>
                      Ref: {msg.sources.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <LoadingSpinner />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)' }}>
            <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '0.5rem' }}>
              
              {/* Hidden File Input */}
              <input 
                type="file" 
                accept=".pdf" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              
              {/* Upload Button - Only show if admin */}
              {user?.is_admin && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--accent-green)', 
                    cursor: 'pointer', opacity: uploading ? 0.5 : 1, padding: '0.5rem'
                  }}
                  title="Upload to Knowledge Base"
                >
                  <Paperclip size={20} className={uploading ? 'animate-pulse' : ''} />
                </button>
              )}

              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={uploading ? "Indexing document..." : "Type your question..."}
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '0.5rem', outline: 'none', resize: 'none' }}
                disabled={uploading}
                rows={1}
              />
              <button 
                onClick={handleSend} 
                disabled={loading || !input.trim() || uploading}
                style={{ background: 'hsl(var(--primary))', color: 'white', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (loading || !input.trim() || uploading) ? 0.5 : 1 }}
              >
                <Send size={18} />
              </button>
            </div>
            {uploading && <p style={{ fontSize: '0.7rem', color: 'var(--accent-green)', textAlign: 'center', marginTop: '0.5rem' }}>Analyzing document chunks...</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
