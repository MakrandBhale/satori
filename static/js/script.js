window.completedJobList = [];
window.total = 0;
window.posCount = 0;
window.negCount = 0;
window.neutralCount = 0;
window.currentTaskId = null;

function loadDoc() {
    //alert("called");
    document.getElementById('query').disabled = true;
    $("#loading-content").show();
    $("#content").hide();
    wipeMainChart();
    $("#loader").show();
    $("#drop-down-button-container").hide();
    //hideAdvancedSearchOptions();
    let xhttp = new XMLHttpRequest();
    startBoxAnimation();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                //alert("response received")
                let response = this.responseText;
                //console.log(dataList)
                let parsedJson = JSON.parse(response)
                console.log(parsedJson);
                sendRequestForId(parsedJson.id);
                saveArray(parsedJson.id);
                // loadChart(dataList)
            } else {
                let errorResponse = JSON.parse(this.response);
                alert(errorResponse.message);
                showResultPage();
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

//hideAdvancedSearchOptions();

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

/*
    let datalist = JSON.parse('{{ response | tojson | safe}}');

    if (datalist !== '') {
        loadChart(datalist)
    }
*/

function setupIndicators() {
    document.querySelector("#positive-tweets-number").innerHTML = window.posCount;
    document.querySelector("#negative-tweets-number").innerHTML = window.negCount;
    document.querySelector("#neutral-tweets-number").innerHTML = window.neutralCount;
    document.querySelector("#total-tweets-number").innerHTML = window.total;
}


function wipeMainChart() {
    window.total = 0;
    window.posCount = 0;
    window.negCount = 0;
    window.neutralCount = 0;
    window.completedJobList = [];
    window.total_response = [];
    //console.log("indicators reset")
    //console.log(total + window.posCount + window.negCount + window.neutralCount);
    if (window.mainChart !== undefined) {
        //console.log("Main chart wiped")
        window.mainChart.destroy();
        window.mainChart = undefined;
    }
    if (window.wordCloudChart !== undefined) {
        //console.log("word chart wiped");
        window.wordCloudChart.destroy();
        window.wordCloudChart = undefined;
    }

    if (window.hashtagCloudChart !== undefined) {
        console.log(window.hashtagCloudChart);
        window.hashtagCloudChart.destroy();
        window.hashtagCloudChart = undefined;
    }
    window.pcg = 0;
    window.old_value = 0;
    updateProgressBar(0);
}

function getProperDate(stringDate) {
    let parts = stringDate.split('-');
    let fromDate = new Date(parts[0], parts[1] - 1, parts[2]);
    /*uncomment this to enable class based x-axis*/
    let endDate = new Date(parts[3], parts[4] - 1, parts[5]);
    let midpoint = new Date((fromDate.getTime() + endDate.getTime()) / 2);

    // return fromDate.toDateString() + "-" + endDate.toDateString();
    //return parts[0] + + parts[1] - 1 +" "+ parts[2];
    return {
        startDate: fromDate,
        endDate: endDate,
        midPoint: midpoint
    }

    //return fromDate.toDateString()
}

function loadChart(response) {
    //console.log("chartdata: " + res);
    //let response = JSON.parse(res)
    //console.log(response);
    //showHome();
    let datalist = response.timeFragment;

    let positive = [], negative = [], neutral = [];
    let dates = [];


    for (let i = 0; i < datalist.length; i++) {
        /*      old time conversion function when timestamp was sent instead of actual date string.
                let date = new Date(parseFloat(datalist[i].name) * 1000);
                let options = {month: 'long', day: 'numeric', year: 'numeric'};
                let formatted_date = date.toLocaleDateString("en-US", options);*/
        //dates.push(getProperDate(datalist[i].name));
        let properDateObject = getProperDate(datalist[i].name)
        dates.push(properDateObject);


        positive.push(datalist[i].positive);
        window.posCount = window.posCount + datalist[i].positive;
        negative.push(datalist[i].negative);
        window.negCount = window.negCount + datalist[i].negative;
        neutral.push(datalist[i].neutral);
        window.neutralCount = window.neutralCount + datalist[i].neutral;

        window.total = datalist[i].total + window.total;
    }


    setupIndicators();
    /*positive.reverse();
    negative.reverse();
    neutral.reverse();
    dates.reverse();*/

    if (window.mainChart === undefined) {
        plotMainChart(positive, negative, neutral, dates)
    } else {

        window.mainChart.data.labels.push(getDatesArray(dates));
        window.mainChart.data.datasets[0].data.push(getSentimentArray(dates, positive[0]));
        window.mainChart.data.datasets[1].data.push(getSentimentArray(dates, negative[0]));
        window.mainChart.data.datasets[2].data.push(getSentimentArray(dates, neutral[0]));
        /*window.mainChart.data.datasets.forEach((dataset)=>{
            dataset.data.push(positive,negative,neutral)
        })*/
        window.mainChart.update();
    }

    plotWordFrequencyChart(response.freqDist)
    setupLinkFrequencyList(response.linkFreqDist)
    //setupHashtagChart(response.hashtagFreqDist);
    setupHashtagFrequencyList(response.hashtagFreqDist)
    setupAboutQueryText(response.query)
}

function setupAboutQueryText(query){
    let aboutQueryContainer = document.getElementById("about-query");
    aboutQueryContainer.innerHTML = `
        <span class="text-muted" style="margin-left: 15px; margin-right: 15px">Showing analysis report for query 
        <strong style="color: #4d4dff; font-size: 18px">"${query.query}"</strong>
        </span>
        
    `
}

function getDatesArray(dates, updateOps = false) {
    let i;
    let dateArray = [];
    if(updateOps) {
        dateArray.push(dates[0].startDate);
    }
    for (i = 1; i < dates.length; i++) {
        dateArray.push(dates[i].startDate);
    }

    //dateArray.push(dates[--i].endDate);

    return dateArray;
}

/*
function setupHashtagChart(hashtagFreqDist) {
    if (window.hashtagCloudChart !== undefined) {
        console.log(window.hashtagCloudChart);
        window.hashtagCloudChart.destroy();
        window.hashtagCloudChart = undefined;
    }

    let hashtagChartCanvas = document.getElementById('hashtagCloudChartCanvas').getContext('2d');
    let hashtagList = [];
    let freqList = [];

    for (let i = 0; i < hashtagFreqDist.length; i++) {
        hashtagList.push(hashtagFreqDist[i][0]);
        freqList.push(hashtagFreqDist[i][1]);
    }

    let data = {
        labels: hashtagList,
        datasets: [
            {
                backgroundColor: ['#4d4dff', '#0099FF', '#00CCFF', '#00FFFF', '#89CFF0', '#ffa733', '#ffcf33', '#ffee33', '#76ff03'],
                fill: true,
                data: freqList,
                pointStyle: 'circle',
                borderWidth: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
        ]
    }

    if (window.hashtagCloudChart) {
        window.hashtagCloudChart.destroy();
    }

    window.hashtagCloudChart = new Chart(hashtagChartCanvas, {
        type: 'polarArea',
        data: data,
        options: {
            display: true,
            position: 'right',
            align: 'start',
            usePointStyle: true,
            defaultFontFamily: "'Roboto', sans-serif",
            defaultFontSize: '24'
        }
    });
}
*/

function prepareSafeHashtagURL(hashtag) {
    return "https://twitter.com/search?q=" + encodeURIComponent(hashtag);
}

function setupHashtagFrequencyList(hashtagFreqDist) {
    let hashtagList = [], frequency = [];

    let parentList = document.getElementById("hashtag-list-id");
    /* to refresh list for every query*/
    parentList.innerHTML = "";
    let collapsibleDiv = document.createElement("DIV");
    collapsibleDiv.setAttribute("id", "remaining-hashtag-list");


    for (let i = 0; i < hashtagFreqDist.length; i++) {
        //hashtagList.push(hashtagFreqDist[i][0])
        //frequency.push(hashtagFreqDist[i][1])
        let hashtag = hashtagFreqDist[i][0];
        let freq = hashtagFreqDist[i][1];
        let textNode = document.createTextNode(hashtag);
        let freqNode = document.createTextNode(freq);

        let listItem = document.createElement("LI");
        let badge = document.createElement("SPAN");
        collapsibleDiv.classList.add("collapse");
        badge.classList.add("badge", "badge-primary", "badge-pill");
        //badge.classList.add("badge", "custom-highlighter");
        badge.appendChild(freqNode);
        listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center", "no-border-list", "list-group-item-action");
        listItem.appendChild(textNode);
        listItem.appendChild(badge);

        listItem.addEventListener("click", function () {
            window.open(prepareSafeHashtagURL(hashtag), "_blank");
        })

        if (i >= 5) {
            /*if the list contains more than 5 elements add it to collapsible div*/
            collapsibleDiv.appendChild(listItem)
        } else {
            parentList.appendChild(listItem)
        }
    }
    /* tweak this 0 to hide the view all link*/
    if (collapsibleDiv.childElementCount > 0) {
        parentList.appendChild(collapsibleDiv);
        $('#view-all-hashtag-button').show();
    }
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


function plotWordFrequencyChart(freqDist) {
    if (window.wordCloudChart !== undefined) {
        window.wordCloudChart.destroy();
        window.wordCloudChart = undefined;
    }
    let freqChart = document.getElementById('wordFrequencyChart').getContext('2d');
    //console.log("Pie chart below")
    //pieChart.addData(fragmented_freqdist);
    let wordList = []
    let frequency = []
    for (let i = 0; i < freqDist.length; i++) {
        //console.log("Freq dist size : " + freqDist);
        wordList.push(freqDist[i][0]);
        frequency.push(freqDist[i][1]);
    }

    let data = {
        labels: wordList,
        datasets: [
            {
                backgroundColor: ['#4d4dff', '#0099FF', '#00CCFF', '#00FFFF', '#89CFF0', '#ffa733', '#ffcf33', '#ffee33', '#76ff03'],
                fill: true,
                data: frequency,
                pointStyle: 'circle',
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
                align: 'start',
                usePointStyle: true,
                defaultFontFamily: "'Roboto', sans-serif",
                defaultFontSize: '24'
            }
        }
    });
}

function getSentimentArray(dateArray, sentimentArray) {
    let some = []
    //some.push({t:dateArray[0].startDate, y: sentimentArray[0]})
    for (let i = 0; i < dateArray.length; i++) {
        let something = {
            t: dateArray[i].midPoint,
            y: sentimentArray[i]
        }
        some.push(something)
    }
    return some;

}

let myChart = document.getElementById('myChart').getContext('2d');

function plotMainChart(positive, negative, neutral, dates) {
    //console.log(dates)
    let gradient = myChart.createLinearGradient(0, 500, 0, 100);
    gradient.addColorStop(0, "rgba(241, 7, 94, 0.38)");
    gradient.addColorStop(0.5, "rgba(249, 144, 183, 0)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    let blueGradient = myChart.createLinearGradient(0, 0, 50, 400);
    blueGradient.addColorStop(0, '#25c8fc');
    blueGradient.addColorStop(1, '#6a11cb');

    let greyGradient = myChart.createLinearGradient(0, 0, 0, 450);
    greyGradient.addColorStop(0, 'rgb(109,115,132,0.6)');
    greyGradient.addColorStop(0.5, 'rgb(57, 62, 70, 0.25)');
    greyGradient.addColorStop(1, 'rgb(57, 62, 70, 0)');

    window.mainChart = new Chart(myChart, {
        type: 'line',
        data: {
            labels: getDatesArray(dates),
            datasets: [
                {
                    label: 'Positive',
                    data: getSentimentArray(dates, positive),
                    borderColor: '#4981FD',
                    spanGaps: true,
                    fill: false,
                    backgroundColor: 'rgba(73,129,253,0.3)'
                },
                {
                    label: 'Negative',
                    data: getSentimentArray(dates, negative),
                    borderColor: '#F1075E',
                    fill: false,
                    backgroundColor: 'rgba(241,7,94,0.1)'
                },
                {
                    label: 'Neutral',
                    data: getSentimentArray(dates, neutral),
                    borderColor: 'rgb(57, 62, 70, 0.6)',
                    radius: 4,
                    backgroundColor: greyGradient,
                    fill: false
                }
            ]
        },
        options: {
            scales: {
                bounds: 'ticks',
                xAxes: [{
                    gridLines: {
                        drawOnChartArea: true
                    },
                    type: 'time',
                    distribution: "linear",

                    time: {
                        unit: 'week'
                    },
                    ticks: {
                        source: 'labels',
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Timeline",
                        fontSize: 18,
                    },
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Tweets",
                        fontSize: 18,

                    },

                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            legend: {
                labels: {
                    usePointStyle: true,
                }
            },
            tooltips: {
                callbacks: {
                    title: function (tooltipItem) {
                        return;
                    }
                }
            },
        }
    })
    Chart.defaults.global.defaultFontFamily = "'Roboto', sans-serif";
    Chart.defaults.global.defaultFontColor = "#3a3d49"
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
        //hideAdvancedSearchOptions();
        removeShadow();
        //the click was outside the specifiedElement, do something
    }
}

//document.addEventListener('click', toggleOutsideDetectionListener);

function toggleAdvancedSearchOption() {
    if ($("#dropdown").is(":visible")) {
        //hideAdvancedSearchOptions()
    } else {
        //showAdvanceSearchOptions()
    }
}


function showAdvanceSearchOptions() {

    $("#dropdown").toggle();
    addShadow()
    let dropdownMenuIcon = document.getElementById('dropdown-menu-icon');
    dropdownMenuIcon.classList.add('rotate-up');
    dropdownMenuIcon.classList.remove('rotate-down');
}

function hideAdvancedSearchOptions() {
    $("#dropdown").hide();
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

function expandHashtagListClicked() {
    let viewAllLink = document.getElementById('viewAllHashtagLink');
    let expandIcon = document.getElementById('expand-hashtag-icon');
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


window.total_response = [];

function sendRequestForId(jobId) {
    $.ajax({
        url: '/tasks/' + jobId,
        method: 'POST'
    })
        .done((res) => {
            //console.log(res.data);
            let percentage = res.data.task_percentage;
            updateProgressBar(percentage);
            if (res.data.task_status === "finished") {
                getTaskResult(res.data.task_id)
                if (currentPage !== "home") {
                    showFinishedNotification();
                } else {
                    showHome();
                }
                showResultPage();
            } else if (res.data.task_status === "queued") {
                setTimeout(function () {
                    sendRequestForId(res.data.task_id);
                }, 1000);
            } else if (res.data.task_status === "failed") {
                alert("Task failed, please try again");
                showResultPage();
            } else {
                setTimeout(function () {
                    sendRequestForId(res.data.task_id);
                }, 1000);
            }
        })
        .fail((err) => {
            console.log(err);
        });
}


function getTaskResult(taskId) {
    /*make final call*/
    window.currentTaskId = taskId
    $.ajax({
        url: '/get_result/' + taskId,
        method: 'POST'
    })
        .done((res) => {
            //console.log(typeof res)
            console.log(res);
            wipeMainChart();
            loadChart(res);
        })
        .fail((err) => {
            alert(err)
        })
}

// function makeFinalCall() {
//     let xmlHttpRequest = new XMLHttpRequest();
//     xmlHttpRequest.onreadystatechange = function () {
//         if (this.readyState === 4 && this.status === 200) {
//             console.log(JSON.parse(this.responseText));
//             loadChart(JSON.parse(this.responseText));
//             showResultPage();
//         }
//         //console.log(this.responseText);
//     }
//     xmlHttpRequest.open("POST", "/get_results/");
//     xmlHttpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//     xmlHttpRequest.send(JSON.stringify(window.completedJobList));
// }


// function postprocessing() {
//     let timestampList = [];
//     let responseMap = new Map();
//
//     //console.log(typeof window.total_response);
//     //console.log(window.total_response);
//     window.total_response.sort(function (a, b) {
//         return new Date(b.timeFragment.name) - new Date(b.timeFragment.name);
//     })
//     /*for(let i = 0; i<window.total_response.length;i++){
//         let temp = window.total_response[i];
//         let timestamp = temp.timeFragment[0].name;
//         console.log(typeof timestamp);
//         timestampList.push(timestamp);
//         responseMap.set(timestamp, temp);
//     }*/
//     //console.log(window.total_response);
//     for (let i = 0; i < window.total_response.length; i++) {
//         loadChart(window.total_response[i]);
//     }
//     window.total_response = [];
//     setTimeout(function () {
//         $("#loading-content").hide();
//         $("#content").show();
//     }, 2500);
//
//
// }

function updateProgressBar(percentage) {

    document.getElementById("percentage-count").innerText = Number(percentage) + "%";
    document.getElementsByClassName('progress-bar').item(0).setAttribute('aria-valuenow', percentage);
    document.getElementsByClassName('progress-bar').item(0).setAttribute('style', 'width:' + Number(percentage) + '%');

    if (percentage >= 100) {
        startDoneAnimation();
    }
}

function startBoxAnimation() {
    $("#box-animation").show();
    $("#done-animation").hide();
}

function startDoneAnimation() {
    $("#box-animation").hide()
    $("#done-animation").show();
}

function showResultPage() {
    $("#loading-content").hide();
    $("#content").show();
    console.log("showing content")
}