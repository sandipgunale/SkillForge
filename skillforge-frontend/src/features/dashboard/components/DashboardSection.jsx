export default function DashboardSection({ title, description, children }) {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="display text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}