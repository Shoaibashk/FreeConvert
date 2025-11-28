import ShadcnDropzone, { DropzoneState } from "shadcn-dropzone";
import { Upload, FileVideo, Music, Video } from "lucide-react";
import { memo } from "react";

interface DropzoneProps {
  onDropFile: (files: File[]) => void;
}

const Dropzone = memo(({ onDropFile }: DropzoneProps) => {
  return (
    <div className="w-full transform hover:scale-[1.01] transition-transform duration-300">
      <ShadcnDropzone
        dropZoneClassName="group relative flex flex-col items-center justify-center w-full min-h-[300px] sketch-border bg-card hover:bg-muted/20 transition-colors duration-200 cursor-pointer"
        onDrop={(files: File[]) => {
          onDropFile(files);
        }}
        maxFiles={1}
        maxSize={50000 * 1024 * 1024} // 50000MB
        accept={{
          "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm"],
          "audio/*": [".mp3", ".ogg", ".wav", ".aac", ".flac"],
        }}
      >
        {(dropzone: DropzoneState) => (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
            {dropzone.isDragAccept ? (
              <div className="flex flex-col items-center space-y-4 wobble">
                <div className="p-6 rounded-full bg-primary/10 sketch-border border-primary">
                  <FileVideo className="w-12 h-12 text-primary" />
                </div>
                <p className="text-xl font-bold text-primary">
                  Drop it like it's hot!
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 rounded-full bg-muted sketch-border group-hover:bg-background transition-colors">
                  <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold marker-highlight inline-block">
                    Drop file here
                  </h3>
                  <p className="text-muted-foreground font-medium">
                    or click to browse your sketchbook
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm font-bold text-muted-foreground pt-4">
                  <span className="flex items-center gap-2 px-3 py-1 sketch-border border-dashed">
                    <Video className="w-4 h-4" /> Video
                  </span>
                  <span className="flex items-center gap-2 px-3 py-1 sketch-border border-dashed">
                    <Music className="w-4 h-4" /> Audio
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </ShadcnDropzone>
    </div>
  );
});

export default Dropzone;
