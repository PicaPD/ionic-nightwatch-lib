import { NightwatchAPI } from "nightwatch";

/**
 * Take a screenshot of an element.
 *
 * @param selector The selector of the target element
 * @param filePath The destination filepath of the resulting PNG image
 */
export async function elementScreenShot(
  app: NightwatchAPI,
  selector: string,
  filePath: string,
) {
  await app.waitForElementVisible(selector, 10_000);
  const data = await app.takeElementScreenshot(selector);
  if (data) {
    await require("fs/promises").writeFile(filePath, data, "base64");
  } else {
    throw Error(`Could not capture element ${selector}`);
  }
}
