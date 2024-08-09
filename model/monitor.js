const { BrowserWindow } = require('electron');
const path = require('path');
const { Worker } = require('worker_threads');
const { showNotification } = require('../components/popup');
const URLItem = require('../model/url');


let urls = [];
let workers = {};

const listURLs = () => {
    return urls;
}

const getURL = async (id) => {
    return urls.find(item => item.id === id);
}

const addURL = async (urlItem) => {
    urls.push(urlItem);
    await urlItem.startMonitoring();
    BrowserWindow.getAllWindows()[0].webContents.send('refresh-item', urlItem);
    runWorker(urlItem.id);
}

const updateURL = async (urlItem) => {
    const index = urls.findIndex(item => item.id === urlItem.id);
    if (index > -1) {
        urls[index] = urlItem;
    }
}

const removeURL = async (id) => {
    const index = urls.findIndex(item => item.id === id);
    if (index > -1) {
        urls.splice(index, 1);
        workers[id].terminate();
        delete workers[id];

        return true;
    }
}

const runWorker = async (id, interval) => {
    if (workers[id]) {
        workers[id].terminate();
    }

    let urlItem = await getURL(id);
    const worker = new Worker(path.join(global.rootPath, 'scrap/worker.js'));
    worker.postMessage({urlItem});

    worker.on('message', async ({_, hasChanged}) => {
        await updateURL(Object.assign(new URLItem(), _));

        BrowserWindow.getAllWindows()[0].webContents.send('refresh-item', _);
        if (hasChanged) {
            showNotification(_.lastResult);
        }

        urlItem = await getURL(id);
        worker.postMessage({ urlItem });
    });

    workers[id] = worker;
}

module.exports = {
    listURLs,
    getURL,
    addURL,
    updateURL,
    runWorker,
    removeURL
};
