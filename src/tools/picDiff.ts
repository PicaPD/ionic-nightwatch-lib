import sharp from "sharp";

/**
 * Compare two screenshots by hashing the images
 * and comparing the hashes by their hamming distances
 *
 * @param pic1 The filepath of a picture
 * @param pic2 The filepath of a picture
 * @param diffTolerance: A number from 0 - 1. Lower numbers are more sensitive to changes
 *  When comparing two hashes of length n, will return true if the hamming distance
 *  is less than or equal to sensitivity * n
 */
export async function picsAreSimilar(
  pic1: string,
  pic2: string,
  diffTolerance: number,
) {
  const hash1 = await hashImage(pic1);
  const hash2 = await hashImage(pic2);

  // Hamming distance: number of differing bits
  const distance = getHammingDistance(hash1, hash2);

  const threshold = diffTolerance * hash1.length;
  return distance <= threshold;
}

/**
 * Create a dHash of an image file
 *
 * @param filePath the path to the image
 * @param [sensitivity=8] the square root of the length of the hash. Longer hashes
 *  will better capture changes, but take longer and can introduce noise
 *
 * @remarks
 * There are several image hashing algorithms available:
 * - dHash is the algorithm of choice for this application. While its simplicity
 * happens to outperform pHashing, it excels at identifying small differences in
 * images. We are attempting to determine if an image changed, and the only source of
 * error should be its presentation in the UI.
 * - pHash's (and wHash's) strength lies in detecting images that are similar, but may have been modified.
 * It is great at identifying similarities even if an image has been watermarked, compressed, cropped, or otherwise modified.
 * In our case, we must consider these modifications as different images.
 */
async function hashImage(filePath: string, sensitivity = 16): Promise<string> {
  // Prepare the image
  const { data } = await sharp(filePath)
    // A dHash considers the differences between adjacent horizontal pixels
    // To produce a hash of size n, we need an image of n + 1 x n
    .grayscale()
    .resize(sensitivity + 1, sensitivity, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Build the hash
  let hash = "";
  for (let row = 0; row < sensitivity; row++) {
    for (let col = 0; col < sensitivity; col++) {
      const leftPixel = data[row * (sensitivity + 1) + col];
      const rightPixel = data[row * (sensitivity + 1) + col + 1];
      hash += leftPixel < rightPixel ? "1" : "0";
    }
  }

  return hash;
}

/**
 * Calculate the hamming distance between two hashes
 */
function getHammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length)
    throw new Error("Hashes must be the same length");

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
}
