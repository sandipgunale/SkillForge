import OptionItem from "./OptionItem";

export default function OptionList({ options, selected, onSelect }) {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <OptionItem
          key={option}
          label={option}
          selected={selected === option}
          onClick={() => onSelect(option)}
        />
      ))}
    </div>
  );
}
