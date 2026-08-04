require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const session = require('express-session'); // Import express-session for session management
const path = require('path');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = 3000;

// Parse incoming JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Routes
app.use(authRoutes);
app.use(postRoutes);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });