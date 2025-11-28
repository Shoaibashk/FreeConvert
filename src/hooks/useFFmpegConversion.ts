import { FFmpeg, FileData } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ffmpegCore from "@/assets/ffmpeg-core.js?url";
import ffmpegCoreWasm from "@/assets/ffmpeg-core.wasm?url";

interface UseFFmpegConversionOptions {
    initialFormat?: string;
}

export function useFFmpegConversion(options: UseFFmpegConversionOptions = {}) {
    const { initialFormat = "mp4" } = options;

    const ffmpegRef = useRef(new FFmpeg());
    const [loaded, setLoaded] = useState(false);

    const [video, setVideo] = useState<File | null>(null);
    const [videoPreviewURL, setVideoPreviewURL] = useState<string | null>(null);
    const [targetFormat, setTargetFormat] = useState(initialFormat);

    // Formats
    const audioFormats = useMemo(
        () => ["mp3", "ogg", "wav", "aac", "flac"],
        []
    );
    const isAudioFormat = useCallback(
        (format: string) => audioFormats.includes(format.toLowerCase()),
        [audioFormats]
    );

    const [convertedVideoURL, setConvertedVideoURL] = useState<string | null>(
        null
    );
    const [isDone, setIsDone] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const abortedRef = useRef(false);
    const cancelingRef = useRef(false);
    const progressRef = useRef(0);

    const load = useCallback(async () => {
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on("log", ({ message }) => {
            if (
                message.includes("Aborted(OOM)") ||
                message.includes("out of memory") ||
                message.includes("Output file #0 does not contain any stream")
            ) {
                abortedRef.current = true;
            }
        });

        ffmpeg.on("progress", ({ progress }) => {
            const newProgress = Math.round(progress * 100);
            if (Math.abs(newProgress - progressRef.current) >= 1) {
                progressRef.current = newProgress;
                setProgress(newProgress);
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
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // Preview URL management
    useEffect(() => {
        if (video) {
            const url = URL.createObjectURL(video);
            setVideoPreviewURL(url);
            return () => URL.revokeObjectURL(url);
        }
        setVideoPreviewURL(null);
    }, [video]);

    const handleDropFile = useCallback((files: File[]) => {
        if (files.length > 0) setVideo(files[0]);
    }, []);

    const transcode = useCallback(async () => {
        if (!video) return;
        setIsDone(false);
        setIsConverting(true);
        setProgress(0);
        setError(null);
        abortedRef.current = false;
        cancelingRef.current = false;

        try {
            const uploadedFile = await fetchFile(video as File);
            const uploadedFileFormat = video.name.split(".").pop()?.toLowerCase();
            const inputFileName = "input." + uploadedFileFormat;
            const outputFileName = "output." + targetFormat;

            const ffmpeg = ffmpegRef.current;
            await ffmpeg.writeFile(inputFileName, uploadedFile);

            const ffmpegArgs: string[] = ["-i", inputFileName, "-threads", "1"];
            const isOutputAudio = isAudioFormat(targetFormat);

            if (isOutputAudio) {
                ffmpegArgs.push("-vn");
                if (targetFormat === "mp3") ffmpegArgs.push("-c:a", "libmp3lame", "-b:a", "192k", "-ar", "44100");
                else if (targetFormat === "ogg") ffmpegArgs.push("-c:a", "libvorbis", "-b:a", "192k", "-ar", "44100");
                else if (targetFormat === "wav") ffmpegArgs.push("-c:a", "pcm_s16le", "-ar", "44100");
                else if (targetFormat === "aac") ffmpegArgs.push("-c:a", "aac", "-b:a", "192k", "-ar", "44100");
                else if (targetFormat === "flac") ffmpegArgs.push("-c:a", "flac", "-ar", "44100");
            } else {
                ffmpegArgs.push("-vf", "scale='min(720,iw)':-2");
                if (targetFormat === "webm") {
                    ffmpegArgs.push(
                        "-c:v", "libvpx", "-crf", "30", "-b:v", "1M", "-deadline", "realtime", "-cpu-used", "5", "-c:a", "libopus", "-b:a", "96k"
                    );
                } else if (["avi", "mkv"].includes(targetFormat)) {
                    ffmpegArgs.push(
                        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "30", "-c:a", "aac", "-b:a", "96k"
                    );
                } else {
                    ffmpegArgs.push(
                        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "30", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart"
                    );
                }
            }

            ffmpegArgs.push(outputFileName);
            await ffmpeg.exec(ffmpegArgs);

            if (abortedRef.current) {
                throw new Error("Conversion failed due to memory or missing streams.");
            }

            const data: FileData = await ffmpeg.readFile(outputFileName);
            const outputSize = (data as Uint8Array).byteLength;
            if (outputSize < 1000) {
                throw new Error("Output file too small. Likely failed.");
            }

            setIsDone(true);
            setIsConverting(false);
            const mimeType = isOutputAudio ? `audio/${targetFormat}` : `video/${targetFormat}`;
            const convertedBlob = new Blob([data as FileData], { type: mimeType });
            setConvertedVideoURL(URL.createObjectURL(convertedBlob));

            try {
                await ffmpeg.deleteFile(inputFileName);
                await ffmpeg.deleteFile(outputFileName);
            } catch (cleanupError) {
                // Non-fatal cleanup error
                if (import.meta.env.DEV) {
                    console.debug("FFmpeg cleanup error", cleanupError);
                }
            }
        } catch (err) {
            if (cancelingRef.current) {
                setIsConverting(false);
                return;
            }
            let errorMessage = "Unknown error";
            if (err instanceof Error) {
                errorMessage = err.message.includes("memory access out of bounds")
                    ? "Video too large/complex. Try MP4 or smaller file."
                    : err.message;
            } else if (typeof err === "string") errorMessage = err;
            else if (err && typeof err === "object") errorMessage = JSON.stringify(err);
            setError(errorMessage);
            setIsConverting(false);
        }
    }, [video, targetFormat, isAudioFormat]);

    const cancel = useCallback(async () => {
        cancelingRef.current = true;
        setIsConverting(false);
        try { ffmpegRef.current.terminate(); } catch (terminateError) {
            if (import.meta.env.DEV) {
                console.debug("FFmpeg terminate error", terminateError);
            }
        }
        ffmpegRef.current = new FFmpeg();
        setProgress(0);
        setLoaded(false);
        await load();
    }, [load]);

    const resetState = useCallback(() => {
        if (videoPreviewURL) URL.revokeObjectURL(videoPreviewURL);
        setVideo(null);
        setVideoPreviewURL(null);
        setIsDone(false);
        setConvertedVideoURL(null);
        setIsConverting(false);
        setProgress(0);
        setError(null);
        progressRef.current = 0;
    }, [videoPreviewURL]);

    return {
        // State
        loaded,
        video,
        videoPreviewURL,
        targetFormat,
        convertedVideoURL,
        isDone,
        isConverting,
        progress,
        error,
        // Actions
        setTargetFormat,
        setVideo,
        handleDropFile,
        transcode,
        cancel,
        resetState,
        // Helpers
        isAudioFormat,
    };
}
