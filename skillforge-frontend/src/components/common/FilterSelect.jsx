import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FilterSelect({
  placeholder,
  value,
  options,
  onChange,
}) {
  return (
    <Select
      value={value || "all"}
      onValueChange={(selected) => onChange(selected === "all" ? "" : selected)}
    >
      <SelectTrigger className="w-55">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all">All</SelectItem>

        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
