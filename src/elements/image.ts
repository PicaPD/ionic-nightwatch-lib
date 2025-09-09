import { NightwatchAPI } from "nightwatch";
import { IonElement } from "./elements";

/**
 * <img> elements
 */
export class Image extends IonElement {
  protected xpath: string;

  /**
   * Build an intractable Image object
   *
   * @param ion_app - The name of the element between <ion-router-outlet>
   *    and <ion-content> that identifies the correct app page
   * @param src - Images are matched by the contents of the src attribute
   *   Does not need to be an exact match. Uses the `contains` method
   * @param app - The Nightwatch API interface
   */
  constructor(ion_app: string, src: string, app: NightwatchAPI) {
    super(ion_app, app);
    this.xpath = `${this.openAppXPath}//img[contains(@src, '${src}')]`;
  }
}
