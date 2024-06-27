/* Posts Page JavaScript */

"use strict";

window.onload = () => {
    // these lines get the login data and save the username and token properties from it respectively,
    // this is so that we only do this logic on page load and can pass down the values where needed, without recalculating
    const loginData = getLoginData();
    const username = loginData.username;
    const token = loginData.token;

    // navbar element
    const logoutButton = document.querySelector("#logoutButton");

    // posts section elements
    const sortDDL = document.querySelector("#sortDDL");
    const postsSection = document.querySelector("#postsSection");

    displayPosts(sortDDL, postsSection, token, username);

    logoutButton.addEventListener("click", logout);
    sortDDL.addEventListener("change", (event) => displayPosts(event.target, postsSection, token, username));
}

async function getPosts(token) {
    try {
        const response = await fetch(`${apiBaseURL}/api/posts`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const posts = await response.json();

        return posts;
    } catch (error) {
        console.log(error);
    }
}

async function displayPosts(dropdown, postsSection, token, username) {

    // this also serves as a refresh since it's a new api call, maybe do on page load and never again? idk
    let posts = await getPosts(token);

    // sort functionality for displaying posts
    switch (dropdown.value) {
        case "author":
            posts.sort(function (a, b) {
                if (a.username.toLowerCase() < b.username.toLowerCase()) {
                    return -1;
                }
                if (a.username.toLowerCase() > b.username.toLowerCase()) {
                    return 1;
                }
                return 0;
            });
            break;
        case "likes":
            posts.sort((a, b) => b.likes.length - a.likes.length);
            break;
        default:
            // everything else falls in here, even the "recent" case
            // that's good because the data is already sorted by most recent when the api call is made
            break;
    }

    // empty the posts section before adding more
    postsSection.innerHTML = "";

    const trashCanIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash deleteButton" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
        </svg>
        `;

    posts.forEach((post, idx) => {
        const newPost = document.createElement("div");

        // these are decleared outside of their respective loops/if conditions so that they are in scope for the construction,
        // must use "let" instead of "const" because values can change
        let likedState = "unliked";
        let deletePostButton = "";
        let likeId;

        // changed from a forEach to for loop to stop the loop early if needed
        for (let i = 0; i < post.likes.length; i++) {
            if (post.likes[i].username === username) {
                likedState = "liked";
                likeId = post.likes[i]._id;
                break;
            }
        }

        if (post.username === username) {
            deletePostButton = trashCanIcon;
        }

        newPost.innerHTML = `
            <div class="card mb-3 p-3 shadow-sm" data-value="${post._id}">
            <div class="d-flex flex-row justify-content-between">
                <div class="pb-3"><b><i>${post.username}</i></b></div>
                <div>${deletePostButton}</div>
            </div>
                <div class="pb-3">
                    <div class="pb-3">${post.text}</div>
                </div>
                <div class="d-flex flex-row justify-content-between">
                <div>
                    <svg data-value="${likeId}"xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill ${likedState}" id="likeButton${idx}" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
                    </svg> <span id="likeCounter${idx}">${post.likes.length}</span>
                    </div>

                    <div class="pb-1">${(new Date(post.createdAt)).toLocaleString()}</div>
                    </div>
            </div>
        `;
        postsSection.appendChild(newPost);
    });

    const likeButtons = document.querySelectorAll("[id*='likeButton']");

    likeButtons.forEach((likeButton) => {
        likeButton.addEventListener('click', (event) => {
            const currentLikeButton = event.currentTarget;

            // there is no way this is good, functional? yes. good? no.
            const currentPost = currentLikeButton.parentElement.parentElement.parentElement;
            const currentPostId = currentPost.dataset.value;

            // check if likePost or unlikePost should be used
            if (currentLikeButton.classList.contains("unliked")) {
                likePost(currentLikeButton, currentPostId, token);
            } else {
                unlikePost(currentLikeButton, currentPostId, token);
            }

            // now we can change the classes
            currentLikeButton.classList.toggle("unliked");
            currentLikeButton.classList.toggle("liked");
        });
    });

    let deleteButtons = document.querySelectorAll(".deleteButton");

    deleteButtons.forEach((deleteButton) => {
        deleteButton.addEventListener('click', (event) => {
            const currentdeleteButton = event.currentTarget;

            // there is no way this is good, functional? yes. good? no.
            const currentPost = currentdeleteButton.parentElement.parentElement.parentElement
            const currentPostId = currentPost.dataset.value;

            deletePost(currentPost, currentPostId, token);
        });
    });


}

async function likePost(likeButton, postId, token) {
    try {
        let response = await fetch(`${apiBaseURL}/api/likes`, {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                postId: `${postId}`
            })
        });
        let data = await response.json();

        console.log(data);

        // move these into a response.ok condition so we don't change things when the api call fails,
        // maintains the illusion that it's updating real-time
        if (response.ok) {
            likeButton.dataset.value = data._id;

            likeButton.nextElementSibling.innerHTML = `${Number(likeButton.nextElementSibling.innerHTML) + 1}`;
        }
    } catch (error) {
        console.log(error);
    }
}

async function unlikePost(likeButton, postId, token) {
    const likeId = likeButton.dataset.value;

    try {
        const response = await fetch(`${apiBaseURL}/api/likes/${likeId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                postId: `${postId}`
            })
        });
        const data = await response.json();

        console.log(data);

        likeButton.nextElementSibling.innerHTML = `${Number(likeButton.nextElementSibling.innerHTML) - 1}`;
    } catch (error) {
        console.log(error);
    }

}

async function deletePost(post, postId, token) {
    try {
        const response = await fetch(`${apiBaseURL}/api/posts/${postId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        const data = await response.json();

        if (response.ok) {
            alert("Post has been successfully deleted. Yipeee!");

            // this gets the post, then moves to it's container div, and clears it all
            post.parentElement.innerHTML = "";
        }

        console.log(data);
    } catch (error) {
        console.log(error);
    }
}