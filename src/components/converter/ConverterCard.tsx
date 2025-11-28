import React, { memo } from "react";
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

interface ConverterCardProps {
  video: File | null;
  videoPreviewURL: string | null;
  targetFormat: string;
  isDone: boolean;
  error: string | null;
  isConverting: boolean;
  progress: number;
  convertedVideoURL: string | null;
  onDropFile: (files: File[]) => void;
  setTargetFormat: (format: string) => void;
  transcode: () => void;
  cancel: () => void;
  resetState: () => void;
}

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
  return !video ? (
    <div className="sketch-card bg-card transform rotate-1">
      <Dropzone onDropFile={onDropFile} />
    </div>
  ) : (
    <div className="sketch-card bg-card space-y-6 transform rotate-1">
      <VideoPreview video={video} videoPreviewURL={videoPreviewURL}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold">Convert to:</span>
          <Select
            value={targetFormat}
            onValueChange={(value) => {
              setTargetFormat(value);
              if (isDone || error) resetState();
            }}
            disabled={isConverting}
          >
            <SelectTrigger className="w-[140px] h-10 sketch-border bg-background">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent className="sketch-border">
              <div className="px-2 py-1.5 text-sm font-bold text-muted-foreground">
                Video
              </div>
              <SelectItem value="mp4">MP4</SelectItem>
              <SelectItem value="mov">MOV</SelectItem>
              <SelectItem value="avi">AVI</SelectItem>
              <SelectItem value="mkv">MKV</SelectItem>
              <SelectItem value="webm">WEBM</SelectItem>
              <div className="px-2 py-1.5 text-sm font-bold text-muted-foreground border-t border-dashed border-border mt-1 pt-2">
                Audio
              </div>
              <SelectItem value="mp3">MP3</SelectItem>
              <SelectItem value="ogg">OGG</SelectItem>
              <SelectItem value="wav">WAV</SelectItem>
              <SelectItem value="aac">AAC</SelectItem>
              <SelectItem value="flac">FLAC</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetState}
            className="h-10 w-10 ml-auto hover:bg-destructive/10 hover:text-destructive rounded-full"
          >
            <CircleX className="w-6 h-6" />
          </Button>
        </div>
      </VideoPreview>

      {isConverting && <ProgressBar progress={progress} />}
      <StatusMessage isDone={isDone} error={error} />
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
