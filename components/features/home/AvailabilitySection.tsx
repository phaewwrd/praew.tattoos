import type { ComponentProps } from "react";
import { AvailabilityBooking } from "@/components/features/booking/AvailabilityBooking";

type AvailabilitySectionProps = ComponentProps<typeof AvailabilityBooking>;

export function AvailabilitySection(props: AvailabilitySectionProps) {
  return (
    <section
      id="availability"
      className="availability section-frame"
      aria-labelledby="availability-title"
    >
      <div className="section-heading">
        <p className="eyebrow">Appointments</p>
        <h2 id="availability-title">Available slots</h2>
      </div>
      <AvailabilityBooking {...props} />
    </section>
  );
}
