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
        const responseCode = response.status;

        // this is may or may not the best way to handle errors but it covers everything? idk will have to ask
        switch (responseCode) {
            case 201:
                alert("Success! New user created");
                window.location.href = "../"
                break;
            case 400:
                alert("Bad request :L")
                break;
            case 409:
                alert("Sorry, that user already exists");
                break;
        }

    } catch (error) {
        alert("Something went wrong :L");
        console.log(error);
    }
}