import { FFmpeg, FileData } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useCallback, useEffect, useRef, useState } from "react";
import ffmpegCore from "@/assets/ffmpeg-core.js?url";
import ffmpegCoreWasm from "@/assets/ffmpeg-core.wasm?url";

// ============================================================================
// Types
// ============================================================================

export interface UseFFmpegConversionOptions {
    /** Initial target format for conversion. Defaults to "mp4" */
    initialFormat?: string;
}

export interface ConversionState {
    loaded: boolean;
    video: File | null;
    videoPreviewURL: string | null;
    targetFormat: string;
    convertedVideoURL: string | null;
    isDone: boolean;
    isConverting: boolean;
    progress: number;
    error: string | null;
}

export interface ConversionActions {
    setTargetFormat: (format: string) => void;
    setVideo: React.Dispatch<React.SetStateAction<File | null>>;
    handleDropFile: (files: File[]) => void;
    transcode: () => Promise<void>;
    cancel: () => Promise<void>;
    resetState: () => void;
}

// ============================================================================
// Constants
// ============================================================================

/** Supported audio output formats */
const AUDIO_FORMATS = ["mp3", "ogg", "wav", "aac", "flac"] as const;

/** Formats that use the AVI/MKV encoding preset */
const CONTAINER_FORMATS = ["avi", "mkv"] as const;

/** Default audio sample rate for all audio conversions */
const AUDIO_SAMPLE_RATE = "44100";

/** Default audio bitrate for lossy formats */
const AUDIO_BITRATE = "192k";

/** Video bitrate for audio extraction */
const VIDEO_AUDIO_BITRATE = "96k";

/** Minimum valid output file size (bytes) - files smaller are likely corrupted */
const MIN_OUTPUT_SIZE = 1000;

/** Error messages that indicate FFmpeg ran out of memory or failed critically */
const FATAL_ERROR_PATTERNS = [
    "Aborted(OOM)",
    "out of memory",
    "Output file #0 does not contain any stream",
] as const;

// ============================================================================
// Audio Encoding Presets
// ============================================================================

type AudioFormat = (typeof AUDIO_FORMATS)[number];

const AUDIO_ENCODING_PRESETS: Record<AudioFormat, string[]> = {
    mp3: ["-c:a", "libmp3lame", "-b:a", AUDIO_BITRATE, "-ar", AUDIO_SAMPLE_RATE],
    ogg: ["-c:a", "libvorbis", "-b:a", AUDIO_BITRATE, "-ar", AUDIO_SAMPLE_RATE],
    wav: ["-c:a", "pcm_s16le", "-ar", AUDIO_SAMPLE_RATE],
    aac: ["-c:a", "aac", "-b:a", AUDIO_BITRATE, "-ar", AUDIO_SAMPLE_RATE],
    flac: ["-c:a", "flac", "-ar", AUDIO_SAMPLE_RATE],
};

// ============================================================================
// Video Encoding Presets
// ============================================================================

/** WebM-specific encoding settings for VP8/Opus */
const WEBM_ENCODING_ARGS = [
    "-c:v", "libvpx",
    "-crf", "30",
    "-b:v", "1M",
    "-deadline", "realtime",
    "-cpu-used", "5",
    "-c:a", "libopus",
    "-b:a", VIDEO_AUDIO_BITRATE,
];

/** H.264/AAC encoding settings for AVI/MKV containers */
const CONTAINER_ENCODING_ARGS = [
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-crf", "30",
    "-c:a", "aac",
    "-b:a", VIDEO_AUDIO_BITRATE,
];

