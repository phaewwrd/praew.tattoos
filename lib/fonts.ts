import { Caveat, Roboto, Silkscreen } from "next/font/google";

// The three type styles of the site, all in one place.

/** (a) Cross-stitch lettering placeholder for the logo and corner letters. */
export const stitchFont = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--ff-stitch",
});

/** (b) Handwriting for form labels, month names and the note. */
export const handFont = Caveat({
  subsets: ["latin"],
  variable: "--ff-hand",
});

/** (c) Roboto (variable, 100–900) for body text, navigation and service names. */
export const sansFont = Roboto({
  subsets: ["latin"],
  variable: "--ff-sans",
});

export const fontVariables = `${stitchFont.variable} ${handFont.variable} ${sansFont.variable}`;
