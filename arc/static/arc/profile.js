document.addEventListener('DOMContentLoaded', function() {
    // When DOM content loaded, update like count
    const Posts = document.querySelectorAll('.post');
    update_like();

    // Hide all comments
    Posts.forEach(post => {
        post.querySelector('.post-comments').style.display = 'none';
    })

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
            // If user is author, edit and remove button already added
            if (post.querySelector('.edit-view-btn')) {

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
            }
            
            const replyView = post.querySelector('.reply-view');
            replyView.style.display = 'none';
            
            post.querySelector('.reply-btn').onclick = function() {                
                if (replyView.style.display === 'flex') {
                    replyView.style.display = 'none';
                } else {                   
                    replyView.style.display = 'flex';
                    const inputArea = post.querySelector('.reply-content');
                    inputArea.innerHTML = '';
                    post.querySelector('.reply-form').onsubmit = function() {
                        // send user input to server side for handling
                        fetch('/reply', {
                            method: 'POST',
                            body: JSON.stringify({
                                post_id: post.id.slice(5),
                                reply_content: inputArea.value
                            })
                        })
                        .then(response => response.json())
                        .then(() => {
                            // add new reply to post
                            const commentDiv = document.createElement('div');
                            commentDiv.className = 'reply';
                            const commentor = document.createElement('a');
                            commentor.className = 'commentor';
                            commentor.innerHTML = `<strong>${username}</strong>`;
                            const comment = document.createElement('span');
                            comment.className = 'comment';
                            comment.innerHTML = ` ${inputArea.value}`;

                            commentDiv.append(commentor);
                            commentDiv.append(comment);

                            post.querySelector('.post-comments').appendChild(commentDiv);

                            // Clear the editing form
                            replyView.style.display = 'none';

                            // Show all previous comment
                            post.querySelector('.post-comments').style.display = 'block';

                            // Update the showing comment button
                            const showCommentBtn = post.querySelector('.comments-showing-btn');
                            
                            // Get the number of comment count of the post
                            const currentCommentCount = parseInt(post.getAttribute('data-comment-count'));

                            // Update the number by + 1
                            const updatedCommentCount = currentCommentCount + 1;

                            // Update the comment count attribute
                            post.setAttribute('data-comment-count', updatedCommentCount);

                            // Modify the showCommentBtn.innerHTML
                            showCommentBtn.innerHTML = `Show ${updatedCommentCount} comments`;
                        })

                        return false;
                    }
                }
                
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
    Posts.forEach(post => {
        const commentShowBtn = post.querySelector('.comments-showing-btn');
        const thisPostComments = post.querySelector('.post-comments');
        commentShowBtn.onclick = function() {
            if (thisPostComments.style.display === 'block') {
                thisPostComments.style.display = 'none';
            } else {
                thisPostComments.style.display = 'block';
            }
        }
    })
    
    
})