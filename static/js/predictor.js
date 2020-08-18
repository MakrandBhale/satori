/*frequency of steps*/
let steps = [1, 7, 15, 30]
function predict() {
    if(window.currentTaskId === null) return;
    let predictButton = document.getElementById("predict-button");
    let predictLoader = document.getElementById("predictor-loader");
    if (window.currentTaskId === null) return;
    predictButton.disabled = true;
    predictLoader.style.display = 'inline-block';

    $.ajax({
        url: '/predict/' + window.currentTaskId,
        method: 'POST'
    })
    .done((res) => {
        //console.log(res);
        updateChart(res.prediction, res.stepCount)
        predictButton.disabled = false;
        predictLoader.style.display = 'none';

    })
    .fail((err) => {
        alert(err)
        predictButton.disabled = false;
        predictLoader.style.display = 'none';
    })
}


function updateChart(data, stepCount) {
    let dateArray = fetchDateArray(data.positive)
    let posArray = scratchData(data.positive)
    let negArray = scratchData(data.negative)
    let neuArray = scratchData(data.neutral)
    let dateObjectArray = []
    for(let i = 0;i<dateArray.length;i++){
        dateObjectArray.push(getMidPoint(dateArray[i], stepCount))
    }


    Array.prototype.push.apply(window.mainChart.data.labels, getDatesArray(dateObjectArray, true));

    let dataSetLength = window.mainChart.data.datasets[0].data.length - 1;

    let posData = getSentimentArray(dateObjectArray, posArray);
    posData.unshift(window.mainChart.data.datasets[0].data[dataSetLength]);
    window.mainChart.data.datasets.push(
        createDatasetObject(
            "Positive Prediction",
            posData,
            '#4981FD')
    )

    let negData = getSentimentArray(dateObjectArray, negArray);
    negData.unshift(window.mainChart.data.datasets[1].data[dataSetLength]);
    window.mainChart.data.datasets.push(
        createDatasetObject(
            "Negative Prediction",
            negData,
            '#F1075E')
    )

    let neuData = getSentimentArray(dateObjectArray, neuArray);
    neuData.unshift(window.mainChart.data.datasets[2].data[dataSetLength]);
    window.mainChart.data.datasets.push(
        createDatasetObject(
            "Neutral Prediction",
            neuData,
            'rgb(57, 62, 70, 0.6)')
    )


    /*Array.prototype.push.apply(window.mainChart.data.datasets[0].data, getSentimentArray(dateObjectArray, posArray))
    window.mainChart.data.datasets[0].borderDash = [5,5];
    Array.prototype.push.apply(window.mainChart.data.datasets[1].data, getSentimentArray(dateObjectArray, negArray));
    Array.prototype.push.apply(window.mainChart.data.datasets[2].data, getSentimentArray(dateObjectArray, neuArray));*/

    //window.mainChart.data.datasets[0].data.push(getSentimentArray(dateObjectArray, posArray));
    //window.mainChart.data.datasets[1].data.concat(getSentimentArray(dateObjectArray, negArray));
    //window.mainChart.data.datasets[2].data.concat(getSentimentArray(dateObjectArray, neuArray));

    // console.log(window.mainChart.data.datasets[0].data)
    window.mainChart.update();
}

function createDatasetObject(name, sentimentArray, color) {
    console.log(sentimentArray)
    return {
        label: name,
        data: sentimentArray,
        borderColor: color,
        borderDash: [5,5],
        spanGaps: true,
        fill: false,
        //backgroundColor: 'rgba(73,129,253,0.3)'
    }
}

function fetchDateArray(sentiment){
    dateArray  = [];
    for(let i =0;i<sentiment.length;i++){
        dateArray.push(sentiment[i][0]/1000000);
    }
    return dateArray;
}

function scratchData(sentiment) {
    scores = [];
    for(let i = 0;i<sentiment.length;i++){
        scores.push(Math.ceil(sentiment[i][1]))
    }
    return scores;
}

function getMidPoint(timestamp, offSet){
    let fromDate = new Date(timestamp);
    /*uncomment this to enable class based x-axis*/
    let endDate = addDays(timestamp, steps[offSet])
    let midpoint = new Date((fromDate.getTime() + endDate.getTime()) / 2);

    // return fromDate.toDateString() + "-" + endDate.toDateString();
    //return parts[0] + + parts[1] - 1 +" "+ parts[2];
    return {
        startDate: fromDate,
        endDate: endDate,
        midPoint: midpoint
    }
}

function addDays(date, days) {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}