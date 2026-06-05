/* * Instagram Feed Logic
 * Part 1: Like Button (Animation, Toggle, Image swap using Relative Paths)
 * Part 2: Search Modal (Filter posts, Reset)
 * Part 3: Comments (Add, Count, Toggle display)
 * Part 4: Dark Mode Toggle (POP-UP TEST)
 * Part 5: Back to Top Button (Show on scroll, Smooth scroll)
 * Part 6: Write "The user is typing..." Popup (Show when typing comment, Hide when empty), inside section 3
 * Part 7: Create Post Modal (Image/Video upload, Text caption, Validation)
 * Part 8: Filter by Post Type (All, Images, Videos, Text)
 * Part 9: Delete Post (Remove from DOM)
 * Part 10: Share Post (Simulate share action with alert)
 */
document.addEventListener("DOMContentLoaded", function () {
    
    const posts = document.querySelectorAll('.post-card');
    const postContainer = document.getElementById('postsContainer');

    // ==========================================
    // 1. LIKE BUTTON LOGIC
    // ==========================================
    const ORIGINAL_LIKE_SRC = "./like.png";
    const RED_LIKE_SRC = "./red_like.png";

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
    const searchInput = document.getElementById('searchInput');
    const resetSearchBtn = document.getElementById('resetSearchBtn');

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            searchModal.style.display = 'flex';
            searchInput.focus(); 
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

    if (searchInput) {
        searchInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                document.getElementById('newPostMessage').style.display = 'none'; // Hide the new post message when performing a search
                const searchQuery = searchInput.value.trim().toLowerCase();
                const allPosts = document.querySelectorAll('.post-card');

                allPosts.forEach(post => {
                    const postDescription = post.querySelector('.post-description');
                    if (postDescription) {
                        const textContent = postDescription.textContent.toLowerCase();
                        if (textContent.includes(searchQuery)) {
                            post.style.display = 'block'; 
                        } else {
                            post.style.display = 'none';  
                        }
                    }
                });

                searchModal.style.display = 'none';
                searchInput.value = ''; 
            }
        });
    }

    if (resetSearchBtn) {
        resetSearchBtn.addEventListener('click', function() {
            document.getElementById('newPostMessage').style.display = 'none'; // Hide the new post message when resetting the search
            const allPosts = document.querySelectorAll('.post-card');
            allPosts.forEach(post => {
                post.style.display = 'block';
            });
            searchInput.value = '';
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
    // 7. CREATE POST BUTTON LOGIC
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

            const clone = templatePost.content.cloneNode(true);
            const mediaContainer = clone.querySelector('[data-content]');
            let mediaElement;

            if (mediaUpload.files.length === 0) {
                mediaElement = document.createElement('div');
                mediaElement.textContent = postText.value;
                mediaElement.className = "text-post";
            }
            else {
                const file = mediaUpload.files[0];

                if (file.type.startsWith('image/')) {
                    mediaElement = document.createElement('img');
                    mediaElement.src = URL.createObjectURL(mediaUpload.files[0]);
                    mediaElement.classList = "post-main-img";
                }
                else if (file.type.startsWith('video/')) {
                    mediaElement = document.createElement('video');
                    mediaElement.src = URL.createObjectURL(file);
                    mediaElement.controls = true; // מוסיף כפתורי Play, Pause ועוצמת שמע
                    mediaElement.className = "video-post";
                }
            }

            if (mediaElement && mediaContainer) {
                mediaContainer.appendChild(mediaElement);
            }

            if (caption.value.trim() !== '') {
                const captionElement = clone.querySelector('[data-caption]');
                if (captionElement) {
                    const strongEl = captionElement.querySelector('strong');
                    if (strongEl) {
                        strongEl.style.display = 'inline'; 
                    }

                    captionElement.style.display = 'block'; 
                    captionElement.append(' ' + caption.value.trim());
                }
            }

            initializePost(clone); // Initialize the new post's functionality so it can be liked, commented on, etc.
            postContainer.prepend(clone);

            postText.value = '';
            caption.value = '';
            mediaUpload.value = '';
            newPostModal.style.display = 'none';
            
            document.getElementById('newPostMessage').style.display = 'block';
        });
    }

    // ==========================================
    // 8. FILTER BY POST TYPE LOGIC
    // ==========================================
    const postFilter = document.getElementById('postFilter');

    if (postFilter) {
        // Listen for when the user selects a different option
        postFilter.addEventListener('change', function() {
            document.getElementById('newPostMessage').style.display = 'none'; // Hide the new post message when filtering
            const filterType = this.value;
            const allPosts = document.querySelectorAll('.post-card'); 

            allPosts.forEach(post => {
                const hasImage = post.querySelector('.post-main-img');
                const hasVideo = post.querySelector('.video-post');

                let postType = 'text'; // default fallback
                if (hasImage) postType = 'image';
                if (hasVideo) postType = 'video';

                // Show or Hide the post based on the dropdown choice
                if (filterType === 'all' || filterType === postType) {
                    post.style.display = 'block';
                } else {
                    post.style.display = 'none';
                }
            });
        });
    }

    // ==========================================
    // 9. DELETE POST LOGIC
    // ==========================================
    postContainer.addEventListener('click', function(event) {
        // Check if the clicked element (or its closest parent) is the delete icon
        const deleteBtn = event.target.closest('.delete-btn-icon');
    
        if (deleteBtn) {
            const postCard = deleteBtn.closest('.post-card');
            if (postCard) {
                postCard.remove();
            }
        }
    });

    // ==========================================
    // 10. SHARE POST LOGIC
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


});