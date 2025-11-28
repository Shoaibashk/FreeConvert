import ShadcnDropzone, { DropzoneState } from "shadcn-dropzone";
import { motion } from "framer-motion";
import { Upload, Video, FileVideo } from "lucide-react";

interface DropzoneProps {
  onDropFile: (files: File[]) => void;
}

const Dropzone = ({ onDropFile }: DropzoneProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4"
    >
      <ShadcnDropzone
        dropZoneClassName="group relative flex flex-col items-center justify-center w-full min-h-[280px] md:min-h-[320px] border-2 border-dashed border-primary/30 rounded-2xl bg-gradient-to-b from-muted/50 to-muted/30 hover:border-primary/60 hover:bg-muted/60 transition-all duration-300 select-none cursor-pointer overflow-hidden"
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
          <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center">
            {dropzone.isDragAccept ? (
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1.1 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <FileVideo className="w-10 h-10 text-primary" />
                </div>
                <p className="text-xl font-semibold text-primary">
                  Drop your video here!
                </p>
              </motion.div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-10 h-10 text-primary group-hover:text-blue-500 transition-colors" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-2">
                  Drop your video here
                </h3>
                <p className="text-muted-foreground mb-4">
                  or click to browse from your device
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {['MP4', 'MOV', 'AVI', 'MKV', 'WEBM'].map((format) => (
                    <span 
                      key={format}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
                    >
                      {format}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Maximum file size: 50GB
                </p>
              </>
            )}
            
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
            </div>
          </div>
        )}
      </ShadcnDropzone>
    </motion.div>
  );
};
export default Dropzone;
