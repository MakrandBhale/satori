function loadDoc() {
    //alert("called");
    document.getElementById('query').disabled = true;
    wipeMainChart();
    $( "#loader" ).toggle();
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        let dataList;
        if (this.readyState === 4 && this.status === 200) {
            if(this.status === 200){
                //alert("response received")
            dataList = this.responseText;
            console.log(dataList)
            loadChart(dataList)
            } else {
                alert(xhttp.statusText);
            }
            $( "#loader" ).toggle();
            document.getElementById('query').disabled = false;
        }
    };
    xhttp.open("POST", "/", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("query=" + document.getElementById("query").value);

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


function wipeMainChart(){
    plotMainChart([0,0,0],[0,0,0],[0,0,0], ["Jan", "Feb", "March"]);
    setupIndicators("--", "--", "--", "--");
}

function loadChart(res) {
    let datalist = JSON.parse(res)
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
    positive.reverse();
    negative.reverse();
    neutral.reverse();
    dates.reverse();

    plotMainChart(positive, negative, neutral, dates)
}

function plotMainChart(positive, negative, neutral, dates){
    let myChart = document.getElementById('myChart').getContext('2d');
    let gradient = myChart.createLinearGradient(0, 0, 0, 450);
    gradient.addColorStop(0, '#F1075E');
    gradient.addColorStop(0.5, 'rgba(241,7,94,0.25)');
    gradient.addColorStop(1, 'rgba(241,7,94,0)');

    let blueGradient = myChart.createLinearGradient(0, 0, 0, 450);
    blueGradient.addColorStop(0, '#4981FD');
    blueGradient.addColorStop(0.5, 'rgba(73,129,253,0.25)');
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
                    backgroundColor: blueGradient
                },
                {
                    label: 'Negative',
                    data: negative,
                    borderColor: '#F1075E',
                    pointBackgroundColor: 'white',
                    backgroundColor: gradient
                },
                {
                    label: 'Neutral',
                    data: neutral,
                    borderColor: 'rgb(57, 62, 70, 0.6)',
                    pointBackgroundColor: 'white',
                    backgroundColor: greyGradient
                }
            ]
        },
        options: {}
    })
}