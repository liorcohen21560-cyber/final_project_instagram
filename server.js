const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Parse incoming JSON requests
app.use(express.json());

// Hard-coded credentials
const VALID_USER = "lior@example.com";
const VALID_PASS = "Password123";

// Global state to track if the user is authenticated
let isLoggedIn = false;

// Handle the login POST request
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Server-side validation for email format
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!username || !emailPattern.test(username)) {
        return res.status(400).json({ success: false, message: "Invalid email format on server." });
    }
    
    // Server-side validation for password length
    if (!password || password.length < 9) {
        return res.status(400).json({ success: false, message: "Password must be at least 9 characters long." });
    }

    // Check credentials against hard-coded values
    if (username === VALID_USER && password === VALID_PASS) {
        isLoggedIn = true; // Mark user as logged in
        return res.status(200).json({ success: true });
    } else {
        return res.status(401).json({ success: false, message: "Invalid username or password." });
    }
});

// Protect index2.html - Must be defined BEFORE express.static
app.get('/index2.html', (req, res) => {
    // Only allow access if the user successfully logged in
    if (isLoggedIn) {
        res.sendFile(path.join(__dirname, 'public', 'index2.html'));
    } else {
        // Redirect unauthorized users back to the login page
        res.redirect('/');
    }
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));