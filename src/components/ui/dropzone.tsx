import ShadcnDropzone, { DropzoneState } from "shadcn-dropzone";

interface DropzoneProps {
  onDropFile: (files: File[]) => void;
}

const Dropzone = ({ onDropFile }: DropzoneProps) => {
  return (
    <>
      <div className="space-y-4">
        {
          <ShadcnDropzone
            dropZoneClassName="flex 
          justify-center 
          w-full 
          h-32 
          border-dashed 
          border-4 
          border-grey-100  
          rounded-lg 
          hover:bg-accent 
          hover:text-accent-foreground 
          transition-all 
          select-none 
          cursor-pointer"
            onDrop={(files: File[]) => {
              onDropFile(files);
            }}
            maxFiles={1}
            maxSize={50000 * 1024 * 1024} // 50000MB
            accept={{
              "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm"],
            }}
          >
            {(dropzone: DropzoneState) => (
              <>
                {dropzone.isDragAccept ? (
                  <div className="text-sm font-medium">
                    Drop your video here!
                  </div>
                ) : (
                  <div className="flex items-center flex-col gap-2">
                    <div className="flex items-center flex-row gap-0.5 text-sm font-medium">
                      Upload video
                    </div>
                    <div className="text-xs text-gray-400">
                      Supported formats: MP4, MOV, AVI, MKV, WEBM
                    </div>
                  </div>
                )}
              </>
            )}
          </ShadcnDropzone>
        }
      </div>
    </>
  );
};
export default Dropzone;
