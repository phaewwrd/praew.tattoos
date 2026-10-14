import type { TattooService } from "@/services/services";

type ServicesSectionProps = {
	services: TattooService[];
};

export function ServicesSection({ services }: ServicesSectionProps) {
	return (
		<section
			id="services"
			className="services section-frame"
			aria-labelledby="services-title"
		>
			<div className="services-heading">
				<p className="eyebrow">How we work</p>
				<h2 id="services-title">Services</h2>
				<p className="body-copy">
					Every piece is priced for its scale, detail, and placement. A deposit
					holds your appointment and is deducted from the final price.
				</p>
			</div>
			<div className="service-list">
				{services.map((service) => (
					<article className="service-item" key={service.id}>
						<div>
							<h3>{service.name}</h3>
							<p>{service.description}</p>
						</div>
						<dl className="service-details">
							<div>
								<dt>From</dt>
								<dd>{service.priceFrom.toLocaleString("en-US")} THB</dd>
							</div>
							<div>
								<dt>Deposit</dt>
								<dd>{service.depositAmount.toLocaleString("en-US")} THB</dd>
							</div>
							{service.durationMinutes && (
								<div>
									<dt>Estimated time</dt>
									<dd>Approx. {service.durationMinutes / 60} hr</dd>
								</div>
							)}
						</dl>
						<a className="text-link" href="#availability">
							Check available slots <span aria-hidden="true">&#8595;</span>
						</a>
					</article>
				))}
			</div>
		</section>
	);
}
