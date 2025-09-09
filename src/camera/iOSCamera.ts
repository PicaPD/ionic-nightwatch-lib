import { NightwatchAPI } from "nightwatch";
import { IOSCameraBase } from "./camera";

export class IOSCamera extends IOSCameraBase {
  public static readonly page = `//XCUIElementTypeOther[@name="CameraMode"]`;

  /**
   * Simple constructor for iOS Cameras
   *
   * @param app - The NIghtwatch API interface
   */
  constructor(app: NightwatchAPI) {
    super({
      app: app,
      shutterBtn: "//XCUIElementTypeButton[@name='PhotoCapture']",
      backBtn: "//XCUIElementTypeButton[@name='Cancel']",
      okBtn: "//XCUIElementTypeButton[@name='Done']",
      page: IOSCamera.page,
    });
  }
}
