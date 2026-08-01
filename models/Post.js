const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user_profile_image: { type: String, default: 'media/profile-pictures/profile.png' },
  username: { type: String, required: true, trim: true },
  upload_time: { type: String, default: '• עכשיו' },
  sub_header: { type: String, default: '' },
  post_type: { type: String, default: 'text' },
  post_content: { type: String, required: true },
  audio: { type: String, default: '' },
  like_count: { type: String, default: '0' },
  comment_count: { type: Number, default: 0 },
  repost_count: { type: Number, default: 0 },
  liked_by_usernames: { type: [String], default: [] },
  caption: { type: String, default: '' }
}, { timestamps: true }); // Creates createdAt and updatedAt fields automatically

module.exports = mongoose.model("Post", postSchema, "Posts_test");