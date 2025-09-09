import { NightwatchAPI } from "nightwatch";
import { IonElement } from "./elements";

export class IonToggle extends IonElement {
  protected xpath: string;
  protected css: string;
  private trueTog: string;

  /**
   * Create an object for interacting with ion-toggle
   *
   * @param ion_app - The name of the app element (child of ion-router-outlet)
   * @param name - the value of the <ion-toggle> `name` attribute
   * @param app - The Nightwatch API instance
   */
  constructor(ion_app: string, name: string, app: NightwatchAPI) {
    super(ion_app, app);

    const trunk = `${this.openAppXPath}//ion-toggle[@name='${name}' and contains(@class, 'hydrated')`;

    this.xpath = `${trunk}]`;
    this.trueTog = `${trunk} and contains(@class, 'toggle-checked')]`;

    this.css = `${this.openAppCSSSelector} ion-toggle[name="${name}"].hydrated`;
  }

  /**
   * Click a toggle switch
   *
   */
  async click() {
    // Pierce the shadow DOM and access the underlying element
    await this.app.execute(
      function (selector: string) {
        const toggle = document.querySelector(selector) as HTMLElement & {
          shadowRoot: ShadowRoot;
        };
        const shadowInput = toggle.shadowRoot?.querySelector(
          'input[type="checkbox"]',
        ) as HTMLInputElement;
        if (shadowInput) {
          shadowInput.click();
        } else {
          throw new Error(
            `${selector} has no shadowed child input[type="checkbox"]`,
          );
        }
      },
      [this.css],
    );
  }

  /**
   * Get the value of a toggle switch
   *
   * @returns the toggle's state
   */
  async read(): Promise<boolean> {
    console.log(this.trueTog);
    return !!(await this.app.isPresent({
      selector: this.trueTog,
      suppressNotFoundErrors: true,
    }));
  }

  /**
   * Set the state of the toggle
   *
   * @param state - desired state of the toggle
   */
  async set(state: boolean) {
    if ((await this.read()) === state) {
      return;
    }
    await this.click();

    const toggle = this;
    await this.app.waitUntil(async function () {
      return state === (await toggle.read());
    }, this.app.globals.waitForConditionTimeout ?? IonToggle.FALLBACK_WAIT);
  }
}
