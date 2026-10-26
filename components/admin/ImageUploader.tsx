"use client";

import { useId, useRef, useState } from "react";
import { signUploadAction } from "@/app/admin/upload/actions";
import type { UploadTarget } from "@/lib/cloudinary";
import type { UploadedImage } from "@/lib/validation/admin";

type Props = {
  target: UploadTarget;
  label: string;
  multiple?: boolean;
  onUploaded: (images: UploadedImage[]) => Promise<void> | void;
};

const MAX_BYTES = 10 * 1024 * 1024;

/** Signed direct upload to Cloudinary; the server only stores the result. */
export function ImageUploader({ target, label, multiple, onUploaded }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setStatus(null);
    try {
      const signed = await signUploadAction({ target });
      if (!signed.ok) throw new Error(signed.message);
      const { cloudName, apiKey, folder, timestamp, signature } = signed.data;

      const uploaded: UploadedImage[] = [];
      for (const [index, file] of Array.from(files).entries()) {
        if (!file.type.startsWith("image/"))
          throw new Error(`${file.name} is not an image.`);
        if (file.size > MAX_BYTES)
          throw new Error(`${file.name} is larger than 10 MB.`);
        setStatus(`Uploading ${index + 1} of ${files.length}…`);
        const body = new FormData();
        body.append("file", file);
        body.append("api_key", apiKey);
        body.append("timestamp", String(timestamp));
        body.append("signature", signature);
        body.append("folder", folder);
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body },
        );
        const result = await response.json();
        if (!response.ok)
          throw new Error(result?.error?.message ?? "Upload failed.");
        uploaded.push({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      }
      await onUploaded(uploaded);
      setStatus("Uploaded.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label
        htmlFor={inputId}
        className="cursor-pointer rounded-md border border-neutral-300 border-dashed px-3 py-2 font-medium text-neutral-700 text-sm focus-within:ring-2 focus-within:ring-neutral-400 hover:bg-neutral-50"
      >
        {busy ? "Uploading…" : label}
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          disabled={busy}
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </label>
      {status ? (
        <p className="text-neutral-600 text-sm" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
