const queriesListName = "queries";
const lastIdKey = "lastQueryID";
const historyArrayKey = "historyArray";

function checkValidityOfLocalStorage() {
    if (typeof (Storage) === "undefined") {
        alert("This browser doesn't saving of search result. Please update the browser. You can still use the service.");
        return false;
    }
    return true;
}

function saveArray(id) {
    let queries = getArray(queriesListName)
    queries.unshift(id)
    localStorage.setItem(queriesListName, JSON.stringify(queries));
}

function getArray(key) {
    if (!checkValidityOfLocalStorage())
        return;
    let savedArrayJSON = localStorage.getItem(key);
    let array = []
    if (savedArrayJSON != null) {
        array = JSON.parse(savedArrayJSON);
    }
    return array;
}

function fetchHistoryArray() {
    let queriesArray = getArray(queriesListName);
    if(queriesArray.length === 0){
        alert("Empty");
        return;
    }
    queriesArray = queriesArray.reverse();

    $.ajax({
        url: "/get_history/",
        type: "POST",
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(queriesArray),
    }).done(function (result) {
        // let existingHistoryArray = getArray(historyArrayKey);
        // existingHistoryArray.push(result);
        /* following code replaces the existing history array with latest array.*/
        localStorage.setItem(historyArrayKey, JSON.stringify(result))
        console.log(result);
        updateHistoryUi(result);
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.log("fail: ", textStatus, errorThrown);
    });
}

function fetchOldHistoryArray() {
    let lastId = getLastId();
    if (lastId == null) {
        fetchHistoryArray();
        return;
    }
    let queriesArray = getArray(queriesListName);
    $.ajax({
        url: "/get_old_history/",
        type: "POST",
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({"lastId": lastId, "queriesArray": queriesArray}),
    }).done(function (result) {
        let existingHistoryArray = getArray(historyArrayKey);
        existingHistoryArray = existingHistoryArray.concat(result);
        localStorage.setItem(historyArrayKey, JSON.stringify(existingHistoryArray))
        updateHistoryUi(existingHistoryArray);
        console.log(existingHistoryArray);
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.log("fail: ", textStatus, errorThrown);
    });
}

function getLastId() {
    /*used for pagination*/
    let existingHistoryArray = getArray(historyArrayKey);
    let lastId = null;
    if (existingHistoryArray.length !== 0) {
        let lastElement = existingHistoryArray[existingHistoryArray.length - 1];
        lastId = lastElement['_id']['$oid'];
        localStorage.setItem(lastIdKey, lastId);
    }
    return lastId;
}

class Searches {
    constructor(queryObj) {
        this.queryObj = queryObj;
        this.status = "queued";
        this.result = "";
    }

    setStatus(status) {
        this.status = status;
    }

    setResult(result) {
        this.result = result;
    }
}

class Query {
    constructor(queryText, startDate, endDate, stepSize, frequency) {
        this.queryText = queryText;
        this.startDate = startDate;
        this.endDate = endDate;
        this.stepSize = stepSize;
        this.frequency = frequency;
    }
}

function storeSearch() {

}


function updateHistoryUi(list) {
    let historyListUl = document.getElementById('history-list');
    let button = document.createElement("button");
    button.innerText = "Load More";
    //clearList();
    button.setAttribute("onClick", "fetchOldHistoryArray()");
    for (let i = 0; i < list.length; i++) {
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(list[i]['query']['query']))
        li.setAttribute("class", "list-group-item")
        historyListUl.appendChild(createHistoryCard(list[i]['query']['query'], list[i]['query_status'], list[i]['timestamp']));
    }

    historyListUl.appendChild(button);
}

function createHistoryCard(name, status, time){
    let divCard = document.createElement("div");
    divCard.setAttribute("class", "card");
    let divCardBody = document.createElement("div");
    divCardBody.setAttribute("class", "card-body");
    let cardTitle = document.createElement("h5");
    cardTitle.setAttribute("class", "card-title");
    cardTitle.appendChild(document.createTextNode(name));
    divCardBody.appendChild(cardTitle);
    divCard.appendChild(divCardBody)
    return divCard;
}

function clearList(){
    let list = document.getElementById("history-list");
    list.innerHTML = "";
}