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

        post.likes.forEach((userObject) => {
            if (userObject.username === loginData.username) {
                likedState = "liked";
                likeId = userObject._id;
            }
        })

        newPost.innerHTML = `
            <div class="card mb-3 p-3" data-value="${post._id}">
            <div class="d-flex flex-row justify-content-between">
                <div class="pb-3"><b><i>@${post.username}</i></b></div>
                <div>${(new Date(post.createdAt)).toLocaleString()}</div>
            </div>
                <div class="pb-3">${post.text}</div>
                <div>
                    <svg data-value="${likeId}"xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill ${likedState}" id="likeButton${idx}" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
                    </svg> <span id="likeCounter${idx}">${post.likes.length}</span>
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