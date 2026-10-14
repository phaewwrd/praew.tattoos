import { connection } from "next/server";
import { getBookings } from "@/services/bookings";
import { BookingManager } from "./booking-manager";

export default async function AdminBookingsPage() {
	await connection();
	const bookings = await getBookings();
	return <BookingManager bookings={bookings} />;
}
