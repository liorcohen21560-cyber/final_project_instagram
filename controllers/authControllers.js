const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!username || !emailPattern.test(username)) {
        return res.status(400).json({ success: false, message: "Invalid email format on server." });
    }
    
    if (!password || password.length < 9) {
        return res.status(400).json({ success: false, message: "Password must be at least 9 characters long." });
    }

    // Find the user by email
    const user = await User.findOne({ email: username });
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    // Compare the incoming plaintext password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        // Update the last_login field to the current date/time
        await User.updateOne(
            { email: username },
            { $set: { last_login: new Date() } }
        );

        // Store the username and user_profile_image in the session
        req.session.username = user.username;
        req.session.user_profile_image = user.user_profile_image;

        return res.status(200).json({ success: true });
    } else {
        return res.status(401).json({ success: false, message: "Invalid username or password." });
    }
};

exports.protectFeed = (req, res) => {
    // Check if the session exists and has a username saved
    if (req.session && req.session.username) {
        console.log("Active user viewing feed:", req.session.username);
        res.sendFile(path.join(__dirname, '..', 'public', 'index2.html'));
    } else {
        res.redirect('/');
    }
};