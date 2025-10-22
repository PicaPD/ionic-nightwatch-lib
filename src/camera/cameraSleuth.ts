import { NightwatchAPI } from "nightwatch";
import { Camera } from "./camera";
import { AndroidCamera2 } from "./androidCamera2";
import { SecAppCamera } from "./secAppCamera";
import { IOSCamera } from "./iOSCamera";
import { Page } from "../pages/page";

export class NoSuchCameraException extends Error {}

/**
 * Run through a list of known camera implementations and determine
 * which is open. Construct a Camera object
 *
 * @param app - The NIghtwatch API interface
 *
 * @returns - A constructed {@link Camera} object specific to
 *  the open application
 *
 * @throws {@link NoSuchCameraException}
 *  Thrown if the camera app cannot be positively identified,
 *  either because it is not implemented or it is not open
 */
export async function findCameraType(app: NightwatchAPI): Promise<Camera> {
  const knownCameraTypes: Camera[] = [
    new IOSCamera(app),
    new AndroidCamera2(app),
    new SecAppCamera(app),
  ];

  // Avoid multiple context switches
  await Page.toNative(app);
  for (const cameraType of knownCameraTypes) {
    const result = await cameraType.waitToBeOpen();
    if (result) {
      console.log(`Found camera package: ${cameraType.constructor.name}`);
      return cameraType;
    }
  }
  throw new NoSuchCameraException("Unknown Camera type.");
}
