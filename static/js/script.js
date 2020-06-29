window.total = 0;
window.posCount = 0;
window.negCount = 0;
window.neutralCount = 0;

class PieChart {
    constructor() {
        this.pieData = new Map();
    }

    addData(arr) {
        for (let i = 0; i < arr.length; i++) {
            if (this.pieData.has(arr[i][0])) {
                let temp = this.pieData.get(arr[i][0]);
                this.pieData.set(arr[i][0], temp + arr[i][1])
            } else {
                this.pieData.set(arr[i][0], arr[i][1])
            }
        }
        //console.log(this.getTopFive())
    }

    getTopFive() {
        this.sortedMap = new Map([...this.pieData.entries()].sort((a, b) => b[1] - a[1]));
        //console.log(this.sortedMap);
        let temp = this.sortedMap.entries();
        let topFive = [];
        for (let i = 0; i < 5; i++) {
            topFive.push(temp.next().value);
        }
        return topFive;
    }
}

function loadDoc() {
    //alert("called");
    document.getElementById('query').disabled = true;
    $("#loading-content").show();
    $("#content").hide();
    wipeMainChart();
    $("#loader").show();
    $("#drop-down-button-container").hide();
    hideAdvancedSearchOptions();
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        let dataList;
        if (this.readyState === 4) {
            if (this.status === 200) {
                //alert("response received")
                dataList = this.responseText;
                //console.log(dataList)
                window.jobList = JSON.parse(dataList)
                getUpdateFromServer()
                // loadChart(dataList)
            } else {
                let errorResponse = JSON.parse(this.response);
                alert(errorResponse.message);
                //console.log(this.response);
            }
            $("#loader").hide();
            $("#drop-down-button-container").show();
            document.getElementById('query').disabled = false;
        }

    };
    let params = prepareParameters();
    xhttp.open("POST", "/", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(params);

}

hideAdvancedSearchOptions();

function prepareParameters() {
    let query = document.getElementById("query").value;
    let startDate = document.getElementById("start-date-picker").value;
    let endDate = document.getElementById("end-date-picker").value;
    let stepCount = document.getElementById('step-input').value;
    let tweetFrequency = document.getElementById("tweet-frequency").value;
    //console.log(stepCount)
    return JSON.stringify({
        query: query,
        startDate: startDate,
        endDate: endDate,
        stepCount: stepCount,
        tweetFrequency: tweetFrequency
    })
}

class TimeFragment {
    constructor(name, negative, neutral, positive) {

    }
}

/*
    let datalist = JSON.parse('{{ response | tojson | safe}}');

    if (datalist !== '') {
        loadChart(datalist)
    }
*/

function setupIndicators() {
    document.querySelector("#positive-tweets-number").innerHTML = "<b>" + window.posCount + "</b>";
    document.querySelector("#negative-tweets-number").innerHTML = "<b>" + window.negCount + "</b>";
    document.querySelector("#neutral-tweets-number").innerHTML = "<b>" + window.neutralCount + "</b>";
    document.querySelector("#total-tweets-number").innerHTML = "<b>" + window.total + "</b>";
}


function wipeMainChart() {
    window.total = 0;
    window.posCount = 0;
    window.negCount = 0;
    window.neutralCount = 0;
    //console.log("indicators reset")
    //console.log(total + window.posCount + window.negCount + window.neutralCount);
    if (window.mainChart !== undefined) {
        //console.log("Main chart wiped")
        window.mainChart.destroy();
        window.mainChart = undefined;
    }
    if (window.wordCloudChart) {
        //console.log("word chart wiped");
        window.wordCloudChart.destroy();
        window.wordCloudChart = undefined;
    }
    pieChart = new PieChart();
    window.pcg = 0;
    window.old_value = 0;
    updateProgressBar();
}

