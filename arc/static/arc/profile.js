document.addEventListener('DOMContentLoaded', function() {
    const Posts = document.querySelectorAll('.post');
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
})