document.addEventListener('DOMContentLoaded', function() {
    // Define views
    const newPostView = document.querySelector('#new-post-view');
    const allPostsView = document.querySelector('#all-posts-view');

    // By default new post view should be hidden
    newPostView.style.display = 'none';
    allPostsView.style.display = 'none';


    // if the user logged in and is in the index page, show the button to create new post
    if (isAuthenticated && indexPage) {
        let i = document.createElement('a');
        i.className = 'nav-link active';
        i.innerHTML = 'New Post';
        i.style.cursor = 'pointer';
        i.onclick = compose;
        document.querySelector('#new-post').append(i);
    }
    // Define function
    function compose() {
        // Show the compose view, clear the input
        newPostView.style.display = 'block';
        allPostsView.style.display = 'none';

        const inputArea = newPostView.querySelector('#new-content');
        inputArea.value = '';

        // Focus to the area for user to start typing right away
        inputArea.focus();

        // Disable the submit button before any word was enter
        const submit_btn = newPostView.querySelector('#new-post-btn');
        submit_btn.disabled = true;

        // When user enter some character, allow user to click button
        inputArea.onkeyup = () => {
            // If area have content, enable the button
            if(inputArea.value.trim().length > 0) {
                submit_btn.disabled = false;
            } else {
                submit_btn.disabled = true;
            }
        }
        

        // When the form was submitted
        newPostView.querySelector('#new-post-form').onsubmit = function() {
            // Get the new post content
            let content = newPostView.querySelector('#new-content').value;
            
            // Send the content to the server to save
            fetch(`/compose_post`, {
                method: 'POST',
                body: JSON.stringify({
                    'content': content
                })
            })
            .then(() => {
                // After saved the post, hide the compose view
                newPostView.value = '';
                newPostView.style.display = 'none';
                load_posts(1);
            })            
            return false;
        }
    }
    function load_posts(page_num) {
        // Hide compose view, show the the posts view
        newPostView.style.display = 'none';
        allPostsView.style.display = 'block';

        // Clean the view
        allPostsView.innerHTML = '';
        
        // Create a post container
        const postsContainer = document.createElement('div');
        postsContainer.className = 'container';
        postsContainer.id = 'posts-container';
        allPostsView.appendChild(postsContainer);

        // Get the posts from server via fetching get_posts in view
        fetch(`/get_posts/${page_num}`)
        .then(response => response.json())
        .then(data => {
            const posts = data.posts;
            const has_next_page = data.has_next_page;
            const has_previous_page = data.has_previous_page;            

            // set up content and style for every post
            posts.forEach(post => {
                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                postDiv.id = `post-${post.id}`;

                const author = document.createElement('a');
                author.className = 'author';
                author.innerHTML = `<strong>${post.author}</strong>`;
                author.style.cursor = 'pointer';
                author.onclick = function() {
                    window.location.href = `/profile/${post.author_id}`;
                }
                

                const timeStamp = document.createElement('span');
                timeStamp.className = 'post-timestamp';
                timeStamp.innerHTML = `${post.created}`;

                const conTent = document.createElement('p');
                conTent.className = 'post-content';
                conTent.innerHTML = `${post.content}`;

                const likeBtn = document.createElement('button');
                likeBtn.className = 'btn btn-sm btn-link like-btn';
                likeBtn.innerHTML = '&#128077;&#127999;';

                // If user logged in, give the like button a function
                if (isAuthenticated) {
                    likeBtn.onclick = function() {
                        fetch('like_post', {
                            method: 'POST',
                            body: JSON.stringify({
                                'post_id': post.id
                            })
                        })
                        .then(response => response.json())
                        .then(() => {
                            updateLikes(posts);
                        })
                    }
                }                

                const likeCount = document.createElement('span');
                likeCount.className = 'like-count';
                likeCount.innerHTML = '0';                

                postDiv.appendChild(author);
                postDiv.appendChild(timeStamp);
                postDiv.appendChild(conTent);
                postDiv.appendChild(likeBtn);
                postDiv.appendChild(likeCount);
                postsContainer.appendChild(postDiv);

                // Add ability edit and remove post for only author of the post
                if (isAuthenticated && (post.author_id === user_id)) {
                    const editViewBtn = document.createElement('button');
                    editViewBtn.className = 'btn btn-lg btn-link edit-view-btn';
                    editViewBtn.innerHTML = `Edit`;
                    editViewBtn.onclick = function() {
                        // If user already click edit button and the form already shown, clear the form
                        if (postDiv.querySelector('.edit-view')) {
                            postDiv.querySelector('.edit-view').remove();
                        } else {
                            const formDiv = document.createElement('div');
                            formDiv.className = 'text-center edit-view';
                            formDiv.style = 'display: flex; justify-content: center;';
                            const editForm = document.createElement('form');
                            editForm.className = 'edit-form';
                            const textArea = document.createElement('textarea');
                            textArea.className = 'new-content';
                            textArea.innerHTML = `${conTent.innerHTML}`;
                            const saveBtn = document.createElement('button');
                            saveBtn.className = 'btn btn-primary save-btn';
                            saveBtn.innerHTML = 'Save';

                            // Add a form to edit the post
                            editForm.appendChild(textArea);
                            editForm.appendChild(saveBtn);

                            // Add eventlistener to edit form
                            editForm.onsubmit = function() {
                                fetch('edit_post', {
                                    method: 'POST',
                                    body: JSON.stringify({
                                        'post_id': post.id,
                                        'content': textArea.value,
                                        'type': 'edit'
                                    })
                                })
                                .then(response => response.json())
                                .then(() => {
                                    conTent.innerHTML = textArea.value;
                                    formDiv.remove();
                                })

                                return false;
                            }

                            formDiv.appendChild(editForm);                        
                            postDiv.appendChild(formDiv);
                        }                        
                    }
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'btn btn-lg btn-link delete-post-btn';
                    deleteBtn.innerHTML = 'Delete';
                    deleteBtn.onclick = function() {
                        fetch('edit_post', {
                            method: 'POST',
                            body: JSON.stringify({
                                'post_id': post.id,
                                'type': 'delete'
                            })
                        })
                        .then(response => response.json())
                        .then(() => {
                            postDiv.style.animationPlayState = 'running';
                            postDiv.addEventListener('animationend', function() {
                                postDiv.remove();
                            })                            
                        })
                    }

                    postDiv.appendChild(editViewBtn);
                    postDiv.appendChild(deleteBtn);

                    // Add reply button
                    const replyBtn = document.createElement('button');
                    replyBtn.className = 'btn btn-lg btn-link reply-btn';
                    replyBtn.innerHTML = 'Reply';

                    postDiv.appendChild(replyBtn);

                    // When reply button was clicked, create a reply view with a form for user to enter
                    replyBtn.onclick = function() {
                        const replyView = document.createElement('div');
                        replyView.className = 'text-center reply-view';
                        replyView.style.display = 'flex';
                        replyView.style.justifyContent = 'center';

                        const replyForm = document.createElement('form');
                        replyForm.className = 'reply-form';
                        const inputArea = document.createElement('textarea');
                        inputArea.className = 'reply-content';
                        const saveBtn = document.createElement('button');
                        saveBtn.className = 'btn btn-primary save-btn';
                        saveBtn.innerHTML = 'Save';
                        replyForm.appendChild(inputArea);
                        replyForm.appendChild(saveBtn);
                        replyView.appendChild(replyForm);
                        postDiv.appendChild(replyView);
                        // document.querySelector('h1').style.color = 'red';
                    }


                    
                }
            })

            function updateLikes(posts) {
                posts.forEach(post => {
                    fetch('update_like', {
                        method: 'POST',
                        body: JSON.stringify({
                            'post_id': post.id
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        const likeCount = data.like_count;
                        
                        let currentPost = document.querySelector(`#post-${post.id}`);

                        currentPost.querySelector('.like-count').innerHTML = `${likeCount}`;
                    })
                })                
            }

            updateLikes(posts);

            // Show the pagin link
            const pagingDiv = document.createElement('div');
            pagingDiv.className = 'pagination';

            if (has_previous_page) {
                const firstPage = document.createElement('a');
                firstPage.className = 'paging-link';
                firstPage.innerHTML = '&laquo; First';
                firstPage.onclick = () => load_posts(1);
                pagingDiv.append(firstPage);

                const previousPage = document.createElement('a');
                previousPage.className = 'paging-link';
                previousPage.innerHTML = 'Previous';                
                previousPage.onclick = () => load_posts(data.previous_page);
                pagingDiv.append(previousPage);                
            }

            const currentPage = document.createElement('span');
            currentPage.className = 'current-page';
            
            currentPage.innerHTML = `Page ${data.current_page} of ${data.last_page}`;
            pagingDiv.append(currentPage);

            if (has_next_page) {
                const nextPage = document.createElement('a');
                nextPage.className = 'paging-link';
                nextPage.innerHTML = 'Next';                
                nextPage.onclick = () => load_posts(data.next_page);
                pagingDiv.append(nextPage);

                const lastPage = document.createElement('a');
                lastPage.className = 'paging-link';
                lastPage.innerHTML = 'Last &raquo;';
                lastPage.onclick = () => load_posts(data.last_page);
                pagingDiv.append(lastPage);
            }
            
            allPostsView.appendChild(pagingDiv);
        })
        .catch(error => {
            console.log(error);
        })
    }

    // By default load posts
    load_posts(1);
})
