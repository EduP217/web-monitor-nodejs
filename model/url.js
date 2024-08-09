const { checkWebsite } = require('../scrap/monitor');


class URLItem {
    constructor(id, url, checkInterval, state) {
        this.id = id;
        this.url = url;
        this.checkInterval = checkInterval;
        this.state = state;
        this.name = "";
        this.content = "";
        this.lastResult = "Initial scan...";
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    isValidURL() {
        try {
            new URL(this.url);
            return true;
        } catch (_) {
            return false;
        }
    }    

    async startMonitoring() {
        const { content, hasChanged } = await checkWebsite(this);
        this.updatedAt = new Date();
    
        let result = "No change detected";
        if(this.content !== "" && hasChanged) {
            result = `Change detected at ${this.updatedAt.toISOString()}`;
        }
    
        this.state = "Scan completed";
        this.lastResult = result;
        this.content = content;
    
        return hasChanged;
    }
}

module.exports = URLItem;
