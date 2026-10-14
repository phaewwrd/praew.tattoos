import { availabilityRepository } from "./availability-repository";
import type { AppointmentRequest } from "./availability-types";
import { getTattooServices } from "./services";

function todayKey() {
	return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(
		new Date(),
	);
}

async function isValidAppointment(request: AppointmentRequest) {
	const services = await getTattooServices({ onlyActive: true });
	return Boolean(
		request.fullName.trim() &&
			/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email) &&
			request.date &&
			request.time &&
			services.some((service) => service.id === request.serviceId),
	);
}

export const availabilityService = {
	async getAvailableDates() {
		const today = todayKey();
		return availabilityRepository.getScheduledDates(today);
	},
	async getAvailableTimes(date: string) {
		if (date < todayKey()) return [];
		return availabilityRepository.getScheduledTimes(date);
	},
	async reserveAppointment(request: AppointmentRequest) {
		if (!(await isValidAppointment(request)))
			return { ok: false as const, reason: "invalid" as const };
		const availableTimes = await this.getAvailableTimes(request.date);
		if (!availableTimes.includes(request.time))
			return { ok: false as const, reason: "unavailable" as const };
		const result = await availabilityRepository.reserve({
			date: request.date,
			time: request.time,
			fullName: request.fullName,
			email: request.email,
			serviceId: request.serviceId,
			details: `Service ID: ${request.serviceId}`,
		});
		if (!result.ok) return result;
		return { ok: true as const };
	},
};
