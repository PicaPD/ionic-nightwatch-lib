import { NightwatchAPI } from "nightwatch";
import { NativePage } from "../pages/page";
import { Element } from "../elements/elements";

/**
 * Named variables for building {@link Gallery} objects
 *
 * @param app - The Nightwatch API interface
 * @param photo - An XPath that points to all clickable photo thumbnails
 * @param page - The XPath of the gallery window
 */
export interface GalleryOptions {
  app: NightwatchAPI;
  photo: string;
  page: string;
}

/**
 * Named variables for building {@link gallery/iOSGallery.IOSGallery} objects
 *
 * @param exitBtn - The XPath of the exit button
 */
export interface IOSGalleryOptions extends GalleryOptions {
  exitBtn: string;
}

/**
 * Base class for Galleries
 */
export abstract class Gallery extends NativePage {
  public readonly page: string;
  protected readonly photo: string;

  /**
   * Common constructor for all Gallery implementations
   *
   * @param options - @see {@link GalleryOptions}
   */
  constructor({ app, photo, page }: GalleryOptions) {
    super(app);
    this.photo = photo;
    this.page = page;
  }

  /**
   * Asserts that the gallery is open
   */
  async assertOpen() {
    await this.app.assert.ok(
      await this.isOpen(),
      "Should open your device photo gallery",
    );
  }

  /**
   * Asserts that the gallery is closed
   */
  async assertClosed() {
    await this.app.assert.ok(
      !(await this.isOpen()),
      "Should close your device photo gallery",
    );
  }

  /**
   * Click a photo
   *
   * @param index - The 0-based index of which photo in the gallery to click
   */
  async choosePhoto(index: number) {
    await this.toNative();
    const photos = await this.app.findElements(this.photo);
    await this.app.elementIdClick(photos[index][Element.ELEMENT_ID]);
    await this.toWeb();
  }

  /**
   * Exit the gallery by using its exit button
   */
  abstract exit(): Promise<void>;
}

/**
 * Base class for all Android galleries
 */
export abstract class AndroidGallery extends Gallery {
  async exit() {
    await this.toNative();
    await this.app.back();
    await this.app.waitForElementNotPresent(this.page);
    await this.toWeb();
  }
}

/**
 * Base class for all iOS galleries
 */
export abstract class IOSGalleryBase extends Gallery {
  protected exitBtn: string;

  /**
   * Common constructor for all iOS Camera applications
   *
   * @param options - @see {@link IOSGalleryOptions}
   */
  constructor({ app, photo, page, exitBtn }: IOSGalleryOptions) {
    super({ app, photo, page });
    this.exitBtn = exitBtn;
  }

  async exit() {
    await this.toNative();
    await this.app.click(this.exitBtn);
    await this.app.waitForElementNotPresent(this.page);
    await this.toWeb();
  }
}
