import { ElementResult, NightwatchAPI } from "nightwatch";
import { IonElement } from "./elements";
import { IonPage } from "../pages/page";

export class IonCard extends IonElement {
  protected readonly xpath: string;
  protected readonly css: string;
  private endOptionXPath: string;

  /**
   * Construct an object for interacting with <ion-cards>
   *
   * @param ion_app - The name of the app element (child of ion-router-outlet)
   * @param cardType - Match the <ion-card> `class` attribute
   * @param index - The 0-based index of displayed cards
   *  Cards are dynamically created
   * @param app - The Nightwatch API instance
   */
  constructor(
    ion_app: string,
    cardType: string,
    index: number,
    app: NightwatchAPI,
  ) {
    super(ion_app, app);
    this.app = app;

    this.xpath = `${IonPage.getOpenAppXPath(ion_app)}//ion-card[contains(@class, '${cardType}')][${index + 1}]`;
    this.endOptionXPath = `${this.xpath}//ion-item-sliding[contains(@class, 'item-sliding-active-options-end')]`;
    this.css = `${ion_app}:not(.ion-page-hidden) ion-card.${cardType}:nth-of-type(${index + 1})`;
  }

  /**
   *  Find all cards in the DOM
   *
   * @param ion_app - The name of the app element (child of ion-router-outlet)
   * @param cardType - Match the <ion-card> `class` attribute
   * @param app - The Nightwatch API instance
   */
  static async getAllCards(
    ion_app: string,
    cardType: string,
    app: NightwatchAPI,
  ) {
    const xpath = `${IonPage.getOpenAppXPath(ion_app)}//ion-card[contains(@class, '${cardType}')]`;
    const elements: ElementResult[] = await app.elements("xpath", xpath);
    const cards: IonCard[] = [];
    for (let i = 0; i < elements.length; i++) {
      cards.push(new IonCard(ion_app, cardType, i, app));
    }
    return cards;
  }

  /**
   * Expose the end options of the card
   *  i.e., swipe for menu
   */
  async openEndOptions() {
    // Wait for the specific card element to be present and hydrated
    await this.app.waitForElementPresent(this.xpath);

    // Execute script to open the end options for this specific element
    await this.app.execute(
      function (cssSelector: string) {
        // Define a docQuery function within the browser context
        function docQuery(source: Document | Element, query: string): Element {
          const result = source.querySelector(query);
          if (!result) {
            throw new Error(`Element ${query} cannot be found (nullish)`);
          }
          if (!(result instanceof Element)) {
            throw new Error(
              `Element ${query} is ${result.className}, not Element`,
            );
          }
          return result;
        }
        // Find the element by its ID
        const element: Element = docQuery(document, cssSelector);

        // Find the parent ion-item-sliding or the element itself if it's the sliding container
        const slidingElement = docQuery(element, "ion-item-sliding");

        (slidingElement as any).open("end");
      },
      [this.css],
    );

    await this.app.waitForElementPresent(this.endOptionXPath);
  }

  /**
   * Open the end option menu and press one of the buttons by name
   *
   * @param name - the text value of the menu button to press
   */
  async clickEndOption(name: string) {
    // Button visibility is tied to item-sliding-active-options-end not item-sliding-active-slide
    const option = this.getOptionXPath(name);
    await this.openEndOptions();
    await this.app.waitForElementVisible(option);
    await this.app.click(option);
  }

  /**
   * Verify that an end option exists
   */
  // TODO: replace this with hasEndOption and refactor test script to isolate verify/assert logic from principle elements
  async verifyEndOption(name: string) {
    this.app.verify.elementPresent(
      this.getOptionXPath(name),
      `Should reveal the ${name} button.`,
    );
  }

  /**
   * Generate the XPath of an end option
   *
   * @param name - the text value of the menu button
   *
   * @returns - an XPath matching a button with the supplied name
   */
  private getOptionXPath(name: string) {
    return `${this.endOptionXPath}//ion-item-option[normalize-space(text()) = '${name}']`;
  }

  /**
   * Find the value of the card header (title)
   *
   * @returns the text value of the child <ion-card-header> element
   */
  async getHeader() {
    await this.isPresent();
    const header = `${this.xpath}//ion-card-header`;
    console.log(`Finding header value for ${header}`);
    return this.app.getText(header);
  }
}
