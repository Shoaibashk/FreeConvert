import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Square, Download } from "lucide-react";

interface ActionButtonsProps {
  isDone: boolean;
  error: string | null;
  isConverting: boolean;
  targetFormat: string;
  convertedVideoURL: string | null;
  onConvert: () => void;
  onCancel: () => void;
  onReset: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isDone,
  error,
  isConverting,
  targetFormat,
  convertedVideoURL,
  onConvert,
  onCancel,
  onReset,
}) => {
  return (
    <div className="flex gap-4 pt-4">
      {!isDone && !error ? (
        isConverting ? (
          <Button
            onClick={onCancel}
            variant="destructive"
            className="flex-1 sketch-button bg-destructive text-destructive-foreground"
          >
            <Square className="mr-2 h-5 w-5 fill-current" />
            Stop It
          </Button>
        ) : (
          <Button
            onClick={onConvert}
            disabled={isConverting}
            className="flex-1 sketch-button text-lg"
          >
            {isConverting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Working on it...
              </>
            ) : (
              "Convert Now!"
            )}
          </Button>
        )
      ) : error ? (
        <Button
          onClick={onReset}
          className="flex-1 sketch-button bg-background text-foreground hover:bg-muted"
        >
          Try Again
        </Button>
      ) : (
        <>
          <a
            download={`converted.${targetFormat}`}
            href={convertedVideoURL || undefined}
            className="flex-1"
          >
            <Button className="w-full sketch-button bg-green-600 hover:bg-green-700 text-white text-lg">
              <Download className="mr-2 h-5 w-5" />
              Download
            </Button>
          </a>
          <Button
            onClick={onReset}
            className="sketch-button bg-background text-foreground hover:bg-muted"
          >
            New
          </Button>
        </>
      )}
    </div>
  );
};
