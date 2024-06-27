"use strict"

window.onload = () => {
    // these lines get the login data and save the username and token properties from it respectively,
    // this is so that we only do this logic on page load and can pass down the values where needed, without recalculating
    const loginData = getLoginData();
    const username = loginData.username;
    const token = loginData.token;

    // navbar element
    const logoutButton = document.querySelector("#logoutButton");

    // profile section elements
    const card = document.querySelector("#cardDescription");
    const profileForm = document.querySelector("#profileForm");

    // post section elements
    const newPostForm = document.querySelector("#newPostForm");

    getProfilePicture(username);
    displayProfileData(card, username, token);

    logoutButton.addEventListener("click", logout);
    newPostForm.addEventListener("submit", (event) => createNewPost(event, token));
    profileForm.addEventListener("submit", (event) => updateProfile(event, username, token));
}

async function createNewPost(event, token) {
    // this prevents the submit event's behaviours (refreshing the page)
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
            alert("Post has been successfully created. Yipeee!");
            window.location.href = "../posts/"
        }
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}

async function updateProfile(event, username, token) {
    // this prevents the submit event's behaviours (refreshing the page)
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
                    <div>${new Date(data.createdAt).toLocaleString()}</div>
                </div>
                <div>
                    <b>Updated:</b>
                    <div>${new Date(data.updatedAt).toLocaleString()}</div>
                </div>
            </div>
            `;

            alert("Profile has been successfully updated. Yipeee!");
            location.reload();
        }
    } catch (error) {
        console.log(error);
    }
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

// code mostly stolen straight from Gravatar documentation, but tweaked for my use case
function getProfilePicture(username) {
    // Step 1: Hash your email address using SHA-256.
    const hashedEmail = CryptoJS.SHA256(`${username}`);

    // Step 2: Construct the Gravatar URL.
    const gravatarUrl = `https://www.gravatar.com/avatar/${hashedEmail}`;

    // Step 3: Set the image source to the Gravatar URL.
    document.querySelector("#gravatar-image").src = gravatarUrl;
}