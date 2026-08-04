const mongoose = require('mongoose');
require('./User'); // in order to ensure the User model is registered before we use it in the virtual populate

const postSchema = new mongoose.Schema({
  user_profile_image: { type: String, default: 'media/profile-pictures/default_profile.jpg' },
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

// --- Add Virtual Populate Relationship (link posts to users by the username field) ---
postSchema.virtual('authorDetails', {
  ref: 'User',             // The name of the User model
  localField: 'username',  // Field in Post schema
  foreignField: 'username',// Field in User schema
  justOne: true            // One-to-one match per post
});

// Ensure virtual fields show up when converting to JSON or Objects
postSchema.set('toObject', { virtuals: true });
postSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Post", postSchema, "Posts_test");