"use strict"

window.onload = () => {
    // not ideal since I am declaring loginData twice, but this I wanted to reuse the function else where
    // we'll see how I feel later
    const username = parseLoginData("username");
    const token = parseLoginData("token");
    const profileForm = document.querySelector("#profileForm");

    displayProfileData(username, token);

    const logoutButton = document.querySelector("#logoutButton");
    logoutButton.addEventListener("click", logout);
    profileForm.addEventListener("submit", (event) => updateProfile(event, username, token));
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
            profileForm.bio.value = data.bio;
            profileForm.fullName.value = data.fullName;
            profileForm.updatedAt.value = data.updatedAt;
            alert("Profile successfully updated")
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

async function displayProfileData(username, token) {
    let response = await fetch(`${apiBaseURL}/api/users/${username}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    let data = await response.json();

    profileForm.fullName.value = data.fullName;
    profileForm.username.value = data.username;
    profileForm.bio.value = data.bio;
    profileForm.createdAt.value = data.createdAt;
    profileForm.updatedAt.value = data.updatedAt;
}