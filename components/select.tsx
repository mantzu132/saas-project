"use client";

import { SingleValue } from "react-select";
import { useMemo } from "react";
import CreatableSelect from "react-select/creatable";

type Props = {
  onChange: (value?: string) => void;
  onCreate?: (value: string) => void;
  options?: { label: string; value: string }[];
  value?: string | null | undefined;
  disabled?: boolean;
  placeholder?: string;
};

export const Select = ({
  onChange,
  options,
  onCreate,
  value,
  placeholder,
  disabled,
}: Props) => {
  const onSelect = (option: SingleValue<{ label: string; value: string }>) => {
    onChange(option?.value);
  };

  const formattedValue = useMemo(
    () => options?.find((option) => option.value === value),
    [options, value],
  );

  return (
    <CreatableSelect
      placeholder={placeholder}
      className="text-small h-10 w-full"
      styles={{
        control: (base, state) => ({
          ...base,
          borderColor: "#E2E8F0",
          "&:hover": {
            borderColor: "#E2E8F0",
          },
        }),
      }}
      value={formattedValue}
      onChange={onSelect}
      options={options}
      onCreateOption={onCreate}
      isDisabled={disabled}
    />
  );
};
