import { selectedColumnState } from "@/app/(dashboard)/transactions/import-card";

interface ImportTableProps {
  headers: string[];
  body: string[][];
  selectedColumns?: selectedColumnState;
  onTableHeadSelectChange?: (columnIndex: number, value: string | null) => void;
  requiredOptions: string[];
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableHeadSelect } from "@/app/(dashboard)/transactions/table-head-select";

export const ImportTable = ({
  headers,
  body,
  selectedColumns,
  onTableHeadSelectChange,
  requiredOptions,
}: ImportTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((_, index) => (
              <TableHead key={index}>
                <TableHeadSelect
                  columnIndex={index}
                  selectedColumns={selectedColumns}
                  onChange={onTableHeadSelectChange}
                  requiredOptions={requiredOptions}
                />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {body.length > 0 ? (
            body.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={headers.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
