const puppeteer = require('puppeteer');


async function checkWebsite(site) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(site.url);
    
    const content = await page.content();

    await browser.close();
    const hasChanged = content !== site.content;
    
    return { content, hasChanged };
}

module.exports = { checkWebsite };
