import {
	getAdminScheduleAllFreeSlots,
	getAdminScheduleMonth,
	getAllArtists,
	studioTodayKey,
} from "@/services/admin-schedule";
import { ScheduleManager } from "./schedule-manager";

export default async function AdminSchedulePage() {
	const today = studioTodayKey();
	const month = today.slice(0, 7);
	const allArtist = await getAllArtists();
	// const artistId = allArtist[0]?.id ?? null;
	const schedule = await getAdminScheduleMonth(month);
	const allFreeSlots = await getAdminScheduleAllFreeSlots();

	return (
		<ScheduleManager
			initialMonth={month}
			initialDate={today}
			allFreeSlots={allFreeSlots}
			initialArtist={allArtist}
			initialSchedule={schedule}
		/>
	);
}
