// backend/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/index');
const errorHandler = require('./src/middlewares/errorHandler');

// Routes – all must export a router instance (not objects/functions)
const authRoutes = require('./src/routes/authRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const draftRoutes = require('./src/routes/draftRoutes');
const mergeRequestRoutes = require('./src/routes/mergeRequestRoutes');
const executionRoutes = require('./src/routes/executionRoutes');
const terminalRoutes = require('./src/routes/terminalRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const collaborationRoutes = require('./src/routes/collaborationRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io setup – allow frontend origin (update in prod)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Security & global middleware
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Connect to MongoDB
connectDB();

// Mount routes – all these files MUST end with: module.exports = router;
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/merge-requests', mergeRequestRoutes);
app.use('/api/execution', executionRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/collaboration', collaborationRoutes);

// Socket.io events – real-time (draft sync, cursors, chat, presence, notifications)
require('./src/socket/events')(io);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ CollabCodeX Backend running on port ${PORT}`);
  console.log(`Frontend: http://localhost:5173`);
  console.log(`Socket.io ready for connections`);
});