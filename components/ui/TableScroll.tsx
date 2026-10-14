import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TableScrollProps = {
	label: string;
	children: ReactNode;
	className?: string;
};

export function TableScroll({ label, children, className }: TableScrollProps) {
	return (
		<section
			aria-label={label}
			// biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region must be keyboard reachable
			tabIndex={0}
			className={cn("overflow-x-auto", className)}
		>
			{children}
		</section>
	);
}
