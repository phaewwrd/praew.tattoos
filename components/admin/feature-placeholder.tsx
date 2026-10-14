type FeaturePlaceholderProps = {
  title: string;
  description: string;
};

export function FeaturePlaceholder({ title, description }: FeaturePlaceholderProps) {
  return (
    <section className="rounded-xl border border-dashed border-neutral-300 bg-white p-8">
      <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm text-neutral-600">{description}</p>
      <p className="mt-6 rounded-md bg-neutral-100 px-3 py-2 text-sm text-neutral-700">
        This page is part of F07 navigation scaffolding. Functional management workflows will be implemented in their own features.
      </p>
    </section>
  );
}
