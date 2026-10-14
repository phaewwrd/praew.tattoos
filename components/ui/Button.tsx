import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "link";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
	primary:
		"rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50",
	secondary:
		"rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50",
	link: "font-medium text-neutral-700 underline disabled:opacity-50",
};

export function Button({
	variant = "primary",
	type = "button",
	className,
	...props
}: ButtonProps) {
	return (
		<button
			type={type}
			className={cn(variantClasses[variant], className)}
			{...props}
		/>
	);
}
