const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('file://' + __dirname + '/index.html');
    
    await page.waitForTimeout(1000);
    
    const visibleTabs = await page.evaluate(() => {
        const panels = document.querySelectorAll('.tab-panel');
        return Array.from(panels).map(p => ({
            id: p.id,
            display: window.getComputedStyle(p).display
        }));
    });
    console.log("Visible Tabs Initial:", visibleTabs);
    
    // Click Threat Map tab
    await page.evaluate(() => {
        const tabs = document.querySelectorAll('.nav-tab');
        tabs[1].click(); // target threat-map-view
    });
    
    await page.waitForTimeout(500);
    
    const visibleTabsAfter = await page.evaluate(() => {
        const panels = document.querySelectorAll('.tab-panel');
        return Array.from(panels).map(p => ({
            id: p.id,
            display: window.getComputedStyle(p).display
        }));
    });
    console.log("Visible Tabs After Click:", visibleTabsAfter);
    
    await browser.close();
})();
