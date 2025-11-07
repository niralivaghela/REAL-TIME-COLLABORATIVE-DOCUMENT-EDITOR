const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Simple schemas
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  status: { type: String, default: 'online' }
});

const workspaceSchema = new mongoose.Schema({
  name: String,
  description: String,
  owner: String,
  members: [{ username: String, role: String }]
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  workspace: String,
  tasks: [{
    title: String,
    description: String,
    status: { type: String, default: 'todo' },
    assignee: String,
    priority: { type: String, default: 'medium' }
  }]
}, { timestamps: true });

const documentSchema = new mongoose.Schema({
  title: String,
  content: { type: String, default: '' },
  type: { type: String, default: 'document' },
  owner: String
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  roomId: String,
  messages: [{
    sender: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

const User = mongoose.model('User', userSchema);
const Workspace = mongoose.model('Workspace', workspaceSchema);
const Project = mongoose.model('Project', projectSchema);
const Document = mongoose.model('Document', documentSchema);
const Chat = mongoose.model('Chat', chatSchema);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection - choose one option:

// Option 1: Local MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/collab-platform';

// Option 2: MongoDB Atlas (uncomment and replace with your connection string)
// const MONGODB_URI = 'mongodb+srv://username:password@cluster.mongodb.net/collab-platform';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database: collab-platform');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('💡 Make sure MongoDB is running on localhost:27017');
    console.log('🔧 Try running: net start MongoDB');
  });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    server: 'CollabSpace Pro v1.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CollabSpace Pro API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      documents: '/api/documents',
      analytics: '/api/analytics'
    }
  });
});

// User Management
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, email } = req.body;
    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) {
      user = new User({ username, email, status: 'online' });
      await user.save();
    } else {
      user.status = 'online';
      await user.save();
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Workspace Management
app.get('/api/workspaces', async (req, res) => {
  try {
    const workspaces = await Workspace.find().populate('projects');
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/workspaces', async (req, res) => {
  try {
    const workspace = new Workspace(req.body);
    await workspace.save();
    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Project Management
app.get('/api/projects/:workspaceId', async (req, res) => {
  try {
    const projects = await Project.find({ workspace: req.params.workspaceId });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Task Management
app.post('/api/projects/:id/tasks', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    project.tasks.push(req.body);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projects/:projectId/tasks/:taskId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    const task = project.tasks.id(req.params.taskId);
    Object.assign(task, req.body);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Advanced Analytics Endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const documents = await Document.find();
    const workspaces = await Workspace.find();
    
    const analytics = {
      totalDocuments: documents.length,
      totalWorkspaces: workspaces.length,
      totalWords: documents.reduce((sum, doc) => {
        const text = doc.content?.replace(/<[^>]*>/g, '') || '';
        return sum + text.split(/\s+/).length;
      }, 0),
      activeUsers: await User.countDocuments({ status: 'online' }),
      recentActivity: documents.slice(0, 10).map(doc => ({
        title: doc.title,
        owner: doc.owner,
        updatedAt: doc.updatedAt
      }))
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Suggestions Endpoint
app.post('/api/ai/suggest', async (req, res) => {
  try {
    const { content, type } = req.body;
    
    const suggestions = {
      'grammar': 'Consider using active voice and shorter sentences.',
      'style': 'Add more descriptive language and vary sentence structure.',
      'format': 'Use headings and bullet points for better organization.',
      'professional': 'Include executive summary and clear conclusions.'
    };
    
    res.json({ suggestion: suggestions[type] || 'Document looks good!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Document Management
app.get('/api/documents', async (req, res) => {
  try {
    const documents = await Document.find().sort({ updatedAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/documents', async (req, res) => {
  try {
    console.log('Creating document with data:', req.body);
    
    const documentData = {
      title: req.body.title || 'Untitled Document',
      content: req.body.content || '',
      type: req.body.type || 'document',
      owner: req.body.owner || 'anonymous'
    };
    
    const document = new Document(documentData);
    const savedDocument = await document.save();
    
    console.log('Document created successfully:', savedDocument._id);
    res.status(201).json(savedDocument);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/documents/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/documents/:id', async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    console.log('Deleting document:', req.params.id);
    const result = await Document.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Document not found' });
    }
    console.log('Document deleted successfully');
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Real-time collaboration
const activeUsers = new Map();
const activeRooms = new Map();
const documentVersions = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-document', async (documentId, username) => {
    socket.join(documentId);
    activeUsers.set(socket.id, { documentId, username });
    
    if (!activeRooms.has(documentId)) {
      activeRooms.set(documentId, new Set());
    }
    activeRooms.get(documentId).add(username);
    
    socket.to(documentId).emit('user-joined', username);
    io.to(documentId).emit('active-users', Array.from(activeRooms.get(documentId)));
    
    // Send current document content
    const doc = await Document.findById(documentId);
    if (doc) {
      socket.emit('document-content', { content: doc.content, version: doc.version || 0 });
    }
  });

  socket.on('join-room', async (roomId, username, roomType) => {
    socket.join(roomId);
    activeUsers.set(socket.id, { roomId, username, roomType });
    
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Set());
    }
    activeRooms.get(roomId).add(username);
    
    socket.to(roomId).emit('user-joined', username);
    io.to(roomId).emit('active-users', Array.from(activeRooms.get(roomId)));
    
    // Load chat history
    const chat = await Chat.findOne({ roomId });
    if (chat) {
      socket.emit('chat-history', chat.messages);
    }
  });

  socket.on('content-change', async (data) => {
    try {
      const { documentId, content, userId } = data;
      
      // Update document in database
      const doc = await Document.findById(documentId);
      if (doc) {
        doc.content = content;
        doc.updatedAt = new Date();
        await doc.save();
      }
      
      // Broadcast to other clients
      socket.to(documentId).emit('content-update', {
        content,
        userId,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('Error updating content:', error);
    }
  });

  socket.on('add-comment', async (documentId, comment) => {
    try {
      // Store comment (you can add a comments collection)
      io.to(documentId).emit('comment-added', comment);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  });
  
  socket.on('cursor-update', (data) => {
    const { documentId, cursor, userId } = data;
    // Simple cursor broadcasting without conflict resolution
    socket.to(documentId).emit('cursor-updated', { cursor, userId });
  });

  socket.on('task-update', async (projectId, taskId, updates) => {
    try {
      const project = await Project.findById(projectId);
      const task = project.tasks.id(taskId);
      Object.assign(task, updates);
      await project.save();
      io.to(projectId).emit('task-updated', { taskId, updates });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  });

  socket.on('send-message', async (roomId, message) => {
    try {
      let chat = await Chat.findOne({ roomId });
      if (!chat) {
        const user = activeUsers.get(socket.id);
        chat = new Chat({
          roomId,
          roomType: user.roomType,
          participants: [user.username],
          messages: []
        });
      }
      
      chat.messages.push(message);
      await chat.save();
      
      io.to(roomId).emit('new-message', message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('whiteboard-draw', (roomId, drawData) => {
    socket.to(roomId).emit('whiteboard-update', drawData);
  });

  socket.on('cursor-position', (roomId, position, username) => {
    socket.to(roomId).emit('cursor-update', { position, username });
  });

  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      const { roomId, username } = user;
      
      if (activeRooms.has(roomId)) {
        activeRooms.get(roomId).delete(username);
        if (activeRooms.get(roomId).size === 0) {
          activeRooms.delete(roomId);
        } else {
          io.to(roomId).emit('active-users', Array.from(activeRooms.get(roomId)));
        }
      }
      socket.to(roomId).emit('user-left', username);
      activeUsers.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Collaboration Platform running on port ${PORT}`);
});