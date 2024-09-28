import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format, parse } from "date-fns";
import { useState } from "react";
import { ImportTable } from "@/app/(dashboard)/transactions/import-table";
import { convertAmountToMiliunits } from "@/lib/utils";

type Props = {
  data: string[][];
  onCancel: () => void;
  onSubmit: (data: any) => void;
};

const dateFormat = "yyyy-MM-dd HH:mm:ss";
const outputFormat = "yyyy-MM-dd"; // the format the DB accepts

const requiredOptions = ["amount", "date", "payee"]; // required to make a transaction
export interface selectedColumnState {
  [key: string]: string | null;
}

export const ImportCard = ({ onCancel, data, onSubmit }: Props) => {
  console.log(data);
  const [selectedColumns, setSelectedColumns] = useState<selectedColumnState>(
    {},
  );
  const progress = Object.values(selectedColumns).filter(
    (value) => value !== null && requiredOptions.includes(value),
  ).length;

  const headers = data[0];
  const body = data.slice(1);

  const handleContinue = () => {
    const mappedData = {
      headers: headers.map((_headers, index) => {
        return selectedColumns[`column_${index}`] || null;
      }),

      body: body
        .map((transaction) => {
          const transformedTransaction = transaction.map((cell, index) =>
            selectedColumns[`column_${index}`] ? cell : null,
          );

          return transformedTransaction.every((item) => item === null)
            ? []
            : transformedTransaction;
        })
        .filter((row) => row.length >= requiredOptions.length),
    };

    console.log(mappedData.body, "mappedData.body");

    // converting array matrix into array containing objects (what backend wants)

    const arrayOfData = mappedData.body.map((transaction) =>
      transaction.reduce((acc: any, cell, index) => {
        const header = mappedData.headers[index];
        if (header) {
          // @ts-ignore
          acc[mappedData.headers[index]] = cell;
        }
        return acc;
      }, {}),
    );

    // convert amount to miliunits
    // formatting dates to match required output format
    console.log(arrayOfData, "arrayofdata");

    const formattedData = arrayOfData.map((item) => ({
      ...item,
      amount: convertAmountToMiliunits(parseFloat(item.amount)),
      date: format(parse(item.date, dateFormat, new Date()), outputFormat),
    }));

    onSubmit(formattedData);
  };

  function onTableHeadSelectChange(value: string | null, index: any) {
    setSelectedColumns((prev) => {
      const newSelectedColumns = { ...prev };

      for (const key in newSelectedColumns) {
        if (newSelectedColumns[key] === value) {
          newSelectedColumns[key] === "null";
        }
      }

      if (value === "skip") value = null;

      newSelectedColumns[`column_${index}`] = value;

      return newSelectedColumns;
    });
  }

  return (
    <Card className="border-none drop-shadow-sm pb-10 -mt-24">
      <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle className="text-xl line-clamp-1">
          Import transaction
        </CardTitle>
        <div className="flex items-center gap-x-2">
          <Button onClick={onCancel} size="sm">
            <Plus className="size-4 mr-2" />
            Cancel
          </Button>

          <Button
            onClick={handleContinue}
            disabled={requiredOptions.length > progress}
            size="sm"
          >
            Continue {`${progress} / ${requiredOptions.length}`}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ImportTable
          headers={headers}
          body={body}
          selectedColumns={selectedColumns}
          requiredOptions={requiredOptions}
          onTableHeadSelectChange={onTableHeadSelectChange}
        />
      </CardContent>
    </Card>
  );
};
