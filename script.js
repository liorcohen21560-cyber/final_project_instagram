// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
    
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", function (event) {
        
        // Prevent default form submission (page refresh)
        event.preventDefault();

        // Get input values
        const usernameInput = document.getElementById("username").value.trim();
        const passwordInput = document.getElementById("password").value.trim();

        // Get error containers
        const usernameError = document.getElementById("usernameError");
        const passwordError = document.getElementById("passwordError");

        let isValid = true;

        // 1. Email Validation (Regex)
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (usernameInput === "") {
            usernameError.textContent = "שדה שם משתמש או אימייל לא יכול להיות ריק.";
            usernameError.style.display = "block";
            isValid = false;
        } else if (!emailPattern.test(usernameInput)) {
            usernameError.textContent = "נא להזין כתובת אימייל תקינה (למשל: example@email.com).";
            usernameError.style.display = "block";
            isValid = false;
        } else {
            usernameError.style.display = "none";
        }

        // 2. Password Validation (Regex: 9 chars, uppercase, lowercase, number)
        const hasUppercase = /[A-Z]/.test(passwordInput);
        const hasLowercase = /[a-z]/.test(passwordInput);
        const hasNumber = /[0-9]/.test(passwordInput);
        const isLongEnough = passwordInput.length >= 9;

        if (passwordInput === "") {
            passwordError.textContent = "שדה הסיסמה לא יכול להיות ריק.";
            passwordError.style.display = "block";
            isValid = false;
        } else if (!isLongEnough || !hasUppercase || !hasLowercase || !hasNumber) {
            passwordError.textContent = "הסיסמה חייבת להכיל לפחות 9 תווים, כולל אות גדולה (A-Z), אות קטנה (a-z) ומספר.";
            passwordError.style.display = "block";
            isValid = false;
        } else {
            passwordError.style.display = "none";
        }

        // 3. Redirect if all validations pass
        if (isValid) {
            // RELATIVE PATH: Redirects to the feed page
            window.location.href = "index2.html"; 
        }
    });
});