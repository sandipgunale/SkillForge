export default function ResourceBody({ resource }) {
  return (
    <div>
      <h3 className="line-clamp-2 text-lg font-semibold">{resource.title}</h3>

      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
        {resource.description}
      </p>
    </div>
  );
}
