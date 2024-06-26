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

    posts.forEach(post => {
        const newPost = document.createElement("div");
        newPost.innerHTML = `
            <div class="card mb-3 p-3">
            <div class="d-flex flex-row justify-content-between">
                <div class="pb-3"><b><i>@${post.username}</i></b></div>
                <div>${(new Date(post.createdAt)).toLocaleString()}</div>
            </div>
                <div class="pb-3">${post.text}</div>
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                        <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                    </svg>
                    ${post.likes.length}
                </div>
            </div>
        `;
        postsSection.appendChild(newPost);
    });
}