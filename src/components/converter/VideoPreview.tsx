import React from "react";

interface VideoPreviewProps {
  video: File;
  videoPreviewURL: string | null;
  children?: React.ReactNode;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  video,
  videoPreviewURL,
  children,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start gap-6">
      <div className="relative w-full md:w-48 h-32 rounded-sm overflow-hidden bg-muted flex-shrink-0 sketch-border">
        {videoPreviewURL && (
          <video
            src={videoPreviewURL}
            className="w-full h-full object-cover"
            controls={false}
          />
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-3 w-full">
        <div>
          <h3 className="font-bold text-xl truncate">{video.name}</h3>
          <p className="text-sm text-muted-foreground font-mono">
            {(video.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};
