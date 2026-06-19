// מערך הפוסטים שלך
const postObjects = [
    {
        user_profile_image: "images/the_amazing_race_profile.jpg", username: "the.amazing.race.israel", upload_time: "• 9 שע'", post_type: "image", 
        post_content: "images/the_amazing_race.jpg", like_count: "16,800", comment_count: 724, repost_count: 51, 
        caption: " קבלו אותם! טום ואלמוג, המנצחים של המירוץ למיליון 2026, הגיעו הבוקר למשרדי קשת 12 לקבל את הפרס 🌏"
    },
    {
        user_profile_image: "images/sport 5.png", username: "sport_5", upload_time: "• 5 שע'", post_type: "image", post_content: "images/eran.jpg",
        like_count: "1,240", comment_count: 389, repost_count: 204, caption: " ערן זהבי לא עוצר! כובש שער ניצחון מדהים באצטדיון חולון ⚽️🔥"
    },
    {
        user_profile_image: "images/sport 5.png", username: "sport_5", upload_time: "• 2 שע'", post_type: "image", post_content: "images/deni.jpg",
        like_count: "186", comment_count: 186, repost_count: 37, caption: " דני אבדיה בשיאו! עוד שישי של חגיגה לאומית בקבוצה של וושינגטון 😍"
    }
];

module.exports = {
    getAllPosts: () => postObjects,
    
    addPost: (newPostData) => {
        const fullyFormedPost = {
            user_profile_image: "profile.png",
            username: "liorcohen299",
            upload_time: "• עכשיו",
            post_type: newPostData.post_type || "text",
            post_content: newPostData.post_content,
            like_count: "0",
            comment_count: 0,
            repost_count: 0,
            caption: newPostData.caption || ""
        };
        postObjects.push(fullyFormedPost);
        return fullyFormedPost;
    },
    
    deletePostByIndex: (index) => {
        if (index !== undefined && index >= 0 && index < postObjects.length) {              
            postObjects.splice(index, 1); 
            return true;
        }
        return false;
    }
};