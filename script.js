// ==================================================================================
// Hamburger Menu
// ==================================================================================

const hamburgerMenu = document.querySelector(".hamburger-menu");
const hamburgerMenuLines = document.querySelector(".hamburger-menu-lines");
const lines = document.querySelectorAll(".line");

hamburgerMenuLines.addEventListener("click", function() {
    // Toggle "active" class
    hamburgerMenu.classList.toggle("active");

    // Toggle "active" class for hamburger lines
    lines.forEach((line) => {
        line.classList.toggle("active-line");
    });
});

// ==================================================================================
// Shorten Link
// ==================================================================================

const longURL = document.getElementById("url-input");
const copyURLpart = document.querySelector(".copy-paste-link");

let btnInput = document.querySelector(".btn-input");
let infoTxt = document.getElementById("info-txt");

function isValidHttpUrl(string) {
    // Initialize new variable
    let newUrl;

    // Validation check
    try {
        newUrl = new URL(string);
        return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
    } catch (error) {
        return false;  
    }
}

function changeBtnStyle(btn) {
    // Reset button style
    btn.style.setProperty("background-color", "aqua");
    btn.removeAttribute("disabled");
    btn.textContent = "Copy";
}

async function shortURL() {
    // Declaring 'input' value inside the function (not in global scope!!!)
    let longURLTxt = document.getElementById("url-input").value.trim();

    // Print out the value (for debugging purposes)
    console.log(longURLTxt);

    try {
        // Calling confirmation URL functions
        if (longURLTxt === "") {
            console.error("Please fill the input.");

            // Update HTML content
            infoTxt.textContent = "Please fill the input.";
            infoTxt.style.setProperty("display", "flex");
            longURL.classList.add("invalid-url");
            return;
        }

        if (!isValidHttpUrl(longURLTxt)) {
            console.error("Invalid URL provided.");

            // Update HTML content
            infoTxt.textContent = "Invalid URL provided.";
            infoTxt.style.setProperty("display", "flex");
            longURL.classList.add("invalid-url");
            return;
        }

        // Loading 'input' button status
        btnInput.setAttribute("disabled", "");
        btnInput.style.setProperty("background-color", "gray");
        btnInput.style.cursor = "not-allowed";
        btnInput.textContent = "Shortening...";

        // Fetch API
        const response = await fetch(`https://api.tinyurl.com/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 1A9H75tBNAUXh7yEa7pbU4idzhHlff7nBnMtBbsfPgdKxfzgWzoadJLQYYYE',
            },
            body: JSON.stringify({
                url: longURLTxt,
                domain: "tinyurl.com"
            }),
        });

        // Check if response is successful
        if (!response.ok) {
            // Update HTML content
            infoTxt.textContent = "HTTP error! Please try again.";
            infoTxt.style.setProperty("display", "flex");
            longURL.classList.add("invalid-url");

            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Convert to .JSON
        const data = await response.json();
        console.log("Full API Response:", data);

        // Update HTML content
        infoTxt.style.setProperty("display", "none");
        longURL.classList.remove("invalid-url");
        copyURLpart.style.setProperty("display", "flex");

        // Return default style for 'input' button
        btnInput.removeAttribute("disabled");
        btnInput.style.setProperty("background-color", "aqua");
        btnInput.style.cursor = "pointer";
        btnInput.textContent = "Shorten it!";

        // Console log created value from .JSON
        console.log("Shortened URL: ", data.data.tiny_url);

        // Get existing links or start fresh
        let links = JSON.parse(localStorage.getItem("links")) || [];

        // Add the new one
        const newLink = {
            id: Date.now(),
            long: longURLTxt,
            short: data.data.tiny_url
        };

        links.push(newLink);
        localStorage.setItem("links", JSON.stringify(links));

        // Create a new list element
        addLinkToUI(newLink);
    } catch(error) {
        console.error(error);
    }
}

function addLinkToUI(linkObj) {
    // Create <li>
    const li = document.createElement("li");
    li.classList.add("li-class");
    li.dataset.id = linkObj.id;

    // Original URL
    li.textContent = linkObj.long;

    // Right-side container
    const div = document.createElement("div");

    // Shortened link
    const a = document.createElement("a");
    a.href = linkObj.short;
    a.textContent = linkObj.short;
    a.target = "_blank";

    // Copy button
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy";

    copyBtn.addEventListener("click", () => {
        // Copy to clipboard
        navigator.clipboard.writeText(linkObj.short);

        // Change style
        copyBtn.style.setProperty("background-color", "rgb(59, 48, 82)");
        copyBtn.setAttribute("disabled", "");
        copyBtn.classList.add("copy-btn");
        copyBtn.textContent = "Copied!";

        // Reset style
        setTimeout(() => changeBtnStyle(copyBtn), 3000);
    });

    // Delete button
    const deleteDiv = document.createElement("div");
    deleteDiv.classList.add("delete-icon");
    for(let i = 0; i < 2; i++) {
        const span = document.createElement("span");
        deleteDiv.appendChild(span);
    }

    deleteDiv.addEventListener("click", () => deleteLink(linkObj.id, li));

    // Assemble
    div.append(a, copyBtn, deleteDiv);
    li.appendChild(div);
    copyURLpart.appendChild(li);
}

function deleteLink(id, liElement) {
    // Remove from localStorage
    let links = JSON.parse(localStorage.getItem("links")) || [];
    links = links.filter(link => link.id !== id);
    localStorage.setItem("links", JSON.stringify(links));

    // Remove from UI
    liElement.remove();
}

btnInput.addEventListener("click", () => shortURL());

window.addEventListener("submit", function(event) {
    event.preventDefault();
});

window.addEventListener("DOMContentLoaded", () => {
    const savedLinks = JSON.parse(localStorage.getItem("links")) || [];
    if(savedLinks.length > 0) {
        copyURLpart.style.display = "flex";
    }
    savedLinks.forEach(link => addLinkToUI(link));
});
