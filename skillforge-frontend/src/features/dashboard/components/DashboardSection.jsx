export default function DashboardSection({ title, description, children }) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>

        {description && (
          <p className="mt-1 text-muted-foreground">{description}</p>
        )}
      </div>

      {children}
    </section>
  );
}
