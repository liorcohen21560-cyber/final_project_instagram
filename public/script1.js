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
            newComment.innerHTML = `<strong>liorcohen299</strong> ${commentText}`;

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
        const strongEl = captionElement.querySelector('strong');
        strongEl.style.display = 'inline';

        captionElement.style.display = 'block';
        if (postData.caption) {
            captionElement.append(' ' + postData.caption);
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
        newComment.innerHTML = `<strong>liorcohen299</strong> <br> <img src="${gifUrl}" class="comment-gif" style="max-width: 150px; border-radius: 8px; margin-top: 5px;">`;
        
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
});