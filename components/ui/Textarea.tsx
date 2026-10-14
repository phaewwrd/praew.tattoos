import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { fieldClassName } from "./Input";

export function Textarea({
	className,
	...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return <textarea className={cn(fieldClassName, className)} {...props} />;
}