function loadChart(response) {
    //console.log("chartdata: " + res);
    //let response = JSON.parse(res)
    //console.log(response);
    let datalist = response.timeFragment;

    let positive = [], negative = [], neutral = [];
    let dates = [];
    let date = new Date(parseFloat(datalist.name) * 1000);
    let options = {month: 'long', day: 'numeric', year: 'numeric'};
    let formatted_date = date.toLocaleDateString("en-US", options);
    positive.push(datalist.positive);
    window.posCount = window.posCount + datalist.positive;
    negative.push(datalist.negative);
    window.negCount = window.negCount + datalist.negative;
    neutral.push(datalist.neutral);
    window.neutralCount = window.neutralCount + datalist.neutral;
    dates.push(formatted_date);
    window.total = datalist.total + window.total;

    setupIndicators();
    /*positive.reverse();
    negative.reverse();
    neutral.reverse();
    dates.reverse();*/
    if (window.mainChart === undefined) {
        plotMainChart(positive, negative, neutral, dates)
    } else {

        window.mainChart.data.labels.push(dates);
        window.mainChart.data.datasets[0].data.push(positive[0]);
        window.mainChart.data.datasets[1].data.push(negative[0]);
        window.mainChart.data.datasets[2].data.push(neutral[0]);
        /*window.mainChart.data.datasets.forEach((dataset)=>{
            dataset.data.push(positive,negative,neutral)
        })*/
        window.mainChart.update();
    }

    plotWordFrequencyChart(response.freqDist)
    setupLinkFrequencyList(response.linkFreqDist)
}

function setupLinkFrequencyList(linkFreqDist) {
    let linkList = [], frequency = [];
    for (let i = 0; i < linkFreqDist.length; i++) {
        linkList.push(linkFreqDist[i][0]);
        frequency.push(linkFreqDist[i][1]);
    }
    let list = document.getElementById("link-list-id");
    list.innerHTML = "";
    let collapsiblediv = document.createElement("DIV");
    collapsiblediv.setAttribute("id", "remaining-list");

    for (let i = 0; i < linkList.length; i++) {
        let urlObj;
        try {
            urlObj = new URL(linkList[i]);
        } catch (err) {
            //console.log(err);
            urlObj = {"host": linkList[i]};
        }


        //console.log(urlObj)
        let text = document.createTextNode(urlObj.host)
        let freqText = document.createTextNode(frequency[i])
        let listItem = document.createElement("LI");
        let badge = document.createElement("SPAN");
        collapsiblediv.classList.add("collapse");
        badge.classList.add("badge", "badge-primary", "badge-pill");
        //badge.classList.add("badge", "custom-highlighter");
        badge.appendChild(freqText);
        listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center", "no-border-list", "list-group-item-action");
        listItem.appendChild(text);
        listItem.appendChild(badge);
        listItem.addEventListener("click", function () {
            window.open(linkList[i], "_blank");
        })
        if (i >= 5) {
            collapsiblediv.appendChild(listItem)
        } else {
            list.appendChild(listItem)
        }

    }
    if (collapsiblediv.childElementCount > 0) {
        list.appendChild(collapsiblediv);
        $('#view-all-button').show();
    }
}

let pieChart = new PieChart();

