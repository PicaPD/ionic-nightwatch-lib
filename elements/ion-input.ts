import { NightwatchAPI } from "nightwatch";
import { IonElement } from "./elements";
import { Page } from "../pages/page";

export class IonInput extends IonElement {
  protected xpath: string;
  private input_xpath: string;
  private css: string;

  /**
   * Create an object for interacting with ion-inputs
   *
   * @param ion_app - The name of the app element (child of ion-router-outlet)
   * @param name - the value of the <ion-input> `name` attribute
   * @param app - The Nightwatch API instance
   */
  constructor(ion_app: string, name: string, app: NightwatchAPI) {
    super(ion_app, app);

    this.xpath = `${this.openAppXPath}//ion-input[@name='${name}' and contains(@class, 'hydrated')]`;
    this.css = `${this.openAppCSSSelector} ion-input[name="${name}"].hydrated`;
    this.input_xpath = `${this.xpath}//input`;
  }

  /**
   * Fill the input field
   *
   * @param data - data with which to fill the field
   */
  public async fill(data: string) {
    // Try to hide the keyboard just in case it was left open
    await Page.hideKeyboard(app, this);

    // Tap the field to trigger Ionic's internal logic
    await this.app.click(this.xpath);

    // iOS keyboard does not deploy here

    // Execute JS in browser context to manipulate the input directly
    await this.app.execute(
      (selector: string, value: string) => {
        const ionInput = document.querySelector(selector);
        const input = ionInput?.querySelector("input");
        if (!input) {
          throw new Error(`${selector} has no <input> child`);
        }

        // Focus input to ensure Angular detects changes
        input.focus();

        // Set value using native setter to trigger binding
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )?.set;
        nativeInputValueSetter?.call(input, value);

        // Trigger Angular's form logic
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));

        // Blur to finalize input
        input.blur();
        input.dispatchEvent(new Event("blur", { bubbles: true }));
      },
      [this.css, data],
    );

    // Try to hide the keyboard again, since iOS often ignores blur()
    await Page.hideKeyboard(app, this);
  }
}
