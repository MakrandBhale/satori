function loadDoc() {
    //alert("called");
    document.getElementById('query').disabled = true;
    wipeMainChart();
    $("#loader").toggle();
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        let dataList;
        if (this.readyState === 4 && this.status === 200) {
            if (this.status === 200) {
                //alert("response received")
                dataList = this.responseText;
                console.log(dataList)
                loadChart(dataList)
            } else {
                alert(xhttp.statusText);
            }
            $("#loader").toggle();
            document.getElementById('query').disabled = false;
        }
    };
    let params = prepareParameters();
    xhttp.open("POST", "/", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(params);

}

function prepareParameters() {
    let query = document.getElementById("query").value;
    let startDate = document.getElementById("start-date-picker").value;
    let endDate = document.getElementById("end-date-picker").value;
    let stepCount = document.getElementById('step-input').value;
    let tweetFrequency = document.getElementById("tweet-frequency").value;
    console.log(stepCount)
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

function setupIndicators(positive, negative, neutral, total) {
    document.querySelector("#positive-tweets-number").innerHTML = "<b>" + positive + "</b>";
    document.querySelector("#negative-tweets-number").innerHTML = "<b>" + negative + "</b>";
    document.querySelector("#neutral-tweets-number").innerHTML = "<b>" + neutral + "</b>";
    document.querySelector("#total-tweets-number").innerHTML = "<b>" + total + "</b>";
}


function wipeMainChart() {
    plotMainChart([0, 0, 0], [0, 0, 0], [0, 0, 0], ["Jan", "Feb", "March"]);
    setupIndicators("--", "--", "--", "--");
}

function loadChart(res) {
    response = JSON.parse(res)
    let datalist = response.timeFragment;
    console.log(datalist);

    let positive = [], negative = [], neutral = [];
    let dates = [];
    let total = 0, posCount = 0, negCount = 0, neutralCount = 0;
    for (let i = 0; i < datalist.length; i++) {
        positive.push(datalist[i].positive);
        posCount = posCount + datalist[i].positive;
        negative.push(datalist[i].negative);
        negCount = negCount + datalist[i].negative;
        neutral.push(datalist[i].neutral);
        neutralCount = neutralCount + datalist[i].neutral;
        dates.push(datalist[i].name);
        total = datalist[i].total + total;
    }
    setupIndicators(posCount, negCount, neutralCount, total);
    /*positive.reverse();
    negative.reverse();
    neutral.reverse();
    dates.reverse();*/

    plotMainChart(positive, negative, neutral, dates)
    plotWordFrequencyChart(response.freqDist)
    setupLinkFrequencyList(response.linkFreqDist)
}

function setupLinkFrequencyList(linkFreqDist) {
    let linkList = [], frequency = [];
    for(let i = 0; i<linkFreqDist.length;i++){
        linkList.push(linkFreqDist[i][0]);
        frequency.push(linkFreqDist[i][1]);
    }
    let list = document.getElementById("link-list-id");

    for(let i = 0;i < linkList.length;i++){
        const urlObj = new URL(linkList[i]);
        console.log(urlObj)
        let text = document.createTextNode(urlObj.host)
        let freqText = document.createTextNode(frequency[i])
        let listItem = document.createElement("LI");
        let badge = document.createElement("SPAN");

        badge.classList.add("badge", "badge-primary", "badge-pill");
        //badge.classList.add("badge", "custom-highlighter");
        badge.appendChild(freqText);

        listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        listItem.appendChild(text);
        listItem.appendChild(badge);
        list.appendChild(listItem)
    }
}
function plotWordFrequencyChart(freqDist) {
    let freqChart = document.getElementById('wordFrequencyChart').getContext('2d');
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
                backgroundColor: ['#55D8FE', '#FF8373', '#FFDA83', '#A3A0FB', '#5EE2A0', '#4981FD', '#ffa733', '#ffcf33', '#ffee33', '#76ff03'],
                fill: true,
                data: frequency,
                borderWidth: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
        ]
    };
    let pieChart = new Chart(freqChart, {
        type: 'pie',
        data: data,
        options: {
            legend: {
                display: true,
                position: 'bottom',
                align: 'start'

            }
        }
    });
}


function plotMainChart(positive, negative, neutral, dates) {
    let myChart = document.getElementById('myChart').getContext('2d');
    let gradient = myChart.createLinearGradient(0, 0, 0, 450);
    gradient.addColorStop(0, '#F1075E');
    gradient.addColorStop(0.5, 'rgba(241,7,94,0.5)');
    gradient.addColorStop(1, 'rgba(241,7,94,0)');

    let blueGradient = myChart.createLinearGradient(0, 0, 0, 450);
    blueGradient.addColorStop(0, '#4981FD');
    blueGradient.addColorStop(0.5, 'rgba(73,129,253,0.5)');
    blueGradient.addColorStop(1, 'rgba(73,129,253,0)');

    let greyGradient = myChart.createLinearGradient(0, 0, 0, 450);
    greyGradient.addColorStop(0, 'rgb(109,115,132,0.6)');
    greyGradient.addColorStop(0.5, 'rgb(57, 62, 70, 0.25)');
    greyGradient.addColorStop(1, 'rgb(57, 62, 70, 0)');

    let massPopChart = new Chart(myChart, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Positive',
                    data: positive,
                    borderColor: '#4981FD',
                    pointBackgroundColor: 'white',
                    backgroundColor: blueGradient,
                    fill: false
                },
                {
                    label: 'Negative',
                    data: negative,
                    borderColor: '#F1075E',
                    pointBackgroundColor: 'white',
                    backgroundColor: gradient,
                    fill: false
                },
                {
                    label: 'Neutral',
                    data: neutral,
                    borderColor: 'rgb(57, 62, 70, 0.6)',
                    pointBackgroundColor: 'white',
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
let toggleOutsideDetectionListener = function (event) {
    /* a function to hide dropdown menu if user clicked outside of menu*/
    let isClickInside = false;
    if (specifiedElement.contains(event.target) || dropdownButton.contains(event.target)) {
        isClickInside = true;
    }
    if (!isClickInside) {
        hideAdvancedSearchOptions();
        //the click was outside the specifiedElement, do something
    }
}
document.addEventListener('click', toggleOutsideDetectionListener);

function showAdvanceSearchOptions() {
    $("#dropdown").toggle(1000);
    addShadow()
}

function hideAdvancedSearchOptions() {
    $("#dropdown").hide(100);
}

function addShadow() {

    let searchBox = document.getElementById("search-field");
    searchBox.classList.add("active-shadow")
}

function removeShadow() {
    let searchBox = document.getElementById("search-field");
    searchBox.classList.remove("active-shadow")
}


//I'm using "click" but it works with any event
