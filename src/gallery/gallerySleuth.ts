import { NightwatchAPI } from "nightwatch";
import { Gallery } from "./gallery";
import { MediaModule } from "./mediaModule";
import { Photopicker } from "./photopicker";
import { IOSGallery } from "./iOSGallery";

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
  type GalleryConstructor = new (app: NightwatchAPI) => Gallery;

  const knownGalleryTypes: GalleryConstructor[] = [
    MediaModule,
    Photopicker,
    IOSGallery,
  ];

  for (const galleryType of knownGalleryTypes) {
    const gallery = new galleryType(app);
    if (await gallery.isOpen()) {
      console.log(`Found gallery package: ${galleryType.name}`);
      return gallery;
    }
  }

  throw new NoSuchGalleryException("Unknown Gallery type.");
}
