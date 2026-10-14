import { SITE_COPYRIGHT_YEAR, SITE_NAME } from "@/constants/site";

export function SiteFooter() {
	return (
		<footer className="site-footer">
			<span>{SITE_NAME}</span>
			<span>Bangkok, Thailand</span>
			<span>&copy; {SITE_COPYRIGHT_YEAR}</span>
		</footer>
	);
}
