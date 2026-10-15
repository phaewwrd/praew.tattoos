export type SiteNavItem = {
	label: string;
	href: string;
	external?: boolean;
};

export const SITE_NAME = "Praew Tattoos";
export const SITE_EMAIL = "praew.tattoos@gmail.com";
export const SITE_COPYRIGHT_YEAR = 2026;
export const INSTAGRAM_PROFILE_URL =
	"https://instagram.com/praew.tattoos?exln=MWpkNnJpaWsxZHc4Zg%3D%3D&utm_source=qr";
export const WHATSAPP_NUMBER = "0621456941";
export const WHATSAPP_URL = "https://wa.me/66621456941";
export const GOOGLE_MAPS_URL =
	"https://www.google.com/maps/search/?api=1&query=Praew.Tattoos";

export const SITE_NAV_ITEMS: readonly SiteNavItem[] = [
	{ label: "available slots", href: "#availability" },
	{ label: "location", href: "#location" },
	{ label: "contact us", href: "#contact" },
	{ label: "Instagram", href: "https://www.instagram.com/", external: true },
];
