"use client";

import { useEffect, useId, useRef } from "react";
import type { SiteNavItem } from "@/constants/site";
import { useDisclosure } from "@/hooks/useDisclosure";

type MobileMenuProps = {
	items: readonly SiteNavItem[];
};

export function MobileMenu({ items }: MobileMenuProps) {
	const { isOpen, close, toggle } = useDisclosure();
	const panelId = useId();
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			close();
			buttonRef.current?.focus();
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [isOpen, close]);

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				className="menu-toggle"
				aria-label={isOpen ? "Close menu" : "Open menu"}
				aria-expanded={isOpen}
				aria-controls={panelId}
				onClick={toggle}
			>
				<span aria-hidden="true">{isOpen ? "close" : "menu"}</span>
			</button>
			<nav
				id={panelId}
				className="mobile-nav"
				aria-label="Mobile navigation"
				hidden={!isOpen}
			>
				{items.map((item) => (
					<a
						key={item.href}
						href={item.href}
						onClick={close}
						{...(item.external && { target: "_blank", rel: "noreferrer" })}
					>
						{item.label}
					</a>
				))}
			</nav>
		</>
	);
}
