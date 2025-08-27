const { chromium } = require("playwright");
const { setTimeout } = require("node:timers/promises");
// const { huddleTitle } = require("./selectors");

const handleTranscriptionUpdate = (popup, messages) => {
  return async (text) => {
    try {
      const msgPai = popup.locator(".c-virtual_list__item[tabindex='0']");
      const paiId = await msgPai.getAttribute("data-item-key");

      if (paiId <= 1) return;

      const lastCompletedUser = popup.locator(
        `.c-virtual_list__item[data-item-key='${
          paiId - 1
        }'] .p-huddle_event_log__member_name`
      );

      const lastCompletedMessage = popup.locator(
        `.c-virtual_list__item[data-item-key='${
          paiId - 1
        }'] .p-huddle_event_log__transcription`
      );

      const currentUser = popup.locator(
        `.c-virtual_list__item[data-item-key='${paiId}'] .p-huddle_event_log__member_name`
      );

      const currentMessage = popup.locator(
        `.c-virtual_list__item[data-item-key='${paiId}'] .p-huddle_event_log__transcription`
      );

      const messageToUpdate = messages.find((msg) => msg.id === "last");

      if (messageToUpdate) {
        messageToUpdate.user = await currentUser.textContent();
        messageToUpdate.message = await currentMessage.textContent();
      } else {
        messages.push({
          user: await currentUser.textContent(),
          message: await currentMessage.textContent(),
          id: "last",
        });
      }

      if (messages.find((msg) => msg.id === paiId - 1)) return;

      messages.push({
        user: await lastCompletedUser.textContent(),
        message: await lastCompletedMessage.textContent(),
        id: paiId - 1,
      });

      console.log(messages);
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

  const messages = [];
  await popup.exposeFunction(
    "onTranscriptionUpdate",
    handleTranscriptionUpdate(popup, messages)
  );
  let transcriptionActivated = false;

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
