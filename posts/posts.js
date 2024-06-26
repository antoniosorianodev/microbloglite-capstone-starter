/* Posts Page JavaScript */

"use strict";

window.onload = () => {
    const sortDDL = document.querySelector("#sortDDL");
    const logoutButton = document.querySelector("#logoutButton");
    const postsSection = document.querySelector("#postsSection");

    displayPosts(sortDDL, postsSection);

    logoutButton.addEventListener("click", logout);
    sortDDL.addEventListener("change", (event) => displayPosts(event.target, postsSection));
}

async function getPosts() {
    const loginData = getLoginData();

    try {
        let response = await fetch(`${apiBaseURL}/api/posts`, {
            headers: {
                Authorization: `Bearer ${loginData.token}`
            }
        });

        let posts = await response.json();

        return posts;
    } catch (error) {
        console.log(error);
    }
}

async function displayPosts(dropdown, postsSection) {
    // this also serves as a refresh since it's a new api call, maybe do on page load and never again? idk
    let posts = await getPosts();

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
            // that's good because it automatically comes sorted by most recent from api, no need to 
            console.log("how did I get here?");
            break;
    }

    // empty the posts section before adding more
    postsSection.innerHTML = "";

    const loginData = getLoginData();

    posts.forEach((post, idx) => {
        const newPost = document.createElement("div");

        let likedState = "unliked";
        let likeId;
        let deletePostButton = "";

        post.likes.forEach((userObject) => {
            if (userObject.username === loginData.username) {
                likedState = "liked";
                likeId = userObject._id;
            }
        })

        if (post.username === loginData.username) {
            deletePostButton = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash deleteButton" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                </svg>
                `;
        }

        newPost.innerHTML = `
            <div class="card mb-3 p-3" data-value="${post._id}">
            <div class="d-flex flex-row justify-content-between">
                <div class="pb-3"><b><i>@${post.username}</i></b></div>
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

    let likeButtons = document.querySelectorAll("[id*='likeButton']");

    likeButtons.forEach((likeButton) => {
        likeButton.addEventListener('click', (event) => {
            const currentLikeButton = event.currentTarget;

            // there is no way this is good, functional? yes. good? no.
            let currentPost = currentLikeButton.parentElement.parentElement;
            let currentPostId = currentPost.dataset.value;

            // this can be .toggle()
            if (currentLikeButton.classList.contains("unliked")) {
                currentLikeButton.classList.remove("unliked");
                currentLikeButton.classList.add("liked");

                likePost(currentLikeButton, currentPostId);
            } else {
                currentLikeButton.classList.add("unliked");
                currentLikeButton.classList.remove("liked");

                unlikePost(currentLikeButton, currentPostId);
            }

            console.log("After", currentLikeButton);
        });
    });

    let deleteButtons = document.querySelectorAll(".deleteButton");

    deleteButtons.forEach((deleteButton) => {
        deleteButton.addEventListener('click', (event) => {
            const currentdeleteButton = event.currentTarget;

            // there is no way this is good, functional? yes. good? no.
            let currentPost = currentdeleteButton.parentElement.parentElement.parentElement
            let currentPostId = currentPost.dataset.value;

            deletePost(currentPostId);
            console.log("After", currentdeleteButton);
        });
    });


}

async function likePost(likeButton, postId) {
    const loginData = getLoginData();

    let response = await fetch(`${apiBaseURL}/api/likes`, {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${loginData.token}`,
        },
        body: JSON.stringify({
            postId: `${postId}`
        })
    });
    let data = await response.json();

    console.log(data);

    likeButton.dataset.value = data._id;

    likeButton.nextElementSibling.innerHTML = `${Number(likeButton.nextElementSibling.innerHTML) + 1}`;
}

async function unlikePost(likeButton, postId) {
    const loginData = getLoginData();

    const likeId = likeButton.dataset.value;

    let response = await fetch(`${apiBaseURL}/api/likes/${likeId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${loginData.token}`,
        },
        body: JSON.stringify({
            postId: `${postId}`
        })
    });
    let data = await response.json();

    console.log(data);

    likeButton.nextElementSibling.innerHTML = `${Number(likeButton.nextElementSibling.innerHTML) - 1}`;
}

async function deletePost(postId) {
    const loginData = getLoginData();
    console.log("I'm in here")
    let response = await fetch(`${apiBaseURL}/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${loginData.token}`,
        }
    });
    let data = await response.json();
    console.log(data);
}