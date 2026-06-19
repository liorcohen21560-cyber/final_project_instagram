const path = require('path');

const VALID_USER = "lior@example.com";
const VALID_PASS = "Password123";
let isLoggedIn = false; 

exports.login = (req, res) => {
    const { username, password } = req.body;
    
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!username || !emailPattern.test(username)) {
        return res.status(400).json({ success: false, message: "Invalid email format on server." });
    }
    
    if (!password || password.length < 9) {
        return res.status(400).json({ success: false, message: "Password must be at least 9 characters long." });
    }

    if (username === VALID_USER && password === VALID_PASS) {
        isLoggedIn = true;
        return res.status(200).json({ success: true });
    } else {
        return res.status(401).json({ success: false, message: "Invalid username or password." });
    }
};

exports.protectFeed = (req, res) => {
    if (isLoggedIn) {
        
        res.sendFile(path.join(__dirname, '..', 'public', 'index2.html'));
    } else {
        res.redirect('/');
    }
};