require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Post = require('./models/Post');
const Group = require('./models/Group');
const Location = require('./models/Location');

const users = [
  {
    username: 'demo_rotem',
    email: 'demo.rotem@example.com',
    user_profile_image: 'media/profile-pictures/default_profile.jpg',
    group_admin: ['sports_demo'],
    group_memberships: ['sports_demo', 'music_demo']
  },
  {
    username: 'maya_demo',
    email: 'maya.demo@example.com',
    user_profile_image: 'media/profile-pictures/maya_99.jpg',
    group_admin: ['music_demo'],
    group_memberships: ['music_demo']
  },
  {
    username: 'eran_demo',
    email: 'eran.demo@example.com',
    user_profile_image: 'media/profile-pictures/eran.jpg',
    group_admin: [],
    group_memberships: ['sports_demo']
  }
];

const posts = [
  {
    username: 'demo_rotem',
    user_profile_image: 'media/profile-pictures/default_profile.jpg',
    upload_time: '• לפני שעה',
    post_type: 'image',
    post_content: 'media/posts/main-posts/deni.jpg',
    like_count: '34',
    comment_count: 3,
    repost_count: 1,
    caption: 'פוסט דמה לתצוגת רשת חברתית עם תמונה.'
  },
  {
    username: 'maya_demo',
    user_profile_image: 'media/profile-pictures/maya_99.jpg',
    upload_time: '• לפני שעתיים',
    post_type: 'video',
    post_content: 'media/posts/main-posts/noa-kirel-post.mp4',
    like_count: '58',
    comment_count: 6,
    repost_count: 2,
    caption: 'דוגמת וידאו HTML5.'
  },
  {
    username: 'eran_demo',
    user_profile_image: 'media/profile-pictures/eran.jpg',
    upload_time: '• היום',
    post_type: 'text',
    post_content: 'יום משחק גדול, פוסט טקסט קצר לדאטה דמה.',
    like_count: '17',
    comment_count: 1,
    repost_count: 0,
    caption: 'פוסט טקסט.'
  }
];

const groups = [
  { group_name: 'sports_demo', admin: 'demo_rotem', members: ['demo_rotem', 'eran_demo'] },
  { group_name: 'music_demo', admin: 'maya_demo', members: ['demo_rotem', 'maya_demo'] }
];

const locations = [
  { name: 'Demo Tel Aviv', lat: 32.0853, lng: 34.7818, addedBy: 'demo_rotem' },
  { name: 'Demo Jerusalem', lat: 31.7683, lng: 35.2137, addedBy: 'maya_demo' }
];

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error('Missing MONGO_URI in .env');
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  const password = await bcrypt.hash('Demo123456', 10);

  for (const user of users) {
    await User.updateOne(
      { email: user.email },
      { $set: { ...user, password } },
      { upsert: true }
    );
  }

  for (const group of groups) {
    await Group.updateOne({ group_name: group.group_name }, { $set: group }, { upsert: true });
  }

  for (const post of posts) {
    await Post.updateOne(
      { username: post.username, post_content: post.post_content },
      { $set: post },
      { upsert: true }
    );
  }

  for (const location of locations) {
    await Location.updateOne({ name: location.name }, { $set: location }, { upsert: true });
  }

  console.log('Demo data seeded. Login email: demo.rotem@example.com password: Demo123456');
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
