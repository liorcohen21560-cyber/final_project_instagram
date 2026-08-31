const Post = require('./Post'); // Import the Mongoose model
const User = require('./User'); // Import the Mongoose model
const Group = require('./Group'); // Import the Mongoose model

module.exports = {
    // Fetch all posts posted by user's friends and groups from MongoDB, sorted by newest first
    getAllPosts: async (currentUsername) => {
        try {
            // Fetch the current user to get their friends list and group memberships
            const currentUser = await User.findOne({ username: currentUsername });

            let allowedCreators = []; // Always include the user themselves

            if (currentUser) {
                // Add friends if they exist
                if (currentUser.friends && Array.isArray(currentUser.friends)) {
                    allowedCreators.push(...currentUser.friends);
                }
                // Add group memberships if they exist
                if (currentUser.group_memberships && Array.isArray(currentUser.group_memberships)) {
                    allowedCreators.push(...currentUser.group_memberships);
                }
            }

            // Build the dynamic query filter
            // This checks if the post's username belongs to the user/friends, 
            // OR if the post belongs to one of the groups the user is in.
            const queryFilter = {
                username: { $in: allowedCreators }
            };

            // Fetch filtered posts from the database
            const posts = await Post.find(queryFilter)
                .populate('authorDetails', "user_profile_image")
                .sort({ createdAt: -1 });

            // Fetch all relevant groups at once to map their profile images quickly
            const groupNamesInPosts = [...new Set(posts.map(p => p.username))];
            const groups = await Group.find({ group_name: { $in: groupNamesInPosts } });
            const groupImageMap = {};
            groups.forEach(g => {
                groupImageMap[g.group_name] = g.group_profile_image;
            });

            // Map through the posts to inject the fallback logic for legacy documents
            return posts.map(post => {
                const postObj = post.toObject ? post.toObject() : post;
            
                // If the author is a group and has a custom image in the Group collection, use it!
                if (groupImageMap[postObj.username] && groupImageMap[postObj.username] !== 'media/profile-pictures/default_profile.jpg') {
                    postObj.user_profile_image = groupImageMap[postObj.username];
                } 
                // Otherwise, fall back to author details or default
                else if (!postObj.user_profile_image || postObj.user_profile_image === "" || postObj.user_profile_image === "media/profile-pictures/default_profile.jpg") {
                    postObj.user_profile_image = postObj.authorDetails?.user_profile_image || 'media/profile-pictures/default_profile.jpg';
                }
            
                return postObj;
            });

        } catch (error) {
            console.error("Error fetching filtered posts:", error);
            throw error;
        }
    },

    // Fetch only the posts created by the current user, sorted by newest first
    getUserOnlyPosts: async (currentUsername) => {
    try {
            const queryFilter = { username: currentUsername };

            const posts = await Post.find(queryFilter)
                .populate('authorDetails', "user_profile_image")
                .sort({ createdAt: -1 });

            return posts.map(post => {
                const postObj = post.toObject ? post.toObject() : post;
        
                if (!postObj.user_profile_image || postObj.user_profile_image === "" || postObj.user_profile_image === "media/profile-pictures/default_profile.jpg") {
                    postObj.user_profile_image = postObj.authorDetails?.user_profile_image || 'media/profile-pictures/default_profile.jpg';
                }
        
                return postObj;
            });

        } catch (error) {
            console.error("Error fetching user-only posts:", error);
            throw error;
        }
    },
    
    // Create and save a new post to MongoDB
    addPost: async (newPostData) => {
        try {
            const newPost = new Post({
                user_profile_image: newPostData.user_profile_image || "media/profile-pictures/default_profile.jpg",
                username: newPostData.username || "liorcohen299",
                upload_time: "• עכשיו",
                post_type: newPostData.post_type || "text",
                post_content: newPostData.post_content,
                like_count: "0",
                comment_count: 0,
                repost_count: 0,
                caption: newPostData.caption || ""
            });

            const savedPost = await newPost.save();
            return savedPost;
        } catch (error) {
            console.error("Error adding post:", error);
            throw error;
        }
    },
    
    // Delete a post by its MongoDB unique _id
    deletePostById: async (postId) => {
        try {
            // Find the document by its MongoDB _id and remove it
            const deletedPost = await Post.findByIdAndDelete(postId);
            return deletedPost !== null; // returns true if found and deleted, false otherwise
        } catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    }
};