import { NightwatchAPI } from "nightwatch";
import { Camera } from "./camera";
import { AndroidCamera2 } from "./androidCamera2";
import { SecAppCamera } from "./secAppCamera";
import { IOSCamera } from "./iOSCamera";

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
  type CameraConstructor = new (app: NightwatchAPI) => Camera;

  const knownCameraTypes: CameraConstructor[] = [
    AndroidCamera2,
    SecAppCamera,
    IOSCamera,
  ];

  for (const cameraType of knownCameraTypes) {
    const camera = new cameraType(app);
    if (await camera.isOpen()) {
      console.log(`Found gallery package: ${cameraType.name}`);
      return camera;
    }
  }

  throw new NoSuchCameraException("Unknown Camera type.");
}
