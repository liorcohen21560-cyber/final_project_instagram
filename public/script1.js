/* * Instagram Feed Logic
 * Part 1: Like Button (Animation, Toggle, Image swap using Relative Paths)
 * Part 2: Search Modal (Filter posts, Reset)
 * Part 3: Comments (Add, Count, Toggle display)
 * Part 4: Dark Mode Toggle (POP-UP TEST)
 * Part 5: Back to Top Button (Show on scroll, Smooth scroll)
 * Part 6: Create Post Modal (Image/Video upload, Text caption, Validation)
 * Part 7: Delete Post (Remove from DOM)
 * Part 8: Share Post (Simulate share action with alert)
 * Part 9: Create Existing Posts Dynamically (Use the postObjects array to generate posts on page load)
 * Part 10: GIF Search Logic (API Integration, Display GIFs, Select and Insert into Comment)
 */
document.addEventListener("DOMContentLoaded", function () {

    const currentUser = {
        username: "liorcohen299", // Fallback default
        profileImage: "media/profile-pictures/default_profile.png" // Fallback default
    };

    // save the logged in user values for use in the script
    async function fetchCurrentUser() {
        try {
            const response = await fetch('/api/current-user');
            if (response.ok) {
                const data = await response.json();
                if (data.username) {
                    currentUser.username = data.username;

                    // Update the username in the suggestions section
                    const suggestionUsernameElement = document.querySelector('.suggestions-side .user-row .fw-bold');
                    if (suggestionUsernameElement) {
                        suggestionUsernameElement.textContent = data.username;
                    }

                }
                if (data.user_profile_image) {
                    currentUser.profileImage = data.user_profile_image;
                    console.log("Current user profile image:", currentUser.profileImage);

                    // Update the profile image in the sidebar
                    const myProfileImgElement = document.querySelector('#profile-btn img');
                    if (myProfileImgElement) {
                        myProfileImgElement.src = data.user_profile_image;
                    }

                    // Update the profile image in the suggestions section
                    const suggestionProfileImgElement = document.querySelector('.suggestions-side .user-row img');
                    if (suggestionProfileImgElement) {
                        suggestionProfileImgElement.src = data.user_profile_image;
                    }

                }
            }
        } catch (error) {
            console.error("Could not fetch current session user:", error);
        }
    }

    fetchCurrentUser();
    
    const posts = document.querySelectorAll('.post-card');
    const postContainer = document.getElementById('postsContainer');

    // ==========================================
    // 1. LIKE BUTTON LOGIC
    // ==========================================
    const ORIGINAL_LIKE_SRC = "media/icons/like.png";
    const RED_LIKE_SRC = "media/icons/red_like.png";

    function initializePost(post) {
        const likeBtnImg = post.querySelector('.like-btn-img');
        const likeCountIconText = post.querySelector('.like-count-txt'); 
        const likeCountDisplayText = post.querySelector('.like-count-display'); 
        
        if (!likeBtnImg || !likeCountIconText) return;

        let isLiked = false;
        const rawText = likeCountIconText.textContent.replace(/,/g, '');
        const baseLikes = parseInt(rawText);

        likeBtnImg.addEventListener('click', function () {
            likeBtnImg.classList.remove('liked-animation');
            void likeBtnImg.offsetWidth; 
            likeBtnImg.classList.add('liked-animation');

            if (!isLiked) {
                let newCount = baseLikes + 1;
                likeCountIconText.textContent = newCount.toLocaleString('en-US');
                if(likeCountDisplayText) likeCountDisplayText.textContent = newCount.toLocaleString('en-US');
                likeBtnImg.src = RED_LIKE_SRC;
                isLiked = true; 
            } else {
                likeCountIconText.textContent = baseLikes.toLocaleString('en-US');
                if(likeCountDisplayText) likeCountDisplayText.textContent = baseLikes.toLocaleString('en-US');
                likeBtnImg.src = ORIGINAL_LIKE_SRC;
                isLiked = false; 
            }
        });

        // ==========================================
        // 3. COMMENTS LOGIC
        // ==========================================
        const commentBtnIcon = post.querySelector('.comment-btn-icon'); 
        const toggleCommentsBtn = post.querySelector('.toggle-comments-btn'); 
        const commentsList = post.querySelector('.comments-list');
        const addCommentSection = post.querySelector('.add-comment-section');

        
       
      
       // תופסים את כפתור ה-GIF שכבר קיים ב-HTML
        const gifBtn = post.querySelector('.gif-comment-btn');
        if (gifBtn) {
            gifBtn.addEventListener('click', function(event) {
                // תופסים את הפוסט האמיתי שעל המסך ישירות מתוך אירוע הלחיצה
                const livePostCard = event.target.closest('.post-card');
                
                if (!livePostCard) {
                    alert("שגיאה: לא הצלחתי לזהות את הפוסט מהמסך.");
                    return;
                }
                
                window.currentPostForGif = livePostCard; 
                document.getElementById('gifModal').style.display = 'flex';
                document.getElementById('gifSearchInput').focus();
            });
        }
        // --------------------------------------------------
        const userTypingPopup = post.querySelector('.user-typing-popup');
        const commentInput = post.querySelector('.comment-input');
        const postCommentBtn = post.querySelector('.post-comment-btn');
        const commentCountIconTxt = post.querySelector('.comment-count-txt');
        const commentCountDisplayTxt = post.querySelector('.comment-count-display');


        

        if (!toggleCommentsBtn || !commentsList || !commentInput || !postCommentBtn) return;

        let currentCommentCount = parseInt(commentCountIconTxt.textContent.replace(/,/g, ''));
        let isCommentsVisible = false;

        function toggleCommentSection() {
            isCommentsVisible = !isCommentsVisible;
            if (isCommentsVisible) {
                commentsList.style.display = 'block';
                addCommentSection.style.display = 'flex'; 
                toggleCommentsBtn.innerHTML = `הסתר תגובות`;
                commentInput.focus();
            } else {
                commentsList.style.display = 'none';
                addCommentSection.style.display = 'none'; 
                toggleCommentsBtn.innerHTML = `הצג את כל <span class="comment-count-display">${currentCommentCount.toLocaleString('en-US')}</span> התגובות`;
            }
        }

        toggleCommentsBtn.addEventListener('click', toggleCommentSection);
        
        if (commentBtnIcon) {
            commentBtnIcon.addEventListener('click', toggleCommentSection);
        }

        commentInput.addEventListener('input', function() {
            if (commentInput.value.trim().length > 0) {
                userTypingPopup.style.display = 'block';
                postCommentBtn.removeAttribute('disabled');
            } else {
                userTypingPopup.style.display = 'none';
                postCommentBtn.setAttribute('disabled', 'true');
            }
        });

        function addComment() {
            userTypingPopup.style.display = 'none';
            const commentText = commentInput.value.trim();
            if (commentText === '') return;

            const newComment = document.createElement('div');
            newComment.classList.add('single-comment');
            newComment.innerHTML = `<strong>${currentUser.username}</strong> ${commentText}`;

            commentsList.appendChild(newComment);

            currentCommentCount++;
            commentCountIconTxt.textContent = currentCommentCount.toLocaleString('en-US');
            
            if (!isCommentsVisible) {
                toggleCommentsBtn.innerHTML = `הצג את כל <span class="comment-count-display">${currentCommentCount.toLocaleString('en-US')}</span> התגובות`;
            }

            commentInput.value = '';
            postCommentBtn.setAttribute('disabled', 'true');

            commentsList.scrollTop = commentsList.scrollHeight;
        }

        postCommentBtn.addEventListener('click', addComment);
        
        commentInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                addComment();
            }
        });
    }

    posts.forEach(post => initializePost(post));

    // ==========================================
    // 2. SEARCH MODAL & FILTER LOGIC
    // ==========================================
    const searchBtn = document.getElementById('search-btn');
    const searchModal = document.getElementById('searchModal');
    const closeSearch = document.getElementById('closeSearch');
    const applySearchBtn = document.getElementById('applySearchBtn');
    const resetSearchBtn = document.getElementById('resetSearchBtn');

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            searchModal.style.display = 'flex';
        });
    }

    if (closeSearch) {
        closeSearch.addEventListener('click', function() {
            searchModal.style.display = 'none';
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target === searchModal) {
            searchModal.style.display = 'none';
        }
    });

    if (applySearchBtn) {
        applySearchBtn.addEventListener('click', function(event) {
            document.getElementById('newPostMessage').style.display = 'none'; // Hide the new post message when performing a search
            
            // .trim().toLowerCase() is used to ensure that the filter values are compared in a case-insensitive manner and without leading/trailing spaces.
            const mediaFilterValue = document.getElementById('mediaTypeFilter').value;
            const usernameFilterValue = document.getElementById('usernameFilter').value.trim().toLowerCase();
            const captionFilterValue = document.getElementById('captionFilter').value.trim().toLowerCase();
            
            const allPosts = document.querySelectorAll('.post-card'); 

            allPosts.forEach(post => {
                // Media type filtering
                const hasImage = post.querySelector('.post-main-img');
                const hasVideo = post.querySelector('.video-post');

                let postType = 'text'; // default fallback
                if (hasImage) postType = 'image';
                if (hasVideo) postType = 'video';

                const matchesMedia = (mediaFilterValue === 'all' || mediaFilterValue === postType);

                // Username filtering
                const usernameElement = post.querySelector('[username]');
                const postUsername = usernameElement ? usernameElement.textContent.trim().toLowerCase() : '';
                const matchesUsername = (usernameFilterValue === '' || postUsername.includes(usernameFilterValue));

                // Caption filtering
                const captionElement = post.querySelector('.post-description');
                const postCaption = captionElement ? captionElement.textContent.trim().toLowerCase() : '';
                const matchesCaption = (captionFilterValue === '' || postCaption.includes(captionFilterValue));

                // Show or Hide the post based on the dropdown choice
                if (matchesMedia && matchesUsername && matchesCaption) {
                    post.style.display = '';
                } else {
                    post.style.display = 'none';
                }
            });

            searchModal.style.display = 'none';
        });
    }

    if (resetSearchBtn) {
        resetSearchBtn.addEventListener('click', function() {
            document.getElementById('newPostMessage').style.display = 'none'; // Hide the new post message when resetting the search
            
            // Reset input fields back to default
            document.getElementById('mediaTypeFilter').value = 'all';
            document.getElementById('usernameFilter').value = '';
            document.getElementById('captionFilter').value = '';
            
            const allPosts = document.querySelectorAll('.post-card');
            allPosts.forEach(post => {
                post.style.display = '';
            });
            searchModal.style.display = 'none';
        });
    }

    // ==========================================
    // 4. DARK MODE TOGGLE LOGIC (TEST ALERT)
    // ==========================================
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
        });
    }

    // ==========================================
    // 5. BACK TO TOP BUTTON LOGIC
    // ==========================================
    const backToTopBtn = document.getElementById('backToTopBtn');
    backToTopBtn.style.display = "none";

    window.onscroll = function() {
        // Show the button when the user scrolls down 100px from the top, hide it otherwise
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            backToTopBtn.style.display = "block"; // Show the button
        } else {
            backToTopBtn.style.display = "none";  // Hide the button
        }
    };


    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            document.getElementById('newPostMessage').style.display = 'none';
        });
    }

    // ==========================================
    // 6. CREATE POST BUTTON LOGIC
    // ==========================================
    const createPostBtn = document.getElementById('create-post-btn');
    const newPostModal = document.getElementById('newPostModal');
    const closeCreate = document.getElementById('closeCreate');
    const mediaUpload = document.getElementById('mediaUpload');
    const postText = document.getElementById('postText');
    const caption = document.getElementById('caption');
    const uploadPostBtn = document.getElementById('uploadPostBtn');
    const templatePost = document.getElementById('templatePost');
    const uploadError = document.getElementById("uploadError");

    if (createPostBtn) {
        createPostBtn.addEventListener('click', function() {
            newPostModal.style.display = 'flex';
        });
    }

    if (closeCreate) {
        closeCreate.addEventListener('click', function() {
            uploadError.style.display = "none";
            newPostModal.style.display = 'none';
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target == newPostModal) {
            uploadError.style.display = "none";
            newPostModal.style.display = 'none';
        }
    });

    if (uploadPostBtn) {
        uploadPostBtn.addEventListener('click', function() {
            if ((mediaUpload.files.length === 0) && (postText.value.trim() === '')) {
                uploadError.textContent = "אנא הוסף תמונה או טקסט לפני העלאת הפוסט.";
                uploadError.style.display = "block";
                return;
            }
            else {
                uploadError.style.display = "none";
            }

            let postType = 'text'; // default fallback

            if (mediaUpload.files.length === 0) {
                postType = 'text';
            }
            else {
                const file = mediaUpload.files[0];

                if (file.type.startsWith('image/')) {
                    postType = 'image';
                }
                else if (file.type.startsWith('video/')) {
                    postType = 'video';
                }
            }

            const formData = new FormData();
            formData.append('username', currentUser.username);
            formData.append('user_profile_image', currentUser.profileImage);
            formData.append('post_type', postType);
            formData.append('caption', caption.value.trim());

            if (mediaUpload.files.length > 0) {
                // 'mediaFile' must match upload.single('mediaFile') in the backend route
                formData.append('mediaFile', mediaUpload.files[0]); 
            } else {
                formData.append('post_content', postText.value);
            }

            fetch('/api/posts', {method: 'POST',
                body: formData // Send the FormData object directly
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        BuildPost(result.addedPost, true);
                        document.getElementById('newPostMessage').style.display = 'block';
                        newPostModal.style.display = 'none';
                    }
                })
        });
    }

    // ==========================================
    // 7. DELETE POST LOGIC
    // ==========================================
    postContainer.addEventListener('click', function(event) {
        // Check if the clicked element (or its closest parent) is the delete icon
        const deleteBtn = event.target.closest('.delete-btn-icon');
    
        if (deleteBtn) {
            const postCard = deleteBtn.closest('.post-card');
            if (postCard) {
                // Get the MongoDB _id from the data attribute of the post card
                const postId = postCard.getAttribute('data-post-id');
                fetch('/api/posts/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postId: postId })
                })
                .then(res => res.json())
                .then(result => {
                    if (result.success) {
                        // remove the post visually if the server successfully deleted it
                        postCard.remove();
                    }
                })
                .catch(err => console.error("Error deleting post:", err));
            }
        }
    });

    // ==========================================
    // 8. SHARE POST LOGIC
    // ==========================================
    postContainer.addEventListener('click', function(event) {
        // Check if the clicked element (or its closest parent) is the delete icon
        const sendBtnIcon = event.target.closest('.send-btn-icon');
        const sendModal = document.getElementById('sendPostModal');
        const closeSend = document.getElementById('closeSend');

        if (sendBtnIcon) {
            sendModal.style.display = 'flex';
        }
    });

    const closeSend = document.getElementById('closeSend');
    const sendModal = document.getElementById('sendPostModal');

    if (closeSend && sendModal) {
        closeSend.addEventListener('click', function() {
            sendModal.style.display = 'none';
        });
    }

    window.addEventListener('click', function(event) {
        const sendModal = document.getElementById('sendPostModal');
        if (sendModal && event.target === sendModal) {
            sendModal.style.display = 'none';
        }
    });

    // ===========================================
    // 9. CREATE EXISTING POSTS DINAMICALLY LOGIC
    // ===========================================
    fetch('/api/posts')
    .then(response => response.json())
    .then(postsArray => {postsArray.forEach((postData) => BuildPost(postData, false));}) // Call BuildPost for each post object in the array
    .catch(err => console.error("Failed to load posts:", err));

    function BuildPost(postData, isNew = false) {
        const templatePost = document.getElementById('templatePost');
        const clone = templatePost.content.cloneNode(true);
        clone.querySelector('.post-card').setAttribute('data-post-id', postData._id); // Store the MongoDB _id for reference

        if (!isNew) {
            clone.querySelector('#newPostTag').style.display = 'none'; // Hide the new post tag for dynamically loaded existing posts
        }

        const userImage = clone.querySelector('[user-profile-image]');
        userImage.src = postData.user_profile_image;

        const usernameElement = clone.querySelector('[username]');
        usernameElement.textContent = postData.username;

        const uploadTimeElement = clone.querySelector('[upload-time]');
        uploadTimeElement.textContent = postData.upload_time;

        const typingPopupElement = clone.querySelector('.user-typing-popup');
        if (typingPopupElement) {
            typingPopupElement.innerHTML = `<strong>${currentUser.username}</strong> is typing...`;
        }

        const mediaContainer = clone.querySelector('[post-content]');
        let mediaElement;
        if (postData.post_type === 'text') {
            mediaElement = document.createElement('div');
            mediaElement.textContent = postData.post_content;
            mediaElement.className = "text-post";
        }
        else if (postData.post_type === 'image') {
            mediaElement = document.createElement('img');
            mediaElement.src = postData.post_content;
            mediaElement.classList = "post-main-img";
        }
        else {
            mediaElement = document.createElement('video');
            mediaElement.src = postData.post_content;
            mediaElement.controls = true; // מוסיף כפתורי Play, Pause ועוצמת שמע
            mediaElement.className = "video-post";
        }

        mediaContainer.appendChild(mediaElement);

        const captionElement = clone.querySelector('[caption]');
        if (captionElement) {
            const strongEl = captionElement.querySelector('strong');
            if (strongEl) {
                strongEl.textContent = postData.username;
                strongEl.style.display = 'inline';
            }

            captionElement.style.display = 'block';
            if (postData.caption) {
                captionElement.append(' ' + postData.caption);
            }
        }

        const likeCount = clone.querySelector('[like-count]');
        likeCount.textContent = postData.like_count;

        const likeCountDisplay = clone.querySelector('[like-count-display]');
        likeCountDisplay.textContent = postData.like_count;

        const commentCount = clone.querySelector('[comment-count]');
        commentCount.textContent = postData.comment_count;

        const commentCountDisplay = clone.querySelector('[comment-count-display]');
        commentCountDisplay.textContent = postData.comment_count;

        const repostCount = clone.querySelector('[repost-count]');
        repostCount.textContent = postData.repost_count;

        initializePost(clone); // Initialize the new post's functionality so it can be liked, commented on, etc.
        if (isNew) {
            postContainer.prepend(clone); // Add new posts to the top of the feed
        } else {
            postContainer.append(clone); // Add existing posts to the bottom of the feed
        }

        // Clear the form fields after adding the post
        postText.value = '';
        caption.value = '';
        mediaUpload.value = '';
    };

    // ==========================================
    // 10. GIF SEARCH LOGIC (API INTEGRATION)
    // ==========================================
    const gifModal = document.getElementById('gifModal');
    const closeGifModal = document.getElementById('closeGifModal');
    const gifSearchInput = document.getElementById('gifSearchInput');
    const searchGifBtn = document.getElementById('searchGifBtn');
    const gifResultsContainer = document.getElementById('gifResultsContainer');
    
    if (closeGifModal) closeGifModal.addEventListener('click', () => gifModal.style.display = 'none');
    window.addEventListener('click', (e) => { if(e.target === gifModal) gifModal.style.display = 'none'; });

    async function fetchGifs() {
        const query = gifSearchInput.value.trim() || 'trending';
        gifResultsContainer.innerHTML = '<p>מחפש...</p>';
        
        try {
            const response = await fetch(`/api/gifs?q=${query}`);
            const data = await response.json();
            
            if (data.success) {
                gifResultsContainer.innerHTML = ''; 
                data.gifs.forEach(gifUrl => {
                    const img = document.createElement('img');
                    img.src = gifUrl;
                    img.addEventListener('click', () => addGifAsComment(gifUrl));
                    gifResultsContainer.appendChild(img);
                });
            } else {
                gifResultsContainer.innerHTML = '<p>לא נמצאו תוצאות.</p>';
            }
        } catch (error) {
            gifResultsContainer.innerHTML = '<p>שגיאה בתקשורת מול השרת.</p>';
        }
    }

  if(searchGifBtn) {
        searchGifBtn.addEventListener('click', (e) => {
            e.preventDefault(); // מונע ריענון של העמוד בלחיצה
            fetchGifs();
        });
    }
    
    if(gifSearchInput) {
        gifSearchInput.addEventListener('keydown', (e) => {
            if(e.key === 'Enter') {
                e.preventDefault(); 
                fetchGifs();
            }
        });
    }

   function addGifAsComment(gifUrl) {
        if (!window.currentPostForGif) {
            alert("שגיאה: לא זוהה הפוסט אליו יש להוסיף את הגיפ.");
            return;
        }
        
        const currentPost = window.currentPostForGif;
        
        // עכשיו בטוח נמצא את אזור התגובות בתוך הפוסט האמיתי
        const commentsList = currentPost.querySelector('.comments-list');
        const commentCountIconTxt = currentPost.querySelector('.comment-count-txt');
        const toggleCommentsBtn = currentPost.querySelector('.toggle-comments-btn');
        
        if (!commentsList) {
            console.error("הפוסט שזוהה:", currentPost);
            alert("שגיאה: לא נמצא אזור התגובות בפוסט הזה.");
            return;
        }

        // יצירת התגובה עם התמונה
        const newComment = document.createElement('div');
        newComment.classList.add('single-comment');
        newComment.innerHTML = `<strong>${currentUser.username}</strong> <br> <img src="${gifUrl}" class="comment-gif" style="max-width: 150px; border-radius: 8px; margin-top: 5px;">`;
        
        // הוספה למסך
        commentsList.appendChild(newComment);
        commentsList.style.display = 'block'; 
        
        // עדכון המספרים בטקסט במידה וקיימים
        if (commentCountIconTxt && toggleCommentsBtn) {
            let currentCommentCount = parseInt(commentCountIconTxt.textContent.replace(/,/g, '')) || 0;
            currentCommentCount++;
            commentCountIconTxt.textContent = currentCommentCount.toLocaleString('en-US');
            toggleCommentsBtn.innerHTML = `הסתר תגובות`;
        }
        
        // גלילה למטה וניקוי החלון
        commentsList.scrollTop = commentsList.scrollHeight;
        document.getElementById('gifModal').style.display = 'none';
        document.getElementById('gifSearchInput').value = '';
        document.getElementById('gifResultsContainer').innerHTML = '';
        window.currentPostForGif = null;
    }

    // ==========================================
    // 13. FACEBOOK POST LOGIC
    // ==========================================
    const bestDayBtn = document.getElementById('bestDayBtn');
    
    if (bestDayBtn) {
        bestDayBtn.addEventListener('click', async function() {
            const originalText = bestDayBtn.textContent;
            bestDayBtn.textContent = 'מפרסם...';
            bestDayBtn.disabled = true; 

            try {
                // פונים לראוט שהכנו בשרת 
                const response = await fetch('/api/facebook/post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const result = await response.json();

                if (result.success) {
                    alert('הסטטוס פורסם בהצלחה לדף הפייסבוק שלך!');
                } else {
                    console.error("Facebook Error:", result.error);
                    alert('הייתה בעיה בפרסום. בדוק בקונסול (F12) לפרטים.');
                }
            } catch (error) {
                console.error("Server Error:", error);
                alert('שגיאה בתקשורת מול השרת שלך.');
            } finally {
                bestDayBtn.textContent = originalText;
                bestDayBtn.disabled = false;
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    // לוגיקת פופ-אפ הגדרות
    const settingsBtn = document.getElementById("settings-btn");
    const settingsModal = document.getElementById("settingsModal");
    const closeSettings = document.getElementById("closeSettings");
    const deleteAccountBtn = document.getElementById("deleteAccountBtn");

    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener("click", () => {
            settingsModal.style.display = "flex";
        });

        closeSettings.addEventListener("click", () => {
            settingsModal.style.display = "none";
        });

        // סגירה בלחיצה מחוץ לחלון
        window.addEventListener("click", (e) => {
            if (e.target === settingsModal) {
                settingsModal.style.display = "none";
            }
        });
    }

    // --- לוגיקת עדכון שם משתמש ---
    const updateUsernameBtn = document.getElementById("updateUsernameBtn");
    const newUsernameInput = document.getElementById("newUsernameInput");

    if (updateUsernameBtn && newUsernameInput) {
        updateUsernameBtn.addEventListener("click", () => {
            const newUsername = newUsernameInput.value.trim();
            
            if (newUsername === "") {
                alert("אנא הזן שם משתמש חדש.");
                return;
            }

            fetch('/update-username', {
                method: 'PUT', // שיטת PUT מיועדת לעדכון נתונים קיימים
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newUsername: newUsername })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("שם המשתמש עודכן בהצלחה ל: " + newUsername);
                    newUsernameInput.value = ""; // מאפסים את השדה
                    
                    // אופציונלי: סגירת הפופ-אפ אוטומטית אחרי העדכון
                    document.getElementById("settingsModal").style.display = "none";
                } else {
                    alert("שגיאה: " + data.message);
                }
            })
            .catch(err => console.error("Error updating username:", err));
        });
    }

    // בקשת מחיקה לשרת
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener("click", () => {
            const isConfirmed = confirm("האם אתה בטוח שברצונך למחוק את החשבון? פעולה זו תמחק את המשתמש שלך לתמיד.");
            
            if (isConfirmed) {
                fetch('/delete-account', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("החשבון נמחק בהצלחה. נתגעגע!");
                        window.location.href = "/"; // החזרה לעמוד ההתחברות
                    } else {
                        alert("שגיאה במחיקת החשבון: " + data.message);
                    }
                })
                .catch(err => console.error("Error deleting account:", err));
            }
        });
    }



    // --- לוגיקת חיפוש משולב (משתמשים וקבוצות) ---
    const openUserSearchBtn = document.getElementById("openUserSearchBtn"); 
    const userSearchModal = document.getElementById("userSearchModal");
    const closeUserSearch = document.getElementById("closeUserSearch");
    const liveUserSearchInput = document.getElementById("liveUserSearchInput");
    const userSearchResults = document.getElementById("userSearchResults");
    
    const groupMembersModal = document.getElementById("groupMembersModal");
    const closeGroupMembers = document.getElementById("closeGroupMembers");

    if (openUserSearchBtn && userSearchModal) {
        openUserSearchBtn.addEventListener("click", () => userSearchModal.style.display = "flex");
        closeUserSearch.addEventListener("click", () => userSearchModal.style.display = "none");
        
        if(closeGroupMembers) {
            closeGroupMembers.addEventListener("click", () => groupMembersModal.style.display = "none");
        }

        window.addEventListener("click", (e) => {
            if (e.target === userSearchModal) userSearchModal.style.display = "none";
            if (e.target === groupMembersModal) groupMembersModal.style.display = "none";
        });

        liveUserSearchInput.addEventListener("input", (e) => {
            const query = e.target.value.trim();

            if (query.length === 0) {
                userSearchResults.innerHTML = "";
                return;
            }

            fetch(`/search-all?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                userSearchResults.innerHTML = ""; 
                
                if (data.success) {
                    // הצגת משתמשים
                    if (data.users.length > 0) {
                        userSearchResults.innerHTML += `<div class="fw-bold mb-2 mt-2" style="color: #737373;">משתמשים</div>`;
                        data.users.forEach(user => {
                            userSearchResults.innerHTML += `
                                <div class="user-row mb-2" style="border-bottom: 1px solid #efefef; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                                    <div class="d-flex align-items-center">
                                        <img src="${user.user_profile_image}" class="suggested-profile-img" alt="${user.username}" style="margin-left: 10px;">
                                        <div class="fw-bold small">${user.username}</div>
                                    </div>
                                    <button class="colorful-btn" style="padding: 6px 12px; font-size: 12px; border-radius: 6px; cursor: pointer;" onclick="addToGroupPreview('${user.username}')">הוסף לקבוצה</button>
                                </div>
                            `;
                        });
                    }

                    // הצגת קבוצות
                    if (data.groups.length > 0) {
                        userSearchResults.innerHTML += `<div class="fw-bold mb-2 mt-3" style="color: #737373;">קבוצות</div>`;
                        data.groups.forEach(group => {
                            userSearchResults.innerHTML += `
                                <div class="user-row mb-2" style="border-bottom: 1px solid #efefef; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="showGroupMembers('${group.group_name}')">
                                    <div class="d-flex align-items-center">
                                        <div style="width: 32px; height: 32px; border-radius: 50%; background: #e0e0e0; display: flex; justify-content: center; align-items: center; margin-left: 10px; font-size: 16px;">👥</div>
                                        <div>
                                            <div class="fw-bold small">${group.group_name}</div>
                                            <div class="text-muted" style="font-size: 11px;">${group.members.length} חברים</div>
                                        </div>
                                    </div>
                                    <span style="font-size: 12px; color: #0095f6;">הצג חברים</span>
                                </div>
                            `;
                        });
                    }

                    if (data.users.length === 0 && data.groups.length === 0) {
                        userSearchResults.innerHTML = "<p class='text-muted mt-3 text-center'>לא נמצאו תוצאות.</p>";
                    }
                }
            })
            .catch(err => console.error("Error searching:", err));
        });
    }

    // פונקציה חדשה שמושכת את רשימת חברי הקבוצה מהשרת ומציגה אותם
    window.showGroupMembers = function(groupName) {
        fetch(`/group-members/${encodeURIComponent(groupName)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById("groupMembersTitle").textContent = `חברים ב-${groupName}`;
                const list = document.getElementById("groupMembersList");
                list.innerHTML = "";
                
                data.members.forEach(member => {
                    const isAdmin = member.username === data.admin ? `<span style="color: #f09433; font-size: 12px; margin-right: 5px;">(מנהל) 👑</span>` : "";
                    list.innerHTML += `
                        <div class="d-flex align-items-center mb-3">
                            <img src="${member.user_profile_image}" style="width: 35px; height: 35px; border-radius: 50%; margin-left: 10px; object-fit: cover;">
                            <div class="fw-bold small">${member.username} ${isAdmin}</div>
                        </div>
                    `;
                });
                
                document.getElementById("groupMembersModal").style.display = "flex";
            } else {
                alert("שגיאה בטעינת חברי הקבוצה.");
            }
        })
        .catch(err => console.error("Error fetching group members:", err));
    };

    // פונקציה זמנית להדגמת הוספה לקבוצה
    // משתנה שישמור את שם המשתמש שאנחנו רוצים להוסיף באותו רגע
    let currentTargetUser = ""; 

    // הפונקציה שנקראת כשלוחצים על הכפתור בתוצאות החיפוש
    window.addToGroupPreview = function(username) {
        currentTargetUser = username;
        document.getElementById("targetUsernameDisplay").textContent = username;
        document.getElementById("addToGroupModal").style.display = "flex";
    };

    // --- לוגיקת אישור ושליחת ההוספה לקבוצה ---
    const addToGroupModal = document.getElementById("addToGroupModal");
    const closeAddToGroup = document.getElementById("closeAddToGroup");
    const submitAddToGroupBtn = document.getElementById("submitAddToGroupBtn");
    const groupNameToAddInput = document.getElementById("groupNameToAddInput");
    const addToGroupError = document.getElementById("addToGroupError");

    if (closeAddToGroup && addToGroupModal) {
        closeAddToGroup.addEventListener("click", () => addToGroupModal.style.display = "none");
        window.addEventListener("click", (e) => {
            if (e.target === addToGroupModal) addToGroupModal.style.display = "none";
        });
    }

    if (submitAddToGroupBtn) {
        submitAddToGroupBtn.addEventListener("click", () => {
            const groupName = groupNameToAddInput.value.trim();

            if (!groupName) {
                addToGroupError.textContent = "אנא הקלד את שם הקבוצה.";
                addToGroupError.style.display = "block";
                return;
            }

            fetch('/add-user-to-group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUsername: currentTargetUser, groupName: groupName })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("המשתמש " + currentTargetUser + " צורף בהצלחה לקבוצה!");
                    addToGroupModal.style.display = "none";
                    groupNameToAddInput.value = "";
                    addToGroupError.style.display = "none";
                } else {
                    addToGroupError.textContent = data.message;
                    addToGroupError.style.display = "block";
                }
            })
            .catch(err => console.error("Error adding user to group:", err));
        });
    }





    // --- לוגיקת יצירת קבוצה חדשה ---
    const openCreateGroupBtn = document.getElementById("openCreateGroupBtn");
    const createGroupModal = document.getElementById("createGroupModal");
    const closeCreateGroup = document.getElementById("closeCreateGroup");
    const submitCreateGroupBtn = document.getElementById("submitCreateGroupBtn");
    const newGroupNameInput = document.getElementById("newGroupNameInput");
    const createGroupError = document.getElementById("createGroupError");

    if (openCreateGroupBtn && createGroupModal) {
        // פתיחה וסגירה של החלון
        openCreateGroupBtn.addEventListener("click", () => createGroupModal.style.display = "flex");
        closeCreateGroup.addEventListener("click", () => createGroupModal.style.display = "none");
        window.addEventListener("click", (e) => {
            if (e.target === createGroupModal) createGroupModal.style.display = "none";
        });

        // שליחת הבקשה ליצירת קבוצה
        submitCreateGroupBtn.addEventListener("click", () => {
            const groupName = newGroupNameInput.value.trim();
            
            if (!groupName) {
                createGroupError.textContent = "אנא הזן שם לקבוצה.";
                createGroupError.style.display = "block";
                return;
            }

            fetch('/create-group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupName: groupName })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("הקבוצה " + groupName + " נוצרה בהצלחה!");
                    createGroupModal.style.display = "none";
                    newGroupNameInput.value = "";
                    createGroupError.style.display = "none";
                } else {
                    createGroupError.textContent = data.message;
                    createGroupError.style.display = "block";
                }
            })
            .catch(err => console.error("Error creating group:", err));
        });
    }


    // --- לוגיקת מחיקת קבוצה ---
    const openDeleteGroupBtn = document.getElementById("openDeleteGroupBtn");
    const deleteGroupModal = document.getElementById("deleteGroupModal");
    const closeDeleteGroup = document.getElementById("closeDeleteGroup");
    const submitDeleteGroupBtn = document.getElementById("submitDeleteGroupBtn");
    const deleteGroupNameInput = document.getElementById("deleteGroupNameInput");
    const deleteGroupError = document.getElementById("deleteGroupError");

    if (openDeleteGroupBtn && deleteGroupModal) {
        openDeleteGroupBtn.addEventListener("click", () => deleteGroupModal.style.display = "flex");
        closeDeleteGroup.addEventListener("click", () => deleteGroupModal.style.display = "none");
        window.addEventListener("click", (e) => {
            if (e.target === deleteGroupModal) deleteGroupModal.style.display = "none";
        });

        submitDeleteGroupBtn.addEventListener("click", () => {
            const groupName = deleteGroupNameInput.value.trim();

            if (!groupName) {
                deleteGroupError.textContent = "אנא הזן את שם הקבוצה.";
                deleteGroupError.style.display = "block";
                return;
            }

            if(confirm("האם אתה בטוח שברצונך למחוק את הקבוצה '" + groupName + "'? פעולה זו היא סופית.")) {
                fetch('/delete-group', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ groupName: groupName })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("הקבוצה נמחקה בהצלחה.");
                        deleteGroupModal.style.display = "none";
                        deleteGroupNameInput.value = "";
                        deleteGroupError.style.display = "none";
                    } else {
                        deleteGroupError.textContent = data.message;
                        deleteGroupError.style.display = "block";
                    }
                })
                .catch(err => console.error("Error deleting group:", err));
            }
        });
    }


    // --- לוגיקת עדכון שם קבוצה ---
    const openUpdateGroupBtn = document.getElementById("openUpdateGroupBtn");
    const updateGroupModal = document.getElementById("updateGroupModal");
    const closeUpdateGroup = document.getElementById("closeUpdateGroup");
    const submitUpdateGroupBtn = document.getElementById("submitUpdateGroupBtn");
    const currentGroupNameInput = document.getElementById("currentGroupNameInput");
    const newGroupNameUpdateInput = document.getElementById("newGroupNameUpdateInput");
    const updateGroupError = document.getElementById("updateGroupError");

    if (openUpdateGroupBtn && updateGroupModal) {
        openUpdateGroupBtn.addEventListener("click", () => updateGroupModal.style.display = "flex");
        closeUpdateGroup.addEventListener("click", () => updateGroupModal.style.display = "none");
        window.addEventListener("click", (e) => {
            if (e.target === updateGroupModal) updateGroupModal.style.display = "none";
        });

        submitUpdateGroupBtn.addEventListener("click", () => {
            const currentName = currentGroupNameInput.value.trim();
            const newName = newGroupNameUpdateInput.value.trim();

            if (!currentName || !newName) {
                updateGroupError.textContent = "אנא מלא את כל השדות.";
                updateGroupError.style.display = "block";
                return;
            }

            fetch('/update-group-name', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentName, newName })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("שם הקבוצה עודכן בהצלחה ל: " + newName);
                    updateGroupModal.style.display = "none";
                    currentGroupNameInput.value = "";
                    newGroupNameUpdateInput.value = "";
                    updateGroupError.style.display = "none";
                } else {
                    updateGroupError.textContent = data.message;
                    updateGroupError.style.display = "block";
                }
            })
            .catch(err => console.error("Error updating group:", err));
        });
    }
    
});

