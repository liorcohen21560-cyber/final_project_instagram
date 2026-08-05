const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_profile_image: { type: String, default: 'media/profile-pictures/default_profile.jpg' },
  username: { type: String, required: true, trim: true, unique: true },
  friends: { type: [String], default: [] },
  group_admin: { type: [String], default: [] },
  group_memberships: { type: [String], default: [] },
  last_login: { type: Date, default: null },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
}, { timestamps: true }); // Creates createdAt and updatedAt fields automatically

module.exports = mongoose.model("User", userSchema, "Users_test");