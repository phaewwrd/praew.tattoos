import Link from "next/link";

export default function NotFound() {
  return (
    <main className="paper-bg grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="font-bold font-stitch text-5xl text-brand">404</p>
        <h1 className="mt-2 font-hand text-3xl">
          This page could not be found.
        </h1>
        <Link
          className="mt-4 inline-block font-black text-brand uppercase underline"
          href="/"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
