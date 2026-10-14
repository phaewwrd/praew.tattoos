import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { fieldClassName } from "./Input";

export function Select({
	className,
	...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
	return <select className={cn(fieldClassName, className)} {...props} />;
}
