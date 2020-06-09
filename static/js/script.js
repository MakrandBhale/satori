function loadDoc() {
        //alert("called");
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            let dataList;
            if (this.readyState === 4 && this.status === 200) {
                alert("response received")
                dataList = this.responseText;
                console.log(dataList)
                //loadChart(dataList)
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

    let datalist = JSON.parse("{{ response | tojson | safe}}");

    if (datalist !== ''){
        loadChart(datalist)
    }


    function loadChart(datalist) {
        console.log(datalist);
        let myChart = document.getElementById('myChart').getContext('2d');
        let positive = [], negative = [], neutral = [];
        let dates = [];

        for (let i = 0; i < datalist.length; i++) {
            positive.push(datalist[i].positive);
            negative.push(datalist[i].negative);
            neutral.push(datalist[i].neutral);
            dates.push(datalist[i].name);
        }
        positive.reverse();
        negative.reverse();
        neutral.reverse();
        dates.reverse();

        let massPopChart = new Chart(myChart, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Positive',
                        data: positive,
                        borderColor: 'rgb(53, 208, 186, 0.6)',
                        fill: false
                    },
                    {
                        label: 'Negative',
                        data: negative,
                        borderColor: 'rgb(217, 32, 39, 0.6)',
                        fill: false
                    },
                    {
                        label: 'Neutral',
                        data: neutral,
                        borderColor: 'rgb(57, 62, 70, 0.6)',
                        fill: false
                    }
                ]
            },
            options: {}
        })
    }