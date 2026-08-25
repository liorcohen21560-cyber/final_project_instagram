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
 * Part 11: Facebook Post Logic (Send post data to backend for Facebook posting)
 */

const currentUser = {
    username: "liorcohen299", // Fallback default
    profileImage: "media/profile-pictures/default_profile.jpg", // Fallback default
    groupAdmin: [],
    groupMemberships: [],
    friends: []
};

const groupImageMap = {};
let selectedProfileImage = currentUser.profileImage;

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
                selectedProfileImage = data.user_profile_image;

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

            if (data.group_admin) {
                currentUser.groupAdmin = data.group_admin;

                currentUser.groupAdmin.forEach(group => {
                    const groupName = group.group_name;
                    const groupImg = group.group_profile_image || 'media/profile-pictures/default_profile.jpg';
                    
                    groupImageMap[groupName] = groupImg;
                });
            }

            if (data.group_memberships) {
                currentUser.groupMemberships = data.group_memberships;
            }

            if (data.friends) {
                currentUser.friends = data.friends;
            }
        }
    } catch (error) {
        console.error("Could not fetch current session user:", error);
    }
}

fetchCurrentUser();

document.addEventListener("DOMContentLoaded", function () {
    const posts = document.querySelectorAll('.post-card');
    const postContainer = document.getElementById('postsContainer');

    // ==========================================
    // 1. LIKE BUTTON LOGIC
    // ==========================================
    const ORIGINAL_LIKE_SRC = "media/icons/like.png";
    const RED_LIKE_SRC = "media/icons/red_like.png";

    function initializePost(post, postData) {
        const likeBtnImg = post.querySelector('.like-btn-img');
        const likeCountIconText = post.querySelector('.like-count-txt'); 
        const likeCountDisplayText = post.querySelector('.like-count-display'); 
        
        if (!likeBtnImg || !likeCountIconText) return;

        // Check if the current user has already liked this post from the database data
        let isLiked = currentUser && postData.liked_by_usernames && postData.liked_by_usernames.includes(currentUser.username);
        likeBtnImg.src = isLiked ? RED_LIKE_SRC : ORIGINAL_LIKE_SRC;

        let currentLikes = postData.like_count || 0;

        likeBtnImg.addEventListener('click', async function () {
            // Prevent multiple rapid clicks if needed
            if (likeBtnImg.dataset.loading === "true") return;
            likeBtnImg.dataset.loading = "true";

            likeBtnImg.classList.remove('liked-animation');
            void likeBtnImg.offsetWidth; 
            likeBtnImg.classList.add('liked-animation');

            try {
                // Send request to backend toggle like route
                const response = await fetch(`/api/posts/${postData._id}/like`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const result = await response.json();
            
                if (response.ok && result.success) {
                    isLiked = result.liked;
                    currentLikes = result.like_count;

                    // Update UI text and image based on backend response
                    likeCountIconText.textContent = currentLikes.toLocaleString('en-US');
                    if (likeCountDisplayText) {
                        likeCountDisplayText.textContent = currentLikes.toLocaleString('en-US');
                    }

                    likeBtnImg.src = isLiked ? RED_LIKE_SRC : ORIGINAL_LIKE_SRC;

                    // Update liker preview dynamically on click
                    const likerPreview = post.querySelector('.post-liker-preview');
                    if (result.liked_by_usernames && result.liked_by_usernames.length > 0) {
                        const firstLiker = result.liked_by_usernames[0];
                        likerPreview.textContent = `• אהוב על ידי ${firstLiker}`;
                        likerPreview.style.display = 'inline';
                    } else {
                        likerPreview.textContent = '';
                        likerPreview.style.display = 'none';
                    }

                } else {
                    alert(result.message || "שגיאה בביצוע לייק.");
                }
            } catch (error) {
                console.error("Error toggling like:", error);
            } finally {
                likeBtnImg.dataset.loading = "false";
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

        let currentCommentCount = postData.comment_count || 0;
        let isCommentsVisible = false;

        // --- Render existing comments from DB on load ---
        if (postData.comments && Array.isArray(postData.comments)) {
            commentsList.innerHTML = ''; // Clear previous if any
            postData.comments.forEach(c => {
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('single-comment');
                if (c.comment_type === 'gif') {
                    commentDiv.innerHTML = `<strong>${c.username}</strong> <img src="${c.comment_content}" style="max-height: 100px; display: block; margin-top: 4px;">`;
                } else {
                    commentDiv.innerHTML = `<strong>${c.username}</strong> ${c.comment_content}`;
                }
                commentsList.appendChild(commentDiv);
            });
        }

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

        async function addComment(content = null, type = 'text') {
            userTypingPopup.style.display = 'none';

            // Ensure content is actually a clean string, not a browser Event object
            let commentText = "";
            if (typeof content === 'string') {
                commentText = content.trim();
            } else {
                commentText = commentInput.value.trim();
            }

            if (commentText === '') return;

            try {
                const response = await fetch(`/api/posts/${postData._id}/comment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ comment_content: commentText, comment_type: type })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    const newCommentObj = result.comment;
                    currentCommentCount = result.comment_count;

                    const newCommentDiv = document.createElement('div');
                    newCommentDiv.classList.add('single-comment');
                    
                    if (newCommentObj.comment_type === 'gif') {
                        newCommentDiv.innerHTML = `<strong>${newCommentObj.username}</strong> <img src="${newCommentObj.comment_content}" style="max-height: 100px; display: block; margin-top: 4px;">`;
                    } else {
                        newCommentDiv.innerHTML = `<strong>${newCommentObj.username}</strong> ${newCommentObj.comment_content}`;
                    }

                    commentsList.appendChild(newCommentDiv);

                    commentCountIconTxt.textContent = currentCommentCount.toLocaleString('en-US');
                    if (commentCountDisplayTxt) {
                        commentCountDisplayTxt.textContent = currentCommentCount.toLocaleString('en-US');
                    }
                    
                    if (!isCommentsVisible) {
                        toggleCommentsBtn.innerHTML = `הצג את כל <span class="comment-count-display">${currentCommentCount.toLocaleString('en-US')}</span> התגובות`;
                    }

                    commentInput.value = '';
                    postCommentBtn.setAttribute('disabled', 'true');
                    commentsList.scrollTop = commentsList.scrollHeight;
                } else {
                    alert(result.message || "שגיאה בשמירת התגובה.");
                }
            } catch (error) {
                console.error("Error adding comment:", error);
            }
        }

        postCommentBtn.addEventListener('click', addComment);
        
        commentInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                addComment();
            }
        });
    }

    posts.forEach(post => initializePost(post, postData));

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
    const creatorSelect = document.getElementById('creator');

    if (createPostBtn) {
        createPostBtn.addEventListener('click', function() {
            // Check if user is admin of at least one group
            if (currentUser.groupAdmin && currentUser.groupAdmin.length > 0) {
                creatorSelect.style.display = 'block';
                creatorSelect.innerHTML = ''; // Clear previous options

                // Default Option: The user themselves
                const selfOption = document.createElement('option');
                selfOption.value = currentUser.username;
                selfOption.textContent = currentUser.username;
                creatorSelect.appendChild(selfOption);

                // Group Options: Add each group name details from groupAdmin
                currentUser.groupAdmin.forEach(group => {
                    const groupOption = document.createElement('option');
                    groupOption.value = group.group_name;
                    groupOption.textContent = group.group_name;
                    creatorSelect.appendChild(groupOption);
                });
            } else {
                // Hide select dropdown if user manages no groups
                creatorSelect.style.display = 'none';
            }
            newPostModal.style.display = 'flex';
        });
    }

    // Listen for changes if the user switches the creator dropdown
    if (creatorSelect) {
        creatorSelect.addEventListener('change', function() {
            const chosenValue = creatorSelect.value;

            if (chosenValue === currentUser.username) {
                selectedProfileImage = currentUser.profileImage;
            } else if (groupImageMap[chosenValue]) {
                selectedProfileImage = groupImageMap[chosenValue];
            }
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

            // Determine selected creator: dropdown value if visible, otherwise currentUser.username
            const selectedCreator = (creatorSelect.style.display !== 'none' && creatorSelect.value) 
                ? creatorSelect.value 
                : currentUser.username;

            const formData = new FormData();
            formData.append('username', selectedCreator);
            formData.append('user_profile_image', selectedProfileImage);
            formData.append('post_type', postType);
            formData.append('caption', caption.value.trim());

            if (mediaUpload.files.length > 0) {
                // 'mediaFile' must match upload.single('mediaFile') in the backend route
                formData.append('mediaFile', mediaUpload.files[0]); 
            } else {
                formData.append('post_content', postText.value);
            }

            // Disable the button and show loading text
            uploadPostBtn.disabled = true;
            const originalButtonText = uploadPostBtn.textContent;
            uploadPostBtn.textContent = "מעלה...";

            fetch('/api/posts', {method: 'POST',
                body: formData // Send the FormData object directly
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        const postedAsUser = (result.addedPost.username === currentUser.username);

                        // TOGGLE CHECK:
                        // If we are in "my posts" view AND we posted as ourselves -> Show it!
                        // If we are in "feed" view AND we posted as a group (or anything else) -> Show it!
                        // Otherwise, don't inject it into the current view container.
                        if ((showingOnlyMyPosts && postedAsUser) || (!showingOnlyMyPosts && !postedAsUser)) {
                            BuildPost(result.addedPost, true);
                            document.getElementById('newPostMessage').style.display = 'block';
                        }
                        else {
                            // Clear the form fields after adding the post
                            postText.value = '';
                            caption.value = '';
                            mediaUpload.value = '';
                        }
                        newPostModal.style.display = 'none';

                        // Refresh the graphs after a new post is added
                        drawTopUsersGraph();
                        drawUserPostTypeStatsGraph();
                    }
                })
                .catch(err => {
                    console.error("Error uploading post:", err);
                    uploadError.textContent = "שגיאה בהעלאת הפוסט. נסה שוב.";
                    uploadError.style.display = "block";
                })
                .finally(() => {
                    // reset the button state regardless of success or failure
                    uploadPostBtn.disabled = false;
                    uploadPostBtn.textContent = originalButtonText;
                });
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

                        // Refresh the graphs after a post is deleted
                        drawTopUsersGraph();
                        drawUserPostTypeStatsGraph();
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
    let showingOnlyMyPosts = false;

    // Reusable function to fetch and render posts from any endpoint
    async function loadPosts() {
        const endpoint = showingOnlyMyPosts ? '/api/posts/my-posts' : '/api/posts';

        try {
            const response = await fetch(endpoint, { credentials: 'include' });
            if (response.ok) {
                const postsArray = await response.json();
            
                // Clear existing posts from the container before rendering the new list
                if (postContainer) {
                    postContainer.innerHTML = ''; 
                }

                // Build each post object into the DOM
                postsArray.forEach((postData) => BuildPost(postData, false));
            } else {
                console.error("Failed to load posts:", response.status);
            }
        } catch (err) {
            console.error("Failed to load posts:", err);
        }
    }

    // Setup the Profile Button Toggle Listener
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', async function() {
            // Toggle state: true becomes false, false becomes true
            showingOnlyMyPosts = !showingOnlyMyPosts;
        
            // Optional visual highlight for the active profile state
            profileBtn.style.border = showingOnlyMyPosts ? "2px solid #0d6efd" : "none";

            // Reload posts based on the toggled state
            await loadPosts();
        });
    }

    // Initial load when the page loads
    loadPosts();

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

        // Render initial liker preview if available
        const likerPreview = clone.querySelector('.post-liker-preview');
        if (postData.liked_by_usernames && postData.liked_by_usernames.length > 0) {
            const firstLiker = postData.liked_by_usernames[0];
            likerPreview.textContent = `• אהוב על ידי ${firstLiker}`;
            likerPreview.style.display = 'inline';
        }

        const commentCount = clone.querySelector('[comment-count]');
        commentCount.textContent = postData.comment_count;

        const commentCountDisplay = clone.querySelector('[comment-count-display]');
        commentCountDisplay.textContent = postData.comment_count;

        const repostCount = clone.querySelector('[repost-count]');
        repostCount.textContent = postData.repost_count;

        initializePost(clone, postData); // Initialize the new post's functionality so it can be liked, commented on, etc.
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

   async function addGifAsComment(gifUrl) {
        if (!window.currentPostForGif) {
            alert("שגיאה: לא זוהה הפוסט אליו יש להוסיף את הגיפ.");
            return;
        }
        
        const currentPost = window.currentPostForGif;
        const postId = currentPost.getAttribute('data-post-id'); // Retrieve the MongoDB ID stored on the post card
        
        // עכשיו בטוח נמצא את אזור התגובות בתוך הפוסט האמיתי
        const commentsList = currentPost.querySelector('.comments-list');
        const commentCountIconTxt = currentPost.querySelector('.comment-count-txt');
        const commentCountDisplayTxt = currentPost.querySelector('.comment-count-display');
        const toggleCommentsBtn = currentPost.querySelector('.toggle-comments-btn');
        
        if (!commentsList || !postId) {
            console.error("הפוסט שזוהה:", currentPost);
            alert("שגיאה: לא נמצא אזור התגובות בפוסט הזה.");
            return;
        }

        try {
            // Send the GIF comment to the backend server
            const response = await fetch(`/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    comment_content: gifUrl, 
                    comment_type: 'gif' 
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const newCommentObj = result.comment;
                const currentCommentCount = result.comment_count;

                // Create the comment element using the data returned from the server
                const newComment = document.createElement('div');
                newComment.classList.add('single-comment');
                newComment.innerHTML = `<strong>${newCommentObj.username}</strong> <br> <img src="${newCommentObj.comment_content}" class="comment-gif" style="max-width: 150px; border-radius: 8px; margin-top: 5px;">`;
                
                // Add to DOM
                commentsList.appendChild(newComment);
                commentsList.style.display = 'block'; 
                
                // Update counts on the UI
                if (commentCountIconTxt) {
                    commentCountIconTxt.textContent = currentCommentCount.toLocaleString('en-US');
                }
                if (commentCountDisplayTxt) {
                    commentCountDisplayTxt.textContent = currentCommentCount.toLocaleString('en-US');
                }
                if (toggleCommentsBtn) {
                    toggleCommentsBtn.innerHTML = `הסתר תגובות`;
                }
                
                // Scroll down and close modal
                commentsList.scrollTop = commentsList.scrollHeight;
                document.getElementById('gifModal').style.display = 'none';
                document.getElementById('gifSearchInput').value = '';
                document.getElementById('gifResultsContainer').innerHTML = '';
                window.currentPostForGif = null;
            } else {
                alert(result.message || "שגיאה בשמירת תגובת הגיפ.");
            }
        } catch (error) {
            console.error("Error adding GIF comment:", error);
            alert("שגיאה בתקשורת מול השרת.");
        }
    }

    // ==========================================
    // 11. FACEBOOK POST LOGIC
    // ==========================================
    // ==========================================
    // 11. FACEBOOK POST LOGIC & CANVAS (HTML5)
    // ==========================================
    const bestDayBtn = document.getElementById('bestDayBtn');
    
    if (bestDayBtn) {
        // --- 1. ציור סמיילי על הקנבס של HTML5 ---
        const canvas = document.getElementById('effectsCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            // התאמת גודל הקנבס לחלון הנוכחי
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            bestDayBtn.addEventListener('click', () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height); // ניקוי הקנבס
                
                // ציור פרצוף
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, Math.PI * 2, true); 
                ctx.fillStyle = "#ffcc00";
                ctx.fill();
                ctx.stroke();
                
                // ציור עיניים
                ctx.beginPath();
                ctx.arc(canvas.width / 2 - 35, canvas.height / 2 - 20, 10, 0, Math.PI * 2, true); 
                ctx.arc(canvas.width / 2 + 35, canvas.height / 2 - 20, 10, 0, Math.PI * 2, true); 
                ctx.fillStyle = "black";
                ctx.fill();
                
                // ציור פה מחייך
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2 + 20, 50, 0, Math.PI, false); 
                ctx.stroke();
                
                // העלמת הסמיילי אחרי 3 שניות
                setTimeout(() => { ctx.clearRect(0, 0, canvas.width, canvas.height); }, 3000);
            });
        }

        // --- 2. הלוגיקה המקורית של הפייסבוק שלך ---
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
    
    const userOrGroupFilter = document.getElementById("UserOrGroupFilter");
    const liveUserSearchInput = document.getElementById("liveUserSearchInput");
    const adminSearchInput = document.getElementById("adminSearchInput");
    const groupSearchInput = document.getElementById("groupSearchInput");

    const applyUserSearchBtn = document.getElementById("applyUserSearchBtn");
    const resetUserSearchBtn = document.getElementById("resetUserSearchBtn");
    const userSearchResults = document.getElementById("userSearchResults");

    const groupMembersModal = document.getElementById("groupMembersModal");
    const closeGroupMembers = document.getElementById("closeGroupMembers");


   function drawGroupMembersGraph() {
    fetch('/statistics/groups')
        .then(response => response.json())
        .then(res => {
            if (!res.success || res.data.length === 0) return;

            const data = res.data;
            
           
            d3.select("#groupMembersGraph").selectAll("*").remove();

            
            let tooltip = d3.select("#groupMembersGraph").select(".tooltip");
            if (tooltip.empty()) {
                tooltip = d3.select("body") 
                  .append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0)
                  .style("position", "absolute")
                  .style("background-color", "rgba(0, 0, 0, 0.8)")
                  .style("color", "white")
                  .style("border-radius", "6px")
                  .style("padding", "8px 12px")
                  .style("font-size", "12px")
                  .style("pointer-events", "none") 
                  .style("z-index", "10000");
            }

            const margin = {top: 20, right: 20, bottom: 20, left: 40},
                  width = 380 - margin.left - margin.right,
                  height = 250 - margin.top - margin.bottom;

            const svg = d3.select("#groupMembersGraph")
              .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const x = d3.scaleBand()
              .range([ 0, width ])
              .domain(data.map(d => d.groupName))
              .padding(0.2);
              
           
            svg.append("g")
              .attr("transform", `translate(0,${height})`)
              .call(d3.axisBottom(x))
              .selectAll("text")
              .remove(); 

            const maxMembers = d3.max(data, d => d.memberCount);
            const y = d3.scaleLinear()
              .domain([0, maxMembers + 1])
              .range([ height, 0]);
              
            svg.append("g")
              .call(d3.axisLeft(y).ticks(maxMembers));

           
            svg.selectAll("mybar")
              .data(data)
              .join("rect")
                .attr("x", d => x(d.groupName))
                .attr("width", x.bandwidth())
                .attr("fill", "#0095f6")
               
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("fill", "#0077c9"); 
                    tooltip.style("opacity", 1);
                })
               
                .on("mousemove", function(event, d) {
                    tooltip
                      .html(`<strong>${d.groupName}</strong><br/>${d.memberCount} חברים`)
                      .style("left", (event.pageX + 15) + "px") 
                      .style("top", (event.pageY - 25) + "px"); 
                })
               
                .on("mouseout", function(event, d) {
                    d3.select(this).attr("fill", "#0095f6"); 
                    tooltip.style("opacity", 0);
                })
               
                .attr("y", d => y(0))
                .attr("height", 0)
              .transition()
              .duration(1000)
                .attr("y", d => y(d.memberCount))
                .attr("height", d => height - y(d.memberCount));
        })
        .catch(err => console.error("Error fetching graph data:", err));
    }

    // Function to handle conditional input visibility based on dropdown selection
    function updateInputVisibility() {
        const filterValue = userOrGroupFilter.value;
    
        if (filterValue === "groups") {
            adminSearchInput.style.display = "block";
            groupSearchInput.style.display = "none";
        } else if (filterValue === "users") {
            adminSearchInput.style.display = "none";
            groupSearchInput.style.display = "block";
        } else { // "all" or "my-groups"
            adminSearchInput.style.display = "none";
            groupSearchInput.style.display = "none";
        }
    }

    // Run visibility check on dropdown change
    if (userOrGroupFilter) {
        userOrGroupFilter.addEventListener("change", updateInputVisibility);
        updateInputVisibility(); // Initial check on load
    }

    if (openUserSearchBtn && userSearchModal) {
       openUserSearchBtn.addEventListener("click", () => {
            userSearchModal.style.display = "flex";
            drawGroupMembersGraph(); 
        });
    
    
        closeUserSearch.addEventListener("click", () => {
            userSearchModal.style.display = "none";
        });
        
        if(closeGroupMembers) {
            closeGroupMembers.addEventListener("click", () => groupMembersModal.style.display = "none");
        }

        window.addEventListener("click", (e) => {
            if (e.target === userSearchModal) userSearchModal.style.display = "none";
            if (e.target === groupMembersModal) groupMembersModal.style.display = "none";
        });



        // Trigger search on button click instead of live input
        if (applyUserSearchBtn) {
            applyUserSearchBtn.addEventListener("click", () => {
                const filter = userOrGroupFilter ? userOrGroupFilter.value : "all";
                const query = liveUserSearchInput ? liveUserSearchInput.value.trim() : "";
                const adminQuery = adminSearchInput ? adminSearchInput.value.trim() : "";
                const groupQuery = groupSearchInput ? groupSearchInput.value.trim() : "";

                // Build query parameters dynamically
                const params = new URLSearchParams();
                params.append("filter", filter);
                if (query) params.append("q", query);
                if (adminQuery && filter === "groups") params.append("admin", adminQuery);
                if (groupQuery && filter === "users") params.append("group", groupQuery);

                fetch(`/search-all?${params.toString()}`)
                .then(response => response.json())
                .then(data => {
                    userSearchResults.innerHTML = ""; 
                    
                    if (data.success) {
                        // Display Users
                        if (data.users && data.users.length > 0) {
                            userSearchResults.innerHTML += `<div class="fw-bold mb-2 mt-2" style="color: #737373;">משתמשים</div>`;
                            data.users.forEach(user => {

                                // Check if user is already a friend (assuming currentUser.friends is available globally)
                                const isFriend = currentUser.friends && currentUser.friends.includes(user.username);
                                const isSelf = user.username === currentUser.username;

                                let friendButtonHtml = "";
                                if (!isSelf) {
                                    friendButtonHtml = !isFriend
                                        ? `<button class="colorful-btn action-friend-btn" data-username="${user.username}" data-action="add" style="padding: 6px 12px; font-size: 12px; border-radius: 6px; cursor: pointer; margin-left: 8px;">הוסף חבר</button>`
                                        : `<button class="colorful-btn action-friend-btn" data-username="${user.username}" data-action="remove" style="padding: 6px 12px; font-size: 12px; border-radius: 6px; cursor: pointer; margin-left: 8px; background-color: #efefef; color: #262626;">הסר חבר</button>`;
                                }

                                userSearchResults.innerHTML += `
                                    <div class="user-row mb-2" style="border-bottom: 1px solid #efefef; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                                        <div class="d-flex align-items-center">
                                            <img src="${user.user_profile_image}" class="suggested-profile-img" alt="${user.username}" style="margin-left: 10px;">
                                            <div class="fw-bold small">${user.username}</div>
                                        </div>
                                        <button class="colorful-btn" style="padding: 6px 12px; font-size: 12px; border-radius: 6px; cursor: pointer;" onclick="addToGroupPreview('${user.username}')">הוסף לקבוצה</button>
                                        ${friendButtonHtml}
                                    </div>
                                `;
                            });
                        }

                        // Display Groups
                        if (data.groups && data.groups.length > 0) {
                            userSearchResults.innerHTML += `<div class="fw-bold mb-2 mt-3" style="color: #737373;">קבוצות</div>`;
                            data.groups.forEach(group => {
                                // Check if the current user is the admin of this group
                                const isAdmin = group.admin === currentUser.username;
                                // Simple check: is the current user in the group's members array?
                                const isMember = group.members && group.members.includes(currentUser.username);

                                // Determine the action button HTML
                                let joinButtonHtml = "";
                                if (isAdmin) {
                                    // If the user is the admin, don't show the leave/join button (or show a badge)
                                    joinButtonHtml = `<span class="text-muted" style="font-size: 11px; margin-left: 8px;">(מנהל קבוצה)</span>`;
                                } else {
                                    // Otherwise, show Join or Leave depending on membership status
                                    joinButtonHtml = !isMember 
                                        ? `<button class="colorful-btn" style="padding: 4px 8px; font-size: 11px; border-radius: 6px; cursor: pointer; margin-left: 8px;" onclick="event.stopPropagation(); joinGroup('${group.group_name}')">הצטרף לקבוצה</button>` 
                                        : `<button class="colorful-btn" style="padding: 4px 8px; font-size: 11px; border-radius: 6px; cursor: pointer; margin-left: 8px; background-color: #efefef; color: #262626;" onclick="event.stopPropagation(); leaveGroup('${group.group_name}')">צא מהקבוצה</button>`;
                                }
                                
                                // Conditionally set click behavior and span visibility based on 'my-groups' filter
                                const isMyGroups = filter === "my-groups";
                                
                                // Check if current filter is 'my-groups' to display the span
                                const showMembersSpan = filter === "my-groups" 
                                    ? `<span style="font-size: 12px; color: #0095f6;">הצג חברים</span>` 
                                    : "";
                                
                                const rowClickHandler = isMyGroups ? `onclick="showGroupMembers('${group.group_name}')"` : "";
                                const rowCursorStyle = isMyGroups ? "cursor: pointer;" : "cursor: default;";

                                userSearchResults.innerHTML += `
                                    <div class="user-row mb-2" style="border-bottom: 1px solid #efefef; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center; ${rowCursorStyle}" ${rowClickHandler}>
                                        <div class="d-flex align-items-center">
                                            <img src="${group.group_profile_image}" class="suggested-profile-img" alt="${group.group_name}" style="margin-left: 10px;">
                                            <div>
                                                <div class="fw-bold small">${group.group_name}</div>
                                                <div class="text-muted" style="font-size: 11px;">${group.members.length} חברים</div>
                                            </div>
                                        </div>
                                        ${joinButtonHtml}
                                        ${showMembersSpan}
                                    </div>
                                `;
                            });
                        }

                        if ((!data.users || data.users.length === 0) && (!data.groups || data.groups.length === 0)) {
                            userSearchResults.innerHTML = "<p class='text-muted mt-3 text-center'>לא נמצאו תוצאות.</p>";
                        }
                    }
                })
                .catch(err => console.error("Error searching:", err));
            });
        }

        // Reset search inputs
        if (resetUserSearchBtn) {
            resetUserSearchBtn.addEventListener("click", () => {
                liveUserSearchInput.value = "";
                if (adminSearchInput) adminSearchInput.value = "";
                if (groupSearchInput) groupSearchInput.value = "";
                if (userOrGroupFilter) userOrGroupFilter.value = "all";
                updateInputVisibility();
                userSearchResults.innerHTML = "";
            });
        }

        if (userSearchResults) {
            userSearchResults.addEventListener("click", async (e) => {
                const friendBtn = e.target.closest(".action-friend-btn");
                if (!friendBtn) return;

                const targetUsername = friendBtn.dataset.username;
                const action = friendBtn.dataset.action;

                if (action === "add") {
                    await addFriend(targetUsername);
                } else if (action === "remove") {
                    await removeFriend(targetUsername);
                }
            });
        }
    }

    window.removeFriend = async function(targetUsername) {
        try {
            const response = await fetch('/remove-friend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUsername: targetUsername })
            });
    
            const result = await response.json();
            if (response.ok) {
                alert(`המשתמש ${targetUsername} הוסר מהחברים בהצלחה.`);
                if (typeof currentUser !== 'undefined' && currentUser.friends) {
                    currentUser.friends = currentUser.friends.filter(f => f !== targetUsername);
                }
                if (applyUserSearchBtn) applyUserSearchBtn.click();
            } else {
                alert(result.message || "שגיאה בהסרת חבר.");
            }
        } catch (error) {
            console.error("Error removing friend:", error);
        }
    };

    window.addFriend = async function(targetUsername) {
        try {
            const response = await fetch('/add-friend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUsername: targetUsername })
            });
        
            const result = await response.json();
            if (response.ok) {
                alert(`המשתמש ${targetUsername} נוסף לחברים בהצלחה!`);
                // Update local currentUser object if needed or re-trigger search
                if (typeof currentUser !== 'undefined' && currentUser.friends) {
                    currentUser.friends.push(targetUsername);
                }
                if (applyUserSearchBtn) applyUserSearchBtn.click();
            } else {
                alert(result.message || "שגיאה בהוספת חבר.");
            }
        } catch (error) {
            console.error("Error adding friend:", error);
        }
    };

    window.joinGroup = async function(groupName) {
        try {
            const response = await fetch('/join-group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupName: groupName })
            });
        
            const result = await response.json();
            if (response.ok) {
                alert(`הצטרפת בהצלחה לקבוצה ${groupName}!`);
                if (applyUserSearchBtn) applyUserSearchBtn.click();
            } else {
                alert(result.message || "שגיאה בהצטרפות לקבוצה.");
            }
        } catch (error) {
            console.error("Error joining group:", error);
        }
    };

    window.leaveGroup = async function(groupName) {
        try {
            const response = await fetch('/leave-group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupName: groupName })
            });
        
            const result = await response.json();
            if (response.ok) {
                alert(`עזבת את הקבוצה ${groupName} בהצלחה.`);
                if (applyUserSearchBtn) applyUserSearchBtn.click();
            } else {
                alert(result.message || "שגיאה בעזיבת הקבוצה.");
            }
        } catch (error) {
            console.error("Error leaving group:", error);
        }
    };


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

                    // Conditional rendering of the remove button based on admin status
                    let removeButtonHtml = "";
                    if (!isAdmin) {
                        removeButtonHtml = `
                            <button class="colorful-btn" 
                                    style="padding: 4px 8px; font-size: 11px; border-radius: 6px; cursor: pointer; background-color: #ff4d4d; color: white; border: none;" 
                                    onclick="removeUserFromGroup('${groupName}', '${member.username}')">
                                הסר
                            </button>
                        `;
                    }

                    list.innerHTML += `
                        <div class="d-flex align-items-center mb-3">
                            <img src="${member.user_profile_image}" style="width: 35px; height: 35px; border-radius: 50%; margin-left: 10px; object-fit: cover;">
                            <div class="fw-bold small">${member.username} ${isAdmin}</div>
                            ${removeButtonHtml}
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

    window.removeUserFromGroup = async function(groupName, usernameToRemove) {
        if (!confirm(`האם אתה בטוח שברצונך להסיר את ${usernameToRemove} מהקבוצה?`)) return;

        try {
            const response = await fetch('/remove-from-group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupName: groupName, usernameToRemove: usernameToRemove })
            });
    
            const result = await response.json();
            if (response.ok && result.success) {
                alert(`המשתמש ${usernameToRemove} הוסר מהקבוצה בהצלחה.`);
                // Refresh the modal list and the background search view
                showGroupMembers(groupName);
                if (applyUserSearchBtn) applyUserSearchBtn.click();
            } else {
                alert(result.message || "שגיאה בהסרת המשתמש מהקבוצה.");
            }
        } catch (error) {
            console.error("Error removing user from group:", error);
        }
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
    const newGroupProfileImageInput = document.getElementById("newGroupProfileImageInput");
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
            const imageFile = newGroupProfileImageInput.files[0]; // Get the selected file
            
            if (!groupName) {
                createGroupError.textContent = "אנא הזן שם לקבוצה.";
                createGroupError.style.display = "block";
                return;
            }

            // Use FormData to package text data and files together
            const formData = new FormData();
            formData.append("groupName", groupName);
    
            if (imageFile) {
                formData.append("groupProfileImage", imageFile); // Matches backend file upload field name
            }

            fetch('/create-group', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("הקבוצה " + groupName + " נוצרה בהצלחה!");
                    createGroupModal.style.display = "none";
                    newGroupNameInput.value = "";
                    newGroupProfileImageInput.value = "";
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
    

    let myMap = null;
    let markersArray = [];
    
    const openMapBtn = document.getElementById("openMapBtn");
    const mapModal = document.getElementById("mapModal");
    const closeMap = document.getElementById("closeMap");

    if (openMapBtn && mapModal) {
        openMapBtn.addEventListener("click", () => {
            mapModal.style.display = "flex";
            
            if (!myMap) {
                myMap = new google.maps.Map(document.getElementById("photoMap"), {
                    center: { lat: 32.0158, lng: 34.7744 }, 
                    zoom: 13,
                    mapTypeId: "roadmap",
                    disableDefaultUI: false
                });

                loadMapMarkers();

                myMap.addListener("click", (mapsMouseEvent) => {
                    const lat = mapsMouseEvent.latLng.lat();
                    const lng = mapsMouseEvent.latLng.lng();
                    const placeName = prompt("הכנס שם למיקום החדש (לדוגמה: פארק, מסעדה):");
                    
                    if (placeName) {
                        fetch('/locations', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: placeName, lat: lat, lng: lng })
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                loadMapMarkers(); 
                            }
                        });
                    }
                });
            }
            
            setTimeout(() => { 
                google.maps.event.trigger(myMap, "resize"); 
                myMap.setCenter({ lat: 32.0158, lng: 34.7744 });
            }, 200);
        });

        closeMap.addEventListener("click", () => mapModal.style.display = "none");
    }

    function loadMapMarkers() {
        if (!myMap) return;
        
        markersArray.forEach(marker => marker.setMap(null));
        markersArray = [];

        fetch('/locations')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    data.data.forEach(loc => {
                        const marker = new google.maps.Marker({
                            position: { lat: loc.lat, lng: loc.lng },
                            map: myMap,
                            title: loc.name
                        });
                        
                        const infoWindow = new google.maps.InfoWindow({
                            content: `
                                <div style="text-align: center; min-width: 120px;">
                                    <strong style="font-size: 14px;">${loc.name}</strong><br>
                                    <hr style="margin: 8px 0;">
                                    <button onclick="editLocation('${loc._id}', '${loc.name}')" style="background:#0095f6; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px; margin-left: 5px;">ערוך</button>
                                    <button onclick="deleteLocation('${loc._id}')" style="background:#ed4956; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">מחק</button>
                                </div>
                            `
                        });

                        marker.addListener("click", () => {
                            infoWindow.open(myMap, marker);
                        });

                        markersArray.push(marker);
                    });
                }
            });
    }

    window.editLocation = function(id, currentName) {
        const newName = prompt("הכנס שם חדש למיקום:", currentName);
        if (newName && newName !== currentName) {
            fetch(`/locations/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newName })
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    loadMapMarkers();
                }
            });
        }
    };

    window.deleteLocation = function(id) {
        if (confirm("האם אתה בטוח שברצונך למחוק מיקום זה?")) {
            fetch(`/locations/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                if(data.success) { loadMapMarkers(); }
            });
        }
    };


});

function drawTopUsersGraph() {
    fetch('/statistics/top-users')
        .then(response => response.json())
        .then(res => {
            if (!res.success || res.data.length === 0) return;

            const data = res.data;
            
            
            d3.select("#topUsersGraph").selectAll("*").remove();

           
            let tooltip = d3.select("#topUsersGraph").select(".tooltip");
            if (tooltip.empty()) {
                tooltip = d3.select("body")
                  .append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0)
                  .style("position", "absolute")
                  .style("background-color", "rgba(0, 0, 0, 0.8)")
                  .style("color", "white")
                  .style("border-radius", "6px")
                  .style("padding", "8px 12px")
                  .style("font-size", "12px")
                  .style("pointer-events", "none")
                  .style("z-index", "10000");
            }

           
            const margin = {top: 10, right: 15, bottom: 20, left: 10}, 
                  width = 230 - margin.left - margin.right,
                  height = 130 - margin.top - margin.bottom;

            const svg = d3.select("#topUsersGraph")
              .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const maxPosts = d3.max(data, d => d.postCount);
            const x = d3.scaleLinear()
              .domain([0, maxPosts])
              .range([ 0, width]);
              
            svg.append("g")
              .attr("transform", `translate(0,${height})`)
              .call(d3.axisBottom(x).ticks(maxPosts > 5 ? 5 : maxPosts))
              .selectAll("text")
                .style("font-size", "9px")
                .style("color", "#737373");

           
            const y = d3.scaleBand()
              .range([ 0, height ])
              .domain(data.map(d => d._id))
              .padding(.2);
              
          
            svg.append("g")
              .call(d3.axisLeft(y))
              .selectAll("text")
              .remove(); 

           
            svg.selectAll("myRect")
              .data(data)
              .join("rect")
              .attr("x", x(0) )
              .attr("y", d => y(d._id))
              .attr("height", y.bandwidth())
              .attr("fill", "#ed4956") // אדום אינסטגרם
              .on("mouseover", function(event, d) {
                  d3.select(this).attr("fill", "#c93340"); // מחשיך קצת במעבר עכבר
                  tooltip.style("opacity", 1);
              })
              .on("mousemove", function(event, d) {
                  tooltip
                    .html(`<strong>${d._id}</strong><br/>${d.postCount} פוסטים`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 25) + "px");
              })
              .on("mouseout", function(event, d) {
                  d3.select(this).attr("fill", "#ed4956"); // מחזיר לצבע המקורי
                  tooltip.style("opacity", 0);
              })
              .attr("width", 0)
              .transition()
              .duration(1000)
              .attr("width", d => x(d.postCount));
        })
        .catch(err => console.error("Error fetching top users graph:", err));
}

drawTopUsersGraph();

function drawUserPostTypeStatsGraph() {
    fetch('/statistics/user-post-types')
        .then(response => response.json())
        .then(res => {
            if (!res.success || res.data.length === 0) return;

            // Transform the single user statistics object into an array for D3 categories
            const stats = res.data;
            const data = [
                { type: 'טקסט (Text)', count: stats.textCount, color: '#3897f0' },
                { type: 'תמונה (Image)', count: stats.imageCount, color: '#ed4956' },
                { type: 'וידאו (Video)', count: stats.videoCount, color: '#833ab4' }
            ];
            
            d3.select("#userPostTypesGraph").selectAll("*").remove();

           
            let tooltip = d3.select("#userPostTypesGraph").select(".tooltip");
            if (tooltip.empty()) {
                tooltip = d3.select("body")
                  .append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0)
                  .style("position", "absolute")
                  .style("background-color", "rgba(0, 0, 0, 0.8)")
                  .style("color", "white")
                  .style("border-radius", "6px")
                  .style("padding", "8px 12px")
                  .style("font-size", "12px")
                  .style("pointer-events", "none")
                  .style("z-index", "10000");
            }

           
            const margin = {top: 10, right: 15, bottom: 20, left: 10}, 
                  width = 230 - margin.left - margin.right,
                  height = 130 - margin.top - margin.bottom;

            const svg = d3.select("#userPostTypesGraph")
              .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const maxPosts = d3.max(data, d => d.count);
            const x = d3.scaleLinear()
              .domain([0, maxPosts])
              .range([ 0, width]);
              
            svg.append("g")
              .attr("transform", `translate(0,${height})`)
              .call(d3.axisBottom(x).ticks(maxPosts > 5 ? 5 : maxPosts))
              .selectAll("text")
                .style("font-size", "9px")
                .style("color", "#737373");

           
            const y = d3.scaleBand()
              .range([ 0, height ])
              .domain(data.map(d => d.type))
              .padding(.2);
              
          
            svg.append("g")
              .call(d3.axisLeft(y))
              .selectAll("text")
              .remove(); 

           
            svg.selectAll("myRect")
              .data(data)
              .join("rect")
              .attr("x", x(0) )
              .attr("y", d => y(d.type))
              .attr("height", y.bandwidth())
              .attr("fill", d => d.color) 
              .on("mouseover", function(event, d) {
                  d3.select(this).style("opacity", 0.8);
                  tooltip.style("opacity", 1);
              })
              .on("mousemove", function(event, d) {
                  tooltip
                    .html(`<strong>${d.type}</strong><br/>${d.count} פוסטים`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 25) + "px");
              })
              .on("mouseout", function(event, d) {
                  d3.select(this).style("opacity", 1);
                  tooltip.style("opacity", 0);
              })
              .attr("width", 0)
              .transition()
              .duration(1000)
              .attr("width", d => x(d.count));
        })
        .catch(err => console.error("Error fetching top users graph:", err));



        // --- לוגיקה לפתיחה וסגירה של תפריט ניהול קבוצות ---
    const toggleGroupMenuBtn = document.getElementById("toggleGroupMenuBtn");
    const groupActionMenu = document.getElementById("groupActionMenu");

    if (toggleGroupMenuBtn && groupActionMenu) {
        toggleGroupMenuBtn.addEventListener("click", () => {
            if (groupActionMenu.style.display === "none") {
                groupActionMenu.style.display = "flex";
            } else {
                groupActionMenu.style.display = "none";
            }
        });
        
        // סגירת התפריט אם לוחצים במקום אחר במסך
        document.addEventListener("click", (event) => {
            if (!toggleGroupMenuBtn.contains(event.target) && !groupActionMenu.contains(event.target)) {
                groupActionMenu.style.display = "none";
            }
        });
    }
    
}

drawUserPostTypeStatsGraph();