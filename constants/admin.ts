export type AdminNavItem = {
	href: string;
	label: string;
};

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
	{ href: "/admin", label: "Dashboard" },
	{ href: "/admin/bookings", label: "Bookings" },
	{ href: "/admin/clients", label: "Clients" },
	{ href: "/admin/artists", label: "Artists" },
	{ href: "/admin/services", label: "Services" },
	{ href: "/admin/schedule", label: "Schedule" },
	{ href: "/admin/payments", label: "Payments" },
	{ href: "/admin/portfolio", label: "Portfolio" },
	{ href: "/admin/messages", label: "Messages" },
];

export const ADMIN_TITLE = "Praew Tattoos Admin";
