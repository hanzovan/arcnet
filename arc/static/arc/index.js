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
            })            
            return false;
        }
    }
    function load_posts(page_num) {
        // Hide compose view, show the the posts view
        newPostView.style.display = 'none';
        allPostsView.style.display = 'block';
        
        // Create a post container
        let postsContainer = document.createElement('div');
        postsContainer.className = 'container';
        postsContainer.id = 'posts-container';
        allPostsView.appendChild(postsContainer);

        // Get the posts from server
        fetch(`/get_posts/${page_num}`)
        .then(response => response.json())
        .then(data => {
            const posts = data.posts;
            posts.forEach(post => {
                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                postDiv.id = `post-${post.id}`;

                const auThor = document.createElement('a');
                auThor.className = 'author';
                auThor.innerHTML = `<strong>${post.author}</strong>`;
                auThor.style.cursor = 'pointer';

                const timeStamp = document.createElement('span');
                timeStamp.className = 'post-timestamp';
                timeStamp.innerHTML = `${post.created}`;

                const conTent = document.createElement('p');
                conTent.className = 'post-content';
                conTent.innerHTML = `${post.content}`;

                const likeBtn = document.createElement('button');
                likeBtn.className = 'btn btn-sm btn-link like-btn';
                likeBtn.innerHTML = '&#128077;&#127999;';

                const likeCount = document.createElement('span');
                likeCount.className = 'like-count';
                likeCount.innerHTML = '0';

                postDiv.appendChild(auThor);
                postDiv.appendChild(timeStamp);
                postDiv.appendChild(conTent);
                postDiv.appendChild(likeBtn);
                postDiv.appendChild(likeCount);
                postsContainer.appendChild(postDiv);
            })
        })
        .catch(error => {
            console.log(error);
        })
    }

    // By default load posts
    load_posts(1);
})
