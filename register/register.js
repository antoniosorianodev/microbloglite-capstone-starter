"use strict";

window.onload = () => {
    const registerForm = document.querySelector("#register");

    registerForm.addEventListener("submit", (event) => createUser(event));
}

async function createUser(event) {
    // this prevents the submit event's behaviours (refreshing the page)
    event.preventDefault();

    // this takes the register form and creates an object from it's entries
    const formData = new FormData(event.target);
    const formDataAsObject = Object.fromEntries(formData);

    try {

        const response = await fetch(`${apiBaseURL}/api/users`, {
            method: "POST",
            headers: { "Content-type": "application/json; charset=UTF-8" },
            body: JSON.stringify(formDataAsObject)
        });

        const newUser = await response.json();
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