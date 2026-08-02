const Post = require('./Post'); // Import the Mongoose model

module.exports = {
    // Fetch all posts from MongoDB, sorted by newest first
    getAllPosts: async () => {
        try {
            return await Post.find().sort({ createdAt: -1 });
        } catch (error) {
            console.error("Error fetching posts:", error);
            throw error;
        }
    },
    
    // Create and save a new post to MongoDB
    addPost: async (newPostData) => {
        try {
            const newPost = new Post({
                user_profile_image: "images/profile.png",
                username: "liorcohen299",
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