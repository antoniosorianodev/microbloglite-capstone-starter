"use strict"

window.onload = () => {
    // not ideal since I am declaring loginData twice, but this I wanted to reuse the function else where
    // we'll see how I feel later
    // ALSO, look in starter code this is probably not needed

    const username = parseLoginData("username");
    const token = parseLoginData("token");
    const profileForm = document.querySelector("#profileForm");
    const card = document.querySelector("#cardDescription");

    const newPostForm = document.querySelector("#newPostForm");
    newPostForm.addEventListener("submit", (event) => createNewPost(event, token));

    displayProfileData(card, username, token);

    const logoutButton = document.querySelector("#logoutButton");
    logoutButton.addEventListener("click", logout);
    profileForm.addEventListener("submit", (event) => updateProfile(event, username, token));
}

async function createNewPost(event, token) {
    event.preventDefault();

    const form = event.target;

    try {
        let response = await fetch(`${apiBaseURL}/api/posts`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                text: form.text.value
            })
        });

        let data = await response.json();

        if (response.ok) {
            alert("Yipeee! New post made");
        }
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}

async function updateProfile(event, username, token) {
    event.preventDefault();

    try {
        let response = await fetch(`${apiBaseURL}/api/users/${username}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                password: profileForm.password.value,
                bio: profileForm.bio.value,
                fullName: profileForm.fullName.value
            })
        });

        let data = await response.json();

        if (response.ok) {
            document.querySelector("#cardDescription").innerHTML = `
            <div>
                <div>
                    <b>Username:</b>
                    <div>${data.username}</div>
                </div>
                <div>
                    <b>Joined:</b>
                    <div>${data.createdAt}</div>
                </div>
                <div>
                    <b>Updated:</b>
                    <div>${data.updatedAt}</div>
                </div>
            </div>
            `;

            alert("Profile successfully updated");
        }
    } catch (error) {
        console.log(error);
    }
}

function parseLoginData(property) {
    const loginData = localStorage.getItem("login-data");
    const loginDataAsObject = JSON.parse(loginData);

    return loginDataAsObject[`${property}`];
}

async function displayProfileData(card, username, token) {
    let response = await fetch(`${apiBaseURL}/api/users/${username}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    let data = await response.json();

    populateCard(card, data);

    profileForm.fullName.value = data.fullName;
    profileForm.bio.value = data.bio;
}

function populateCard(card, data) {
    card.innerHTML = `
    <div>
        <b>Username:</b>
        <div>${data.username}</div>
    </div>
    <div>
        <b>Joined:</b>
        <div>${(new Date(data.createdAt)).toLocaleString()}</div>
    </div>
    <div>
        <b>Updated:</b>
        <div>${(new Date(data.updatedAt)).toLocaleString()}</div>
    </div>
    `;
}

// code mostly stolen straight from Gravatar documentation
document.addEventListener('DOMContentLoaded', () => {
    const loginData = getLoginData();
    console.log(loginData);

    // Step 1: Hash your email address using SHA-256.
    const hashedEmail = CryptoJS.SHA256(`${loginData.username}`);

    // Step 2: Construct the Gravatar URL.
    const gravatarUrl = `https://www.gravatar.com/avatar/${hashedEmail}`;

    // Step 3: Set the image source to the Gravatar URL.
    document.getElementById('gravatar-image').src = gravatarUrl;
});