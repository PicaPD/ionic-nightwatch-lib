import { NightwatchAPI } from "nightwatch";
import { Page, NativePage } from "../pages/page";

/**
 * Named variables for building {@link Camera} objects
 *
 * @param app - The Nightwatch API interface
 * @param page - the XPath of the camera page
 * @param shutterBtn - the XPath of the shutter button
 *  (click this to take a picture)
 * @param okBtn - the XPath of the picture confirmation button
 */
export interface CameraOptions {
  app: NightwatchAPI;
  page: string;
  shutterBtn: string;
  okBtn: string;
}

/**
 * Named variables for building {@link IOSCameraBase} objects
 * @param backBtn - the XPath of the back button
 *
 */
export interface IOSCameraOptions extends CameraOptions {
  backBtn: string;
}

/**
 * Base class for cameras
 * @see {@link AndroidCamera} and {@link IOSCameraBase} for complete implementation
 * @see {@link camera/androidCamera2.AndroidCamera2} and
 * {@link camera/iOSCamera.IOSCamera} for package-specific implementations
 */
export abstract class Camera extends NativePage {
  public readonly page: string;
  protected shutterBtn: string;
  protected okBtn: string;

  /**
   * Common constructor for all Camera implementations
   * @param options - @see {@link CameraOptions}
   */
  constructor({ app, page, shutterBtn, okBtn }: CameraOptions) {
    super(app);
    this.page = page;
    this.shutterBtn = shutterBtn;
    this.okBtn = okBtn;
  }

  /**
   * Verifies that a back button exists
   */
  abstract verifyBack(): Promise<void>;

  /**
   * Exit the camera application by using a back button
   */
  abstract back(): Promise<void>;

  /**
   * Take a picture and confirm it.
   * @remarks
   * Camera app must already be open for this to work
   */
  async takePicture(callback?: () => Promise<void>) {
    await Page.toNative(this.app);
    await this.app.click(this.shutterBtn);
    await this.app.click(this.okBtn);
    if (callback) {
      await callback();
    }
    await this.app.pause(3_000);

    await Page.toWeb(this.app);
  }
}

/**
 * Extensible class for all Android Cameras
 * See {@link camera/androidCamera2.AndroidCamera2} for a specific implementation
 */
export class AndroidCamera extends Camera {
  async back() {
    await Page.toNative(this.app);
    // Use the phone's back button
    await this.app.back();
    await this.app.waitForElementNotPresent(this.page);
    await Page.toWeb(this.app);
  }

  async verifyBack(): Promise<void> {
    // Androids use the phone's back button
    // It is always available
    await this.app.verify.ok(true, "Android back button is always available");
  }
}

/**
 * Extensible class for iOS Camera apps
 */
export class IOSCameraBase extends Camera {
  private backBtn: string;

  /**
   * Common constructor for all iOS Camera applications
   *
   * @param options - @see {@link IOSCameraOptions}
   */
  constructor({ app, page, shutterBtn, okBtn, backBtn }: IOSCameraOptions) {
    super({ app, page, shutterBtn, okBtn });
    this.backBtn = backBtn;
  }

  async verifyBack(): Promise<void> {
    await Page.toNative(this.app);
    await this.app.verify.elementPresent(
      this.backBtn,
      "Camera should have a 'back' or 'cancel' button",
    );
  }

  async back() {
    await Page.toNative(this.app);
    await this.app.click(this.backBtn);
    await this.app.waitForElementNotPresent(this.page);
    await Page.toWeb(this.app);
  }
}
