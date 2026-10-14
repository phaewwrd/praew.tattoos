"use client";

import type * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: CalendarProps) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn("p-3", className)}
			classNames={{
				root: "relative",
				months: "flex flex-col sm:flex-row gap-2",
				month: "space-y-3",
				month_caption: "flex justify-center pt-1 relative items-center",
				caption_label: "text-sm font-medium",
				nav: "flex items-center gap-1",
				button_previous:
					"absolute left-1 h-7 w-7 border border-[var(--line)] bg-transparent p-0 opacity-60 hover:opacity-100",
				button_next:
					"absolute right-1 h-7 w-7 border border-[var(--line)] bg-transparent p-0 opacity-60 hover:opacity-100",
				month_grid: "w-full border-collapse",
				weekdays: "flex",
				weekday:
					"w-9 rounded-md text-[var(--muted)] text-[0.75rem] font-normal",
				week: "mt-2 flex w-full",
				day: "relative h-9 w-9 p-0 text-center text-sm",
				day_button:
					"h-9 w-9 border border-[var(--line)] p-0 font-normal hover:bg-[var(--ink)] hover:text-[var(--paper)]",
				selected:
					"bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]",
				today: "border-[var(--ink)]",
				outside: "opacity-30",
				disabled: "pointer-events-none border-transparent opacity-30",
				hidden: "invisible",
				...classNames,
			}}
			{...props}
		/>
	);
}
