const Group = require('../models/Group'); // ודא שהנתיב למודל הקבוצות נכון
const User = require('../models/User');   // נצטרך גם את מודל המשתמש כדי לעדכן אותו

exports.createGroup = async (req, res) => {
    try {
        // 1. אבטחה: וידוא משתמש מחובר
        if (!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: "עליך להתחבר כדי ליצור קבוצה." });
        }

        const { groupName } = req.body;
        const currentUsername = req.session.username;

        if (!groupName) {
            return res.status(400).json({ success: false, message: "שם הקבוצה חסר." });
        }

        // 2. בדיקה שהקבוצה לא קיימת כבר במערכת (כדי למנוע כפילויות)
        const existingGroup = await Group.findOne({ group_name: groupName });
        if (existingGroup) {
            return res.status(400).json({ success: false, message: "קבוצה בשם זה כבר קיימת, אנא בחר שם אחר." });
        }

        // 3. יצירת האובייקט החדש של הקבוצה
        const newGroup = new Group({
            group_name: groupName,
            admin: currentUsername,
            members: [currentUsername] // האדמין הוא אוטומטית גם חבר קבוצה
        });

        // 4. שמירת הקבוצה ב-DB
        await newGroup.save();

        // 5. עדכון ה-User שמנהל את הקבוצה (הוספת שם הקבוצה למערכי הניהול והחברות שלו)
        await User.updateOne(
            { username: currentUsername },
            { 
                $push: { 
                    group_admin: groupName,
                    group_memberships: groupName 
                } 
            }
        );

        return res.status(201).json({ success: true, message: "הקבוצה נוצרה בהצלחה." });

    } catch (error) {
        console.error("Create Group Error:", error);
        return res.status(500).json({ success: false, message: "שגיאת שרת פנימית." });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        // 1. אבטחה: וידוא משתמש מחובר
        if (!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: "עליך להתחבר כדי למחוק קבוצה." });
        }

        const { groupName } = req.body;
        const currentUsername = req.session.username;

        if (!groupName) {
            return res.status(400).json({ success: false, message: "שם הקבוצה חסר." });
        }

        // 2. חיפוש הקבוצה במסד הנתונים
        const group = await Group.findOne({ group_name: groupName });
        if (!group) {
            return res.status(404).json({ success: false, message: "הקבוצה לא נמצאה." });
        }

        // 3. הבדיקה הקריטית: האם המשתמש המחובר הוא מנהל הקבוצה?
        if (group.admin !== currentUsername) {
            return res.status(403).json({ success: false, message: "רק מנהל הקבוצה מורשה למחוק אותה." });
        }

        // 4. מחיקת הקבוצה מאוסף הקבוצות
        await Group.deleteOne({ group_name: groupName });

        // 5. ניקוי הקבוצה מהפרופילים של כל המשתמשים ($pull מוציא ערך מתוך מערך)
        await User.updateMany(
            {}, // מסנן ריק = רוץ על כל המשתמשים
            { 
                $pull: { 
                    group_admin: groupName,
                    group_memberships: groupName 
                } 
            }
        );

        return res.status(200).json({ success: true, message: "הקבוצה נמחקה בהצלחה." });

    } catch (error) {
        console.error("Delete Group Error:", error);
        return res.status(500).json({ success: false, message: "שגיאת שרת פנימית." });
    }
};

exports.updateGroupName = async (req, res) => {
    try {
        if (!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: "עליך להתחבר כדי לבצע פעולה זו." });
        }

        const { currentName, newName } = req.body;
        const currentUsername = req.session.username;

        // 1. חיפוש הקבוצה כדי לוודא קיום והרשאות מנהל
        const group = await Group.findOne({ group_name: currentName });
        if (!group) {
            return res.status(404).json({ success: false, message: "הקבוצה המבוקשת לא נמצאה." });
        }

        if (group.admin !== currentUsername) {
            return res.status(403).json({ success: false, message: "רק מנהל הקבוצה מורשה לשנות את שמה." });
        }

        // 2. וידוא שהשם החדש לא תפוס כבר
        const existingGroup = await Group.findOne({ group_name: newName });
        if (existingGroup) {
            return res.status(400).json({ success: false, message: "השם החדש תפוס, אנא בחר שם אחר." });
        }

        // 3. עדכון שם הקבוצה באוסף הקבוצות
        await Group.updateOne(
            { group_name: currentName },
            { $set: { group_name: newName } }
        );

        // 4. עדכון השם במערכי הניהול של המשתמשים ($ מסמן את המיקום הספציפי במערך)
        await User.updateMany(
            { group_admin: currentName },
            { $set: { "group_admin.$": newName } }
        );

        // 5. עדכון השם במערכי החברות של המשתמשים
        await User.updateMany(
            { group_memberships: currentName },
            { $set: { "group_memberships.$": newName } }
        );

        return res.status(200).json({ success: true, message: "שם הקבוצה עודכן בהצלחה." });

    } catch (error) {
        console.error("Update Group Name Error:", error);
        return res.status(500).json({ success: false, message: "שגיאת שרת פנימית." });
    }
};

