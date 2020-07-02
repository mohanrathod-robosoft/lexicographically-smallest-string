const puppeteer = require('puppeteer-core');
 
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080');
  await page.screenshot({path: 'puppeteerparse.js'});
 
  await browser.close();
})();