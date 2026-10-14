import { connection } from "next/server";
import { BookingManager } from "./booking-manager";
import { getBookings } from "@/lib/bookings";

export default async function AdminBookingsPage() {
  await connection();
  const bookings = await getBookings();
  return <BookingManager bookings={bookings} />;
}
