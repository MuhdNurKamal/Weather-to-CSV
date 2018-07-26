'use-strict';

const moment = require('moment-timezone');
const http = require('https');
const fs = require('fs');
const path = require('path');
const timezoner = require('timezoner');
const TARGET_DOWNLOAD_LOCATION = 'files';

const COLUMN_NAME_DATE = "Date";
const COLUMN_NAME_TIME = "Time";
const columnDict = {
    "latitude": "Latitude",
    "longitude": "Longitude",
    "summary": "Summary",
    "precipIntensity": "Precipitation Intensity / mm/h",
    "precipProbability": "Precipitation Probability",
    "temperature": "Temperature / Celcius",
    "apparentTemperature": "Apparent Temperature / Celcius",
    "dewPoint": "Dew Point / Celcius",
    "humidity": "Humidity",
    "pressure": "Pressure / hPa",
    "pressureError": "Pressure Error",
    "windSpeed": "Wind Speed / m/s",
    "windGust": "Wind Gust / m/s",
    "windBearing": "Wind Bearing",
    "cloudCover": "Cloud Cover",
    "visibility": "Visibility"
}

let arr, apiKey, latitude, longitude, startYear, startMonth, startDay, numOfDays, dataToDownload;

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
        try {
            data = JSON.parse(data);
        } catch(err) {
            $('ol').append("<li>" + err + "</li>");
            return;
        }
        let date = moment.tz(data["hourly"]["data"][0]["time"] * 1000, timeZoneID).format();
        let hourlyArr = data["hourly"]["data"].map((hourlyData) => {
            let time = moment.tz(hourlyData['time'] * 1000, timeZoneID).format("HH-mm-ss");
            data = {
                "time": time
            };
            dataToDownload.forEach((current, index, arr) => {
                data[current] = hourlyData[current];
            });
            return data;
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
            fs.writeFileSync(path.join(__dirname, TARGET_DOWNLOAD_LOCATION, fileName), csvString);
            let downloadMessage =
                'Coordinates: ' + latitude + ' N ' + longitude + ' E' + '\n' +
                'Timezone ID: ' + timeZoneID + '\n' +
                'Start Date: ' + arr[0]['date'].split('T')[0] + '\n' +
                'End Date: ' + arr[arr.length - 1]['date'].split('T')[0] + '\n' +
                'Total ' + totalDays + ((totalDays > 1) ? ' days' : ' day') + '\n' +
                'downloading is done, Filename: ' + fileName +
                'Download folder: ' + path.join(__dirname, TARGET_DOWNLOAD_LOCATION);
            alert(downloadMessage);
        }
    });
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

const setConfig = (config) => {
    apiKey = config.apiKey;
    latitude = config.latitude;
    longitude = config.longitude;
    startYear = config.startYear;
    startMonth = config.startMonth;
    startDay = config.startDay;
    numOfDays = config.numOfDays;
    dataToDownload = config.dataToDownload;
}

const getCsv = (arr) => {
    let csvString = '"' + COLUMN_NAME_DATE + '","' + COLUMN_NAME_TIME + dataToDownload.reduce((prev, curr) => prev + '","' + columnDict[(curr)], '') + '"\n';
    arr.forEach((day, index) => {
        day['data'].forEach((hour, index) => {
            if (index == 0)
                csvString += '"' + day['date'] + '",';
            else
                csvString += '"",';

            csvString += '"' + hour['time'];

            csvString += dataToDownload.reduce((prev, curr, index) => prev + '","' + hour[curr], '') + '"\n';
        })
    });
    return csvString;
}

const run = function (config) {
    arr = [];
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

module.exports = {
    'run': run,
    'setConfig': setConfig,
};