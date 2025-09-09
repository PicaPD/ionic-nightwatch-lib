import { NightwatchAPI } from "nightwatch";
import { IOSGalleryBase } from "./gallery";

export class IOSGallery extends IOSGalleryBase {
  public static readonly page = `//XCUIElementTypeNavigationBar[@name="Photos"]`;

  /**
   * Simple constructor for iOS galleries
   *
   * @param app - The NIghtwatch API interface
   */
  constructor(app: NightwatchAPI) {
    super({
      app: app,
      photo: "//XCUIElementTypeImage[@name='PXGGridLayout-Info']",
      page: IOSGallery.page,
      exitBtn: "//XCUIElementTypeButton[@name='Cancel']",
    });
  }
}
