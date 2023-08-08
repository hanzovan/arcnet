document.addEventListener('DOMContentLoaded', function() {
    // When DOM content loaded, update like count
    const Posts = document.querySelectorAll('.post');
    update_like();
    // Get all the post and add eventlistener to all like button if user logged in
    if (isAuthenticated) {
        Posts.forEach(post => {
            post.querySelector('.like-btn').onclick = function() {
                fetch('/like_post', {
                    method: 'POST',
                    body: JSON.stringify({
                        'post_id': post.id.slice(5)
                    })
                })
                .then(response => response.json())
                .then(() => {
                    update_like();
                })
                .catch(error => {
                    console.log(error);
                })
            }
        })
    }

    function update_like() {        
        Posts.forEach(post => {
            fetch('/update_like', {
                method: 'POST',
                body: JSON.stringify({
                    'post_id': post.id.slice(5)
                })
            })
            .then(response => response.json())
            .then(data => {
                const likeCount = data.like_count;
                post.querySelector('.like-count').innerHTML = likeCount;
            })
        })
    }
    
    
})