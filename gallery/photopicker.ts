import { NightwatchAPI } from "nightwatch";
import { AndroidGallery } from "./gallery";

export class Photopicker extends AndroidGallery {
  public static readonly packageName = "com.google.android.photopicker";

  /**
   * Simple constructor for the com.google.android.photopicker package
   *
   * @param app - The Nightwatch API interface
   */
  constructor(app: NightwatchAPI) {
    super({
      app: app,
      photo:
        "//android.view.View[contains(@content-desc, 'Photo')]/../android.view.View/android.view.View",
      page: `//*[@package='${Photopicker.packageName}']`,
    });
  }
}
