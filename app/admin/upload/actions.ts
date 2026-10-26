"use server";

import { z } from "zod";
import { createAction } from "@/lib/action";
import { signUpload, UPLOAD_TARGETS } from "@/lib/cloudinary";

export const signUploadAction = createAction(
  z.object({ target: z.enum(UPLOAD_TARGETS) }),
  async ({ target }) => signUpload(target),
);
