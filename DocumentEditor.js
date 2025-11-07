import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DocumentEditor = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Document');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showInsertMenu, setShowInsertMenu] = useState(false);

  const [showCollabPanel, setShowCollabPanel] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [fontSize, setFontSize] = useState('12');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState('Home');
  const [collaborators, setCollaborators] = useState([]);
  const [comments, setComments] = useState([]);
  const [versions, setVersions] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [documentStats, setDocumentStats] = useState({});
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const editorRef = useRef(null);
  const autoSaveRef = useRef(null);

  useEffect(() => {
    loadDocument();
    loadCollaborators();
    loadComments();
    loadVersions();
  }, [id]);

  useEffect(() => {
    updateWordCount();
    updateDocumentStats();
    if (autoSaveEnabled) {
      clearTimeout(autoSaveRef.current);
      autoSaveRef.current = setTimeout(saveDocument, 2000);
    }
  }, [content]);

  const loadDocument = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/documents/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDocument(data);
        setTitle(data.title);
        setContent(data.content || '');
      } else {
        setDocument({ _id: id, title: 'Demo Document', content: '', owner: user.username });
        setTitle('Demo Document');
        setContent('<p>Start typing your document here...</p>');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      setDocument({ _id: id, title: 'Offline Document', content: '', owner: user.username });
      setTitle('Offline Document');
      setContent('<p>Start typing your document here...</p>');
    } finally {
      setLoading(false);
    }
  };

  const loadCollaborators = () => {
    const mockCollaborators = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Editor', online: true },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Viewer', online: false }
    ];
    setCollaborators(mockCollaborators);
  };

  const loadComments = () => {
    const mockComments = [
      { id: 1, author: 'John Doe', text: 'Great introduction!', timestamp: new Date(), resolved: false }
    ];
    setComments(mockComments);
  };

  const loadVersions = () => {
    const mockVersions = [
      { id: 1, version: '1.1', author: user.username, timestamp: new Date(), changes: 'Initial draft' }
    ];
    setVersions(mockVersions);
  };

  const saveDocument = async () => {
    setSaving(true);
    try {
      await fetch(`http://localhost:5000/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateWordCount = () => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const words = text ? text.split(/\s+/).length : 0;
    setWordCount(words);
  };

  const updateDocumentStats = () => {
    const text = content.replace(/<[^>]*>/g, '');
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const paragraphs = content.split(/<\/p>|<br>/i).length - 1;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    setDocumentStats({
      words: wordCount,
      characters,
      charactersNoSpaces,
      paragraphs,
      sentences,
      readingTime: Math.ceil(wordCount / 200) // Average reading speed
    });
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const insertTable = (rows = 3, cols = 3) => {
    let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
    for (let i = 0; i < rows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHTML += '<td style="padding: 8px; border: 1px solid #ccc; min-width: 100px;">Cell</td>';
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</table>';
    document.execCommand('insertHTML', false, tableHTML);
    handleContentChange();
    setShowInsertMenu(false);
  };

  const insertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = `<img src="${e.target.result}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px;" />`;
          document.execCommand('insertHTML', false, img);
          handleContentChange();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
    setShowInsertMenu(false);
  };

  const insertChart = () => {
    const chartHTML = `
      <div style="width: 400px; height: 300px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; margin: 10px 0; background: #f9f9f9;">
        <div style="text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 10px;">📊</div>
          <div>Chart Placeholder</div>
          <div style="font-size: 0.875rem; color: #666;">Click to add chart data</div>
        </div>
      </div>
    `;
    document.execCommand('insertHTML', false, chartHTML);
    handleContentChange();
    setShowInsertMenu(false);
  };

  const insertPageBreak = () => {
    const pageBreak = '<div style="page-break-before: always; border-top: 2px dashed #ccc; margin: 20px 0; padding: 10px; text-align: center; color: #666; font-size: 0.875rem;">Page Break</div>';
    document.execCommand('insertHTML', false, pageBreak);
    handleContentChange();
    setShowInsertMenu(false);
  };

  const findAndReplace = () => {
    if (!findText) return;
    
    const regex = new RegExp(findText, 'gi');
    const newContent = content.replace(regex, replaceText);
    setContent(newContent);
    if (editorRef.current) {
      editorRef.current.innerHTML = newContent;
    }
  };

  const exportToPDF = () => {
    window.print();
  };

  const exportToWord = () => {
    const blob = new Blob([`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <style>
          body { font-family: ${fontFamily}; font-size: ${fontSize}pt; line-height: 1.6; margin: 1in; }
          table { border-collapse: collapse; width: 100%; }
          td, th { border: 1px solid #000; padding: 8px; }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `], { type: 'application/msword' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        alert('Fullscreen not supported');
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const addComment = () => {
    const selection = window.getSelection();
    if (selection.toString()) {
      const comment = prompt('Add your comment:');
      if (comment) {
        const newComment = {
          id: Date.now(),
          author: user.username,
          text: comment,
          timestamp: new Date(),
          resolved: false,
          selectedText: selection.toString()
        };
        setComments(prev => [...prev, newComment]);
      }
    } else {
      alert('Please select text to comment on.');
    }
  };

  const insertTemplate = (templateType) => {
    const templates = {
      header: '<div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;"><h1>Document Title</h1><p>Subtitle or Author</p></div>',
      footer: '<div style="text-align: center; border-top: 1px solid #ccc; padding-top: 10px; margin-top: 20px; font-size: 0.875rem; color: #666;">Page Footer - Company Name</div>',
      signature: '<div style="margin-top: 40px;"><p>Best regards,</p><br><p>_________________</p><p>[Your Name]</p><p>[Your Title]</p><p>[Contact Information]</p></div>',
      toc: '<div style="margin: 20px 0;"><h2>Table of Contents</h2><ol><li>Introduction</li><li>Main Content</li><li>Conclusion</li></ol></div>'
    };
    
    document.execCommand('insertHTML', false, templates[templateType] || '');
    handleContentChange();
    setShowTemplatePanel(false);
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</div>
          <div>Loading document...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: darkMode ? '#1a1a1a' : '#f0f2f5' }}>
      {/* MS Word-like Ribbon */}
      <div style={{
        background: darkMode ? '#2d2d2d' : 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {/* Title Bar */}
        <div style={{
          padding: '0.5rem 1rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#2563eb',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ← Dashboard
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveDocument}
              style={{
                fontSize: '1rem',
                fontWeight: '500',
                border: 'none',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                outline: 'none',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                minWidth: '200px'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {collaborators.filter(c => c.online).map(collab => (
                <div key={collab.id} style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#4ade80',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {collab.name[0]}
                </div>
              ))}
            </div>
            {saving && <span style={{ fontSize: '0.875rem' }}>💾 Saving...</span>}
            <button onClick={() => setShowCollabPanel(!showCollabPanel)} style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              👥 Share
            </button>
            <button onClick={toggleFullscreen} style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              {isFullscreen ? '🗗' : '🗖'}
            </button>
          </div>
        </div>

        {/* Ribbon Tabs */}
        <div style={{
          padding: '0.5rem 1rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: '2rem'
        }}>
          {['Home', 'Insert', 'Layout', 'Review', 'View'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: '0.5rem 1rem', 
                fontWeight: activeTab === tab ? '600' : 'normal',
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab ? '2px solid var(--primary)' : 'none',
                cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Toolbar based on active tab */}
        <div style={{
          padding: '1rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {activeTab === 'Home' && (
            <>
              {/* Font Group */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <select 
                  value={fontFamily} 
                  onChange={(e) => {
                    setFontFamily(e.target.value);
                    formatText('fontName', e.target.value);
                  }}
                  style={{ border: 'none', outline: 'none', padding: '0.25rem' }}
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Calibri">Calibri</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Inter">Inter</option>
                </select>
                <select 
                  value={fontSize} 
                  onChange={(e) => {
                    setFontSize(e.target.value);
                    formatText('fontSize', e.target.value);
                  }}
                  style={{ border: 'none', outline: 'none', padding: '0.25rem', width: '60px' }}
                >
                  {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              {/* Format Group */}
              <div style={{ display: 'flex', gap: '0.25rem', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <button onClick={() => formatText('bold')} style={{ padding: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                  B
                </button>
                <button onClick={() => formatText('italic')} style={{ padding: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', fontStyle: 'italic' }}>
                  I
                </button>
                <button onClick={() => formatText('underline')} style={{ padding: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  U
                </button>
                <button onClick={() => formatText('strikeThrough')} style={{ padding: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'line-through' }}>
                  S
                </button>
              </div>

              {/* Alignment Group */}
              <div style={{ display: 'flex', gap: '0.25rem', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <button onClick={() => formatText('justifyLeft')} style={{ padding: '0.5rem', border: 'none', background: 'none', cursor: 'pointer' }}>
                  ⬅
                </button>
                <button onClick={() => formatText('justifyCenter')} style={{ padding: '0.5rem', border: 'none', background: 'none', cursor: 'pointer' }}>
                  ⬌
                </button>
                <button onClick={() => formatText('justifyRight')} style={{ padding: '0.5rem', border: 'none', background: 'none', cursor: 'pointer' }}>
                  ➡
                </button>
                <button onClick={() => formatText('justifyFull')} style={{ padding: '0.5rem', border: 'none', background: 'none', cursor: 'pointer' }}>
                  ⬍
                </button>
              </div>

              {/* Lists Group */}
              <div style={{ display: 'flex', gap: '0.25rem', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <button onClick={() => formatText('insertUnorderedList')} style={{ padding: '0.5rem', border: 'none', background: 'none', cursor: 'pointer' }}>
                  • List
                </button>
                <button onClick={() => formatText('insertOrderedList')} style={{ padding: '0.5rem', border: 'none', background: 'none', cursor: 'pointer' }}>
                  1. List
                </button>
              </div>
            </>
          )}

          {activeTab === 'Insert' && (
            <>
              <button onClick={() => insertTable()} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', borderRadius: '4px' }}>
                📊 Table
              </button>
              <button onClick={insertImage} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', borderRadius: '4px' }}>
                🖼️ Image
              </button>
              <button onClick={insertChart} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', borderRadius: '4px' }}>
                📈 Chart
              </button>
              <button onClick={insertPageBreak} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', borderRadius: '4px' }}>
                📄 Page Break
              </button>
              <button onClick={() => setShowTemplatePanel(!showTemplatePanel)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', borderRadius: '4px' }}>
                📝 Templates
              </button>
            </>
          )}

          {activeTab === 'Review' && (
            <>
              <button onClick={addComment} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', borderRadius: '4px' }}>
                💬 Comment
              </button>
              <button onClick={() => setShowComments(!showComments)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', borderRadius: '4px' }}>
                👁️ Show Comments
              </button>
              <button onClick={() => setShowVersionHistory(!showVersionHistory)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', borderRadius: '4px' }}>
                📚 Version History
              </button>
              <button onClick={() => setShowFindReplace(!showFindReplace)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', borderRadius: '4px' }}>
                🔍 Find & Replace
              </button>
            </>
          )}

          {activeTab === 'View' && (
            <>
              <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', borderRadius: '4px' }}>
                {darkMode ? '☀️' : '🌙'} {darkMode ? 'Light' : 'Dark'} Mode
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label>
                  <input 
                    type="checkbox" 
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  />
                  Auto-save
                </label>
              </div>
            </>
          )}

          {/* Export Group - Always visible */}
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            <button onClick={exportToPDF} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', borderRadius: '4px' }}>
              📄 PDF
            </button>
            <button onClick={exportToWord} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', borderRadius: '4px' }}>
              📝 Word
            </button>
          </div>
        </div>
      </div>

      {/* Find & Replace Panel */}
      {showFindReplace && (
        <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Find..."
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}
            />
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}
            />
            <button onClick={findAndReplace} className="btn btn-primary">
              Replace All
            </button>
            <button onClick={() => setShowFindReplace(false)} className="btn btn-secondary">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Template Panel */}
      {showTemplatePanel && (
        <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={() => insertTemplate('header')} className="btn btn-secondary">Header</button>
            <button onClick={() => insertTemplate('footer')} className="btn btn-secondary">Footer</button>
            <button onClick={() => insertTemplate('signature')} className="btn btn-secondary">Signature</button>
            <button onClick={() => insertTemplate('toc')} className="btn btn-secondary">Table of Contents</button>
            <button onClick={() => setShowTemplatePanel(false)} className="btn btn-secondary">✕</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex' }}>
        {/* Editor Area */}
        <div style={{ 
          flex: 1,
          padding: '2rem',
          display: 'flex',
          justifyContent: 'center',
          background: darkMode ? '#1a1a1a' : '#f0f2f5'
        }}>
          <div style={{
            width: '8.5in',
            minHeight: '11in',
            background: darkMode ? '#2d2d2d' : 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '1in',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            color: darkMode ? '#ffffff' : '#000000'
          }}>
            <div
              ref={editorRef}
              contentEditable
              onInput={handleContentChange}
              dangerouslySetInnerHTML={{ __html: content }}
              style={{
                minHeight: '9in',
                outline: 'none',
                lineHeight: '1.6',
                fontSize: `${fontSize}pt`,
                fontFamily: fontFamily
              }}
            />
          </div>
        </div>

        {/* Side Panels */}
        {(showComments || showVersionHistory || showCollabPanel) && (
          <div style={{ width: '300px', background: 'var(--bg-primary)', borderLeft: '1px solid var(--border)', padding: '1rem' }}>
            {showComments && (
              <div style={{ marginBottom: '2rem' }}>
                <h3>💬 Comments</h3>
                {comments.map(comment => (
                  <div key={comment.id} style={{ 
                    padding: '0.75rem', 
                    marginBottom: '0.5rem', 
                    background: 'var(--bg-secondary)', 
                    borderRadius: '8px',
                    opacity: comment.resolved ? 0.6 : 1
                  }}>
                    <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{comment.author}</div>
                    <div style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}>{comment.text}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {comment.timestamp.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showVersionHistory && (
              <div style={{ marginBottom: '2rem' }}>
                <h3>📚 Version History</h3>
                {versions.map(version => (
                  <div key={version.id} style={{ 
                    padding: '0.75rem', 
                    marginBottom: '0.5rem', 
                    background: 'var(--bg-secondary)', 
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>v{version.version}</div>
                    <div style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}>{version.changes}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {version.author} • {version.timestamp.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showCollabPanel && (
              <div>
                <h3>👥 Collaborators</h3>
                {collaborators.map(collab => (
                  <div key={collab.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    padding: '0.75rem', 
                    marginBottom: '0.5rem', 
                    background: 'var(--bg-secondary)', 
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: collab.online ? '#4ade80' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      color: 'white'
                    }}>
                      {collab.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{collab.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {collab.role} • {collab.online ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>
                ))}
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  + Invite Collaborator
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Status Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: darkMode ? '#2d2d2d' : 'var(--bg-primary)',
        borderTop: '1px solid var(--border)',
        padding: '0.5rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <span>Words: {documentStats.words || 0}</span>
          <span>Characters: {documentStats.characters || 0}</span>
          <span>Paragraphs: {documentStats.paragraphs || 0}</span>
          <span>Reading time: {documentStats.readingTime || 0} min</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>Page 1 of 1</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => setZoom(Math.max(25, zoom - 25))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              -
            </button>
            <span>{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 25))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              +
            </button>
          </div>
          {autoSaveEnabled && <span style={{ color: 'var(--success)' }}>✓ Auto-save</span>}
        </div>
      </div>

      <style jsx>{`
        @media print {
          .ribbon, .status-bar, button {
            display: none !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DocumentEditor;