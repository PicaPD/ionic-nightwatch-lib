import { NightwatchAPI } from "nightwatch";
import { IonElement } from "./elements";

export class IonButton extends IonElement {
  protected xpath: string;
  protected css: string;
  private disabledBtn: string;

  /**
   * Create an object for interacting with ion-buttons
   *
   * @param ion_app - The name of the app element (child of ion-router-outlet)
   * @param name - the value of the <ion-button> `name` attribute
   * @param app - The Nightwatch API instance
   */
  constructor(ion_app: string, name: string, app: NightwatchAPI) {
    super(ion_app, app);

    const trunk = `${this.openAppXPath}//ion-button[@name='${name}' and contains(@class, 'hydrated')`;
    this.disabledBtn = `${trunk} and contains(@class, 'button-disabled')]`;
    this.xpath = `${trunk}]`;
    this.css = `${this.openAppCSSSelector} ion-button[name="${name}"].hydrated`;
  }

  /**
   * Wait for an element to be clickable without throwing an error
   * @param timeout how long to wait for the element (ms)
   *  Optional. Defaults to globals.waitForConditionTimeout
   * @returns true if the element is clickable
   */
  public async safeWaitToBeClickable(timeout?: number) {
    const waitTime =
      timeout ??
      this.app.globals.waitForConditionTimeout ??
      IonButton.FALLBACK_WAIT;
    const start = Date.now();
    let now = start;
    while (!(await this.isClickable())) {
      now = Date.now();
      if (now - start > waitTime) {
        console.log(
          `  \x1b[33m!\x1b[0m Element ${this.getXPath()} was not clickable after ${now - start} milliseconds.`,
        );
        return false;
      }
      await new Promise((f) =>
        setTimeout(f, this.app.globals.waitForConditionPollInterval),
      );
    }
    console.log(
      `  \x1b[32m✔\x1b[0m Element ${this.getXPath()} was clickable after ${now - start} milliseconds.`,
    );
    return true;
  }

  /**
   * Query if the ion-button is clickable by checking the underlying <button> element
   *
   * @returns true if the element is clickable
   */
  public async isClickable() {
    // the disabledBtnXpath is more specific than xpath
    if (
      await this.app.isPresent({
        selector: this.disabledBtn,
        suppressNotFoundErrors: true,
      })
    ) {
      return false;
    }
    return await this.app.isPresent({
      selector: this.xpath,
      suppressNotFoundErrors: true,
    });
  }

  /**
   * Click a button hidden in a shadow DOM
   */
  async clickShadowBtn() {
    // Pierce the shadow DOM and access the underlying element
    await this.app.execute(
      function (hostSelector: string) {
        const host = document.querySelector(hostSelector) as HTMLElement & {
          shadowRoot?: ShadowRoot;
        };

        if (!host || !host.shadowRoot) {
          throw new Error("Shadow host or shadowRoot not found");
        }

        const innerButton = host.shadowRoot.querySelector("button");
        if (!innerButton) {
          throw new Error("Button inside shadow root not found");
        }

        (innerButton as HTMLElement).click();
      },
      [this.css],
    );
  }
}
