import FilterSelect from "@/components/common/FilterSelect";

const types = [
  {
    value: "VIDEO",
    label: "Video",
  },
  {
    value: "ARTICLE",
    label: "Article",
  },
  {
    value: "PDF",
    label: "PDF",
  },
];

export default function TypeFilter({ value, onChange }) {
  return (
    <FilterSelect
      placeholder="Type"
      value={value}
      options={types}
      onChange={onChange}
    />
  );
}
