import { NightwatchAPI } from "nightwatch";
import { Element } from "./elements";

/**
 * <ion-action-sheet> elements
 * These elements live outside of ion-app and are not context-dependent
 */
export class IonActionSheet extends Element {
  protected xpath: string;

  /**
   * Build an intractable IonActionSheet object
   *
   * @see {@link elements:Element}
   */
  constructor(app: NightwatchAPI) {
    super(app);
    this.xpath = `//ion-action-sheet`;
  }

  /**
   * Click an option in the alert window
   *
   * @param name - The exact text of the <span> element within the desired button
   */
  async clickOption(name: string) {
    await this.app.click(this.getOptionXPath(name));
  }

  /**
   * Determine if an option exists in the alert window
   * Uses a wait-and-see strategy. Is not a single, immediate query
   *
   * @param name - The exact text of the <span> element within the desired button
   */
  async hasOption(name: string) {
    await this.isPresent();
    const xpath = this.getOptionXPath(name);
    return await this.app.isPresent(xpath);
  }

  /**
   * Build an XPath for an option
   *
   * @param name - The exact text of the <span> element within the desired button
   *
   * @returns - An XPath that will match name
   */
  private getOptionXPath(name: string) {
    return `${this.xpath}//button/span[text()='${name}']/..`;
  }
}
