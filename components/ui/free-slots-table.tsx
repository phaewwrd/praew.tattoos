"use client";

// import { AdminScheduleAllFreeSlots } from "@/lib/admin-schedule";
import { Artist } from "@/lib/artists";
import { useMemo, useState } from "react";

// type Slot = {
//     date: string; // "YYYY-MM-DD"
//     startTime: string; // "HH:mm"
//     endTime: string; // "HH:mm"
//     artistId: string;
// };
// type Artist = { id: string; name: string };
export type FreeSlot = {
    date: string; // "YYYY-MM-DD"
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
    artistId: string;
};

export type AdminScheduleAllFreeSlots = {
    allFreeSlots: FreeSlot[]; // ← array
};

const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
};

const formatDuration = (start: string, end: string) => {
    const mins = toMinutes(end) - toMinutes(start);
    if (mins <= 0) return "-";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return [h && `${h} h`, m && `${m} min`].filter(Boolean).join(" ");
};

const formatDate = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

export function FreeSlotsTable({
    slots,
    artists = [],
}: {
    slots: AdminScheduleAllFreeSlots;
    artists?: Artist[];
}) {
    const [artistFilter, setArtistFilter] = useState<"all" | number>("all");

    const artistName = useMemo(
        () => new Map(artists.map((a) => [a.id, a.name])),
        [artists],
    );
    console.log("slots", slots);
    // เรียงตามวัน/เวลา + กรอง + จัดกลุ่มตามวัน
    const groups = useMemo(() => {
        const filtered = slots.allFreeSlots
            .filter((s) => artistFilter === "all" || Number(s.artistId) === artistFilter)
            .sort((a, b) =>
                `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`),
            );

        const map = new Map<string, FreeSlot[]>();
        for (const s of filtered) {
            const list = map.get(s.date);
            if (list) list.push(s); // มีวันนี้แล้ว: เพิ่มต่อท้าย
            else map.set(s.date, [s]); // ยังไม่มี: สร้าง array ใหม่
        }
        return [...map.entries()];
    }, [slots, artistFilter]);

    console.log("groups", groups);

    const total = groups.reduce((n, [, items]) => n + items.length, 0);

    return (
        <section className="grid gap-2">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-medium text-neutral-600">
                    All Free Slots{" "}
                    <span className="font-normal text-neutral-400">({total})</span>
                </h3>

                <select
                    value={artistFilter}
                    onChange={(e) => setArtistFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
                    aria-label="Filter by artist"
                    className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                >
                    <option value="all">All artists</option>
                    {artists.map((a) => (
                        <option key={a.id} value={a.id}>
                            {a.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="max-h-80 overflow-auto rounded-lg border border-neutral-200">
                <table className="w-full border-collapse text-left text-xs">
                    <caption className="sr-only">Available free slots by date</caption>

                    <thead className="sticky top-0 z-10 bg-neutral-50 text-neutral-500 shadow-[0_1px_0_0_var(--color-neutral-200)]">
                        <tr>
                            <th scope="col" className="px-3 py-2 font-medium">Time</th>
                            <th scope="col" className="hidden px-3 py-2 font-medium sm:table-cell">
                                Duration
                            </th>
                            <th scope="col" className="px-3 py-2 font-medium">Artist</th>
                        </tr>
                    </thead>

                    {groups.length === 0 ? (
                        <tbody>
                            <tr>
                                <td colSpan={3} className="px-3 py-8 text-center text-neutral-400">
                                    No slots available
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        groups.map(([date, items]) => (
                            <tbody key={date} className="divide-y divide-neutral-100">
                                {/* แถวหัวข้อวัน */}
                                <tr className="bg-neutral-50/70">
                                    <th
                                        scope="colgroup"
                                        colSpan={3}
                                        className="px-3 py-1.5 text-[11px] font-semibold text-neutral-700"
                                    >
                                        {formatDate(date)}
                                        <span className="ml-1.5 font-normal text-neutral-400">
                                            · {items.length} slot{items.length > 1 && "s"}
                                        </span>
                                    </th>
                                </tr>

                                {items.map((s) => (
                                    <tr
                                        key={`${s}-${s.date}-${s.endTime}-${s.artistId}`}
                                        className="transition-colors hover:bg-neutral-50"
                                    >
                                        <td className="px-3 py-2 font-medium tabular-nums text-neutral-800">
                                            {s.startTime} – {s.endTime}
                                        </td>
                                        <td className="hidden px-3 py-2 tabular-nums text-neutral-500 sm:table-cell">
                                            {formatDuration(s.startTime, s.endTime)}
                                        </td>
                                        <td className="px-3 py-2 text-neutral-700">
                                            <span className="block max-w-40 truncate">
                                                {artistName.get(Number(s.artistId)) ?? "N/A"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        ))
                    )}
                </table>
            </div>
        </section>
    );
}