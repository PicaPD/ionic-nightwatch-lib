import { NightwatchAPI } from "nightwatch";
import { AndroidCamera } from "./camera";

export class AndroidCamera2 extends AndroidCamera {
  public static readonly packageName = "com.android.camera2";
  public static readonly page = `//*[@package='${AndroidCamera2.packageName}']`;

  /**
   * Simple constructor for the com.android.camera2 package
   *
   * @param app - The Nightwatch API interface
   */
  constructor(app: NightwatchAPI) {
    super({
      app: app,
      shutterBtn: '//android.widget.ImageView[@content-desc="Shutter"]',
      page: AndroidCamera2.page,
      okBtn: '//android.widget.ImageButton[@content-desc="Done"]',
    });
  }
}
