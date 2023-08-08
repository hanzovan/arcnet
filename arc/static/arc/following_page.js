document.addEventListener('DOMContentLoaded', function() {
    // Get the posts from HTML
    const posts = document.querySelectorAll(".post");

    // Update like count for every post
    update_like();

    function update_like() {
        posts.forEach(post => {
            fetch('/update_like', {
                method: 'POST',
                body: JSON.stringify({
                    'post_id': post.id.slice(5)
                })
            })
            .then(response => response.json())
            .then(data => {
                const like_count = data.like_count;
                post.querySelector('.like-count').innerHTML = `${like_count}`;
            })
            .catch(error => {
                console.log(error);
            })
        })
    }
    // Add eventlistener to like button knowing user already logged in
    posts.forEach(post => {
        post.querySelector('.like-btn').onclick = function() {
            fetch('/like_post', {
                method: 'POST',
                body: JSON.stringify({
                    'post_id': post.id.slice(5)
                })
            })
            .then(response => response.json())
            .catch(error => {
                console.log(error);
            })
            .then(() => {
                update_like();
            })
        }
    })

})