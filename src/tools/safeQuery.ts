import { NightwatchAPI } from "nightwatch";
const FALLBACK_WAIT = 5_000;

/**
 * Wait for an element to appear in the DOM
 *
 * @param app A NightwatchAPI instance
 * @param selector An XPath
 * @param timeout - Returns false if the element is not found in
 *  this many milliseconds.
 *  Optional. Defaults to global waitForConditionTimeout
 *
 * @returns true if the element is present in the DOM before timeout
 */
export async function waitToBePresent(
  app: NightwatchAPI,
  selector: string,
  timeout?: number,
) {
  // Set the timeout
  const waitTime =
    timeout ?? app.globals.waitForConditionTimeout ?? FALLBACK_WAIT;
  const start = Date.now();
  let now = start;

  // Polling loop
  while (!(await isPresentNow(app, selector))) {
    now = Date.now();

    // Timeout occurred
    if (now - start > waitTime) {
      console.log(
        `  \x1b[33m!\x1b[0m Element ${selector} was not present after ${now - start} milliseconds.`,
      );
      return false;
    }

    // Polling pause
    await new Promise((f) =>
      setTimeout(f, app.globals.waitForConditionPollInterval),
    );
  }

  // Loop exited; element was found
  console.log(
    `  \x1b[32m✔\x1b[0m Element ${selector} was present after ${now - start} milliseconds.`,
  );
  return true;
}

/**
 * Wait for an element to disappear from the DOM
 *
 * @param app A NightwatchAPI instance
 * @param selector An XPath
 * @param timeout - Returns false if the element is still found after
 *  this many milliseconds.
 *  Optional. Defaults to global waitForConditionTimeout
 *
 * @returns true if the element is not present in the DOM before timeout
 */
export async function waitToBeGone(
  app: NightwatchAPI,
  selector: string,
  timeout?: number,
) {
  // Set the timeout
  const waitTime =
    timeout ?? app.globals.waitForConditionTimeout ?? FALLBACK_WAIT;
  const start = Date.now();
  let now = start;

  // Polling loop
  while (await isPresentNow(app, selector)) {
    now = Date.now();

    // Timeout occurred
    if (now - start > waitTime) {
      console.log(
        `  \x1b[33m!\x1b[0m Element ${selector} was present after ${now - start} milliseconds.`,
      );
      return false;
    }

    // Polling pause
    await new Promise((f) =>
      setTimeout(f, app.globals.waitForConditionPollInterval),
    );
  }

  // Loop exited; element was found
  console.log(
    `  \x1b[32m✔\x1b[0m Element ${selector} was not present after ${now - start} milliseconds.`,
  );
  return true;
}

/**
 * Query once if an element is in the DOM
 * @returns true if the element is present in the DOM
 */
async function isPresentNow(app: NightwatchAPI, selector: string) {
  return await app.isPresent({
    selector: selector,
    suppressNotFoundErrors: true,
  });
}
