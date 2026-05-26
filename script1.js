/* * Instagram Feed Logic
 * Part 1: Handles Like Button animation, toggle logic, and relative heart image swap
 * Part 2: Handles Search popup, filtering posts by description, and resetting the feed
 */
document.addEventListener("DOMContentLoaded", function () {
    
    // ==========================================
    // 1. LIKE BUTTON LOGIC
    // ==========================================
    const ORIGINAL_LIKE_SRC = "like.png";
    const RED_LIKE_SRC = "red_like.png";

    // Select all post cards on the page
    const posts = document.querySelectorAll('.post-card');

    posts.forEach(post => {
        // Find specific elements within the current post
        const likeBtnImg = post.querySelector('.like-btn-img');
        const likeCountIconText = post.querySelector('.like-count-txt'); 
        const likeCountDisplayText = post.querySelector('.like-count-display'); 
        
        // Stop execution if the post does not contain a like button or count
        if (!likeBtnImg || !likeCountIconText) return;

        let isLiked = false;
        
        // Extract initial likes, ignoring commas for large numbers (e.g. 16,800)
        const rawText = likeCountIconText.textContent.replace(/,/g, '');
        const baseLikes = parseInt(rawText);

        likeBtnImg.addEventListener('click', function () {
            
            // A. Pop animation effect
            likeBtnImg.classList.remove('liked-animation');
            void likeBtnImg.offsetWidth; // Trigger reflow to restart animation
            likeBtnImg.classList.add('liked-animation');

            // B. Add/Remove like logic and image toggle
            if (!isLiked) {
                let newCount = baseLikes + 1;
                // Update numbers with commas
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
    });

    // ==========================================
    // 2. SEARCH MODAL & FILTER LOGIC
    // ==========================================
    const searchBtn = document.getElementById('search-btn');
    const searchModal = document.getElementById('searchModal');
    const closeSearch = document.getElementById('closeSearch');
    const searchInput = document.getElementById('searchInput');
    const resetSearchBtn = document.getElementById('resetSearchBtn'); 

    // A. Open Search Modal
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            searchModal.style.display = 'flex';
            searchInput.focus(); 
        });
    }

    // B. Close Search Modal (by clicking 'X')
    if (closeSearch) {
        closeSearch.addEventListener('click', function() {
            searchModal.style.display = 'none';
        });
    }

    // C. Close Modal (by clicking outside the content box)
    window.addEventListener('click', function(event) {
        if (event.target === searchModal) {
            searchModal.style.display = 'none';
        }
    });

    // D. Filter Posts on "Enter" key press
    if (searchInput) {
        searchInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                const searchQuery = searchInput.value.trim().toLowerCase();

                posts.forEach(post => {
                    const postDescription = post.querySelector('.post-description');
                    
                    if (postDescription) {
                        const textContent = postDescription.textContent.toLowerCase();
                        
                        // Show post if text includes the query, hide otherwise
                        if (textContent.includes(searchQuery)) {
                            post.style.display = 'block'; 
                        } else {
                            post.style.display = 'none';  
                        }
                    }
                });

                searchModal.style.display = 'none';
                searchInput.value = ''; // Clear input
            }
        });
    }

    // E. Reset Logic: Show all posts again
    if (resetSearchBtn) {
        resetSearchBtn.addEventListener('click', function() {
            posts.forEach(post => {
                post.style.display = 'block';
            });
            searchInput.value = '';
            searchModal.style.display = 'none';
        });
    }
});