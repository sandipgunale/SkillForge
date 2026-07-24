export default function ResourceDescription({ resource }) {
  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-2xl font-semibold tracking-tight">Description</h2>

      <div className="mt-6">
        {resource.description ? (
          <p className="whitespace-pre-line leading-8 text-muted-foreground">
            {resource.description}
          </p>
        ) : (
          <p className="italic text-muted-foreground">
            No description available.
          </p>
        )}
      </div>
    </section>
  );
}
