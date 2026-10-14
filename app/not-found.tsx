import Link from "next/link";

export default function NotFound() {
	return (
		<main className="section-frame flex min-h-dvh flex-col items-start justify-center gap-4 py-16">
			<p className="eyebrow">404</p>
			<h1 id="not-found-title">This page could not be found.</h1>
			<Link className="text-link" href="/">
				Back to home
			</Link>
		</main>
	);
}
