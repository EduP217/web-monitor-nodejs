const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const monitor = require('./model/monitor');
const URLItem = require('./model/url');
const { showNotification } = require('./components/popup');

global.rootPath = app.getAppPath();


function createWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 850,
        webPreferences: {
            preload: path.join(global.rootPath, 'config/preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


ipcMain.handle('check-website', async (e, url, checkInterval, intervalType) => {
    const urls = monitor.listURLs();
    let lastId = 1;
    if (urls.length > 0) {
        lastId = urls[urls.length - 1].id + 1;
    }

    let intervalTime = checkInterval * 1000;
    if (intervalType === "minutes") {
        intervalTime = checkInterval * 60 * 1000;
    } else if (intervalType === "hours") {
        intervalTime = checkInterval * 60 * 60 * 1000;
    } else if (intervalType === "days") {
        intervalTime = checkInterval * 24 * 60 * 60 * 1000;
    }

    const urlItem = new URLItem(lastId, url, intervalTime, "Created");
    if(!urlItem.isValidURL()) {
        showNotification("The URL provided is corrupted. Please, try again with a correct URL.");
        return false;
    }

    monitor.addURL(urlItem);
    showNotification("URL item added to monitor");
    return true;
});

ipcMain.handle('list-monitoring', async (e) => {
    const urls = monitor.listURLs().slice();
    return urls.sort().reverse();
});

ipcMain.handle('remove-url', async (e, id) => {
    const result = monitor.removeURL(id);
    if(!result) {
        showNotification("There was an error removing the URL");
        return false;
    }
    showNotification("URL item removed successfully.");
    return true;
});
