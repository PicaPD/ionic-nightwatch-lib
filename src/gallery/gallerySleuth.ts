import { NightwatchAPI } from "nightwatch";
import { Gallery } from "./gallery";
import { MediaModule } from "./mediaModule";
import { Photopicker } from "./photopicker";
import { IOSGallery } from "./iOSGallery";
import { Page } from "../pages/page";

export class NoSuchGalleryException extends Error {}

/**
 * Run through a list of known gallery implementations and determine
 * which is open. Construct a Gallery object
 *
 * @param app - The NIghtwatch API interface
 *
 * @returns - A constructed {@link Gallery} object specific to
 *  the open application
 *
 * @throws {@link NoSuchGalleryException}
 *  Thrown if the gallery app cannot be positively identified,
 *  either because it is not implemented or it is not open
 */
export async function findGalleryType(app: NightwatchAPI): Promise<Gallery> {
  const knownGalleryTypes: Gallery[] = [
    new IOSGallery(app),
    new MediaModule(app),
    new Photopicker(app),
  ];

  // Avoid multiple context switches
  await Page.toNative(app);
  for (const galleryType of knownGalleryTypes) {
    const result = await galleryType.isLoaded();
    if (result) {
      console.log(`Found gallery package: ${galleryType.constructor.name}`);
      return galleryType;
    }
  }
  throw new NoSuchGalleryException("Unknown Gallery type.");
}
