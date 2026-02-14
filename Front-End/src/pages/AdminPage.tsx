import axios from 'axios';
import { FileText, Home, Trash2, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const AdminPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return alert("Select a PDF first!");
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      await axios.post(`${API_BASE_URL}/upload-pdf`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Document indexed successfully! 🚀");
      setFile(null);
    } catch (error: any) {
      alert(error.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-layout" style={{ maxWidth: '800px', margin: '100px auto', padding: '0 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Knowledge Management</h1>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>Upload and index university resources</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="outline" size="sm" onClick={() => navigate('/')}><Home size={18} /> Home</Button>
          <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
        </div>
      </div>

      <Card title="Upload Official Documents" className="glass-effect">
        <div style={{ 
          border: '2px dashed var(--glass-border)', 
          borderRadius: '16px', 
          padding: '3rem', 
          textAlign: 'center',
          background: 'rgba(255,255,255,0.02)',
          marginBottom: '1.5rem'
        }}>
          <Upload size={48} color="hsl(var(--primary))" style={{ marginBottom: '1rem' }} />
          <h3>Drag and drop PDF here</h3>
          <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>Only PDF files are supported for vector indexing</p>
          
          <input 
            type="file" 
            accept=".pdf" 
            id="admin-upload" 
            hidden 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <label htmlFor="admin-upload">
            <Button as="span" style={{ cursor: 'pointer' }}>
               {file ? `Selected: ${file.name}` : "Browse Files"}
            </Button>
          </label>
        </div>

        {file && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '1rem', 
            padding: '1rem', background: 'rgba(255,255,255,0.05)', 
            borderRadius: '12px', marginBottom: '1.5rem' 
          }}>
            <FileText color="hsl(var(--accent-blue))" />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 600 }}>{file.name}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <Button onClick={handleUpload} isLoading={uploading}>Index Document</Button>
            <Button variant="outline" onClick={() => setFile(null)}><Trash2 size={18} /></Button>
          </div>
        )}
        
        <div style={{ marginTop: '2rem' }}>
          <h4>Indexing Guidelines</h4>
          <ul style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', lineHeight: 1.6 }}>
            <li>Ensure the PDF contains selectable text (not just images).</li>
            <li>Verify document classification before uploading to public portal.</li>
            <li>Large documents may take a few moments to process into vector chunks.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default AdminPage;
