'use strict';
const devices = require('puppeteer/DeviceDescriptors')
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true,
    })
    try {
        const page = await browser.newPage()
        // await page.emulate(devices['iPhone X'])
        await page.goto('http://www.baidu.com')
        await page.type('#kw', '韦德')
        await page.click('#su')

        // await page.waitForNavigation({ timeout: 5000 })

        await page.waitFor(2000);

        await page.screenshot({
            path: '/Users/admin/Documents/screenshot/baidu_iphone_X.png',
            fullPage: true
        })
    } catch (error) {
        console.error(error)
    } finally {
        await browser.close();
    }
})()