document.addEventListener('DOMContentLoaded', function() {
    hideMessage();

    function hideMessage() {
        let yayMessageDiv = document.querySelector('.alert-success');
        let nayMessageDiv = document.querySelector('.alert-danger');

        if (yayMessageDiv) {
            setTimeout(function() {
                yayMessageDiv.style.animationPlayState = 'running';                
            }, 1000);
        }
        if (nayMessageDiv) {
            setTimeout(function() {
                nayMessageDiv.style.animationPlayState = 'running';                
            }, 1000)
        }
    }
})