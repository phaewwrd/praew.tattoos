import type { PortfolioGroup } from "@/services/portfolio";
import { PortfolioImage } from "./PortfolioImage";

type PortfolioSectionProps = {
	groups: PortfolioGroup[];
};

export function PortfolioSection({ groups }: PortfolioSectionProps) {
	return (
		<section
			id="gallery"
			className="gallery section-frame"
			aria-labelledby="gallery-title"
		>
			<div className="section-heading">
				<p className="eyebrow">Selected work</p>
				<h2 id="gallery-title">Portfolio</h2>
			</div>
			{groups.length ? (
				groups.map((group, _groupIndex) => {
					const groupKey = group.id ?? "other";
					return (
						<section
							className="portfolio-category"
							key={groupKey}
							aria-labelledby={`category-${groupKey}-portfolio`}
						>
							<p
								className="portfolio-category-label"
								id={`category-${groupKey}-portfolio`}
							>
								{group.name}
							</p>
							<div className="portfolio-row">
								{group.items.map(
									(item) => (
										<figure key={item.id}>
											<PortfolioImage
												alt={`${item.title} tattoo by ${item.artistName}`}
												src={item.imageUrl}
											/>
											<figcaption>{item.title}</figcaption>
										</figure>
									),
								)}
							</div>
						</section>
					);
				})
			) : (
				<p className="gallery-empty">
					New work is being prepared for the portfolio. Please check back soon.
				</p>
			)}
		</section>
	);
}
