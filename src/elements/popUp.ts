import { NightwatchAPI } from "nightwatch";
import { Element } from "./elements";

export class PopUp extends Element {
  public readonly name: string;
  protected xpath: string;

  /**
   * Construct an object to interact with <mbsc-popup> elements
   *
   * @param name - the value of the <mbsc-popup> `name` attribute
   * @param app - The Nightwatch API instance
   */
  public constructor(name: string, app: NightwatchAPI) {
    super(app);
    this.name = name;
    // Element is in DOM. `style` attribute affects visibility
    this.xpath = `//mbsc-popup[@style='']//p[@name='${this.name}']`;
  }

  /**
   * Click a button within the popup
   *
   * @param button - button text
   * @param explicit - If true, matches button text exactly.
   *  If false, matches button containing text.
   *  Defaults to false.
   */
  public async clickButton(button: string, explicit?: boolean) {
    explicit = explicit ?? false;
    const xpath = explicit
      ? `//div[@role='button' and normalize-space(text())='${button}']`
      : `//div[@role='button' and contains(normalize-space(text()), '${button}')]`;

    await this.app.waitForElementVisible(xpath);
    await this.app.click(xpath);
  }
}
