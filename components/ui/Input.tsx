import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const fieldClassName =
	"w-full rounded-md border border-neutral-300 px-3 py-2";

export function Input({
	className,
	...props
}: InputHTMLAttributes<HTMLInputElement>) {
	return <input className={cn(fieldClassName, className)} {...props} />;
}