/** Default H.264/AAC encoding settings with faststart for streaming */
const DEFAULT_VIDEO_ENCODING_ARGS = [
    ...CONTAINER_ENCODING_ARGS,
    "-movflags", "+faststart",
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if the given format is an audio-only format.
 */
function isAudioFormat(format: string): format is AudioFormat {
    return AUDIO_FORMATS.includes(format.toLowerCase() as AudioFormat);
}

/**
 * Checks if a log message indicates a fatal FFmpeg error.
 */
function isFatalError(message: string): boolean {
    return FATAL_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

/**
 * Extracts a file extension from a filename.
 */
function getFileExtension(filename: string): string {
    return filename.split(".").pop()?.toLowerCase() ?? "";
}

/**
 * Builds FFmpeg command arguments for audio conversion.
 */
function buildAudioArgs(targetFormat: AudioFormat): string[] {
    return ["-vn", ...AUDIO_ENCODING_PRESETS[targetFormat]];
}

/**
 * Builds FFmpeg command arguments for video conversion.
 */
function buildVideoArgs(targetFormat: string): string[] {
    // Scale video to max 720px width while maintaining aspect ratio
    const scaleArgs = ["-vf", "scale='min(720,iw)':-2"];

    if (targetFormat === "webm") {
        return [...scaleArgs, ...WEBM_ENCODING_ARGS];
    }

    if (CONTAINER_FORMATS.includes(targetFormat as (typeof CONTAINER_FORMATS)[number])) {
        return [...scaleArgs, ...CONTAINER_ENCODING_ARGS];
    }

    return [...scaleArgs, ...DEFAULT_VIDEO_ENCODING_ARGS];
}

/**
 * Parses an unknown error into a user-friendly message.
 */
function parseErrorMessage(err: unknown): string {
    if (err instanceof Error) {
        // Provide a friendlier message for memory errors
        if (err.message.includes("memory access out of bounds")) {
            return "Video too large/complex. Try MP4 or smaller file.";
        }
        return err.message;
    }

    if (typeof err === "string") {
        return err;
    }

    if (err && typeof err === "object") {
        return JSON.stringify(err);
    }

    return "Unknown error";
}

/**
 * Gets the worker URL based on the current environment.
 */
function getWorkerURL(): string {
    return import.meta.env.DEV
        ? "/ffmpeg-core.worker.js"
        : `${import.meta.env.BASE_URL}ffmpeg-core.worker.js`;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Custom hook for managing FFmpeg-based media conversion.
 *
 * Provides state and actions for:
 * - Loading FFmpeg WASM module
 * - Selecting and previewing input files
 * - Converting between video/audio formats
 * - Tracking conversion progress
 * - Handling errors and cancellation
 *
 * @example
 * ```tsx
 * const { loaded, transcode, progress, error } = useFFmpegConversion();
 *
 * if (!loaded) return <Loading />;
 *
 * return <button onClick={transcode}>Convert</button>;
 * ```
 */
export function useFFmpegConversion(
    options: UseFFmpegConversionOptions = {}
): ConversionState & ConversionActions & { isAudioFormat: typeof isAudioFormat } {
    const { initialFormat = "mp4" } = options;

    // FFmpeg instance ref (persists across renders)
    const ffmpegRef = useRef(new FFmpeg());

    // Conversion control refs
    const abortedRef = useRef(false);
    const cancelingRef = useRef(false);
    const progressRef = useRef(0);

    // Loading state
    const [loaded, setLoaded] = useState(false);

    // File state
    const [video, setVideo] = useState<File | null>(null);
    const [videoPreviewURL, setVideoPreviewURL] = useState<string | null>(null);

    // Conversion configuration
    const [targetFormat, setTargetFormat] = useState(initialFormat);

    // Conversion output state
    const [convertedVideoURL, setConvertedVideoURL] = useState<string | null>(null);
    const [isDone, setIsDone] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // -------------------------------------------------------------------------
    // FFmpeg Loading
    // -------------------------------------------------------------------------

    const loadFFmpeg = useCallback(async () => {
        const ffmpeg = ffmpegRef.current;

        // Monitor for fatal errors in FFmpeg logs
        ffmpeg.on("log", ({ message }) => {
            if (isFatalError(message)) {
                abortedRef.current = true;
            }
        });

        // Update progress state (throttled to 1% changes)
        ffmpeg.on("progress", ({ progress }) => {
            const newProgress = Math.round(progress * 100);
            if (Math.abs(newProgress - progressRef.current) >= 1) {
                progressRef.current = newProgress;
                setProgress(newProgress);
            }
        });

        // Load FFmpeg WASM modules
        await ffmpeg.load({
            coreURL: await toBlobURL(ffmpegCore, "text/javascript"),
            wasmURL: await toBlobURL(ffmpegCoreWasm, "application/wasm"),
            workerURL: await toBlobURL(getWorkerURL(), "text/javascript"),
        });

        setLoaded(true);
    }, []);

    // Load FFmpeg on mount
    useEffect(() => {
        loadFFmpeg();
    }, [loadFFmpeg]);

    // -------------------------------------------------------------------------
    // Video Preview Management
    // -------------------------------------------------------------------------

    useEffect(() => {
        if (!video) {
            setVideoPreviewURL(null);
            return;
        }

        const url = URL.createObjectURL(video);
        setVideoPreviewURL(url);

        // Cleanup: revoke object URL when video changes or unmounts
        return () => URL.revokeObjectURL(url);
    }, [video]);

    // -------------------------------------------------------------------------
    // File Drop Handler
    // -------------------------------------------------------------------------

    const handleDropFile = useCallback((files: File[]) => {
        if (files.length > 0) {
            setVideo(files[0]);
        }
    }, []);

    // -------------------------------------------------------------------------
    // Transcoding Logic
    // -------------------------------------------------------------------------

    const transcode = useCallback(async () => {
        if (!video) return;

        // Reset state for new conversion
        setIsDone(false);
        setIsConverting(true);
        setProgress(0);
        setError(null);
        abortedRef.current = false;
        cancelingRef.current = false;

        const inputExtension = getFileExtension(video.name);
        const inputFileName = `input.${inputExtension}`;
        const outputFileName = `output.${targetFormat}`;

        try {
            const ffmpeg = ffmpegRef.current;

            // Write input file to FFmpeg virtual filesystem
            const uploadedFile = await fetchFile(video);
            await ffmpeg.writeFile(inputFileName, uploadedFile);

            // Build FFmpeg command arguments
            const isOutputAudio = isAudioFormat(targetFormat);
            const formatArgs = isOutputAudio
                ? buildAudioArgs(targetFormat)
                : buildVideoArgs(targetFormat);

            const ffmpegArgs = [
                "-i", inputFileName,
                "-threads", "1",
                ...formatArgs,
                outputFileName,
            ];

            // Execute conversion
            await ffmpeg.exec(ffmpegArgs);

            // Check for FFmpeg errors that occurred during execution
            if (abortedRef.current) {
                throw new Error("Conversion failed due to memory or missing streams.");
            }

            // Read and validate output
            const data: FileData = await ffmpeg.readFile(outputFileName);
            const outputSize = (data as Uint8Array).byteLength;

            if (outputSize < MIN_OUTPUT_SIZE) {
                throw new Error("Output file too small. Likely failed.");
            }

            // Create downloadable blob URL
            const mimeType = isOutputAudio
                ? `audio/${targetFormat}`
                : `video/${targetFormat}`;
            const convertedBlob = new Blob([data as FileData], { type: mimeType });
            setConvertedVideoURL(URL.createObjectURL(convertedBlob));

            // Mark conversion as complete
            setIsDone(true);
            setIsConverting(false);

            // Cleanup temporary files (non-blocking)
            cleanupFiles(ffmpeg, inputFileName, outputFileName);
        } catch (err) {
            // Ignore errors if user cancelled
            if (cancelingRef.current) {
                setIsConverting(false);
                return;
            }

            setError(parseErrorMessage(err));
            setIsConverting(false);
        }
    }, [video, targetFormat]);

    // -------------------------------------------------------------------------
    // Cleanup Helper
    // -------------------------------------------------------------------------

    async function cleanupFiles(
        ffmpeg: FFmpeg,
        inputFileName: string,
        outputFileName: string
    ): Promise<void> {
        try {
            await ffmpeg.deleteFile(inputFileName);
            await ffmpeg.deleteFile(outputFileName);
        } catch (cleanupError) {
            // Non-fatal: log only in development
            if (import.meta.env.DEV) {
                console.debug("FFmpeg cleanup error", cleanupError);
            }
        }
    }

    // -------------------------------------------------------------------------
    // Cancellation
    // -------------------------------------------------------------------------

    const cancel = useCallback(async () => {
        cancelingRef.current = true;
        setIsConverting(false);

        // Terminate current FFmpeg instance
        try {
            ffmpegRef.current.terminate();
        } catch (terminateError) {
            if (import.meta.env.DEV) {
                console.debug("FFmpeg terminate error", terminateError);
            }
        }

        // Create fresh FFmpeg instance and reload
        ffmpegRef.current = new FFmpeg();
        setProgress(0);
        setLoaded(false);
        await loadFFmpeg();
    }, [loadFFmpeg]);

    // -------------------------------------------------------------------------
    // State Reset
    // -------------------------------------------------------------------------

    const resetState = useCallback(() => {
        // Cleanup preview URL to prevent memory leaks
        if (videoPreviewURL) {
            URL.revokeObjectURL(videoPreviewURL);
        }

        // Reset all state to initial values
        setVideo(null);
        setVideoPreviewURL(null);
        setIsDone(false);
        setConvertedVideoURL(null);
        setIsConverting(false);
        setProgress(0);
        setError(null);
        progressRef.current = 0;
    }, [videoPreviewURL]);

    // -------------------------------------------------------------------------
    // Return Value
    // -------------------------------------------------------------------------

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

        // Helpers (exposed for external use)
        isAudioFormat,
    };
}
