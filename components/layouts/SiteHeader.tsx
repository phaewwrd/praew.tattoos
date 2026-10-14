import { SITE_NAME, SITE_NAV_ITEMS } from "@/constants/site";
import { MobileMenu } from "./MobileMenu";

export function SiteHeader() {
	return (
		<header className="site-header">
			<a className="wordmark" href="#top" aria-label={`${SITE_NAME} home`}>
				praew tattoos
			</a>
			<nav className="site-nav" aria-label="Primary navigation">
				{SITE_NAV_ITEMS.map((item) => (
					<a
						key={item.href}
						href={item.href}
						{...(item.external && { target: "_blank", rel: "noreferrer" })}
					>
						{item.label}
					</a>
				))}
			</nav>
			<MobileMenu items={SITE_NAV_ITEMS} />
		</header>
	);
}
