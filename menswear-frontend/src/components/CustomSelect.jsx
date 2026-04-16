import Select from "react-select";

const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  isClearable = true,
}) => {
  const formattedOptions = options.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  const selectedOption =
    formattedOptions.find((opt) => opt.value === value) || null;

  return (
    <Select
      options={formattedOptions}
      value={selectedOption}
      onChange={(selected) => onChange(selected ? selected.value : "")}
      placeholder={placeholder}
      isClearable={isClearable}
      isSearchable
      className="w-48"
    />
  );
};

export default CustomSelect;
