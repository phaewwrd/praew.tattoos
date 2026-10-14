import { SITE_EMAIL } from "@/constants/site";

export function ContactSection() {
	return (
		<section
			id="contact"
			className="contact section-frame"
			aria-labelledby="contact-title"
		>
			<p className="eyebrow">Contact</p>
			<h2 id="contact-title">Start with a conversation.</h2>
			<a className="contact-email" href={`mailto:${SITE_EMAIL}`}>
				{SITE_EMAIL}
			</a>
			<p className="body-copy">
				For custom work, include your idea, preferred placement, and size.
			</p>
		</section>
	);
}
