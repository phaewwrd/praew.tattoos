"use client";

export default function RootError({ reset }: { reset: () => void }) {
	return (
		<main className="section-frame flex min-h-dvh flex-col items-start justify-center gap-4 py-16">
			<p className="eyebrow">Something went wrong</p>
			<h1>We couldn&apos;t load this page.</h1>
			<button type="button" className="text-button" onClick={reset}>
				Try again
			</button>
		</main>
	);
}
