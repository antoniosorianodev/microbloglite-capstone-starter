"use strict"

window.onload = () => {
    // not ideal since I am declaring loginData twice, but this I wanted to reuse the function else where
    // we'll see how I feel later
    const username = parseLoginData("username");
    const token = parseLoginData("token");

    displayProfileData(username, token);
}

function parseLoginData(property) {
    const loginData = localStorage.getItem("login-data");
    const loginDataAsObject = JSON.parse(loginData);

    return loginDataAsObject[`${property}`];
}

async function displayProfileData(username, token) {
    let response = await fetch(`${apiBaseURL}/api/users/${username}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    let data = await response.json();

    document.querySelector("#main").innerHTML = `
    <div>fullName${data.fullName}</div>
    <div>username${data.username}</div>
    <div>bio${data.bio}</div>
    <div>createdAt${data.createdAt}</div>
    <div>updatedAt${data.updatedAt}</div>
    `;
}