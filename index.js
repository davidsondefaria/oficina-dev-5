const { chromium } = require("playwright");
const { setTimeout } = require("node:timers/promises");
// const { huddleTitle } = require("./selectors");

const handleTranscriptionUpdate = (popup) => {
  return async (text) => {
    try {
      const msgName = popup.locator(
        ".c-virtual_list__item[tabindex='0'] .p-huddle_event_log__member_name"
      );
      console.log("User: ", await msgName.textContent());

      const msgText = popup.locator(
        ".c-virtual_list__item[tabindex='0'] .p-huddle_event_log__transcription"
      );
      console.log("Message: ", await msgText.textContent());
    } catch (error) {
      console.log(error);
    }
  };
};

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

  await page.goto("https://app.slack.com/client/T09137B6UNN/D0912TB66NQ");

  await page.getByLabel("Start huddle with Davidson ZRP").click();

  console.log("started huddle");

  // Set up popup listener before clicking
  const popupPromise = page.waitForEvent("popup", { timeout: 10000 });

  console.log("Clicking 'Open huddle window'...");
  await page.getByLabel("Open huddle window").click();

  const popup = await popupPromise;

  await popup.exposeFunction(
    "onTranscriptionUpdate",
    handleTranscriptionUpdate(popup)
  );
  let transcriptionActivated = false;

  const messages = [];
  const transcriptSelector = ".c-virtual_list__scroll_container";

  const mutationObserverInit = ([selector]) => {
    const targetNode = document.querySelector(selector);

    if (!targetNode) {
      console.error("Elemento da transcrição não encontrado!");
      return;
    }

    const config = {
      childList: true,
      subtree: true,
      characterData: true,
    };

    const callback = (mutationsList, observer) => {
      console.log("dentro do callback");
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          console.log("A child node has been added or removed.");
        } else if (mutation.type === "attributes") {
          console.log(`The ${mutation.attributeName} attribute was modified.`);
        }
      }
      const fullText = targetNode.innerText;
      window.onTranscriptionUpdate(fullText);
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    window.onTranscriptionUpdate(targetNode.innerText);
  };

  if (!transcriptionActivated) {
    await popup.getByLabel("Settings").click();
    console.log("Settings clicked");

    await popup.getByText("Show captions").click();
    console.log("Show captions clicked");

    await popup.getByText("Side-by-side").click();
    console.log("Side-by-side clicked");

    // await popup.getByText("Change huddle language").click();
    // console.log("Change huddle language clicked");

    // await popup.getByText("Português (Brasil)").click();
    // console.log("Language changed to Português (Brasil)");

    // await popup.getByText("Continue").click();
    // console.log("Continue clicked");
    transcriptionActivated = true;
  }
  await setTimeout(30_000, null);
  await popup.evaluate(mutationObserverInit, [transcriptSelector]);
}

main();
