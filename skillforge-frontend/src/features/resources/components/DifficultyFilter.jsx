import FilterSelect from "@/components/common/FilterSelect";

const difficulties = [
  {
    value: "BEGINNER",
    label: "Beginner",
  },
  {
    value: "INTERMEDIATE",
    label: "Intermediate",
  },
  {
    value: "ADVANCED",
    label: "Advanced",
  },
];

export default function DifficultyFilter({ value, onChange }) {
  return (
    <FilterSelect
      placeholder="Difficulty"
      value={value}
      options={difficulties}
      onChange={onChange}
    />
  );
}
