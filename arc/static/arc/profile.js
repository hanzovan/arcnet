document.addEventListener('DOMContentLoaded', function() {
    // When DOM content loaded, update like count
    const Posts = document.querySelectorAll('.post');
    update_like();
    // Get all the post and add eventlistener to all like button if user logged in
    if (isAuthenticated) {
        Posts.forEach(post => {
            // If user click like, add like to the server and update like count for the post
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
            // If user click edit button, show the edit view which contain a form for editing, prefill with the old content
            post.querySelector('.edit-view-btn').onclick = function() {
                const editView = post.querySelector('.edit-view');
                if (editView.style.display === 'none') {
                    editView.style.display = 'flex';
                    const newContent = post.querySelector('.new-content');
                    newContent.innerHTML = post.querySelector('.post-content').innerHTML;

                    // When user submit form, send the new content to server, modify the content in HTML also
                    post.querySelector('.edit-form').onsubmit = function() {
                        const content = newContent.value;
                        fetch('/edit_post', {
                            method: 'POST',
                            body: JSON.stringify({
                                'post_id': post.id.slice(5),
                                'type': 'edit',
                                'content': content
                            })
                        })
                        .then(response => response.json())
                        .catch(error => {
                            console.log(error);
                        })
                        .then(() => {
                            post.querySelector('.post-content').innerHTML = newContent.value;
                            editView.style.display = 'none';
                        })

                        return false;
                    }
                } else {
                    editView.style.display = 'none';
                }
                
            }
            post.querySelector('.delete-post-btn').onclick = function() {
                fetch('/edit_post', {
                    method: 'POST',
                    body: JSON.stringify({
                        'post_id': post.id.slice(5),
                        'type': 'delete'
                    })
                })
                .then(response => response.json())
                .catch(error => {
                    console.log(error);
                })
                .then(() => {
                    post.style.animationPlayState = 'running';
                    post.addEventListener('animationend', function() {
                        post.remove();
                    })              
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