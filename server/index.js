import app from "./app.js";
import http from 'http';
import { Server } from "socket.io"; 
import { connectToMongoDB } from "./db/config.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Project from "./models/project.models.js";

// Connect to MongoDB
connectToMongoDB();

// Server Port
const port = process.env.PORT || 4000;
const server = http.createServer(app); 

// Initialize Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Authentication middleware for socket connections
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
    const projectId = socket.handshake.query.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error('Invalid projectId'));
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new Error('Project not found'));
    }

    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(new Error('Authentication error'));
    }

    socket.user = decoded;
    socket.project = project;
    next();
  } catch (error) {
    next(error);
  }
});

// Handle socket connections
io.on('connection', (socket) => {
  const roomId = socket.project._id.toString();
  socket.roomId = roomId;

  console.log('A user connected:', socket.id, 'to project:', roomId);
  socket.join(roomId);

  // Handle incoming project messages
  socket.on('project-message', (data) => {
    console.log('Received message:', data);

    // Send the message to all users in the room except the sender
    socket.to(roomId).emit('project-message', {
      text: data.text,
      sender: socket.user.email || 'Unknown',
      timestamp: new Date().toISOString(),
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    socket.leave(roomId);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
