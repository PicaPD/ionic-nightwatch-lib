/**
 * Common features for page objects
 */
import { NightwatchAPI } from "nightwatch";
import { Element } from "../elements/elements";

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
  async toWeb() {
    // Add an explicit wait for the page to load
    console.log('Pausing for the web context...');
    await new Promise(f => setTimeout(f, 10_000));
    await this.app.waitUntil(async function() {
      // wait for webview context to be available
      // initially, this.getContexts() only returns ['NATIVE_APP']
      console.log('Switching to WEBVIEW')
      const contexts = await this.appium.getContexts();
      console.log(`Got Contexts: ${contexts}`);
      if (!contexts) {
        return false;
      }

      const webviewContext = contexts.find(ctx => ctx.includes('WEBVIEW'));
      if (webviewContext !== undefined) {
        console.log('Found a WEBVIEW context');
        const setContextResult = await this.appium.setContext(webviewContext);
        console.log(setContextResult);
        console.log(`Current context: ${await this.appium.getContext()}`)
        console.log('Switched to Webview');
        return true;
      }
      return false
    })
  }

  /**
   * Change testing to the native context
   *
   */
  async toNative() {
    // Native context is always available
    console.log('Switching to NATIVE')
    await this.app.appium.setContext("NATIVE_APP");
    console.log('Switched to NATIVE')
  }

  /**
   * A simple wrapper for the waitForElementPresent
   * on this.page
   */
  public async waitToLoad() {
    await this.app.waitForElementPresent(this.page);
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
  async open() {
    const pkg = "io.app.oversea";
    // Open the link
    await this.app.execute("mobile: deepLink" as any, [
      {
        url: this.deepLink,
        package: pkg,
      },
    ]);
    await this.app.waitForElementPresent(this.page);
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
  async isOpen() {
    // Change to native
    await this.toNative();
    const result = await this.app.isPresent({
      selector: this.page,
      suppressNotFoundErrors: true,
    });
    await this.toWeb();
    return result;
  }
}
