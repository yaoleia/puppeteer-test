const devices = require('puppeteer/DeviceDescriptors')
const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({
        headless: true
    })

    try {
        const page = await browser.newPage()
        // await page.emulate(devices['iPhone X'])

        await page.goto('http://lh.nemoface.com/')
        await page.type('.el-input__inner[type="text"]', 'admin')
        await page.type('.el-input__inner[type="password"]', 'deepglint')
        await page.click('.el-button[type="button"]')
        // const elementHandle = await page.$('.el-input__inner[type="password"]');
        // await elementHandle.press('Enter');
        await page.setViewport({ width: 1920, height: 1080 });

        // await page.waitForNavigation({ timeout: 3000 })

        await page.waitFor(5000);

        await page.screenshot({
            path: '/Users/admin/Documents/screenshot/baidu_iphone_X_search_puppeteer.png'
        })
    } catch (error) {
        console.error(error)
    } finally {
        await browser.close()
    }

})()