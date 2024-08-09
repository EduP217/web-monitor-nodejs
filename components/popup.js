const { Notification } = require('electron');

function showNotification (message) {
    new Notification({ title: "ALERT", body: message }).show();
}

module.exports = { showNotification };
