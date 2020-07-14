let currentlyShowing = document.getElementById("home");
let currentlySelectedMenu = document.getElementById('home_menu');

function showHistory() {
    fetchHistoryArray();
    selectMenu(document.getElementById("history_menu"))
    show(document.getElementById("history_content"))
}

function showHome() {
    selectMenu(document.getElementById("home_menu"))
    show(document.getElementById("home"))
}

function show(newElement) {
    $(currentlyShowing).hide()
    currentlyShowing = newElement;
    $(newElement).show()
}

function selectMenu(newMenuElement){
    currentlySelectedMenu.classList.remove("menu-selected");
    newMenuElement.classList.add("menu-selected");
    currentlySelectedMenu = newMenuElement;
}