document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", function (event) {
        // Prevent form from refreshing the page
        event.preventDefault();

        const usernameInput = document.getElementById("username").value.trim();
        const passwordInput = document.getElementById("password").value.trim();
        const usernameError = document.getElementById("usernameError");
        const passwordError = document.getElementById("passwordError");

        let isValid = true;

        // --- 1. Client-side Validation ---
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        // Validate Username/Email
        if (usernameInput === "") {
            usernameError.textContent = "Username or email cannot be empty.";
            usernameError.style.display = "block";
            isValid = false;
        } else if (!emailPattern.test(usernameInput)) {
            usernameError.textContent = "Please enter a valid email address.";
            usernameError.style.display = "block";
            isValid = false;
        } else {
            usernameError.style.display = "none";
        }

        // Validate Password strength
        const isPasswordValid = passwordInput.length >= 9 && /[A-Z]/.test(passwordInput) && /[a-z]/.test(passwordInput) && /[0-9]/.test(passwordInput);

        if (passwordInput === "") {
            passwordError.textContent = "Password cannot be empty.";
            passwordError.style.display = "block";
            isValid = false;
        } else if (!isPasswordValid) {
            passwordError.textContent = "Password must be at least 9 characters long and include uppercase, lowercase, and a number.";
            passwordError.style.display = "block";
            isValid = false;
        } else {
            passwordError.style.display = "none";
        }

        // --- 2. Send to Server ---
        // Proceed only if client-side validation is successful
        if (isValid) {
            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameInput, password: passwordInput })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Redirect to the feed page
                    window.location.href = "index2.html";
                } else {
                    // Display server error message (e.g., incorrect credentials)
                    usernameError.textContent = data.message;
                    usernameError.style.display = "block";
                }
            })
            .catch(err => console.error("Error connecting to server:", err));
        }
    });


    
});

document.addEventListener("DOMContentLoaded", function () {
    // --- הוספת לוגיקת ההרשמה ---
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("regUsername").value.trim();
            const email = document.getElementById("regEmail").value.trim();
            const password = document.getElementById("regPassword").value.trim();
            const registerError = document.getElementById("registerError");

            fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("החשבון נוצר בהצלחה! כעת ניתן להתחבר.");
                    // סגירת הפופ-אפ אוטומטית ואיפוס הטופס
                    const modalEl = document.getElementById('registerModal');
                    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                    modal.hide();
                    registerForm.reset();
                    registerError.style.display = "none";
                } else {
                    registerError.textContent = data.message;
                    registerError.style.display = "block";
                }
            })
            .catch(err => console.error("Error creating user:", err));
        });
    }
});
