export default function ResourceDescription({ resource }) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <h2 className="text-xl font-semibold">Description</h2>

      <p className="mt-4 leading-8 text-muted-foreground">
        {resource.description}
      </p>
    </div>
  );
}
