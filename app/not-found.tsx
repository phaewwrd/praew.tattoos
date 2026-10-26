import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-start justify-center gap-4 py-16">
      <p className="text-sm uppercase">404</p>
      <h1 id="not-found-title">This page could not be found.</h1>
      <Link className="underline" href="/">
        Back to home
      </Link>
    </main>
  );
}
