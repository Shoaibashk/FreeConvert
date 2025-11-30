import React, { memo, useCallback } from "react";
import Dropzone from "@/components/ui/dropzone";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CircleX } from "lucide-react";
import { VideoPreview } from "./VideoPreview";
import { ProgressBar } from "./ProgressBar";
import { StatusMessage } from "./StatusMessage";
import { ActionButtons } from "./ActionButtons";

// ============================================================================
// Types
// ============================================================================

interface ConverterCardProps {
  /** Selected video file */
  video: File | null;
  /** Preview URL for the video */
  videoPreviewURL: string | null;
  /** Current target format for conversion */
  targetFormat: string;
  /** Whether conversion completed successfully */
  isDone: boolean;
  /** Error message if conversion failed */
  error: string | null;
  /** Whether conversion is in progress */
  isConverting: boolean;
  /** Conversion progress (0-100) */
  progress: number;
  /** URL to the converted file blob */
  convertedVideoURL: string | null;
  /** Handler for file drop */
  onDropFile: (files: File[]) => void;
  /** Handler to change target format */
  setTargetFormat: (format: string) => void;
  /** Handler to start conversion */
  transcode: () => void;
  /** Handler to cancel conversion */
  cancel: () => void;
  /** Handler to reset state */
  resetState: () => void;
}

interface FormatOption {
  value: string;
  label: string;
}

// ============================================================================
// Constants
// ============================================================================

/** Supported video output formats */
const VIDEO_FORMATS: FormatOption[] = [
  { value: "mp4", label: "MP4" },
  { value: "mov", label: "MOV" },
  { value: "avi", label: "AVI" },
  { value: "mkv", label: "MKV" },
  { value: "webm", label: "WEBM" },
];

/** Supported audio output formats */
const AUDIO_FORMATS: FormatOption[] = [
  { value: "mp3", label: "MP3" },
  { value: "ogg", label: "OGG" },
  { value: "wav", label: "WAV" },
  { value: "aac", label: "AAC" },
  { value: "flac", label: "FLAC" },
];

// ============================================================================
// Sub-components
// ============================================================================

interface FormatSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

/**
 * Dropdown selector for choosing the output format.
 */
const FormatSelector: React.FC<FormatSelectorProps> = ({
  value,
  onChange,
  disabled,
}) => (
  <Select value={value} onValueChange={onChange} disabled={disabled}>
    <SelectTrigger className="w-[140px] h-10 sketch-border bg-background">
      <SelectValue placeholder="Format" />
    </SelectTrigger>
    <SelectContent className="sketch-border">
      {/* Video formats section */}
      <div className="px-2 py-1.5 text-sm font-bold text-muted-foreground">
        Video
      </div>
      {VIDEO_FORMATS.map(({ value, label }) => (
        <SelectItem key={value} value={value}>
          {label}
        </SelectItem>
      ))}

      {/* Audio formats section */}
      <div className="px-2 py-1.5 text-sm font-bold text-muted-foreground border-t border-dashed border-border mt-1 pt-2">
        Audio
      </div>
      {AUDIO_FORMATS.map(({ value, label }) => (
        <SelectItem key={value} value={value}>
          {label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

interface ClearButtonProps {
  onClick: () => void;
}

/**
 * Button to clear the current video and start over.
 */
const ClearButton: React.FC<ClearButtonProps> = ({ onClick }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    className="h-10 w-10 ml-auto hover:bg-destructive/10 hover:text-destructive rounded-full"
  >
    <CircleX className="w-6 h-6" />
  </Button>
);

// ============================================================================
// Main Component
// ============================================================================

const ConverterCardComponent: React.FC<ConverterCardProps> = ({
  video,
  videoPreviewURL,
  targetFormat,
  isDone,
  error,
  isConverting,
  progress,
  convertedVideoURL,
  onDropFile,
  setTargetFormat,
  transcode,
  cancel,
  resetState,
}) => {
  /**
   * Handles format change and resets state if conversion was complete or errored.
   */
  const handleFormatChange = useCallback(
    (value: string) => {
      setTargetFormat(value);
      if (isDone || error) {
        resetState();
      }
    },
    [setTargetFormat, isDone, error, resetState]
  );

  // Show dropzone when no video is selected
  if (!video) {
    return (
      <div className="sketch-card bg-card transform rotate-1">
        <Dropzone onDropFile={onDropFile} />
      </div>
    );
  }

  // Show converter UI when a video is selected
  return (
    <div className="sketch-card bg-card space-y-6 transform rotate-1">
      {/* Video preview with format selector */}
      <VideoPreview video={video} videoPreviewURL={videoPreviewURL}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold">Convert to:</span>
          <FormatSelector
            value={targetFormat}
            onChange={handleFormatChange}
            disabled={isConverting}
          />
          <ClearButton onClick={resetState} />
        </div>
      </VideoPreview>

      {/* Progress indicator (only shown during conversion) */}
      {isConverting && <ProgressBar progress={progress} />}

      {/* Status message (success or error) */}
      <StatusMessage isDone={isDone} error={error} />

      {/* Action buttons */}
      <ActionButtons
        isDone={isDone}
        error={error}
        isConverting={isConverting}
        targetFormat={targetFormat}
        convertedVideoURL={convertedVideoURL}
        onConvert={transcode}
        onCancel={cancel}
        onReset={resetState}
      />
    </div>
  );
};

export const ConverterCard = memo(ConverterCardComponent);
