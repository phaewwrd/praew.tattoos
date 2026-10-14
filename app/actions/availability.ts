"use server";

import { availabilityService } from "@/lib/availability-service";
import type {
	AppointmentRequest,
	AppointmentReservation,
	AvailableDates,
	AvailableTimes,
} from "@/lib/availability-types";
import { failure, success, type ServerResponse } from "@/lib/server-response";

export async function getAvailableDatesAction(): Promise<
	ServerResponse<AvailableDates>
> {
	try {
		return success({ dates: await availabilityService.getAvailableDates() });
	} catch {
		return failure(
			"INTERNAL_ERROR",
			"Calendar is unavailable. Please try again.",
		);
	}
}

export async function getAvailableTimesAction(
	date: string,
): Promise<ServerResponse<AvailableTimes>> {
	try {
		return success({
			date,
			times: await availabilityService.getAvailableTimes(date),
		});
	} catch {
		return failure(
			"INTERNAL_ERROR",
			"Times are unavailable. Please select another date.",
		);
	}
}

export async function reserveAppointmentAction(
	request: AppointmentRequest,
): Promise<ServerResponse<AppointmentReservation>> {
	try {
		const result = await availabilityService.reserveAppointment(request);
		if (!result.ok) {
			return result.reason === "unavailable"
				? failure(
						"SLOT_UNAVAILABLE",
						"That time was just taken. Please choose another available time.",
					)
				: failure("INVALID_INPUT", "Please review the appointment details.");
		}
		return success({
			date: request.date,
			time: request.time,
			message:
				"Your appointment request is reserved. We'll contact you via information provided with the next steps.",
		});
	} catch {
		return failure(
			"INTERNAL_ERROR",
			"We couldn't create your request. Please try again.",
		);
	}
}
