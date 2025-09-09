import { NightwatchAPI } from "nightwatch";
import { IonElement } from "./elements";

export class IonFabButton extends IonElement {
  protected xpath: string;

  /**
   * Create an object for interacting with ion-fab-buttons
   *
   * @param ion_app - The name of the app element (child of ion-router-outlet)
   * @param name - the value of the <ion-fab-button> `name` attribute
   * @param app - The Nightwatch API instance
   */
  constructor(ion_app: string, name: string, app: NightwatchAPI) {
    super(ion_app, app);
    this.xpath = `${this.openAppXPath}//ion-fab-button[@name='${name}']`;
  }
}
