const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Group = require('../models/Group');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    
    // בדיקת תקינות אימייל
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!username || !emailPattern.test(username)) {
        return res.status(400).json({ success: false, message: "Invalid email format on server." });
    }
    
    // בדיקת אורך סיסמה
    if (!password || password.length < 9) {
        return res.status(400).json({ success: false, message: "Password must be at least 9 characters long." });
    }

    // בדיקת תקינות סיסמה: אות גדולה, אות קטנה ומספר
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        return res.status(400).json({ success: false, message: "הסיסמה חייבת להכיל לפחות אות גדולה אחת, אות קטנה אחת ומספר." });
    }

    // חיפוש המשתמש
    const user = await User.findOne({ email: username });
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    // השוואת סיסמאות
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        await User.updateOne(
            { email: username },
            { $set: { last_login: new Date() } }
        );

        req.session.username = user.username;
        req.session.user_profile_image = user.user_profile_image;
        req.session.group_admin = user.group_admin || [];
        req.session.group_memberships = user.group_memberships || [];
        req.session.friends = user.friends || [];

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

exports.getCurrentUser = async (req, res) => {
    if (req.session && req.session.username) {
        try {
            // Fetch fresh user document from MongoDB
            const userDoc = await User.findOne({ username: req.session.username });
            if (!userDoc) {
                return res.status(404).json({ error: "User not found" });
            }

            const groupNames = userDoc.group_admin || [];
            
            const groupAdminDetails = await Promise.all(
                groupNames.map(async (groupName) => {
                    const groupDoc = await Group.findOne({ group_name: groupName }); 

                    return {
                        group_name: groupName,
                        group_profile_image: groupDoc ? groupDoc.group_profile_image : 'media/profile-pictures/default_profile.jpg'
                    };
                })
            );

            res.json({ 
                username: userDoc.username,
                user_profile_image: userDoc.user_profile_image,
                group_admin: groupAdminDetails ,
                group_memberships: userDoc.group_memberships || [],
                friends: userDoc.friends || []
            });
        } catch (err) {
            console.error("Error fetching group admin details:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    } else {
        res.status(401).json({ username: null, user_profile_image: null, group_admin: [], group_memberships: [], friends: [] });
    }
};

exports.addFriend = async (req, res) => {
    try {
        if (!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: "עליך להתחבר כדי לבצע פעולה זו." });
        }

        const targetUsername = req.body.targetUsername ? req.body.targetUsername.trim() : "";
        const currentUsername = req.session.username.trim();

        if (!targetUsername) {
            return res.status(400).json({ success: false, message: "חסר שם משתמש." });
        }

        if (targetUsername === currentUsername) {
            return res.status(400).json({ success: false, message: "אינו יכול להוסיף את עצמך לחברים." });
        }

        const currentUser = await User.findOne({ username: currentUsername });
        if (!currentUser) {
            return res.status(404).json({ success: false, message: "המשתמש המחובר לא נמצא." });
        }

        const targetUser = await User.findOne({ username: targetUsername });
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "המשתמש המבוקש לא נמצא." });
        }

        if (currentUser.friends && currentUser.friends.includes(targetUsername)) {
            return res.status(400).json({ success: false, message: "המשתמש כבר ברשימת החברים שלך." });
        }

        // Add to current user's friends list (and optionally target user if mutual)
        await User.updateOne(
            { username: currentUsername },
            { $addToSet: { friends: targetUsername } }
        );

        // **Immediate Session Update**
        if (!req.session.friends) {
            req.session.friends = [];
        }
        if (!req.session.friends.includes(targetUsername)) {
            req.session.friends.push(targetUsername);
        }

        return res.status(200).json({ success: true, message: "המשתמש נוסף לחברים בהצלחה." });

    } catch (error) {
        console.error("Add Friend Error:", error);
        return res.status(500).json({ success: false, message: "שגיאת שרת פנימית." });
    }
};

exports.removeFriend = async (req, res) => {
    try {
        if (!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: "עליך להתחבר כדי לבצע פעולה זו." });
        }

        const targetUsername = req.body.targetUsername ? req.body.targetUsername.trim() : "";
        const currentUsername = req.session.username.trim();

        if (!targetUsername) {
            return res.status(400).json({ success: false, message: "חסר שם משתמש." });
        }

        // Remove from current user's friends list
        await User.updateOne(
            { username: currentUsername },
            { $pull: { friends: targetUsername } }
        );

        // **Immediate Session Update**
        if (req.session.friends) {
            req.session.friends = req.session.friends.filter(f => f !== targetUsername);
        }

        return res.status(200).json({ success: true, message: "החבר הוסר בהצלחה." });

    } catch (error) {
        console.error("Remove Friend Error:", error);
        return res.status(500).json({ success: false, message: "שגיאת שרת פנימית." });
    }
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "כל השדות חסרים." });
        }

        // בדיקת תקינות אימייל
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            return res.status(400).json({ success: false, message: "פורמט האימייל אינו תקין." });
        }

        // בדיקת אורך סיסמה
        if (password.length < 9) {
            return res.status(400).json({ success: false, message: "הסיסמה חייבת להכיל לפחות 9 תווים." });
        }

        // בדיקת תקינות סיסמה: אות גדולה, אות קטנה ומספר
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).json({ success: false, message: "הסיסמה חייבת להכיל לפחות אות גדולה אחת, אות קטנה אחת ומספר." });
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

exports.updateEmail = async (req, res) => {
    try {
        // 1. נוודא שיש משתמש מחובר
        if (!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: "אינך מורשה לבצע פעולה זו." });
        }

        const currentUsername = req.session.username;
        const { newEmail } = req.body;

        // 2. בדיקת תקינות בשרת
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!newEmail || !emailPattern.test(newEmail)) {
            return res.status(400).json({ success: false, message: "כתובת האימייל אינה תקינה." });
        }

        // 3. נוודא שהאימייל החדש לא תפוס כבר
        const existingUser = await User.findOne({ email: newEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "האימייל הזה כבר רשום במערכת. אנא בחר אימייל אחר." });
        }

        // 4. עדכון במסד הנתונים
        await User.updateOne(
            { username: currentUsername },
            { $set: { email: newEmail } }
        );

        // שים לב: אנחנו לא מעדכנים את ה-Session כאן כמו שעשינו בשם משתמש, 
        // כי שם המשתמש (שנמצא בסשן) נשאר אותו דבר!

        return res.status(200).json({ success: true, message: "האימייל עודכן בהצלחה." });

    } catch (error) {
        console.error("Update Email Error:", error);
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
