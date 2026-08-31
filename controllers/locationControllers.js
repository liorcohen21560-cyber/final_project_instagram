const Location = require('../models/Location');


exports.getLocations = async (req, res) => {
    try {
        const locations = await Location.find({});
        res.status(200).json({ success: true, data: locations });
    } catch (error) {
        res.status(500).json({ success: false, message: "שגיאה בשליפת מיקומים" });
    }
};


exports.addLocation = async (req, res) => {
    try {
        const username = req.session ? req.session.username : 'unknown';
        
        // 1. בדיקה האם למשתמש כבר יש מיקום במסד הנתונים
        const existingLocation = await Location.findOne({ addedBy: username });
        if (existingLocation) {
            return res.status(400).json({ 
                success: false, 
                message: "כבר יש לך מיקום במפה! כל משתמש יכול ליצור רק סיכה אחת. לחץ על הסיכה שלך כדי לערוך אותה." 
            });
        }

        const { name, lat, lng } = req.body;
        const newLocation = new Location({ name, lat, lng, addedBy: username });
        await newLocation.save();
        res.status(201).json({ success: true, data: newLocation });
    } catch (error) {
        res.status(500).json({ success: false, message: "שגיאה ביצירת מיקום" });
    }
};


exports.updateLocation = async (req, res) => {
    try {
        const username = req.session ? req.session.username : 'unknown';
        const { id } = req.params;
        const { newName } = req.body;

        
        const location = await Location.findById(id);
        if (!location) return res.status(404).json({ success: false, message: "המיקום לא נמצא" });

        
        if (location.addedBy !== username) {
            return res.status(403).json({ success: false, message: "אין לך הרשאה לערוך מיקום של משתמש אחר." });
        }

        location.name = newName;
        await location.save();
        res.status(200).json({ success: true, message: "המיקום עודכן בהצלחה" });
    } catch (error) {
        res.status(500).json({ success: false, message: "שגיאה בעדכון מיקום" });
    }
};


exports.deleteLocation = async (req, res) => {
    try {
        const username = req.session ? req.session.username : 'unknown';
        const { id } = req.params;

        const location = await Location.findById(id);
        if (!location) return res.status(404).json({ success: false, message: "המיקום לא נמצא" });

       
        if (location.addedBy !== username) {
            return res.status(403).json({ success: false, message: "אין לך הרשאה למחוק מיקום של משתמש אחר." });
        }

        await Location.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "המיקום נמחק" });
    } catch (error) {
        res.status(500).json({ success: false, message: "שגיאה במחיקת מיקום" });
    }
};