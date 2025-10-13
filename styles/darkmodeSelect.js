// Dark mode styles for React Select
export const darkStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#374151' : '#1f2937',
      borderColor: state.isFocused ? '#4f46e5' : '#4b5563',
      color: '#f9fafb',
      boxShadow: state.isFocused ? '0 0 0 1px #4f46e5' : 'none',
      '&:hover': {
        borderColor: '#6b7280',
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1f2937',
      borderColor: '#4b5563',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#4f46e5'
        : state.isFocused
          ? '#374151'
          : '#1f2937',
      color: state.isSelected ? '#ffffff' : '#f9fafb',
      '&:hover': {
        backgroundColor: '#374151',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
    }),
    input: (provided) => ({
      ...provided,
      color: '#f9fafb',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#f9fafb',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#374151',
      color: '#f9fafb',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#f9fafb',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#d1d5db',
      '&:hover': {
        backgroundColor: '#4b5563',
        color: '#ffffff',
      },
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: '#4b5563',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#9ca3af',
    }),
  };