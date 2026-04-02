import { useRef, useState, useEffect, useCallback } from "react";
import { Maximize2, Minimize2, Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface VideoPlayerProps {
  url: string;
  lessonId: string;
  durationMinutes?: number;
  onProgress?: (lessonId: string, percent: number) => void;
  onComplete?: (lessonId: string) => void;
}

const COMPLETE_THRESHOLD = 90; // 90% watched = complete

const getYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const VideoPlayer = ({ url, lessonId, durationMinutes, onProgress, onComplete }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchedPercent, setWatchedPercent] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const maxWatchedRef = useRef(0);

  const ytId = getYouTubeId(url);
  const isYouTube = !!ytId;

  // Track video progress for non-YouTube videos
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    
    const current = video.currentTime;
    const total = video.duration;
    setCurrentTime(current);
    setDuration(total);
    
    // Track max watched position to prevent skipping
    if (current > maxWatchedRef.current) {
      maxWatchedRef.current = current;
    }
    
    const percent = Math.round((maxWatchedRef.current / total) * 100);
    setWatchedPercent(percent);
    onProgress?.(lessonId, percent);
    
    if (percent >= COMPLETE_THRESHOLD && !hasCompleted) {
      setHasCompleted(true);
      onComplete?.(lessonId);
    }
  }, [lessonId, onProgress, onComplete, hasCompleted]);

  // Reset when lesson changes
  useEffect(() => {
    maxWatchedRef.current = 0;
    setWatchedPercent(0);
    setHasCompleted(false);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, [lessonId, url]);

  // Fullscreen handling
  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;

    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setIsFullscreen(true);
        // Lock to landscape on mobile
        try {
          await (screen.orientation as any)?.lock?.("landscape");
        } catch {}
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        try {
          screen.orientation?.unlock?.();
        } catch {}
      }
    } catch {}
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    // Only allow seeking to already watched positions
    const maxSeek = maxWatchedRef.current;
    const targetTime = x * video.duration;
    video.currentTime = Math.min(targetTime, maxSeek);
  };

  // YouTube player with fullscreen support
  if (isYouTube) {
    return (
      <div
        ref={containerRef}
        className={`relative bg-black rounded-2xl overflow-hidden border border-border ${
          isFullscreen ? "fixed inset-0 z-50 rounded-none" : "w-full"
        }`}
      >
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1`}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            title="Video Lecture"
          />
        </div>
        <div className="absolute top-3 right-3 z-10">
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 bg-black/60 hover:bg-black/80 text-white border-0 backdrop-blur-sm"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
        {/* YouTube progress note */}
        <div className="px-4 py-2 bg-muted/50 flex items-center gap-2 text-xs text-muted-foreground">
          <Play className="w-3 h-3" />
          <span>YouTube video — watch fully to mark as complete</span>
        </div>
      </div>
    );
  }

  // Native HTML5 video player with progress tracking
  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-2xl overflow-hidden border border-border ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none flex flex-col" : "w-full"
      }`}
    >
      {/* Video */}
      <div
        className={`relative w-full ${isFullscreen ? "flex-1 flex items-center justify-center" : "aspect-video"}`}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={url}
          className={`w-full ${isFullscreen ? "max-h-full object-contain" : "h-full object-contain"}`}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
          playsInline
          preload="metadata"
        />
        {/* Play/Pause overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
              <Play className="w-7 h-7 text-primary-foreground ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="px-3 py-2 bg-gradient-to-t from-black/90 to-black/60 space-y-1.5">
        {/* Seek bar */}
        <div className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group" onClick={handleSeek}>
          {/* Watched (allowed to seek) */}
          <div
            className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
            style={{ width: `${duration > 0 ? (maxWatchedRef.current / duration) * 100 : 0}%` }}
          />
          {/* Current position */}
          <div
            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 7px)` }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className="p-1 hover:bg-white/10 rounded">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={toggleMute} className="p-1 hover:bg-white/10 rounded">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="text-xs tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary">
              {watchedPercent}% watched
            </span>
            <button onClick={toggleFullscreen} className="p-1 hover:bg-white/10 rounded">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Progress indicator below player */}
      {!isFullscreen && (
        <div className="px-4 py-2 bg-muted/50 flex items-center gap-3">
          <Progress value={watchedPercent} className="h-1.5 flex-1" />
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            {watchedPercent >= COMPLETE_THRESHOLD ? "✅ Complete" : `${watchedPercent}%`}
          </span>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
