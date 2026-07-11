export default function SectionTitle({ title, description }) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>

      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
