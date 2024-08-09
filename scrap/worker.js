const { parentPort } = require('worker_threads');
const URLItem = require('../model/url');


parentPort.on('message', async ({urlItem}) => {
    setTimeout(async () => {
        const _ = Object.assign(new URLItem(), urlItem);
        const hasChanged = await _.startMonitoring();
        parentPort.postMessage({_, hasChanged});
    }, urlItem.checkInterval);
});
