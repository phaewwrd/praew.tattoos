"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/constants/admin";
import { cn } from "@/lib/utils";

type AdminNavProps = {
	className?: string;
	linkClassName?: string;
	onNavigate?: () => void;
};

export function AdminNav({
	className,
	linkClassName,
	onNavigate,
}: AdminNavProps) {
	const pathname = usePathname();

	return (
		<nav aria-label="Admin navigation" className={cn("space-y-1", className)}>
			{ADMIN_NAV_ITEMS.map((item) => {
				const isActive =
					pathname === item.href ||
					(item.href !== "/admin" && pathname.startsWith(item.href));

				return (
					<Link
						key={item.href}
						href={item.href}
						onClick={onNavigate}
						className={cn(
							"block rounded-md px-3 py-2 text-sm transition-colors",
							isActive
								? "bg-neutral-900 text-white"
								: "text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900",
							linkClassName,
						)}
						aria-current={isActive ? "page" : undefined}
					>
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
}
