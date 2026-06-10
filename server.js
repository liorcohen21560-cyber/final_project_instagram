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

// Posts
 const postObjects = [
    {
        user_profile_image: "images/the_amazing_race_profile.jpg", username: "the.amazing.race.israel", upload_time: "• 9 שע'", post_type: "image", 
        post_content: "images/the_amazing_race.jpg", like_count: "16,800", comment_count: 724, repost_count: 51, 
        caption: " קבלו אותם! טום ואלמוג, המנצחים של המירוץ למיליון 2026, הגיעו הבוקר למשרדי קשת 12 לקבל את הפרס 🌏"
    },
    {
        user_profile_image: "images/sport 5.png", username: "sport_5", upload_time: "• 5 שע'", post_type: "image", "post_content": "images/eran.jpg",
        like_count: "1,240", comment_count: 389, repost_count: 204, caption: " ערן זהבי לא עוצר! כובש שער ניצחון מדהים באצטדיון חולון ⚽️🔥"
    },
    {
        user_profile_image: "images/sport 5.png", username: "sport_5", upload_time: "• 2 שע'", post_type: "image", post_content: "images/deni.jpg",
        like_count: "186", comment_count: 186, repost_count: 37, caption: " דני אבדיה בשיאו! עוד שישי של חגיגה לאומית בקבוצה של וושינגטון 😍"
    }
    ];

// API endpoint to get the posts data
app.get('/api/posts', (req, res) => {
    res.json(postObjects);
});


// API endpoint to add a new post
app.post('/api/posts', (req, res) => {
    const newPostData = req.body; // This catches the object you sent from the frontend

    // initialize default values for a new post
    const fullyFormedPost = {
        user_profile_image: "profile.png",
        username: "liorcohen299",
        upload_time: "• עכשיו",
        post_type: newPostData.post_type || "text",
        post_content: newPostData.post_content,
        like_count: "0",
        comment_count: 0,
        repost_count: 0,
        caption: newPostData.caption || ""
    };

    postObjects.push(fullyFormedPost);
    res.status(201).json({ success: true, addedPost: fullyFormedPost });
});

// API endpoint to delete a post by index
app.post('/api/posts/delete', (req, res) => {
    const { index } = req.body; // Gets the index sent from the frontend

    // Check if the index is valid and exists in our array
    if (index !== undefined && index >= 0 && index < postObjects.length) {              
        // Remove 1 element at the specified index position
        postObjects.splice(index, 1); 
        return res.json({ success: true });
    }
    res.status(400).json({ success: false, message: "Invalid post index provided." });
});

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));