import { TattooMapLoader } from "@/components/map/TattooMapLoader";
import { GOOGLE_MAPS_URL } from "@/constants/site";

export function LocationSection() {
	return (
		<section
			id="location"
			className="location section-frame"
			aria-labelledby="location-title"
		>
			<div>
				<p className="eyebrow">The studio</p>
				<h2 id="location-title">A private space for unhurried work.</h2>
				<p className="body-copy">
					Appointments take place in a calm studio in Bangkok. Every session is
					one-to-one, with time to settle in before the needle starts.
				</p>
			</div>
			<TattooMapLoader />
			<a
				className="text-link"
				href={GOOGLE_MAPS_URL}
				target="_blank"
				rel="noreferrer"
			>
				Open in Google Maps <span aria-hidden="true">&#8599;</span>
			</a>
			<div className="location-details">
				<address>
					Bangkok, Thailand
					<br />
					Full studio details are shared with confirmed appointments.
				</address>
				<p>Nearest MRT: Bangson (Purple line and Red line) exit 5</p>
				<p>walk approximately 10 minutes to the studio.</p>
			</div>
		</section>
	);
}
