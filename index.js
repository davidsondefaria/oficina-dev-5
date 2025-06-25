const { default: axios } = require("axios");
const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.launch({
    headless: false, // turn off headless mode
  });
  const page = await browser.newPage();

  await page.goto("https://github.com/davidsondefaria/oficina-dev-5/blob/main/README.md");

  const text = await page.locator(".markdown-body > p").textContent();

  console.log('Extracted text:', text);

  await axios.post("https://9da6-2804-14d-78b1-8448-26e3-9d9b-ae51-774b.ngrok-free.app/webhook-test/ia", { text });

  await browser.close();
}

main();
