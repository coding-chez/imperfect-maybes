
/* =====================================
   IMPERFECT MAYBES
   Main JavaScript
===================================== */


/* 1. DOM ELEMENTS */

const thoughtForm = document.getElementById("thoughtForm");
const thoughtInput = document.getElementById("thoughtInput");
const categorySelect = document.getElementById("categorySelect");

const thoughtGrid = document.getElementById("thoughtGrid");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const charCount = document.getElementById("charCount");

const totalCount = document.getElementById("totalCount");
const allCount = document.getElementById("allCount");

const collectionTitle = document.getElementById("collectionTitle");

const newPromptButton = document.getElementById("newPrompt");
const promptText = document.getElementById("promptText");

const navigationItems = document.querySelectorAll(".nav-item");


/* 2. DATA */

const prompts = [
    "what is something you miss but rarely talk about?",
    "what if the thing you are waiting for is already here?",
    "what is a little thing that made you smile recently?",
    "what is something you wish you could tell your younger self?",
    "what is one uncertainty you have learned to live with?",
    "what does home feel like to you?",
    "what is something ordinary that you find beautiful?",
    "what is a dream you are quietly keeping?",
    "what would you do if you were not afraid of starting over?",
    "what is something you have outgrown but still appreciate?"
];

const categoryNames = {
    thoughts: "☁ Thought",
    maybes: "✧ Maybe",
    questions: "? Question",
    "little-things": "♡ Little thing"
};


/* 3. APPLICATION STATE */

let thoughts = loadThoughts();

let currentFilter = "all";

let searchTerm = "";


/* 4. LOCAL STORAGE */

function loadThoughts() {

    try {
        const savedThoughts = localStorage.getItem("imperfectMaybes");

        return savedThoughts ? JSON.parse(savedThoughts) : [];

    } catch (error) {
        console.error("Could not load saved thoughts:", error);
        return [];
    }

}


function saveThoughts() {

    try {
        localStorage.setItem(
            "imperfectMaybes",
            JSON.stringify(thoughts)
        );

    } catch (error) {
        console.error("Could not save thoughts:", error);
        alert("Your browser could not save this thought. Please check your storage settings.");
    }

}


/* 5. DATE AND GREETING */

function updateDate() {

    const dateElement = document.getElementById("currentDate");
    const greetingElement = document.getElementById("greeting");

    const now = new Date();

    dateElement.textContent = now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    }).toUpperCase();

    const hour = now.getHours();

    if (hour < 12) {
        greetingElement.textContent = "good morning, thinker.";
    } else if (hour < 18) {
        greetingElement.textContent = "good afternoon, thinker.";
    } else {
        greetingElement.textContent = "good evening, thinker.";
    }

}


/* 6. RANDOM PROMPT GENERATOR */

function generatePrompt() {

    const randomIndex = Math.floor(Math.random() * prompts.length);

    promptText.textContent = prompts[randomIndex];

}

newPromptButton.addEventListener("click", generatePrompt);


/* 7. CHARACTER COUNTER */

thoughtInput.addEventListener("input", function () {

    const currentLength = thoughtInput.value.length;

    charCount.textContent = `${currentLength} / 500`;

});


/* 8. ADD A NEW THOUGHT */

thoughtForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const content = thoughtInput.value.trim();

    const category = categorySelect.value;

    if (!content) {
        return;
    }

    const newThought = {
        id: crypto.randomUUID(),
        content: content,
        category: category,
        favorite: false,
        createdAt: new Date().toISOString()
    };

    thoughts.unshift(newThought);

    saveThoughts();

    thoughtForm.reset();

    charCount.textContent = "0 / 500";

    currentFilter = "all";
    searchTerm = "";
    searchInput.value = "";

    updateActiveNavigation();

    renderThoughts();

});


/* 9. FILTER THOUGHTS */

function getFilteredThoughts() {

    return thoughts.filter(function (thought) {

        const matchesCategory =
            currentFilter === "all" ||
            (currentFilter === "favorites" && thought.favorite) ||
            thought.category === currentFilter;

        const matchesSearch =
            thought.content.toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;

    });

}


/* 10. CREATE THOUGHT CARD */