function plotWordFrequencyChart(fragmented_freqdist) {
    if (window.wordCloudChart !== undefined) {
        window.wordCloudChart.destroy();
        window.wordCloudChart = undefined;
    }
    let freqChart = document.getElementById('wordFrequencyChart').getContext('2d');
    //console.log("Pie chart below")
    pieChart.addData(fragmented_freqdist);
    let freqDist = pieChart.getTopFive();
    let wordList = []
    let frequency = []
    for (let i = 0; i < freqDist.length; i++) {
        wordList.push(freqDist[i][0]);
        frequency.push(freqDist[i][1]);
    }

    let data = {
        labels: wordList,
        datasets: [
            {
                backgroundColor: ['#0000FF', '#0066FF', '#0099FF', '#00CCFF', '#00FFFF', '#4981FD', '#ffa733', '#ffcf33', '#ffee33', '#76ff03'],
                fill: true,
                data: frequency,
                borderWidth: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
        ]
    };
    if (window.wordCloudChart) {
        window.wordCloudChart.destroy();
    }
    window.wordCloudChart = new Chart(freqChart, {
        type: 'doughnut',
        data: data,
        options: {

            legend: {
                display: true,
                position: 'right',
                align: 'start'

            }
        }
    });
}

let myChart = document.getElementById('myChart').getContext('2d');

function plotMainChart(positive, negative, neutral, dates) {

    let gradient = myChart.createLinearGradient(0, 500, 0, 100);
    gradient.addColorStop(0, "rgba(241, 7, 94, 0.38)");
    gradient.addColorStop(0.5, "rgba(249, 144, 183, 0)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    let blueGradient = myChart.createLinearGradient(0, 0, 0, 450);
    blueGradient.addColorStop(0, 'rgba(73,129,253,0.3)');
    blueGradient.addColorStop(0.5, 'rgba(73,129,253,0.1)');
    blueGradient.addColorStop(1, 'rgba(73,129,253,0)');

    let greyGradient = myChart.createLinearGradient(0, 0, 0, 450);
    greyGradient.addColorStop(0, 'rgb(109,115,132,0.6)');
    greyGradient.addColorStop(0.5, 'rgb(57, 62, 70, 0.25)');
    greyGradient.addColorStop(1, 'rgb(57, 62, 70, 0)');

    window.mainChart = new Chart(myChart, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Positive',
                    data: positive,
                    borderColor: '#4981FD',
                    pointBackgroundColor: 'white',
                    radius: 4,
                    pointBorderWidth: 4,
                    fill: true,
                    backgroundColor: 'rgba(73,129,253,0.1)'
                },
                {
                    label: 'Negative',
                    data: negative,
                    borderColor: '#F1075E',
                    pointBackgroundColor: 'white',
                    pointBorderWidth: 4,
                    radius: 4,
                    fill: true,
                    backgroundColor: 'rgba(241,7,94,0.1)'
                },
                {
                    label: 'Neutral',
                    data: neutral,
                    borderColor: 'rgb(57, 62, 70, 0.6)',
                    pointBackgroundColor: 'white',
                    pointBorderWidth: 4,
                    radius: 4,
                    backgroundColor: greyGradient,
                    fill: false
                }
            ]
        },
        options: {}
    })
}

let specifiedElement = document.getElementById('dropdown');
let dropdownButton = document.getElementById('dropdownButton');
let query = document.getElementById('query');
let toggleOutsideDetectionListener = function (event) {
    /* a function to hide dropdown menu if user clicked outside of menu*/
    let isClickInside = false;
    if (specifiedElement.contains(event.target) || dropdownButton.contains(event.target) || query.contains(event.target)) {
        isClickInside = true;
    }
    if (!isClickInside) {
        hideAdvancedSearchOptions();
        removeShadow();
        //the click was outside the specifiedElement, do something
    }
}
document.addEventListener('click', toggleOutsideDetectionListener);

function toggleAdvancedSearchOption() {
    if ($("#dropdown").is(":visible")) {
        hideAdvancedSearchOptions()
    } else {
        showAdvanceSearchOptions()
    }
}


function showAdvanceSearchOptions() {

    $("#dropdown").toggle(1000);
    addShadow()
    let dropdownMenuIcon = document.getElementById('dropdown-menu-icon');
    dropdownMenuIcon.classList.add('rotate-up');
    dropdownMenuIcon.classList.remove('rotate-down');
}

function hideAdvancedSearchOptions() {
    $("#dropdown").hide(100);
    let dropdownMenuIcon = document.getElementById('dropdown-menu-icon');
    dropdownMenuIcon.classList.remove('rotate-up');
    dropdownMenuIcon.classList.add('rotate-down');
}

function addShadow() {
    let searchBox = document.getElementById("search-field");
    searchBox.classList.add("active-shadow")
}

