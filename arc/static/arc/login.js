document.addEventListener('DOMContentLoaded', function() {    
    const usernameBox = document.querySelector('#username-box');
    const loginButton = document.querySelector('#login-btn');

    // by default disable login btn
    loginButton.disabled = true;

    // If user enter something, allow them to submit
    usernameBox.onkeyup = () => {
        if (usernameBox.value.trim().length > 0) {
            loginButton.disabled = false;
        } else {
            loginButton.disabled = true;
        }
    }
})