import puppeteer from "puppeteer";

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

  // Fired when page is about to send HTTP request.
  client.on("Network.requestWillBeSent", (parameters) => {
    if (parameters.request.url == "https://plausible.io/api/event") {
      console.log("Plausible", parameters);
    }
    pairs[parameters.requestId] = {
      request: parameters,
      response: {},
    };

    // console.log(`The request ${request_url} was initiated by ${initiator_url}.`);
  });

  // Fired when HTTP response is available.
  client.on("Network.responseReceived", (parameters) => {
    if (pairs[parameters.requestId]) {
      pairs[parameters.requestId].response = parameters;
    } else {
      console.log("pairs?", parameters);
    }
  });

  // Load requested page and wait until the network has gone idle
  await page.goto("https://m3rls.github.io/cookie-example/", { waitUntil: "networkidle0" });
  
  console.log(
    "cookies 2",
    (await client.send("Network.getAllCookies")).cookies
  );

  await browser.close();
})();