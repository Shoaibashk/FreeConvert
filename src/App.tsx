import Dropzone from "@/components/ui/dropzone";
import { FFmpeg, FileData } from "@ffmpeg/ffmpeg";
import { useEffect, useRef, useState } from "react";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import ffmpegCore from "@/assets/ffmpeg-core.js?url";
import ffmpegCoreWasm from "@/assets/ffmpeg-core.wasm?url";
import { CircleX, Download, ArrowRight, Zap, Shield, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Infinite from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef<HTMLDivElement>(null);

  const [video, setVideo] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState("mp4");
  const [convertedVideoURL, setConvertedVideoURL] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  const load = async () => {
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("progress", ({ progress }) => {
      setProgress(Math.round(progress * 100));
      if (messageRef.current) {
        messageRef.current.innerHTML = `${Math.round(progress * 100)}%`;
      }
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(ffmpegCore, "text/javascript"),
      wasmURL: await toBlobURL(ffmpegCoreWasm, "application/wasm"),
      workerURL: await toBlobURL(
        import.meta.env.DEV
          ? `/ffmpeg-core.worker.js`
          : `${import.meta.env.BASE_URL}ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    });
    setLoaded(true);
  };

  const transcode = async () => {
    setIsDone(false);
    setIsConverting(true);
    setProgress(0);
    
    const uploadedFile = await fetchFile(video as File);
    const ffmpeg = ffmpegRef.current;
    const uploadedFileFormat = video?.name.split(".").pop();

    await ffmpeg.writeFile("input." + uploadedFileFormat, uploadedFile);
    await ffmpeg.exec([
      "-i",
      "input." + uploadedFileFormat,
      "output." + targetFormat,
    ]);
    const data: FileData = await ffmpeg.readFile("output." + targetFormat);

    setIsDone(true);
    setIsConverting(false);
    const convertedBlob = new Blob([data as FileData], {
      type: "video/" + targetFormat,
    });
    setConvertedVideoURL(URL.createObjectURL(convertedBlob));
  };

  const resetState = () => {
    setVideo(null);
    setIsDone(false);
    setConvertedVideoURL(null);
    setIsConverting(false);
    setProgress(0);
    if (messageRef.current) {
      messageRef.current.innerHTML = "";
    }
  };

  useEffect(() => {
    load();
  }, []);

  const features = [
    {
      icon: Shield,
      title: "100% Private",
      description: "Your files never leave your device. All processing happens locally in your browser."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Powered by FFmpeg WebAssembly for near-native performance."
    },
    {
      icon: Globe,
      title: "Works Offline",
      description: "Install as a PWA and convert videos even without internet."
    }
  ];

  if (!loaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-6">
        <Infinite size={100} className="text-primary" />
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading FFmpeg</h2>
          <p className="text-muted-foreground">Preparing the video converter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Convert Videos{" "}
              <span className="gradient-text">Instantly</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Free, private, and fast video converter that works entirely in your browser.
              No uploads, no servers — your files stay on your device.
            </p>
          </motion.div>

          {/* Converter Area */}
          <AnimatePresence mode="wait">
            {!video ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto"
              >
                <Dropzone
                  onDropFile={(files: File[]) => {
                    if (files.length > 0) {
                      setVideo(files[0]);
                    }
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="converter"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-3xl mx-auto"
              >
                <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                  {/* Video Preview */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                    <div className="relative w-full md:w-40 h-28 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <video
                        src={URL.createObjectURL(video as Blob)}
                        className="w-full h-full object-cover"
                        controls={false}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate mb-1">{video.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {(video.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-muted rounded-md font-medium">
                          {video.name.split('.').pop()?.toUpperCase()}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <Select
                          value={targetFormat}
                          onValueChange={(value) => setTargetFormat(value)}
                        >
                          <SelectTrigger className="w-[100px] h-8">
                            <SelectValue placeholder="Format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mp4">MP4</SelectItem>
                            <SelectItem value="mov">MOV</SelectItem>
                            <SelectItem value="avi">AVI</SelectItem>
                            <SelectItem value="mkv">MKV</SelectItem>
                            <SelectItem value="webm">WEBM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={resetState}
                      className="absolute top-4 right-4 md:relative md:top-0 md:right-0"
                    >
                      <CircleX className="w-5 h-5 text-destructive" />
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  {isConverting && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-6"
                    >
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Converting...</span>
                        <span ref={messageRef} className="font-medium">{progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Success Message */}
                  {isDone && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-green-600 dark:text-green-400">Conversion Complete!</p>
                        <p className="text-sm text-muted-foreground">Your video is ready to download</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {!isDone ? (
                      <Button 
                        onClick={transcode}
                        disabled={isConverting}
                        className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      >
                        {isConverting ? (
                          <>
                            <Infinite size={20} className="mr-2" />
                            Converting...
                          </>
                        ) : (
                          <>
                            Convert to {targetFormat.toUpperCase()}
                          </>
                        )}
                      </Button>
                    ) : (
                      <>
                        <a
                          download={`converted.${targetFormat}`}
                          href={convertedVideoURL || undefined}
                          className="flex-1"
                        >
                          <Button className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                            <Download className="mr-2 h-5 w-5" />
                            Download Video
                          </Button>
                        </a>
                        <Button 
                          variant="outline" 
                          onClick={resetState}
                          className="h-12"
                        >
                          Convert Another
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose FreeConvert?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built with the latest web technologies to give you the best video conversion experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span className="font-semibold">FreeConvert</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Made with ❤️ by{" "}
            <a 
              href="https://shoaibashk.github.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Shoaibashk
            </a>
            {" "}• Powered by FFmpeg WebAssembly
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a 
              href="https://github.com/Shoaibashk/FreeConvert" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
