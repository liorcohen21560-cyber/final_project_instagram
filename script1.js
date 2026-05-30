/* * Instagram Feed Logic
 * Part 1: Like Button (Animation, Toggle, Image swap using Relative Paths)
 * Part 2: Search Modal (Filter posts, Reset)
 * Part 3: Comments (Add, Count, Toggle display)
 * Part 4: Dark Mode Toggle (POP-UP TEST)
 */
document.addEventListener("DOMContentLoaded", function () {
    
    const posts = document.querySelectorAll('.post-card');

    // ==========================================
    // 1. LIKE BUTTON LOGIC
    // ==========================================
    const ORIGINAL_LIKE_SRC = "./like.png";
    const RED_LIKE_SRC = "./red_like.png";

    posts.forEach(post => {
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
                postCommentBtn.removeAttribute('disabled');
            } else {
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
    });

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
                const searchQuery = searchInput.value.trim().toLowerCase();

                posts.forEach(post => {
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
            posts.forEach(post => {
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
});