function removeShadow() {
    let searchBox = document.getElementById("search-field");
    searchBox.classList.remove("active-shadow")
}

let expanded = false;

function expandListClicked() {
    //console.log("clikcke")
    let viewAllLink = document.getElementById('viewAllLink');
    let expandIcon = document.getElementById('expand-icon');
    if (!expanded) {
        viewAllLink.innerText = "View Less";

        expandIcon.classList.remove("rotate-down")
        expandIcon.classList.add("rotate-up")
    } else {
        viewAllLink.innerText = "View All";
        expandIcon.classList.add("rotate-down")
        expandIcon.classList.remove("rotate-up")
    }
    expanded = !expanded;
}

function getUpdateFromServer() {
    //console.log(window.jobList);
    window.total_job_count = window.jobList.length;
    window.old_value = 0;
    window.pcg = 0;
    startBoxAnimation();
    for (let i = 0; i < window.jobList.length; i++) {
        //console.log("sending request for job " + window.jobList[i]);
        sendRequestForId(window.jobList[i]);
    }
}

window.total_response = [];

function sendRequestForId(taskId) {
    //console.log("Task id : " + taskId);

    $.ajax({
        url: '/tasks/' + taskId,
        method: 'POST'
    })
        .done((res) => {
            if (res.data.task_res === "") {
                setTimeout(function () {
                    sendRequestForId(res.data.task_id);

                }, 1000);
            } else {
                let index = window.jobList.indexOf(res.data.task_id);
                if (index !== -1) window.jobList.splice(index, 1);
                window.total_response.push(res.data.task_res)
                console.log("job-list aray size" + window.jobList.length);
                console.log("old value " + window.old_value);
                console.log('pcg ' + window.pcg);
                window.pcg = Math.floor(window.total_response.length / window.total_job_count * 100);

                if (window.old_value <= window.pcg) {
                    window.requestAnimationFrame(updateProgressBar);
                }

                if (window.jobList.length === 0) {
                    //window.pcg = 0;
                    //window.old_value = 0;
                    postprocessing();
                    //console.log(window.total_response)
                }
                //loadChart(res.data.task_res)
            }
        })
        .fail((err) => {
            console.log(err);
        });
}

function postprocessing() {
    let timestampList = [];
    let responseMap = new Map();

    //console.log(typeof window.total_response);
    //console.log(window.total_response);
    window.total_response.sort(function (a, b) {
        return new Date(b.timeFragment.name) - new Date(b.timeFragment.name);
    })
    /*for(let i = 0; i<window.total_response.length;i++){
        let temp = window.total_response[i];
        let timestamp = temp.timeFragment[0].name;
        console.log(typeof timestamp);
        timestampList.push(timestamp);
        responseMap.set(timestamp, temp);
    }*/
    console.log(window.total_response);
    for (let i = 0; i < window.total_response.length; i++) {
        loadChart(window.total_response[i]);
    }
    window.total_response = [];
    setTimeout(function(){
        $("#loading-content").hide();
        $("#content").show();
    },2500);


}

const updateProgressBar = function () {

    document.getElementById("percentage-count").innerText = Number(window.old_value) + "%";
    document.getElementsByClassName('progress-bar').item(0).setAttribute('aria-valuenow', window.old_value);
    document.getElementsByClassName('progress-bar').item(0).setAttribute('style', 'width:' + Number(window.old_value) + '%');
    if (window.old_value < window.pcg) {
        //document.getElementById('progress-bar').classList.remove("progress-bar-striped", "progress-bar-animated")
        window.old_value++;
        window.requestAnimationFrame(updateProgressBar);
    } else {
        //document.getElementById('progress-bar').classList.add("progress-bar-striped", "progress-bar-animated")
    }
    if(window.old_value === 100){
        startDoneAnimation();
    }
}

function startBoxAnimation(){
    $("#box-animation").show();
    $("#done-animation").hide();
}

function startDoneAnimation() {
    $("#box-animation").hide()
    $("#done-animation").show();
}