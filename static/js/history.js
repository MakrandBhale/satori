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
    let refreshIcon = document.getElementById("refresh-icon");
    refreshIcon.classList.add("spin-refresh")
    let queriesArray = getArray(queriesListName);
    if (queriesArray.length === 0) {
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
        refreshIcon.classList.remove("spin-refresh")

        // let existingHistoryArray = getArray(historyArrayKey);
        // existingHistoryArray.push(result);
        /* following code replaces the existing history array with latest array.*/
        localStorage.setItem(historyArrayKey, JSON.stringify(result))
        console.log(result);
        updateHistoryUi(result);
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.log("fail: ", textStatus, errorThrown);
        refreshIcon.classList.remove("spin-refresh")

    });
}

function fetchLoadMoreContent() {
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
    clearList();
    button.setAttribute("onClick", "fetchLoadMoreContent()");
    for (let i = 0; i < list.length; i++) {
        let listItem = document.createElement('div');
        listItem.setAttribute("class", "list-group-item");
        listItem.innerHTML = getTemplate(
            list[i]['query']['query'],
            list[i]['query']['startDate'],
            list[i]['query']['endDate'],
            list[i]['query_status'],
            list[i]['timestamp'],
            list[i]['total_tweets'],
            list[i]['_id']['$oid']
        );
        if(list[i]['query_status'] === "queued"){
            sendRequestForId(list[i]['_id']['$oid'])
        }

        historyListUl.appendChild(listItem)
        // let li = document.createElement("li");
        // li.appendChild(document.createTextNode(list[i]['query']['query']))
        // li.setAttribute("class", "list-group-item")
        //historyListUl.appendChild(createHistoryCard(list[i]['query']['query'], list[i]['query_status'], list[i]['timestamp']));
    }
    let buttonContainer = document.createElement('div');
    buttonContainer.innerHTML = getLoadMoreButtonTemplate();

    historyListUl.appendChild(buttonContainer);
}

function clearList() {
    let list = document.getElementById("history-list");
    list.innerHTML = "";

}

function getDateString(timestamp) {
    timestamp = timestamp * 1000;
    let timestampDate = new Date(timestamp);
    let today = new Date();
    let diff = Math.abs(today - timestampDate);
    let minutes = Math.floor((diff / 1000) / 60);
    if (minutes < 5) {
        return "Just now"
    }

    if (timestampDate.getDate() === today.getDate()) {
        return "Today"
    } else if ((today.getDate() - timestampDate.getDate()) === 1) {
        return "Yesterday"
    } else {
        return timestampDate.toDateString();
    }

}

function getStatusTemplate(queryStatus) {
    if (queryStatus === "finished") {
        return ` <span class="small-text green-light-background">
            <i class='bx bxs-check-circle' style='color:#39c00d;'></i>
            Finished
        </span>`;
    } else if (queryStatus === "queued") {
        return ` <span class="small-text yellow-light-background">
            <i class='bx bxs-time-five' style='color:#ff8800'  ></i>
            Queued
        </span>`;
    } else {
        return ` <span class="small-text red-light-background">
            <i class='bx bxs-error-circle' style='color:#cc0000'  ></i>
            Failed
        </span>`;
    }
}

function getTemplate(name, startDate, endDate, queryStatus, searchedDate, tweetCount, searchId) {
    return `
        
        <div class="d-flex w-100 flex-column">
            <div class="row marginal">
            <div class="d-flex  col-12 justify-content-between">
                <span class="large-text">${name}</span>
                ${getStatusTemplate(queryStatus)}
            </div>
            </div>
<!--
            <table style="table-layout: auto; margin-bottom: 12px" cellspacing="0" cellpadding="0">
                <tr>
                    <td style="white-space: nowrap">
                        <span class="large-text center">${name}</span>
                    </td>
                    <td style="width: 100%"></td>
                    <td style="white-space: nowrap; margin-left: 8px">
                        ${getStatusTemplate(queryStatus)}
                    </td>
                    
                </tr>
            </table>-->
            <h6 class="card-subtitle mb-2 small-text text-muted">
                <span class="small-text ">${startDate}</span>
                <span class="small-text"><i class='bx bx-arrow-back bx-rotate-180'
                                            style='color:#1a59f6'></i></span>
                <span class="small-text">${endDate}</span>

            </h6>

            <p>
            <!-- templates are awesome! here sometimes tweet count is undefined so nothing is shown-->
                ${tweetCount ? `<span class="med-text">${tweetCount}</span>
                <span class="regular-text"> tweets scraped.</span>` : ''
    }
                
            </p>
            <div class="d-flex justify-content-between align-items-center">
<!--                disable the button if process is not finished yet-->
                <button class="material-text-button" onclick="loadPreviousQuery('${searchId}', this)" ${queryStatus !== "finished" ? ` disabled` : ``}>View Result</button>
                <p class="card-text"><small class="text-muted">${getDateString(searchedDate)}</small></p>
            </div>

        </div>


        

    `;
}

function loadPreviousQuery(searchId, button) {
    button.innerText = "Loading...";
    button.disabled = true;
    getTaskResult(searchId);
    showHome();
}

function getLoadMoreButtonTemplate() {
    return `<button class="col-12 outline-material-button" onclick="fetchLoadMoreContent()">Load More</button>`;
}

