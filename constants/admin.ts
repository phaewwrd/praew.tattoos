export type AdminNavItem = {
  href: string;
  label: string;
};

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/slots", label: "Slots" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/calendar-images", label: "Calendar images" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/settings", label: "Settings" },
];

export const ADMIN_TITLE = "Praew.Tattoos Admin";
