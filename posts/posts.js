/* Posts Page JavaScript */

"use strict";

window.onload = () => {
    displayPosts();
}

async function displayPosts() {
    const token = parseToken();

    let response = await fetch(`${apiBaseURL}/api/posts`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    let data = await response.json();

    document.write(JSON.stringify(data));
}

function parseToken() {
    const loginData = localStorage.getItem("login-data");
    const loginDataAsObject = JSON.parse(loginData);

    return loginDataAsObject.token
}