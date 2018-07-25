'use-strict';

const fs = require('fs');
const path = require('path');
const getAnswer = require('./logic');

const CONFIG_FILE_NAME = 'config.json';

const run = function() {
    const hasConfigFile = function() {
        return fs.existsSync(path.join(__dirname, CONFIG_FILE_NAME));
    }

    const setConfig = function() {
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
        }
    }

    // TODO
    const saveConfig = function() {

    }

    const getConfig = function() {
        config = {
            apiKey: $('#api-key-config').val(),
            latitude: parseFloat($('#latitude-config').val()),
            longitude: parseFloat($('#longitude-config').val()),        
            startDay: parseInt($('#start-day-config').val()),
            startMonth: parseInt($('#start-month-config').val()),
            startYear: parseInt($('#start-year-config').val()),
            numOfDays: parseInt($('#number-of-days-config').val()),
        }
        return config;
    }

    const saveToCsv = function(config) {

    }

    setConfig();
    $('#submit-button').click(function(event) {
        let config = getConfig();
        getAnswer(config);
    });
}

$(run);
