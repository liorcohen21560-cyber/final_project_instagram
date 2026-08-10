const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const postModel = require('../models/postModel');
const Post = require('../models/Post'); 

exports.getFeed = async (req, res) => {
    try {
        const currentUsername = req.session ? req.session.username : null;

        if (!currentUsername) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
        }

        const posts = await postModel.getAllPosts(currentUsername);
        
        res.json(posts);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error fetching feed." });
    }
};

exports.getMyPosts = async (req, res) => {
    try {
        const currentUsername = req.session ? req.session.username : null;

        if (!currentUsername) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
        }

        const posts = await postModel.getUserOnlyPosts(currentUsername);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error fetching my posts." });
    }
}

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
            username: req.body.username,
            user_profile_image: req.body.user_profile_image,
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




exports.getTopActiveUsers = async (req, res) => {
    try {
       
        const topUsers = await Post.aggregate([ 
            {
               
                $group: {
                    _id: "$username",
                    postCount: { $sum: 1 }
                }
            },
            {
                
                $sort: { postCount: -1 }
            },
            {
                // הגבלה ל-5 המובילים
                $limit: 5
            }
        ]); // <-- סגירת מערך

        return res.status(200).json({ success: true, data: topUsers });
    } catch (error) {
        console.error("Top Users Stats Error:", error);
        return res.status(500).json({ success: false, message: "שגיאה בשליפת נתוני משתמשים פעילים." });
    }
};

exports.getUserPostTypeStats = async (req, res) => {
    try {
        const username = req.session.username;
        const stats = await Post.aggregate([
            {
                $match: { username: username } // Filter for a specific user
            },
            {
                $group: {
                    _id: "$username",
                    totalPosts: { $sum: 1 },
                    textCount: {
                        $sum: { $cond: [{ $eq: ["$post_type", "text"] }, 1, 0] }
                    },
                    imageCount: {
                        $sum: { $cond: [{ $eq: ["$post_type", "image"] }, 1, 0] }
                    },
                    videoCount: {
                        $sum: { $cond: [{ $eq: ["$post_type", "video"] }, 1, 0] }
                    }
                }
            }
        ]);

        // If the user hasn't posted anything yet, return zero counts
        const userStats = stats.length > 0 ? stats[0] : { totalPosts: 0, textCount: 0, imageCount: 0, videoCount: 0 };

        return res.status(200).json({ success: true, data: userStats });
    } catch (error) {
        console.error("Post Type Stats Error:", error);
        return res.status(500).json({ success: false, message: "שגיאה בשליפת סטטיסטיקת סוגי פוסטים." });
    }
};