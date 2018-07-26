'use-strict';

const fs = require('fs');
const path = require('path');
const downloader = require('./weather-downloader.js');

const CONFIG_FILE_NAME = 'config.json';

const run = function () {
    const hasConfigFile = function () {
        return fs.existsSync(path.join(__dirname, CONFIG_FILE_NAME));
    }

    const setConfig = function () {
        if (hasConfigFile()) {
            // TODO: Handle error reading
            config = JSON.parse(fs.readFileSync(path.join(__dirname, CONFIG_FILE_NAME), 'utf8'));

            $('#api-key-config').val(config['apiKey']);
            $('#latitude-config').val(config['latitude']);
            $('#longitude-config').val(config['longitude']);
            $('#start-day-config').val(config['startDay']);
            $('#start-month-config').val(config['startMonth']);
            $('#start-year-config').val(config['startYear']);
            $('#number-of-days-config').val(config['numOfDays']);

            $(':checkBox').each(function (index, checkbox) {
                if (config.dataToDownload.includes(checkbox.id.substring(0, checkbox.id.indexOf('-')))) {
                    checkbox.checked = true;
                }
            });
        }
    }

    // TODO
    const saveConfig = function () {
        let config = getConfig();
        fs.writeFileSync(path.join(__dirname, CONFIG_FILE_NAME), JSON.stringify(config));
    }

    const getConfig = function () {
        config = {
            apiKey: $('#api-key-config').val(),
            latitude: parseFloat($('#latitude-config').val()),
            longitude: parseFloat($('#longitude-config').val()),
            startDay: parseInt($('#start-day-config').val()),
            startMonth: parseInt($('#start-month-config').val()),
            startYear: parseInt($('#start-year-config').val()),
            numOfDays: parseInt($('#number-of-days-config').val()),
            dataToDownload: getDataToDownload()
        }
        return config;
    }

    const getDataToDownload = function () {
        const dataToDownload = [];
        $(':checkBox').each(function (index, checkbox) {
            if (checkbox.checked) {
                dataToDownload.push(checkbox.id.substring(0, checkbox.id.indexOf('-')));
            }
        });
        return dataToDownload;
    }

    $('#submit-button').click(function (event) {
        let config = getConfig();
        console.log("Hello there");
        downloader.setConfig(config);
        downloader.run();
    });

    window.addEventListener('beforeunload', function () {
        saveConfig();
    })

    // Load settings from config file
    setConfig();
}

$(run);