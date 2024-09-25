import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UploadButton } from "@/app/(dashboard)/transactions/upload-button";
import { DataTable } from "@/components/data-table";
import { columns } from "@/app/(dashboard)/transactions/columns";
import { useState } from "react";
import { ImportTable } from "@/app/(dashboard)/transactions/import-table";

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
  const [selectedColumns, setSelectedColumns] = useState<selectedColumnState>(
    {},
  );

  const progress = Object.values(selectedColumns).filter(Boolean).length;

  const headers = data[0];
  const body = data.slice(1);

  function onTableHeadSelectChange(value, index) {
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
            onClick={onSubmit}
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
          onTableHeadSelectChange={onTableHeadSelectChange}
        />
      </CardContent>
    </Card>
  );
};
