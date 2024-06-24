"use strict";

window.onload = () => {
    const registerForm = document.querySelector("#register");

    registerForm.addEventListener("submit", (event) => createUser(event));

    const logoutButton = document.querySelector("#logoutButton");
    logoutButton.addEventListener("click", logout);
}

async function createUser(event) {
    event.preventDefault();

    let formData = new FormData(event.target);
    let formDataAsObject = Object.fromEntries(formData);

    try {

        let response = await fetch(`${apiBaseURL}/api/users`, {
            method: "POST",
            headers: { "Content-type": "application/json; charset=UTF-8" },
            body: JSON.stringify(formDataAsObject)
        });

        let newUser = await response.json();

        if (response.status === 201) {
            alert("Success! New user created");
        } else if (response.status === 409) {
            alert("Sorry, that user already exists");
        }

    } catch (error) {
        alert("Something went wrong :L");
        console.log(error);
    }
}