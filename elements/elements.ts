import { NightwatchAPI } from "nightwatch";
import { IonPage } from "../page";

export abstract class Element {
  // Constant Selenium element ID
  public static readonly ELEMENT_ID = "element-6066-11e4-a52e-4f735466cecf";

  protected app: NightwatchAPI;
  protected abstract xpath: string;

  /**
   * Construct a new intractable Element
   *
   * @param app - The Nightwatch API interface
   */
  constructor(app: NightwatchAPI) {
    this.app = app;
  }

  /**
   * Getter for the element XPath
   *
   * @returns the XPath as a string
   */
  public getXPath() {
    return this.xpath;
  }

  /**
   * Click the element
   * Unlike app.click(selector), this method waits
   * for the element to become visible instead of
   * immediately firing off the click
   */
  public async click() {
    await this.app.waitForElementVisible({
      selector: this.xpath,
      abortOnFailure: true,
    });
    await this.app.click(this.xpath);
  }

  /**
   * Query once if an element is in the DOM
   * @returns true if the element is present in the DOM
   */
  private async isPresentNow() {
    return await this.app.isPresent({
      selector: this.xpath,
      suppressNotFoundErrors: true,
    });
  }

  /**
   * Wait for an element to appear in the DOM
   *
   * @param timeout - Returns false if the element is not found in
   *  this many milliseconds.
   *  Optional. Defaults to global waitForConditionTimeout
   *
   * @returns true if the element is present in the DOM before
   *  the method times out
   */
  public async isPresent(timeout?: number) {
    const waitTime = timeout ?? this.app.globals.waitForConditionTimeout;
    const start = Date.now();
    let now = start;
    while (!(await this.isPresentNow())) {
      now = Date.now();
      if (now - start > waitTime) {
        console.log(
          `  \x1b[33m!\x1b[0m Element ${this.xpath} was not present after ${now - start} milliseconds.`,
        );
        return false;
      }
      await new Promise((f) =>
        setTimeout(f, this.app.globals.waitForConditionPollInterval),
      );
    }
    console.log(
      `  \x1b[32m✔\x1b[0m Element ${this.xpath} was present after ${now - start} milliseconds.`,
    );
    return true;
  }

  /**
   * Wait for an element to disappear from the DOM or timeout
   *
   * @param timeout - Returns false if the element is not found in
   *  this many milliseconds.
   *  Optional. Defaults to global waitForConditionTimeout
   *
   * @returns true if the element is not present in the DOM before the element times out
   */
  public async isGone(timeout?: number) {
    const waitTime = timeout ?? this.app.globals.waitForConditionTimeout;
    const start = Date.now();
    let now = start;
    while (await this.isPresentNow()) {
      now = Date.now();
      if (now - start > waitTime) {
        console.log(
          `  \x1b[33m!\x1b[0m Element ${this.xpath} was present after ${now - start} milliseconds.`,
        );
        return false;
      }
      await new Promise((f) =>
        setTimeout(f, this.app.globals.waitForConditionPollInterval),
      );
    }
    console.log(
      `  \x1b[32m✔\x1b[0m Element ${this.xpath} was not present after ${now - start} milliseconds.`,
    );
    return true;
  }

  /**
   * Swipe left on the element 75% of its width
   */
  public async swipeLeft() {
    const rect = await this.app.getElementRect("xpath", this.xpath);

    // Swipe using coordinates
    await this.app.execute("mobile: swipeGesture", [
      {
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        direction: "left",
        percent: 0.75,
      },
    ]);
  }

  /**
   * Swipe right on the element 75% of its width
   */
  public async swipeRight() {
    const rect = await this.app.getElementRect("xpath", this.xpath);

    // Swipe using coordinates
    await this.app.execute("mobile: swipeGesture", [
      {
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        direction: "right",
        percent: 0.75,
      },
    ]);
  }
}

/**
 * Add app context for all elements in an ion app
 */
export abstract class IonElement extends Element {
  protected openAppXPath: string;
  protected openAppCSSSelector: string;

  /**
   * Create a new IonElement
   *
   * @param ion_app - The name of the element between <ion-router-outlet>
   *    and <ion-content> that identifies the correct app page
   * @param app - The Nightwatch API interface
   */
  constructor(ion_app: string, app: NightwatchAPI) {
    super(app);
    this.openAppXPath = IonPage.getOpenAppXPath(ion_app);
    this.openAppCSSSelector = `${ion_app}:not(.ion-page-hidden)`;
  }
}
