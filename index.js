const { chromium } = require("playwright");
const { huddleTitle } = require("./selectors");

async function main() {
  const browser = await chromium.launchPersistentContext("/tmp/test-slackbot", {
    headless: false,
    args: ["--start-maximized"],
    viewport: null,
  });
  console.log("Browser launched!");
  const page = await browser.newPage();

  console.log("Navigating to slack.com...");

  // logar com email usando o link abaixo antes de tentar pegar a transcrição
  // await page.goto("https://slack.com/signin");

  await page.goto("https://app.slack.com/huddle/T02HDPYV6J3/C02HDPZ0W6B");

  const popupPromise = page.waitForEvent("popup", { timeout: 500000 });
  const popup = await popupPromise;

  const txt = popup.locator(huddleTitle);

  console.log("Huddle title: ", await txt.textContent());

  while (true) {
    const msgLocator = popup.locator(".p-huddle_event_log__transcription");
    console.log("Message visible");

    try {
      const msg = await msgLocator.textContent({ timeout: 5000000 });
      console.log("Transcription: ", msg);
    } catch (error) {
      console.log(error);
    }
  }
}

main();
