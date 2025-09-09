import { NightwatchAPI } from "nightwatch";
import { IonElement } from "./elements";
import { IonPage } from "../page";

export class IonItem extends IonElement {
  protected xpath: string;
  protected css: string;

  /**
   * Create an object for interacting with ion-items
   *
   * @param ion_app - The name of the app element (child of ion-router-outlet)
   * @param name - the value of the <ion-item> `name` attribute
   * @param app - The Nightwatch API instance
   */
  constructor(ion_app: string, name: string, app: NightwatchAPI) {
    super(ion_app, app);

    this.xpath = `${IonPage.getOpenAppXPath(ion_app)}//ion-item[@name='${name}' and contains(@class, 'hydrated')]`;
    this.css = `${this.openAppCSSSelector} ion-item[name="${name}"].hydrated`;
  }
}
