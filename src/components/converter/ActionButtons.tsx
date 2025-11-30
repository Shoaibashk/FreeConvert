import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Square, Download } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface ActionButtonsProps {
  /** Whether conversion completed successfully */
  isDone: boolean;
  /** Error message if conversion failed, null otherwise */
  error: string | null;
  /** Whether conversion is currently in progress */
  isConverting: boolean;
  /** Target format for the download filename */
  targetFormat: string;
  /** URL to the converted file blob */
  convertedVideoURL: string | null;
  /** Handler to start conversion */
  onConvert: () => void;
  /** Handler to cancel ongoing conversion */
  onCancel: () => void;
  /** Handler to reset and start over */
  onReset: () => void;
}

// ============================================================================
// Sub-components for clarity
// ============================================================================

interface CancelButtonProps {
  onCancel: () => void;
}

const CancelButton: React.FC<CancelButtonProps> = ({ onCancel }) => (
  <Button
    onClick={onCancel}
    variant="destructive"
    className="flex-1 sketch-button bg-destructive text-destructive-foreground"
  >
    <Square className="mr-2 h-5 w-5 fill-current" />
    Stop It
  </Button>
);

interface ConvertButtonProps {
  onConvert: () => void;
  isConverting: boolean;
}

const ConvertButton: React.FC<ConvertButtonProps> = ({
  onConvert,
  isConverting,
}) => (
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
);

interface ErrorButtonProps {
  onReset: () => void;
}

const ErrorButton: React.FC<ErrorButtonProps> = ({ onReset }) => (
  <Button
    onClick={onReset}
    className="flex-1 sketch-button bg-background text-foreground hover:bg-muted"
  >
    Try Again
  </Button>
);

interface SuccessButtonsProps {
  targetFormat: string;
  convertedVideoURL: string | null;
  onReset: () => void;
}

const SuccessButtons: React.FC<SuccessButtonsProps> = ({
  targetFormat,
  convertedVideoURL,
  onReset,
}) => (
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
);

// ============================================================================
// Main Component
// ============================================================================

/**
 * Renders the appropriate action buttons based on the current conversion state.
 *
 * States:
 * - Converting: Shows cancel button
 * - Idle (not started): Shows convert button
 * - Error: Shows retry button
 * - Success: Shows download and new conversion buttons
 */
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
  // Determine which UI state we're in
  const isInProgress = !isDone && !error;
  const hasError = Boolean(error);
  const isComplete = isDone && !error;

  return (
    <div className="flex gap-4 pt-4">
      {isInProgress &&
        (isConverting ? (
          <CancelButton onCancel={onCancel} />
        ) : (
          <ConvertButton onConvert={onConvert} isConverting={isConverting} />
        ))}

      {hasError && <ErrorButton onReset={onReset} />}

      {isComplete && (
        <SuccessButtons
          targetFormat={targetFormat}
          convertedVideoURL={convertedVideoURL}
          onReset={onReset}
        />
      )}
    </div>
  );
};
