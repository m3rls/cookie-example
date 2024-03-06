const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
  await page.setViewport({
    width: 1920,
    height: 1080,
  });

  // Enable the Raw Chrome Devtools Protocol
  // https://chromedevtools.github.io/devtools-protocol/tot/Network/
  const client = await page.createCDPSession();
  await client.send("Network.enable");

  client.on("Network.requestWillBeSent", (parameters) => {
    console.log('requestWillBeSent', parameters);
  });
  client.on("Network.responseReceived", (parameters) => {
    console.log('response', parameters);
  });

  // Load requested page and wait until the network has gone idle
  await page.goto("https://m3rls.github.io/cookie-example/", { waitUntil: "networkidle0" });
  
  console.log("Page Cookies", await page.cookies());
  console.log("CDP Cookies", (await client.send("Network.getAllCookies")).cookies);
  
  await browser.close();
})();