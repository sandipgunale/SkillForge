import SearchInput from "@/components/common/SearchInput";

export default function SearchBar({ value, onChange }) {
  return (
    <SearchInput
      placeholder="Search resources..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
