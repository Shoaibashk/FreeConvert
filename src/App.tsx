import { Loader2 } from "lucide-react";
import { ConverterCard } from "@/components/converter/ConverterCard";
import { StatsCard } from "@/components/converter/StatsCard";
import { TipsCard } from "@/components/converter/TipsCard";
import { Footer } from "@/components/converter/Footer";
import { useFFmpegConversion } from "@/hooks/useFFmpegConversion";

function App() {
  const {
    loaded,
    video,
    videoPreviewURL,
    targetFormat,
    isDone,
    error,
    isConverting,
    progress,
    convertedVideoURL,
    handleDropFile,
    setTargetFormat,
    transcode,
    cancel,
    resetState,
  } = useFFmpegConversion();

  if (!loaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <div className="text-center space-y-1">
          <h2 className="text-lg font-medium">Loading FFmpeg</h2>
          <p className="text-sm text-muted-foreground">
            Preparing converter...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col p-4 md:p-8">
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl grid md:grid-cols-[1fr_300px] gap-8 items-start">
          <div className="space-y-8">
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-4xl font-bold tracking-tight marker-highlight inline-block transform -rotate-1">
                Convert Media
              </h1>
              <p className="text-muted-foreground text-lg">
                Fast, private, and secure conversion in your browser.
              </p>
            </div>
            <ConverterCard
              video={video}
              videoPreviewURL={videoPreviewURL}
              targetFormat={targetFormat}
              isDone={isDone}
              error={error}
              isConverting={isConverting}
              progress={progress}
              convertedVideoURL={convertedVideoURL}
              onDropFile={handleDropFile}
              setTargetFormat={setTargetFormat}
              transcode={transcode}
              cancel={cancel}
              resetState={resetState}
            />
          </div>
          <div className="space-y-6 hidden md:block">
            <StatsCard />
            <TipsCard />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