exports.addUserToGroup = async (req, res) => {
    try {
        if (!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: "עליך להתחבר כדי לבצע פעולה זו." });
        }

        const { targetUsername, groupName } = req.body;
        const currentUsername = req.session.username;

        if (!targetUsername || !groupName) {
            return res.status(400).json({ success: false, message: "חסרים נתונים לביצוע הפעולה." });
        }

        // 1. בדיקה שהקבוצה אכן קיימת
        const group = await Group.findOne({ group_name: groupName });
        if (!group) {
            return res.status(404).json({ success: false, message: "הקבוצה המבוקשת לא נמצאה." });
        }

        // 2. בדיקת הרשאות - האם המשתמש המחובר הוא המנהל של הקבוצה?
        if (group.admin !== currentUsername) {
            return res.status(403).json({ success: false, message: "רק מנהל הקבוצה רשאי לצרף משתמשים חדשים." });
        }

        // 3. בדיקה שהמשתמש המיועד אכן קיים במערכת
        const targetUser = await User.findOne({ username: targetUsername });
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "המשתמש אותו ניסית לצרף לא נמצא במערכת." });
        }

        // 4. בדיקה האם המשתמש כבר חבר בקבוצה
        if (group.members.includes(targetUsername)) {
            return res.status(400).json({ success: false, message: "המשתמש כבר חבר בקבוצה זו." });
        }

        // 5. הכל תקין - עדכון הקבוצה (הוספה למערך members)
        await Group.updateOne(
            { group_name: groupName },
            { $push: { members: targetUsername } }
        );

        // 6. עדכון המשתמש (הוספה למערך group_memberships)
        await User.updateOne(
            { username: targetUsername },
            { $push: { group_memberships: groupName } }
        );

        return res.status(200).json({ success: true, message: "המשתמש צורף לקבוצה בהצלחה." });

    } catch (error) {
        console.error("Add User to Group Error:", error);
        return res.status(500).json({ success: false, message: "שגיאת שרת פנימית." });
    }
};


// פונקציה 1: חיפוש גם משתמשים וגם קבוצות
exports.searchAll = async (req, res) => {
    try {
        const { filter = 'all', q = '', admin = '', group = '' } = req.query;

        // אם כל שדות החיפוש ריקים, מחזירים תוצאות ריקות
        if (!q && !admin && !group) {
            return res.json({ success: true, users: [], groups: [] });
        }

        let usersPromise = Promise.resolve([]);
        let groupsPromise = Promise.resolve([]);

        // --- חיפוש משתמשים ---
        if (filter === 'all' || filter === 'users') {
            let userQueryCondition = {};

            // חיפוש לפי שם משתמש כללי (q) אם קיים
            if (q) {
                userQueryCondition.username = { $regex: q, $options: 'i' };
            }

            // אם הוגדר חיפוש לפי שם קבוצה (group)
            if (group) {
                const matchingGroups = await Group.find({ 
                    group_name: { $regex: group, $options: 'i' } 
                }).select('members');

                // איסוף כל שמות המשתמש מתוך מערכי החברים של הקבוצות התואמות, והסרת כפילויות בעזרת Set
                const usernamesInGroups = [...new Set(matchingGroups.flatMap(g => g.members || []))];

                if (usernamesInGroups.length === 0) {
                    // אם לא נמצאו קבוצות תואמות או שאין חברים בקבוצות
                    userQueryCondition.username = { $in: [] };
                } else {
                    if (userQueryCondition.username) {
                        userQueryCondition = {
                            $and: [
                                { username: userQueryCondition.username },
                                { username: { $in: usernamesInGroups } }
                            ]
                        };
                    } else {
                        userQueryCondition.username = { $in: usernamesInGroups };
                    }
                }
            }

            usersPromise = User.find(userQueryCondition)
                .select('username user_profile_image _id')
                .limit(10);
        }

        // --- חיפוש קבוצות ---
        if (filter === 'all' || filter === 'groups') {
            let groupQueryCondition = {};

            // חיפוש לפי שם קבוצה כללי (q) אם קיים
            if (q) {
                groupQueryCondition.group_name = { $regex: q, $options: 'i' };
            }

            // אם הוגדר חיפוש לפי מנהל (admin)
            if (admin) {
                groupQueryCondition.admin = { $regex: admin, $options: 'i' };
            }

            groupsPromise = Group.find(groupQueryCondition)
                .select('group_name admin members')
                .limit(10);
        }

        const [users, groups] = await Promise.all([usersPromise, groupsPromise]);

        return res.status(200).json({ success: true, users, groups });
    } catch (error) {
        console.error("Search All Error:", error);
        return res.status(500).json({ success: false, message: "שגיאת שרת פנימית." });
    }
};

// פונקציה 2: החזרת רשימת החברים המלאה של קבוצה (עם תמונות)
exports.getGroupMembers = async (req, res) => {
    try {
        const groupName = req.params.groupName;
        
        const group = await Group.findOne({ group_name: groupName });
        if (!group) return res.status(404).json({ success: false, message: "קבוצה לא נמצאה." });

        // משיכת פרטי המשתמשים מתוך מערך השמות ששמור בקבוצה
        const members = await User.find({ username: { $in: group.members } })
            .select('username user_profile_image');

        return res.status(200).json({ 
            success: true, 
            members: members,
            admin: group.admin 
        });
    } catch (error) {
        console.error("Get Group Members Error:", error);
        return res.status(500).json({ success: false, message: "שגיאת שרת פנימית." });
    }
};

exports.getGroupStatistics = async (req, res) => {
    try {
   
        const groupStats = await Group.aggregate([
            {
                $project: {
                    _id: 0,
                    groupName: "$group_name",
                    memberCount: { $size: "$members" } 
                }
            },
            {
                $sort: { memberCount: -1 } // מיון מהגדול לקטן
            }
        ]);

        return res.status(200).json({ success: true, data: groupStats });
    } catch (error) {
        console.error("Statistics Error:", error);
        return res.status(500).json({ success: false, message: "שגיאה בשליפת נתונים סטטיסטיים." });
    }
};

