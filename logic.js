'use-strict';

const moment = require('moment-timezone');
const http = require('https');
const fs = require('fs');
const path = require('path');
const timezoner = require('timezoner');
const arr = [];

let apiKey, latitude, longitude, startYear, startMonth, startDay, numOfDays;

const downloadPage = (url, timeZoneID, totalDays) => {
    const fetchPage = (urlF, callBack) => {
        http.get(urlF, (response) => {
            let buff = '';
            response.on('data', (chunk) => buff += chunk);
            response.on('end', () => callBack(null, buff));
        }).on('error', (error) => {
            console.error(`Got error: ${error.message}`);
            callback(error);
        })
    }

    fetchPage(url, (error, data) => {
        if (error) return console.log(error);
        data = JSON.parse(data);
        let date = moment.tz(data["hourly"]["data"][0]["time"] * 1000, timeZoneID).format();
        let hourlyArr = data["hourly"]["data"].map((hourlyData) => {
            let time = moment.tz(hourlyData['time'] * 1000, timeZoneID).format("HH-mm-ss");
            let temp = hourlyData['temperature'];
            let humidity = hourlyData['humidity'];
            return {
                "time": time,
                "temp": temp,
                "humidity": humidity
            }
        })
        arr.push({
            "date": date,
            "data": hourlyArr
        });
        if (arr.length == totalDays) {
            arr.sort((a, b) => {
                if (a["date"] > b["date"])
                    return 1;
                else if (a["date"] < b["date"])
                    return -1;
                return 0;
            });
            let csvString = getCsv(arr);
            let fileName = timeZoneID.split("/")[1] + "," + startYear + "," + startMonth + "," + startDay + ".csv";
            fs.writeFileSync(path.join(__dirname, fileName), csvString);
            console.log('Coordinates: ' + latitude + ' N ' + longitude + ' E');
            console.log('Timezone ID: ' + timeZoneID);
            console.log('Start Date: ' + arr[0]['date'].split('T')[0]);
            console.log('End Date: ' + arr[arr.length - 1]['date'].split('T')[0]);
            console.log('Total ' + totalDays + ((totalDays > 1) ? ' days' : ' day'));
            console.log('downloading is done, Filename: ' + fileName);
        }
    })
};

const getAnswer = (timeZoneID, startYear, startMonth, startDay, totalDays) => {

    let formattedMonth = startMonth < 10 ? '0' + startMonth : startMonth;
    let formattedDay = startDay < 10 ? '0' + startDay : startDay;
    currDate = moment.tz(startYear + "-" + formattedMonth + "-" + formattedDay, timeZoneID);

    for (let i = 0; i < totalDays; i++) {
        let url = 'https://api.darksky.net/forecast/' + apiKey + '/' + latitude + ',' + longitude + ',' + currDate.format() + '?units=si';
        console.log(url);
        downloadPage(url, timeZoneID, totalDays);
        currDate.add(1, 'days');
    }
}

const setParams = (config) => {
    apiKey = config.apiKey;
    latitude = config.latitude;
    longitude = config.longitude;
    startYear = config.startYear;
    startMonth = config.startMonth;
    startDay = config.startDay;
    numOfDays = config.numOfDays;
}

const getCsv = (arr) => {
    let csvString = '"date","time","temp","humidity"\n';
    arr.forEach((day, index) => {
        day['data'].forEach((hour, index) => {
            if (index == 0)
                csvString += '"' + day['date'] + '",';
            else
                csvString += '"",';

            csvString += '"' + hour['time'] + '",';
            csvString += '"' + hour['temp'] + '",';
            csvString += '"' + hour['humidity'] + '"\n';
        })
    });
    return csvString;
}

const run = function (config) {
    setParams(config);
    timezoner.getTimeZone(
        latitude, // Latitude coordinate
        longitude, // Longitude coordinate
        function (err, data) {
            if (err) {
                console.log(err);
            } else {
                //timeZone, year, month, day, noOfDays
                getAnswer(data['timeZoneId'], startYear, startMonth, startDay, numOfDays);
            }
        }
    );
}

module.exports = run;