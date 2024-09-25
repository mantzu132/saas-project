import { selectedColumnState } from "@/app/(dashboard)/transactions/import-card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TableHeadSelectProps {
  columnIndex: number;
  selectedColumns: selectedColumnState;
  onChange?: (columnIndex: number, value: string | null) => void;
}

const options = ["amount", "payee", "notes", "date"]; // all options that we can use

export const TableHeadSelect = ({
  columnIndex,
  selectedColumns,
  onChange,
}: TableHeadSelectProps) => {
  const currentSelect = selectedColumns?.[`column_${columnIndex}`];

  // TODO : DONT FORGET WE NEED TO MAKE SURE WHEN THE USER SUBMITS HE HAS THE REQUIRED OPTIONS MAPPED
  console.log(selectedColumns);
  return (
    <Select
      value={currentSelect || "skip"}
      onValueChange={(value) => onChange(value, columnIndex)}
    >
      <SelectTrigger
        className={cn(
          "focus:ring-offset-0 focus:ring-transparent outline-none border-none bg-transparent capitalize",
          currentSelect && "text-blue-500",
        )}
      >
        <SelectValue placeholder="skip" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="skip">Skip</SelectItem>
        {options
          .filter(
            (option) =>
              option === currentSelect ||
              !Object.values(selectedColumns ?? {}).includes(option),
          )
          .map((option) => (
            <SelectItem key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
};
