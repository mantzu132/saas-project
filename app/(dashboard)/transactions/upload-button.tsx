import { useCSVReader } from "react-papaparse";
import { Button } from "@/components/ui/button";

import { CSSProperties } from "react";
import { Upload } from "lucide-react";

type Props = {
  onUpload: (result: any) => void;
};

export const UploadButton = ({ onUpload }: Props) => {
  const { CSVReader } = useCSVReader();

  // TODO : ADD A PAYWALL
  return (
    <CSVReader onUploadAccepted={onUpload}>
      {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps }) => (
        <>
          <Button {...getRootProps()} size="sm" className="w-full lg-w-auto">
            <Upload className="size-4 mr-2" />
            {acceptedFile ? acceptedFile.name : "Import"}
          </Button>
          {acceptedFile && (
            <Button {...getRemoveFileProps()} size="sm">
              Remove
            </Button>
          )}
          <ProgressBar />
        </>
      )}
    </CSVReader>
  );
};
