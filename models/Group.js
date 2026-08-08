const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  group_profile_image: { type: String, default: 'media/profile-pictures/default_profile.jpg' },
  group_name: { type: String, required: true, trim: true, unique: true },
  admin: { type: String, required: true, trim: true },
  members: { type: [String], default: [] },
}, { timestamps: true }); // Creates createdAt and updatedAt fields automatically

module.exports = mongoose.model("Group", groupSchema, "Groups_test");