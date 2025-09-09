import { NightwatchAPI } from "nightwatch";
import { IonElement } from "./elements";

export class IonMenuButton extends IonElement {
  protected xpath: string;

  /**
   * Create an object for interacting with ion-menu-buttons
   *
   * @param ion_app - The name of the app element (child of ion-router-outlet)
   * @param name - the value of the <ion-menu-button> `name` attribute
   * @param app - The Nightwatch API instance
   */
  constructor(ion_app: string, name: string, app: NightwatchAPI) {
    super(ion_app, app);
    this.xpath = `${this.openAppXPath}//ion-menu-button[@name='${name}' and contains(@class, 'hydrated')]`;
  }
}
