/** "062-145-6941" → "https://wa.me/66621456941" (Thai numbers) or keeps international digits. */
export function whatsappUrl(number: string): string {
  const digits = number.replace(/[^\d+]/g, "");
  const international = digits.startsWith("+")
    ? digits.slice(1)
    : digits.startsWith("0")
      ? `66${digits.slice(1)}`
      : digits;
  return `https://wa.me/${international}`;
}

export function telUrl(number: string): string {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}

export function instagramUrl(handle: string): string {
  return `https://www.instagram.com/${handle.replace(/^@/, "").toLowerCase()}/`;
}
