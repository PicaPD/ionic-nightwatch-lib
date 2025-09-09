import { IonElement } from "./elements";
import { NightwatchAPI } from "nightwatch";

export class IonAlert extends IonElement {
  protected xpath: string;
  public readonly inputField: string;

  /**
   * Build an element for IonAlert boxes
   *
   * @param ion_app - The name of the app element (child of ion-router-outlet)
   * @param app - The Nightwatch API instance
   */
  constructor(
    ion_app: string,
    app: NightwatchAPI,
    { heading = "", body = "", explicit = false },
  ) {
    super(ion_app, app);

    const h = explicit
      ? `h2[normalize-space(text())='${heading}']`
      : `h2[contains(normalize-space(text()), '${heading}')]`;

    const p = explicit
      ? `div[normalize-space(text())='${body}']`
      : `div[contains(normalize-space(text()), '${body}')]`;

    this.xpath = "//ion-alert[contains(@class, 'hydrated')";

    if (heading !== "") {
      this.xpath += ` and .//${h}`;
    }

    if (body !== "") {
      this.xpath += ` and .//${p}`;
    }

    this.xpath += "]";

    this.inputField = `${this.xpath}//input`;
  }

  /**
   * Click a button within the alert
   *
   * @param button - button text
   * @param explicit - If true, matches button text exactly.
   *  If false, matches button containing text.
   *  Defaults to false.
   */
  public async clickButton(button: string, explicit?: boolean) {
    explicit = explicit ?? false;
    const xpath = this.generateButtonXPath(button, explicit);

    await this.app.waitForElementVisible(xpath);
    await this.app.click(xpath);
  }

  /**
   * Determine if a button exists within the alert
   * Uses a wait-and-see strategy
   *
   * @param button - button text
   * @param explicit - If true, matches button text exactly.
   *  If false, matches button containing text.
   *  Defaults to false.
   *
   * @returns true if a matching button was found
   */
  public async hasButton(button: string, explicit?: boolean) {
    explicit = explicit ?? false;
    await this.isPresent();
    const xpath = this.generateButtonXPath(button, explicit);
    return await this.app.isPresent(xpath);
  }

  /**
   * Determine if an input field exists within the alert
   * Uses a wait-and-see strategy
   *
   * @returns true if an input field was found
   */
  public async hasInputField() {
    await this.isPresent();
    return await this.app.isPresent(this.inputField);
  }

  /**
   * Find the placeholder value for the input field
   *
   * @returns Value of the 'placeholder' attribute as a string
   */
  public async inputFieldPlaceholderValue() {
    await this.app.waitForElementPresent(this.inputField);
    return await this.app.getAttribute(this.inputField, "placeholder");
  }

  /**
   * Fill the input field
   *
   * @param data - string with which to fill the field
   */
  public async fillField(data: string) {
    await this.app.waitForElementPresent(this.inputField);
    await this.app.clearValue(this.inputField);
    await this.app.sendKeys(this.inputField, data);
    // Page.hidekeyboard() will dismiss the alert message
    // because it clicks outside the window
  }

  /**
   * Determine the XPath of a button within the alert
   *
   * @param optionName - The text of the button
   * @param explicit - Forces an exact match if true
   *
   * @returns - an XPath that will match the button
   */
  private generateButtonXPath(optionName: string, explicit: boolean) {
    explicit = explicit ?? false;

    return explicit
      ? `${this.xpath}//button[.//text()[normalize-space() = '${optionName}']]`
      : `${this.xpath}//button[.//text()[contains(normalize-space(), '${optionName}')]]`;
  }
}
