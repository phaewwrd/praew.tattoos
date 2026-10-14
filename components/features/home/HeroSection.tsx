export function HeroSection() {
	return (
		<section className="hero section-frame" aria-labelledby="hero-title">
			<p className="eyebrow">Bangkok, Thailand</p>
			<h1 id="hero-title">A quiet mark, made to stay.</h1>
			<p className="hero-copy">
				Fine line and ornamental tattooing by Praew. Thoughtful pieces for skin,
				memory, and the space between.
			</p>
			<a className="text-link" href="#availability">
				View available slots <span aria-hidden="true">&#8595;</span>
			</a>
		</section>
	);
}
