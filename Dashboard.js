import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, onLogout }) => {
  const [documents, setDocuments] = useState([]);

  const [showTemplates, setShowTemplates] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, timeline
  const [sortBy, setSortBy] = useState('modified'); // modified, name, size, type
  const [filterBy, setFilterBy] = useState('all'); // all, shared, private, favorites
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [selectedDocs, setSelectedDocs] = useState([]);


  const [notifications, setNotifications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const templates = [
    { id: 'blank', name: 'Blank Document', icon: '📄', desc: 'Start with a blank page', category: 'General' },
    { id: 'resume', name: 'Resume', icon: '👤', desc: 'Professional CV template', category: 'Personal' },
    { id: 'letter', name: 'Business Letter', icon: '✉️', desc: 'Formal business letter', category: 'Business' },
    { id: 'report', name: 'Report', icon: '📊', desc: 'Professional report template', category: 'Business' },
    { id: 'invoice', name: 'Invoice', icon: '🧾', desc: 'Business invoice template', category: 'Finance' },
    { id: 'proposal', name: 'Project Proposal', icon: '📋', desc: 'Project proposal template', category: 'Business' },
    { id: 'newsletter', name: 'Newsletter', icon: '📰', desc: 'Company newsletter', category: 'Marketing' },
    { id: 'memo', name: 'Memo', icon: '📝', desc: 'Internal memorandum', category: 'Business' },
    { id: 'presentation', name: 'Presentation', icon: '🎯', desc: 'Slide presentation outline', category: 'Business' },
    { id: 'budget', name: 'Budget Plan', icon: '💰', desc: 'Financial budget template', category: 'Finance' },
    { id: 'timeline', name: 'Project Timeline', icon: '⏱️', desc: 'Project planning timeline', category: 'Planning' },
    { id: 'checklist', name: 'Checklist', icon: '✅', desc: 'Task checklist template', category: 'Planning' },
    { id: 'contract', name: 'Contract', icon: '📋', desc: 'Legal contract template', category: 'Legal' },
    { id: 'agenda', name: 'Meeting Agenda', icon: '📅', desc: 'Meeting agenda template', category: 'Business' }
  ];

  useEffect(() => {
    fetchDocuments();
    loadRecentFiles();
    loadNotifications();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    }
  };

  const loadRecentFiles = () => {
    const recent = JSON.parse(localStorage.getItem('recentFiles') || '[]');
    setRecentFiles(recent.slice(0, 5));
  };

  const loadNotifications = () => {
    const mockNotifications = [
      { id: 1, type: 'collaboration', message: 'John shared "Project Report" with you', time: '2 hours ago' },
      { id: 2, type: 'update', message: 'Your document "Resume" was auto-saved', time: '1 day ago' },
      { id: 3, type: 'storage', message: 'You\'re using 75% of your storage', time: '3 days ago' }
    ];
    setNotifications(mockNotifications);
  };

  const addToRecentFiles = (doc) => {
    const recent = JSON.parse(localStorage.getItem('recentFiles') || '[]');
    const filtered = recent.filter(item => item.id !== doc._id);
    const updated = [{ id: doc._id, title: doc.title, date: new Date().toISOString() }, ...filtered].slice(0, 10);
    localStorage.setItem('recentFiles', JSON.stringify(updated));
    setRecentFiles(updated.slice(0, 5));
  };

  const createDocument = async (templateId = 'blank', title = 'Untitled Document') => {
    try {
      const templateContent = getTemplateContent(templateId);
      const response = await fetch('http://localhost:5000/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: templateContent,
          owner: user.username,
          template: templateId
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data._id) {
          addToRecentFiles(data);
          navigate(`/document/${data._id}`);
        }
      }
    } catch (error) {
      console.error('Error creating document:', error);
      const offlineId = Date.now().toString();
      navigate(`/document/${offlineId}`);
    }
  };

  const getTemplateContent = (templateId) => {
    const templates = {
      blank: '',
      resume: `<div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="margin: 0; color: #333; font-size: 32px;">[Your Full Name]</h1>
          <p style="margin: 5px 0; color: #666; font-size: 16px;">[Your Professional Title]</p>
          <p style="margin: 5px 0; font-size: 14px;">[Email] | [Phone] | [LinkedIn] | [Location]</p>
        </div>
        <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Professional Summary</h2>
        <p>[Brief professional summary...]</p>
        <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Experience</h2>
        <h3>[Job Title] - [Company Name]</h3>
        <p style="color: #666; font-style: italic;">[Start Date] - [End Date]</p>
        <ul><li>Key achievement or responsibility</li></ul>
      </div>`,
      letter: `<div style="max-width: 700px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
        <div style="text-align: right; margin-bottom: 30px;">
          <p>[Your Name]<br>[Your Address]<br>[City, State ZIP Code]<br>[Date]</p>
        </div>
        <div style="margin-bottom: 30px;">
          <p>[Recipient Name]<br>[Title]<br>[Company Name]<br>[Address]</p>
        </div>
        <p><strong>Subject: [Subject Line]</strong></p>
        <p>Dear [Recipient Name],</p>
        <p>[Opening paragraph...]</p>
        <p>Sincerely,</p><br><p>[Your Name]</p>
      </div>`
    };
    return templates[templateId] || '';
  };

  const handleCreateDocument = () => {
    if (selectedTemplate) {
      const title = newDocTitle.trim() || selectedTemplate.name;
      createDocument(selectedTemplate.id, title);
      setNewDocTitle('');
      setShowTemplates(false);
      setSelectedTemplate(null);
    }
  };

  const deleteDocument = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    
    try {
      await fetch(`http://localhost:5000/api/documents/${docId}`, {
        method: 'DELETE'
      });
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const toggleFavorite = (docId) => {
    setDocuments(docs => docs.map(doc => 
      doc._id === docId ? { ...doc, isFavorite: !doc.isFavorite } : doc
    ));
  };

  const duplicateDocument = async (docId) => {
    try {
      const originalDoc = documents.find(doc => doc._id === docId);
      if (originalDoc) {
        const response = await fetch('http://localhost:5000/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${originalDoc.title} (Copy)`,
            content: originalDoc.content,
            owner: originalDoc.owner
          })
        });
        if (response.ok) {
          const newDoc = await response.json();
          setDocuments(prev => [newDoc, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error duplicating document:', error);
    }
  };

  const exportDocument = (docId, format) => {
    alert(`Export to ${format.toUpperCase()} feature coming soon!`);
  };

  const handleBulkAction = (action) => {
    if (action === 'delete') {
      if (window.confirm(`Delete ${selectedDocs.length} documents?`)) {
        selectedDocs.forEach(docId => deleteDocument(docId));
        setSelectedDocs([]);
      }
    } else if (action === 'export') {
      alert('Export feature coming soon!');
      setSelectedDocs([]);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('http://localhost:5000/api/documents/upload', {
          method: 'POST',
          body: formData
        });
        if (response.ok) {
          const newDoc = await response.json();
          setDocuments(prev => [newDoc, ...prev]);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const getStorageInfo = () => {
    const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
    const maxStorage = 5 * 1024 * 1024 * 1024; // 5GB
    return {
      used: totalSize,
      total: maxStorage,
      percentage: (totalSize / maxStorage) * 100
    };
  };

  const analytics = {
    totalDocs: documents.length,
    recentActivity: documents.filter(doc => 
      new Date(doc.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    collaborativeDocs: documents.filter(doc => doc.collaborators?.length > 0).length,
    favoritesDocs: documents.filter(doc => doc.isFavorite).length
  };

  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'shared' && doc.collaborators?.length > 0) ||
                           (filterBy === 'private' && (!doc.collaborators || doc.collaborators.length === 0)) ||
                           (filterBy === 'favorites' && doc.isFavorite);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.title.localeCompare(b.title);
        case 'size': return (b.size || 0) - (a.size || 0);
        case 'type': return (a.type || '').localeCompare(b.type || '');
        default: return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });

  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="app-layout">
      {/* Advanced Sidebar */}
      <div className="sidebar" style={{ width: '320px' }}>
        <div style={{ padding: '1.5rem' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: 'white',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}>
              📝
            </div>
            <div>
              <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.25rem' }}>CollabSpace Pro</h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Professional Edition</div>
            </div>
          </div>
          
          {/* User Info */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            marginBottom: '2rem',
            padding: '1rem',
            background: 'var(--bg-tertiary)',
            borderRadius: '12px',
            border: '1px solid var(--border)'
          }}>
            <div className="user-avatar" style={{ width: '45px', height: '45px' }}>
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.username}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></div>
                Online
              </div>
            </div>
          </div>

          {/* Storage Info */}
          <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>💾 Storage</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {Math.round(getStorageInfo().percentage)}% used
              </span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '6px', 
              background: 'var(--border)', 
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${getStorageInfo().percentage}%`, 
                height: '100%', 
                background: getStorageInfo().percentage > 80 ? 'var(--danger)' : 'var(--primary)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '2rem' }}>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginBottom: '0.75rem', padding: '0.875rem' }}
              onClick={() => setShowTemplates(true)}
            >
              📄 New Document
            </button>
            
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', marginBottom: '0.75rem' }}
              onClick={() => createDocument('blank')}
            >
              ⚡ Blank Document
            </button>

            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', marginBottom: '0.75rem' }}
              onClick={() => fileInputRef.current?.click()}
            >
              📁 Upload File
            </button>
          </div>

          {/* Recent Files */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>📋 Recent Files</h4>
            {recentFiles.length > 0 ? (
              recentFiles.map((file, index) => (
                <div key={index} style={{
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
                onClick={() => navigate(`/document/${file.id}`)}
                >
                  <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{file.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(file.date).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
                No recent files
              </div>
            )}
          </div>

          {/* Notifications */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>🔔 Notifications</h4>
            {notifications.slice(0, 3).map(notif => (
              <div key={notif.id} style={{
                padding: '0.75rem',
                marginBottom: '0.5rem',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '0.75rem'
              }}>
                <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{notif.message}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{notif.time}</div>
              </div>
            ))}
          </div>

          {/* Logout */}
          <button 
            onClick={onLogout} 
            style={{ 
              background: 'none', 
              border: '1px solid var(--border)', 
              color: 'var(--danger)', 
              cursor: 'pointer',
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--border-radius)',
              transition: 'var(--transition)'
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* MS Word-like Header */}
        <div style={{
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border)',
          padding: '1rem 2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '600' }}>📝 CollabSpace Pro Dashboard</h1>
              <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                Create, edit, and collaborate on professional documents
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => setShowAnalytics(!showAnalytics)}>
                📊 Analytics
              </button>
              <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                📤 Upload
              </button>
              <button className="btn btn-primary" onClick={() => setShowTemplates(true)}>
                📝 New Document
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/')}>
                🏠 Home
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".doc,.docx,.pdf,.txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="🔍 Search documents, tags, collaborators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: '25px',
                fontSize: '0.875rem',
                background: 'var(--bg-secondary)'
              }}
            />
          </div>
        </div>

        {/* Analytics Panel */}
        {showAnalytics && (
          <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>📊 Workspace Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{analytics.totalDocs}</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Documents</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{analytics.recentActivity}</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Active This Week</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{analytics.collaborativeDocs}</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Shared Documents</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💾</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{Math.round(getStorageInfo().percentage)}%</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Storage Used</div>
              </div>
            </div>
          </div>
        )}

        <div className="content-area">
          {/* Quick Start Templates */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>🚀 Quick Start</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {templates.slice(0, 4).map(template => (
                <div key={template.id} 
                     className="card" 
                     style={{ 
                       cursor: 'pointer', 
                       textAlign: 'center', 
                       padding: '1.5rem',
                       transition: 'var(--transition)',
                       border: '2px solid transparent'
                     }}
                     onClick={() => createDocument(template.id, template.name)}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{template.icon}</div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{template.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                    {template.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Documents Grid */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>📄 Your Documents ({filteredDocuments.length})</h3>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* Filter Dropdown */}
                <select 
                  value={filterBy} 
                  onChange={(e) => setFilterBy(e.target.value)}
                  style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-primary)' }}
                >
                  <option value="all">All Documents</option>
                  <option value="private">Private</option>
                  <option value="shared">Shared</option>
                  <option value="favorites">Favorites</option>
                </select>
                
                {/* Sort Dropdown */}
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-primary)' }}
                >
                  <option value="modified">Last Modified</option>
                  <option value="name">Name</option>
                  <option value="size">Size</option>
                  <option value="type">Type</option>
                </select>
                
                {/* View Mode Buttons */}
                <button 
                  className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`} 
                  style={{ padding: '0.5rem 1rem' }}
                  onClick={() => setViewMode('grid')}
                >
                  🔲 Grid
                </button>
                <button 
                  className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`} 
                  style={{ padding: '0.5rem 1rem' }}
                  onClick={() => setViewMode('list')}
                >
                  📊 List
                </button>
                
                {/* Bulk Actions */}
                {selectedDocs.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={() => handleBulkAction('export')}>
                      📤 Export ({selectedDocs.length})
                    </button>
                    <button className="btn btn-danger" onClick={() => handleBulkAction('delete')}>
                      🗑️ Delete ({selectedDocs.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {filteredDocuments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                <h3 style={{ marginBottom: '0.5rem' }}>No documents found</h3>
                <p style={{ marginBottom: '1.5rem' }}>
                  {searchTerm ? 'Try a different search term' : 'Create your first document to get started!'}
                </p>
                <button className="btn btn-primary" onClick={() => setShowTemplates(true)}>
                  📝 Create Document
                </button>
              </div>
            ) : (
              <div style={{ 
                display: viewMode === 'grid' ? 'grid' : 'flex',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none',
                flexDirection: viewMode === 'list' ? 'column' : 'row',
                gap: '1rem' 
              }}>
                {filteredDocuments.map(doc => (
                  <div key={doc._id} 
                       className="document-card" 
                       style={{ 
                         padding: viewMode === 'list' ? '1rem' : '1.25rem',
                         border: selectedDocs.includes(doc._id) ? '2px solid var(--primary)' : '1px solid var(--border)',
                         borderRadius: '12px',
                         background: selectedDocs.includes(doc._id) ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-primary)',
                         cursor: 'pointer',
                         transition: 'var(--transition)',
                         display: viewMode === 'list' ? 'flex' : 'block',
                         alignItems: viewMode === 'list' ? 'center' : 'stretch',
                         gap: viewMode === 'list' ? '1rem' : '0'
                       }}
                       onClick={(e) => {
                         if (e.ctrlKey || e.metaKey) {
                           setSelectedDocs(prev => 
                             prev.includes(doc._id) 
                               ? prev.filter(id => id !== doc._id)
                               : [...prev, doc._id]
                           );
                         } else {
                           addToRecentFiles(doc);
                           navigate(`/document/${doc._id}`);
                         }
                       }}
                  >
                    {viewMode === 'list' ? (
                      <>
                        <input 
                          type="checkbox" 
                          checked={selectedDocs.includes(doc._id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSelectedDocs(prev => 
                              e.target.checked 
                                ? [...prev, doc._id]
                                : prev.filter(id => id !== doc._id)
                            );
                          }}
                          style={{ marginRight: '1rem' }}
                        />
                        <div style={{ fontSize: '1.5rem', marginRight: '1rem' }}>📝</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '600', truncate: 'ellipsis' }}>{doc.title}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>by {doc.owner}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          <span>{doc.collaborators?.length || 0} collaborators</span>
                          <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                          <span>{Math.round((doc.size || 0) / 1024)} KB</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '1rem' }}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(doc._id);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                            title="Favorite"
                          >
                            {doc.isFavorite ? '⭐' : '☆'}
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateDocument(doc._id);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                            title="Duplicate"
                          >
                            📋
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.share?.({ title: doc.title, url: window.location.href });
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                            title="Share"
                          >
                            🔗
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(doc._id);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--danger)' }}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ fontSize: '2rem' }}>📝</div>
                            {doc.isFavorite && <span style={{ fontSize: '1rem' }}>⭐</span>}
                            {doc.collaborators?.length > 0 && <span style={{ fontSize: '1rem' }}>👥</span>}
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(doc._id);
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                              title="Favorite"
                            >
                              {doc.isFavorite ? '⭐' : '☆'}
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateDocument(doc._id);
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                              title="Duplicate"
                            >
                              📋
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.share?.({ title: doc.title, url: window.location.href });
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                              title="Share"
                            >
                              🔗
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteDocument(doc._id);
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--danger)' }}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>{doc.title}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>
                          by {doc.owner} • {doc.collaborators?.length || 0} collaborators
                        </p>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Modified {new Date(doc.updatedAt).toLocaleDateString()}</span>
                          <span>{Math.round((doc.size || 0) / 1024)} KB</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Selection Modal */}
      {showTemplates && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '90%', maxWidth: '1000px', maxHeight: '80vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>📄 Choose a Template</h2>
              <button 
                onClick={() => setShowTemplates(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            
            {/* Template Categories */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {['All', ...new Set(templates.map(t => t.category))].map(category => (
                  <button 
                    key={category}
                    className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {filteredTemplates.map(template => (
                <div key={template.id} 
                     style={{
                       padding: '1.5rem',
                       border: selectedTemplate?.id === template.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                       borderRadius: '12px',
                       cursor: 'pointer',
                       textAlign: 'center',
                       background: selectedTemplate?.id === template.id ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-primary)',
                       transition: 'var(--transition)'
                     }}
                     onClick={() => setSelectedTemplate(template)}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{template.icon}</div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{template.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                    {template.desc}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                    {template.category}
                  </div>
                </div>
              ))}
            </div>

            {selectedTemplate && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <input
                  type="text"
                  placeholder={`${selectedTemplate.name} title`}
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--border-radius)'
                  }}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-primary" onClick={handleCreateDocument}>
                    Create {selectedTemplate.name}
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setSelectedTemplate(null);
                      setNewDocTitle('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;