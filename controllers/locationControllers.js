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
        const { name, lat, lng } = req.body;
        const newLocation = new Location({ 
            name, 
            lat, 
            lng, 
            addedBy: req.session ? req.session.username : 'unknown' 
        });
        await newLocation.save();
        res.status(201).json({ success: true, data: newLocation });
    } catch (error) {
        res.status(500).json({ success: false, message: "שגיאה ביצירת מיקום" });
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { newName } = req.body;
        await Location.findByIdAndUpdate(id, { name: newName });
        res.status(200).json({ success: true, message: "המיקום עודכן בהצלחה" });
    } catch (error) {
        res.status(500).json({ success: false, message: "שגיאה בעדכון מיקום" });
    }
};

exports.deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        await Location.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "המיקום נמחק" });
    } catch (error) {
        res.status(500).json({ success: false, message: "שגיאה במחיקת מיקום" });
    }
};