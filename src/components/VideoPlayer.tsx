import { useEffect, useState } from "react";
import { RotateCcw, Video, XCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface VideoPlayerProps {
  src: string;
  className?: string;
  videoClassName?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  preload?: "none" | "metadata" | "auto";
  playsInline?: boolean;
  maxHeight?: string;
  label?: string;
}

export default function VideoPlayer({
  src,
  className = "aspect-video w-full rounded-xl overflow-hidden bg-black",
  videoClassName = "w-full h-full object-contain",
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
  preload = "metadata",
  playsInline = true,
  maxHeight,
  label = "Video",
}: VideoPlayerProps) {
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFailed(false);
  }, [src, version]);

  return (
    <div className={`relative ${className}`}>
      {loading && !failed && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/65">
          <LoadingSpinner size="sm" color="white" message="Đang tải video..." />
        </div>
      )}

      {failed ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-muted text-center p-5">
          <XCircle className="w-10 h-10 text-destructive" />
          <div>
            <p className="font-display font-bold text-foreground">Không tải được video</p>
            <p className="text-xs text-muted-foreground font-body mt-1">{label}</p>
          </div>
          <button
            type="button"
            onClick={() => setVersion((current) => current + 1)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <RotateCcw className="w-4 h-4" /> Thử lại
          </button>
        </div>
      ) : (
        <video
          key={`${src}-${version}`}
          src={src}
          className={videoClassName}
          controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          preload={preload}
          style={maxHeight ? { maxHeight } : undefined}
          onLoadedData={() => setLoading(false)}
          onCanPlay={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setFailed(true);
          }}
        />
      )}

      {!loading && !failed && !controls && (
        <div className="absolute bottom-2 right-2 rounded-full bg-black/60 p-1 text-white">
          <Video className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}
