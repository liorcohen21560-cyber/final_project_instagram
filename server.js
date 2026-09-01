require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const session = require('express-session'); // Import express-session for session management
const path = require('path');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const sessionSecret = process.env.SESSION_SECRET || 'development-only-session-secret';

// Parse incoming JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure session middleware
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false
}));

// Routes
app.use(authRoutes);
app.use(postRoutes);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

async function startServer() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not configured. Add it to the .env file before starting the server.');
  }

  await mongoose.connect(mongoUri);
  console.log('Successfully connected to MongoDB');

  return app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Server startup failed:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
