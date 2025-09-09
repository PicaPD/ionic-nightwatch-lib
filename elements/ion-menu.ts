import { NightwatchAPI } from "nightwatch";
import { IonElement } from "./elements";
import { IonPage } from "../page";

export class IonMenu extends IonElement {
  protected readonly xpath: string;
  protected readonly openXPath: string;
  protected readonly closedXPath: string;

  /**
   * Create an object for interacting with ion-menu
   *
   * @param ion_app - The name of the app element (child of ion-router-outlet)
   * @param app - The Nightwatch API instance
   */
  constructor(ion_app: string, app: NightwatchAPI) {
    super(ion_app, app);

    this.openXPath = `${IonPage.getOpenAppXPath(ion_app)}//ion-menu[contains(@class, 'show-menu')]`;
    this.closedXPath = `${IonPage.getOpenAppXPath(ion_app)}//ion-menu[not(contains(@class, 'show-menu'))]`;
    this.xpath = this.openXPath;
  }

  /**
   * Open the menu
   */
  async open() {
    console.log("Opening hamburger menu");
    if (await this.isPresent()) {
      return;
    }
    const menuButton = `${this.openAppXPath}//ion-menu-button[contains(@class, 'hydrated')]`;
    await this.app.waitForElementVisible(menuButton);
    await this.app.click(menuButton);
    await this.app.waitForElementVisible(this.openXPath);
  }

  /**
   * Click a menu option
   *
   * @param optionTree - a list of menu options to click
   *
   * @example
   * Given a menu of the following form:
   *  Account
   *      - Edit
   *      - Sign Out
   *      - Billing
   *  Settings
   *      - Notifications
   *      - Appearance
   *      - Behavior
   *          - Alarms
   *          - Accessibility
   *          - Network
   *  Help
   *      - FAQ
   *      - SUpport
   *      - About
   *
   * The "Accessibility" menu can be selected by passing
   * clickOption(['Settings', 'Behavior', 'Accessibility'])
   * The UI will click through to Settings->Behavior->Accessibly
   */
  async clickOption(optionTree: string[]) {
    let depth = 0;
    let xPath = `${this.openXPath}//ion-item[.//ion-label[contains(normalize-space(), '${optionTree[depth]}')]]`;
    while (true) {
      await this.app.waitForElementVisible(xPath);
      await this.app.click(xPath);
      depth++;
      if (depth >= optionTree.length) {
        return;
      }
      xPath += `/../ion-item-group/ion-item[.//ion-label[contains(normalize-space(), '${optionTree[depth]}')]]`;
    }
  }

  /**
   * Close the menu by swiping it left
   */
  async close() {
    await this.swipeLeft();
    await this.isGone();
  }
}
