const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = 3000;

// Parse incoming JSON requests
app.use(express.json());


app.use(authRoutes);
app.use(postRoutes);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));