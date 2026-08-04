const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const postModel = require('../models/postModel');

exports.getFeed = async (req, res) => {
    try {
        const posts = await postModel.getAllPosts();

        // Format posts so the frontend receives the correct user_profile_image from User collection
        const formattedPosts = posts.map(post => {
            const postObj = post.toObject ? post.toObject() : post;
            
            // If authorDetails was found via virtual populate, override the profile image
            if (postObj.authorDetails && postObj.authorDetails.user_profile_image) {
                postObj.user_profile_image = postObj.authorDetails.user_profile_image;
            }
            
            return postObj;
        });
        
        res.json(formattedPosts);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error fetching feed." });
    }
};

exports.createPost = async (req, res) => {
    try {
        let postContent = req.body.post_content;

        // If a file was uploaded via GridFS, store the retrieval path/filename
        if (req.file) {
            const db = mongoose.connection.db;
            const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
            
            const filename = Date.now() + '-' + req.file.originalname;
            
            // Create a readable stream from the buffer and pipe it to GridFS bucket
            const readableStream = require('stream').Readable.from(req.file.buffer);
            const uploadStream = bucket.openUploadStream(filename);
            
            await new Promise((resolve, reject) => {
                readableStream.pipe(uploadStream)
                    .on('error', reject)
                    .on('finish', resolve);
            });
            
            postContent = `api/posts/file/${filename}`;
        }

        // Make sure you pass the current logged-in user's username here!
        const postData = {
            username: req.body.username, // Ensure username is provided in the request body
            post_type: req.body.post_type,
            caption: req.body.caption,
            post_content: postContent
        };

        const addedPost = await postModel.addPost(postData);
        res.status(201).json({ success: true, addedPost });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error creating post." });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.body; 
        const isDeleted = await postModel.deletePostById(postId);
        
        if (isDeleted) {
            return res.json({ success: true, message: "Post deleted successfully." });
        }
        res.status(404).json({ success: false, message: "Post not found." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error deleting post." });
    }
};

exports.searchGifs = (req, res) => {
    const https = require('https');
    const searchQuery = req.query.q || "trending";
    
    // שים כאן את המפתח שהעתקת מגיפי בתוך המרכאות!
    const apiKey = process.env.GIPHY_API_KEY;
    console.log("My API Key from env is:", apiKey);
    
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(searchQuery)}&limit=6`;

    https.get(url, (response) => {
        let data = '';
        
        response.on('data', (chunk) => { data += chunk; });
        
        response.on('end', () => {
            try {
                const parsedData = JSON.parse(data);
                
                // הוספנו הדפסה לטרמינל כדי שנוכל לראות את התשובה האמיתית של גיפי
                console.log("Giphy Response:", parsedData); 

                if (parsedData.data && parsedData.data.length > 0) {
                    const gifUrls = parsedData.data.map(gif => gif.images.fixed_height.url);
                    res.json({ success: true, gifs: gifUrls });
                } else {
                    res.json({ success: false, message: "לא נמצאו תוצאות" });
                }
            } catch (error) {
                res.status(500).json({ success: false, message: "שגיאה בפענוח הנתונים" });
            }
        });
        
    }).on('error', (error) => {
        res.status(500).json({ success: false, message: "שגיאה בתקשורת לגיפי" });
    });

    
};

// ==========================================
// פונקציה לפרסום פוסט בדף הפייסבוק
// ==========================================
exports.postToFacebook = (req, res) => {
    const https = require('https');
    
    // שולפים את הסודות שלנו מקובץ ה-.env
    const pageId = process.env.FB_PAGE_ID;
    const accessToken = process.env.FB_ACCESS_TOKEN;
    const message = "היה לי היום את היום הכי טוב כבר תקופה"; // ההודעה שביקשת

    // מכינים את החבילה שתשלח לפייסבוק
    const postData = JSON.stringify({
        message: message,
        access_token: accessToken
    });

    const options = {
        hostname: 'graph.facebook.com',
        path: `/v19.0/${pageId}/feed`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const request = https.request(options, (response) => {
        let data = '';
        
        response.on('data', (chunk) => { data += chunk; });
        
        response.on('end', () => {
            try {
                const parsedData = JSON.parse(data);
                // אם פייסבוק מחזירים ID, סימן שהפוסט עלה
                if (parsedData.id) {
                    res.json({ success: true, message: "הסטטוס פורסם בהצלחה!", postId: parsedData.id });
                } else {
                    res.json({ success: false, error: parsedData });
                }
            } catch (error) {
                res.status(500).json({ success: false, message: "שגיאה בפענוח התשובה מפייסבוק" });
            }
        });
    });

    request.on('error', (error) => {
        console.error("Facebook API Error:", error);
        res.status(500).json({ success: false, message: "שגיאה בתקשורת מול פייסבוק" });
    });

    request.write(postData);
    request.end();
};
