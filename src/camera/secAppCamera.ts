import { NightwatchAPI } from "nightwatch";
import { AndroidCamera } from "./camera";

export class SecAppCamera extends AndroidCamera {
  public static readonly packageName = "com.sec.android.app.camera";

  /**
   * Simple constructor for the com.sec.android.app.camera package
   *
   * @param app - The NIghtwatch API interface
   */
  constructor(app: NightwatchAPI) {
    super({
      app: app,
      shutterBtn:
        "//android.widget.ImageView[contains(@resource-id, 'center_button')]",
      okBtn: "//android.widget.Button[@content-desc='OK']",
      page: `//*[@package='${SecAppCamera.packageName}']`,
    });
  }
}