function createThoughtCard(thought) {

    const card = document.createElement("article");
    card.className = "thought-card";

    const cardTop = document.createElement("div");
    cardTop.className = "card-top";

    const category = document.createElement("span");
    category.className = "category-tag";
    category.textContent = categoryNames[thought.category] || "☁ Thought";

    const date = document.createElement("span");
    date.className = "card-date";

    date.textContent = new Date(thought.createdAt).toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

    cardTop.append(category, date);


    const content = document.createElement("p");
    content.className = "card-text";
    content.textContent = thought.content;


    const actions = document.createElement("div");
    actions.className = "card-actions";


    const favoriteButton = document.createElement("button");

    favoriteButton.type = "button";
    favoriteButton.className = "card-action favorite";

    if (thought.favorite) {
        favoriteButton.classList.add("is-favorite");
    }

    favoriteButton.textContent = thought.favorite
        ? "♥ Saved"
        : "♡ Favorite";

    favoriteButton.setAttribute(
        "aria-pressed",
        String(thought.favorite)
    );

    favoriteButton.addEventListener("click", function () {
        toggleFavorite(thought.id);
    });


    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "card-action delete";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function () {
        deleteThought(thought.id);
    });


    actions.append(favoriteButton, deleteButton);

    card.append(cardTop, content, actions);

    return card;

}


/* 11. RENDER THOUGHTS */

function renderThoughts() {

    const filteredThoughts = getFilteredThoughts();

    thoughtGrid.replaceChildren();

    filteredThoughts.forEach(function (thought) {

        const card = createThoughtCard(thought);

        thoughtGrid.appendChild(card);

    });

    emptyState.classList.toggle(
        "visible",
        filteredThoughts.length === 0
    );

    if (filteredThoughts.length === 0) {

        const emptyTitle = emptyState.querySelector("h3");
        const emptyMessage = emptyState.querySelector("p");

        if (searchTerm) {
            emptyTitle.textContent = "no thoughts found.";
            emptyMessage.textContent = "maybe try another word?";
        } else {
            emptyTitle.textContent = "nothing here just yet.";
            emptyMessage.textContent = "every little collection starts somewhere.";
        }

    }

    totalCount.textContent =
        `${filteredThoughts.length} ${filteredThoughts.length === 1 ? "thought" : "saved"}`;

    allCount.textContent = thoughts.length;

    updateCollectionTitle();

}


/* 12. UPDATE COLLECTION TITLE */

function updateCollectionTitle() {

    const titles = {
        all: "little pieces of you.",
        thoughts: "thoughts passing through.",
        maybes: "things that might be.",
        questions: "things worth wondering.",
        "little-things": "the little things.",
        favorites: "ones worth keeping."
    };

    collectionTitle.textContent = titles[currentFilter] || titles.all;

}


/* 13. NAVIGATION */

function updateActiveNavigation() {

    navigationItems.forEach(function (item) {

        const isActive = item.dataset.filter === currentFilter;

        item.classList.toggle("active", isActive);

    });

}


navigationItems.forEach(function (item) {

    item.addEventListener("click", function () {

        currentFilter = item.dataset.filter;

        updateActiveNavigation();

        renderThoughts();

    });

});


/* 14. SEARCH */

searchInput.addEventListener("input", function () {

    searchTerm = searchInput.value.trim().toLowerCase();

    renderThoughts();

});


/* 15. FAVORITES */

function toggleFavorite(id) {

    thoughts = thoughts.map(function (thought) {

        if (thought.id === id) {

            return {
                ...thought,
                favorite: !thought.favorite
            };

        }

        return thought;

    });

    saveThoughts();

    renderThoughts();

}


/* 16. DELETE */

function deleteThought(id) {

    const confirmed = confirm(
        "are you sure you want to let this thought go?"
    );

    if (!confirmed) {
        return;
    }

    thoughts = thoughts.filter(function (thought) {
        return thought.id !== id;
    });

    saveThoughts();

    renderThoughts();

}


/* 17. INITIALIZE APPLICATION */

function init() {

    updateDate();

    generatePrompt();

    updateActiveNavigation();

    renderThoughts();

}

init();

console.log("imperfect maybes is connected!");