function onLoad() {
    var url = window.location.href;
    var index = url.lastIndexOf("#");
    if (index === -1) {
        return;
    }

    var endIndex = url.indexOf("&");
    var authToken = url.substring(index + 14, endIndex);

    var loginDiv = elem('login');
    loginDiv.style.display = 'none';

    var userDiv = elem('user');
    userDiv.style.display = 'block';

    var stepsDiv = elem('step-data');
    stepsDiv.style.display = 'block';

    showUser(authToken);
    getIntradayActivity(authToken);
}

function showUser(authToken) {
    fetchData('https://api.fitbit.com/1/user/-/profile.json', authToken)
        .then(function(data) {
            var header = document.createElement('h3');
            header.innerHTML = data.user.fullName;

            var profilePic = document.createElement('img');
            profilePic.src = data.user.avatar;
            elem('user').appendChild(header);
            elem('user').appendChild(profilePic);
        })
}

function getIntradayActivity(authToken) {
    var date = getDate();
    var url = 'https://api.fitbit.com/1/user/-/activities/steps/date/' + date + '/1d.json';
    fetchData(url, authToken)
        .then(function(data) {
            var header = document.createElement('h3');
            header.innerHTML = 'Steps on ' + data["activities-steps"][0].dateTime + ": " + data["activities-steps"][0].value;

            elem('step-data').appendChild(header);
            drawList(data["activities-steps-intraday"].dataset);
            drawChart(data["activities-steps-intraday"].dataset);
        })
}

function drawChart(data) {
    elem('chart').innerHTML = '';

    var canvas = document.createElement('canvas');
    elem('chart').appendChild(canvas);

    var ctx = canvas.getContext('2d');
    ctx.canvas.width = Math.floor(window.innerWidth * .75);
    ctx.canvas.height = Math.floor(window.innertHeight * .8);

    var chartData = {
        labels: data.map(function(obj) {return obj.key}),
        datasets: [{
            label: 'Steps',
            fillColor:            'rgba(220,220,220,0.2)',
            strokeColor:          'rgba(220,220,220,1)',
            pointColor:           'rgba(220,220,220,1)',
            pointStrokeColor:     '#fff',
            pointHighlightFill:   '#fff',
            pointHighlightStroke: 'rgba(220,220,220,1)',
            data:   data.map(function(obj) {obj.value})
        }]
    }

    var lineChart = new Chart(ctx).Line(data, {});
}

function drawList(data) {
    var list = document.createElement('ul');
    data.map(function(obj) {
        var listItem = document.createElement('li');
        listItem.innerHTML = obj.time + ": " + obj.value;
        list.appendChild(listItem);
    })

    elem('step-data').appendChild(list);
}

function fetchData(url, authToken) {
    var authHeader = "Bearer " + authToken;
    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.setRequestHeader("Authorization", authHeader);
        req.onload = function() {
            if (req.status >= 200 && req.status < 300) return resolve(JSON.parse(req.response))
            reject(new Error(req.statusText))
        }
        req.onerror = function() { reject(new Error('Network failure'))}
        req.send()
    })
}

function getDate() {
    var todaysDate = new Date();
    var year = todaysDate.getFullYear().toString();
    var month = (todaysDate.getMonth()+1).toString();
    var day = todaysDate.getDate().toString();

    var mmChars = mm.split('');
    var ddChars = dd.split('');

    return yyyy + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + (ddChars[1]?dd:"0"+ddChars[0]);
}

function elem(id) { return document.getElementById(id) }
