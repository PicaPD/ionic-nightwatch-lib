import { NightwatchAPI } from "nightwatch";
import { AndroidGallery } from "./gallery";

export class MediaModule extends AndroidGallery {
  public static readonly packageName =
    "com.google.android.providers.media.module";

  /**
   * Simple constructor for the com.google.android.providers.media.module package
   *
   * @param app - The Nightwatch API interface
   */
  constructor(app: NightwatchAPI) {
    super({
      app: app,
      photo:
        "//android.widget.ImageView[contains(@resource-id, 'icon_thumbnail')]",
      page: `//*[@package='${MediaModule.packageName}']`,
    });
  }
}
