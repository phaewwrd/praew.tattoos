import "server-only";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const ROOT_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || "praew-tattoos";

export const UPLOAD_TARGETS = [
  "services",
  "calendar",
  "instagram-fallback",
] as const;
export type UploadTarget = (typeof UPLOAD_TARGETS)[number];

export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
};

/** Signs a direct browser → Cloudinary upload into the target folder. */
export function signUpload(target: UploadTarget): UploadSignature {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured.");
  }
  const folder = `${ROOT_FOLDER}/${target}`;
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    apiSecret,
  );
  return { cloudName, apiKey, folder, timestamp, signature };
}

/** Only accept uploads that landed in our own cloud and folder. */
export function isOwnUpload(
  image: { url: string; publicId: string },
  target: UploadTarget,
): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  return (
    image.url.startsWith(`https://res.cloudinary.com/${cloudName}/`) &&
    image.publicId.startsWith(`${ROOT_FOLDER}/${target}/`)
  );
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    // The DB row is already gone; an orphaned asset is harmless.
    console.error("Cloudinary delete failed", error);
  }
}
