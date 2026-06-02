document.addEventListener("DOMContentLoaded", () => {
    if (typeof AOS !== "undefined") {
        AOS.init();
    }

    const homeButton = document.getElementById("home-button");
    const folderButton = document.getElementById("folder-button");
    const templateButton = document.getElementById("template-button");
    const moreButton = document.getElementById("apps-button");
    const searchForm = document.querySelector(".search-bar");

    if (homeButton) {
        homeButton.addEventListener("click", () => {
            window.location.href = "home.html";
        });
    }

    if (folderButton) {
        folderButton.addEventListener("click", () => {
            window.location.href = "saved-scrapbooks.html";
        });
    }

    if (templateButton) {
        templateButton.addEventListener("click", () => {
            window.location.href = "creative-corner.html";
        });
    }

    if (moreButton) {
        moreButton.addEventListener("click", () => {
            window.location.href = "about-us.html";
        });
    }

    if (searchForm) {
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
        });
    }
});