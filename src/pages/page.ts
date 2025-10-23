/**
 * Common features for page objects
 */
import { NightwatchAPI } from "nightwatch";
import { Element } from "../elements/elements";
import { waitToBeGone, waitToBePresent } from "../tools/safeQuery";

export abstract class Page {
  // Fallback if this.app.globals.waitForConditionTimeout is undefined
  protected static readonly FALLBACK_WAIT = 5_000; // milliseconds

  protected abstract readonly page: string; // Highest specific XPath to the page
  protected readonly app: NightwatchAPI;

  constructor(app: NightwatchAPI) {
    this.app = app;
  }

  /**
   * Change testing to the Web context
   */
  static async toWeb(app: NightwatchAPI) {
    if ((await app.appium.getContext())?.includes("WEBVIEW")) {
      console.log("A Web context is active. No change will be made.");
      return;
    }

    // Context switching on iOS is fragile and the best way
    // I've found to reliably change is to RELAUNCH THE GOSHDARN APP
    if (app.options.desiredCapabilities?.["platformName"] === "ios") {
      console.log("Relaunching the app");
      // Terminate the app
      const bundleId =
        await app.options.desiredCapabilities?.["appium:bundleId"];
      if (!bundleId || typeof bundleId !== "string") {
        console.warn("WARNING: Could not find an appium:bundleId");
      } else {
        await app.execute("mobile: terminateApp", [{ bundleId: bundleId }]);
        await app.pause(3000);
        // Activate/launch the app
        await app.execute("mobile: activateApp", [{ bundleId: bundleId }]);
        await app.pause(3000);
      }
    }

    // Faithfully copied from Nightwatch's docs
    app
      .waitUntil(async function () {
        // wait for webview context to be available
        // initially, this.getContexts() only returns ['NATIVE_APP']
        const contexts = await this.appium.getContexts();

        return contexts.length > 1;
      })
      .perform(async function () {
        // switch to webview context
        const contexts = await this.appium.getContexts(); // contexts: ['NATIVE_APP', 'WEBVIEW_<id>']
        await this.appium.setContext(contexts[1]);
      });
  }

  /**
   * Change testing to the native context
   *
   */
  static async toNative(app: NightwatchAPI) {
    // Native context is always available
    await app.appium.setContext("NATIVE_APP");
  }

  /**
   * Wait for a page to load
   *
   * @param timeout - Returns false if the page is not found in
   *  this many milliseconds.
   *  Optional. Defaults to global waitForConditionTimeout
   *
   * @returns true if the page is present in the DOM before
   *  the method times out
   */
  public async isLoaded(timeout?: number) {
    return await waitToBePresent(this.app, this.page, timeout);
  }

  /**
   * Wait for a page to be gone
   *
   * @param timeout - Returns false if the page is still found after
   *  this many milliseconds.
   *  Optional. Defaults to global waitForConditionTimeout
   *
   * @returns true if the page is not present in the DOM before
   *  the method times out
   */
  public async isGone(timeout?: number) {
    return await waitToBeGone(this.app, this.page, timeout);
  }

  /**
   * Wait for the keyboard to be fully deployed
   *
   * @returns true if the keyboard opened
   */
  private static async waitForKeyboardOpen(
    app: NightwatchAPI,
    timeout?: number,
  ) {
    const waitTime =
      timeout ?? app.globals.waitForConditionTimeout ?? Page.FALLBACK_WAIT;
    const start = Date.now();
    let now = start;
    while (!(await app.appium.isKeyboardShown())) {
      now = Date.now();
      if (now - start > waitTime) {
        return false;
      }
      await new Promise((f) =>
        setTimeout(f, app.globals.waitForConditionPollInterval),
      );
    }
    return true;
  }

  /**
   * Dismiss the soft keyboard
   */
  static async hideKeyboard(app: NightwatchAPI, targetElement?: Element) {
    // Wait for the keyboard to fully open
    if (!(await Page.waitForKeyboardOpen(app, 250))) {
      return;
    }
    // this.app.appium.hideKeyboard() does not work on iOS
    try {
      await app.waitUntil(async function () {
        // ios keyboards are stubborn
        // this wait will timeout if this is not executed repeatedly
        await this.click("//body"); // works for iOS
        await this.appium.hideKeyboard(); // works for Android
        return !(await this.appium.isKeyboardShown());
      });
    } catch (error) {
      console.error("Could not hide keyboard");
      throw error;
    }
    if (targetElement) {
      await app.waitForElementVisible(
        targetElement.getXPath(),
        `Element ${targetElement.getXPath()} was not visible after hiding keyboard`,
      );
    }
  }

  // Dev Tools
  // ############################################

  /**
   * Send the entire page source to the console
   */
  async getAppSource() {
    const pageSource = await this.app.document.pageSource();
    console.log(pageSource); // Logs the XML structure of the current screen
  }
}

export abstract class IonPage extends Page {
  protected abstract readonly deepLink: string;
  protected abstract readonly ion_app: string;

  protected get loadingSpinner(): string {
    return `${IonPage.getOpenAppXPath(this.ion_app)}//ion-content//app-loading-spinner`;
  }

  /**
   * Open the page via deep link and hold until it is loaded
   * Cross-platform deep link handler for iOS and Android real devices.
   * For iOS, uses Safari to open the custom URL scheme.
   * For Android, uses mobile:deepLink (Appium-specific).
   */
  async open(timeout?: number) {
    console.log(`Opening ${this.deepLink}`);

    // 3 attempts
    for (let i = 0; i < 3; i++) {
      // Open the link
      await this.executeDeepLink();
      if (await this.isLoaded()) {
        return;
      } else {
        console.log(`Could not open page: attempt ${i + 1} / 3`);
      }
    }
  }

  protected async executeDeepLink() {
    const pkg = "io.app.oversea";
    await this.app.execute("mobile: deepLink" as any, [
      {
        url: this.deepLink,
        package: pkg,
      },
    ]);
  }

  public static getOpenAppXPath(ion_app: string) {
    return `//${ion_app}[not(contains(@class, 'ion-page-hidden'))]`;
  }
}

export abstract class NativePage extends Page {
  /**
   * Determine if a native page is open or not
   * Uses an instant-read strategy
   *
   * @returns true if the page is open
   */
  async isLoaded() {
    // Change to native
    await Page.toNative(this.app);
    const result = await super.isLoaded();

    // Switching to web on a native page in iOS will crash
    if (!result) {
      await Page.toWeb(this.app);
    }
    return result;
  }
}
