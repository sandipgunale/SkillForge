import FilterSelect from "@/components/common/FilterSelect";

export default function TopicFilter({ value, topics, onChange }) {
  return (
    <FilterSelect
      placeholder="Topic"
      value={value}
      onChange={onChange}
      options={topics.map((topic) => ({
        value: topic.id,
        label: topic.name,
      }))}
    />
  );
}
