// import { DotPattern } from "@/components/ui/dot-pattern";
import Dropzone from "@/components/ui/dropzone";
// import Navbar from "@/components/ui/navbar";
// import { cn } from "@/lib/utils";
import { FFmpeg, FileData } from "@ffmpeg/ffmpeg";
import { useEffect, useRef, useState } from "react";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import ffmpegCore from "@/assets/ffmpeg-core.js?url";
import ffmpegCoreWasm from "@/assets/ffmpeg-core.wasm?url";
// import { useRef } from "react";
import { CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Infinite from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Confetti, ConfettiRef } from "./components/ui/confetti";

function App() {
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef<HTMLDivElement>(null);

  const [video, setVideo] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState("mp4");
  const [convertedVideoURL, setConvertedVideoURL] = useState<string | null>(
    null
  );
  const [loaded, setLoaded] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const load = async () => {
    // const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.9/dist/esm";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("progress", ({ progress, time }) => {
      messageRef!.current!.innerHTML = `${progress * 100} % (transcoded time: ${
        time / 1000000
      } s)`;
    });

    await ffmpeg.load({
      // coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      coreURL: await toBlobURL(ffmpegCore, "text/javascript"),
      // wasmURL: await toBlobURL(
      //   `${baseURL}/ffmpeg-core.wasm`,
      //   "application/wasm"
      // ),
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
    const uploadedFile = await fetchFile(video as File);
    const ffmpeg = ffmpegRef.current;
    const uploadedFileFormat = video?.name.split(".").pop();

    await ffmpeg.writeFile("input." + uploadedFileFormat, uploadedFile);
    await ffmpeg.exec([
      "-i",
      "input." + uploadedFileFormat,
      // "-c:v",
      // "libx264",

      "output." + targetFormat,
    ]);
    const data: FileData = await ffmpeg.readFile("output." + targetFormat);

    setIsDone(true);
    const convertedBlob = new Blob([data as FileData], {
      type: "video/" + targetFormat,
    });
    setConvertedVideoURL(URL.createObjectURL(convertedBlob));
  };

  useEffect(() => {
    load();
  }, []);

  // useEffect(() => {
  //   if (!video) {
  //     messageRef!.current!.innerHTML = "";
  //     setConvertedVideoURL(null);
  //     setIsDone(false);
  //   }
  // }, [video]);

  return loaded ? (
    <>
      <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        {!video && (
          <div className="w-full max-w-6xl p-2">
            <Dropzone
              onDropFile={(files: File[]) => {
                if (files.length > 0) {
                  setVideo(files[0]);
                }
              }}
            />
          </div>
        )}
        {video && (
          <div className="bg-card p-4 rounded-lg border max-w-6xl w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <video
                  src={URL.createObjectURL(video as Blob)}
                  className="w-24 h-16 rounded-md object-cover"
                  controls={false}
                />
                <div>
                  <p className="font-medium gap-4">{video.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(video.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Select
                  value={targetFormat}
                  onValueChange={(value) => setTargetFormat(value)}
                >
                  <SelectTrigger className="w-[120px]">
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

                <Button
                  onClick={() => {
                    transcode();
                    // Handle conversion logic here
                  }}
                >
                  Convert
                </Button>

                <CircleX
                  color="#ff3d3d"
                  size={"35px"}
                  strokeWidth="2px"
                  absoluteStrokeWidth={false}
                  onClick={() => {
                    setVideo(null);
                    setIsDone(false);
                    setConvertedVideoURL(null);
                    messageRef!.current!.innerHTML = "";
                  }}
                />
                {isDone && (
                  <a
                    download={"name." + targetFormat}
                    href={convertedVideoURL?.toString()}
                  >
                    <Button variant={"outline"}>Download</Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
        <div ref={messageRef}></div>
      </div>
    </>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <Infinite size={100} />
    </div>
  );
}

export default App;
