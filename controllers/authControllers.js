const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.login = async (req, res) => {
    try {
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
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: "Server error during login." });
    }
};

exports.loginForm = async (req, res) => {
    try {
        const { username, password } = req.body;
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!username || !emailPattern.test(username) || !password || password.length < 9) {
            return res.redirect('/');
        }

        const user = await User.findOne({ email: username });
        if (!user) {
            return res.redirect('/');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.redirect('/');
        }

        await User.updateOne(
            { email: username },
            { $set: { last_login: new Date() } }
        );

        req.session.username = user.username;
        req.session.user_profile_image = user.user_profile_image;
        return res.redirect('/index2.html');
    } catch (error) {
        console.error("Login Form Error:", error);
        return res.redirect('/');
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


exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "כל השדות חסרים." });
        }

        // בדיקה אם המשתמש כבר קיים
        const existingUser = await User.findOne({ $or: [{ email: email }, { username: username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "שם המשתמש או האימייל כבר קיימים במערכת." });
        }

        // הצפנת הסיסמה
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // יצירת משתמש חדש
        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword
        });

        await newUser.save();
        return res.status(201).json({ success: true, message: "המשתמש נוצר בהצלחה" });

    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ success: false, message: "שגיאת שרת פנימית." });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        // 1. אבטחה: מוודאים שבאמת יש משתמש מחובר ושומרים את השם שלו
        if (!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: "אינך מורשה לבצע פעולה זו." });
        }

        const currentUsername = req.session.username;

        // 2. מחיקת המשתמש מהדאטה-בייס לפי שם המשתמש
        const deletedUser = await User.findOneAndDelete({ username: currentUsername });

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "המשתמש לא נמצא במערכת." });
        }

        // 3. השמדת הסשן - מנתק את המשתמש מיד מהמערכת
        req.session.destroy((err) => {
            if (err) {
                console.error("Session destroy error:", err);
            }
            return res.status(200).json({ success: true, message: "המשתמש נמחק בהצלחה." });
        });

    } catch (error) {
        console.error("Delete Account Error:", error);
        return res.status(500).json({ success: false, message: "שגיאת שרת פנימית." });
    }
};

exports.updateUsername = async (req, res) => {
    try {
        // 1. נוודא שיש משתמש מחובר
        if (!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: "אינך מורשה לבצע פעולה זו." });
        }

        const currentUsername = req.session.username;
        const { newUsername } = req.body;

        // 2. נוודא שהוזן שם תקין ושהוא לא זהה לשם הנוכחי
        if (!newUsername || newUsername.toLowerCase() === currentUsername.toLowerCase()) {
            return res.status(400).json({ success: false, message: "יש להזין שם משתמש חדש שונה מהנוכחי." });
        }

        // 3. נוודא שהשם החדש לא תפוס כבר על ידי משתמש אחר במערכת
        const existingUser = await User.findOne({ username: newUsername });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "שם המשתמש החדש כבר תפוס, אנא בחר שם אחר." });
        }

        // 4. עדכון במסד הנתונים
        await User.updateOne(
            { username: currentUsername },
            { $set: { username: newUsername } }
        );

        // 5. הצעד הקריטי: עדכון ה-Session בשרת לשם החדש!
        req.session.username = newUsername;

        return res.status(200).json({ success: true, message: "שם המשתמש עודכן בהצלחה." });

    } catch (error) {
        console.error("Update Username Error:", error);
        return res.status(500).json({ success: false, message: "שגיאת שרת פנימית." });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const query = req.query.q; // שליפת מחרוזת החיפוש מה-URL
        
        if (!query) {
            return res.json({ success: true, users: [] });
        }

        // חיפוש במונגו: $regex מחפש חלק ממילה, 'i' אומר שזה לא תלוי באותיות גדולות/קטנות
        const users = await User.find({ 
            username: { $regex: query, $options: 'i' } 
        })
        .select('username user_profile_image _id') // מחזיר רק את השדות האלו!
        .limit(10); // מגביל ל-10 תוצאות כדי לא להכביד על השרת

        return res.status(200).json({ success: true, users: users });

    } catch (error) {
        console.error("Search Users Error:", error);
        return res.status(500).json({ success: false, message: "שגיאת שרת בחיפוש." });
    }
};
