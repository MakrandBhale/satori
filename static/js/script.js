let mainChart, wordCloudChart;

function loadDoc() {
    //alert("called");
    document.getElementById('query').disabled = true;
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
                console.log(dataList)
                loadChart(dataList)
            } else {
                let errorResponse = JSON.parse(this.response);
                alert(errorResponse.message);
                console.log(this.response);
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
    // plotMainChart([0, 0, 0], [0, 0, 0], [0, 0, 0], ["Jan", "Feb", "March"]);
    // setupIndicators("--", "--", "--", "--");
}

function loadChart(res) {
    console.log(res);
    let response = JSON.parse(res)
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
    for (let i = 0; i < linkFreqDist.length; i++) {
        linkList.push(linkFreqDist[i][0]);
        frequency.push(linkFreqDist[i][1]);
    }
    let list = document.getElementById("link-list-id");
    list.innerHTML = "";
    let collapsiblediv = document.createElement("DIV");
    collapsiblediv.setAttribute("id", "remaining-list");

    for (let i = 0; i < linkList.length; i++) {
        let urlObj ;
        try {
            urlObj = new URL(linkList[i]);
        } catch(err){
            console.log(err);
            urlObj = {"host" : linkList[i]};
        }


        console.log(urlObj)
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
    let freqChart = document.getElementById('wordFrequencyChart').getContext('2d');
    console.log("Pie chart below")
    removeData(wordCloudChart);

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
    wordCloudChart = new Chart(freqChart, {
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
    removeData(mainChart);
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

    mainChart = new Chart(myChart, {
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
    console.log("clikcke")
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

function removeData(chart) {
    console.log(chart)
    if (chart !== undefined) {
        chart.destroy();
    }
}