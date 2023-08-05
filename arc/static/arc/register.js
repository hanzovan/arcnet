document.addEventListener('DOMContentLoaded', function() {
    const registerButton = document.querySelector('#register-btn');
    const usernameBox = document.querySelector('#username-box');

    // Register button was disable by default
    registerButton.disabled = true;

    // When user typing, enable button
    usernameBox.onkeyup = () => {
        if (usernameBox.value.trim().length > 0) {
            registerButton.disabled = false;
        } else {
            registerButton.disabled = true;
        }
    }
})