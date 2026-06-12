import { useEffect, useRef } from "react";
import { Camera, XCircle, RefreshCw } from "lucide-react";
import { useWebcam } from "@/hooks/useWebcam";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface WebcamFeedProps {
  id?: string;
  className?: string;
  glowOnActive?: boolean;
  /** Callback to expose camera readiness state to parent */
  onStatusChange?: (status: { isReady: boolean; error: string | null }) => void;
}

export default function WebcamFeed({ className = "", glowOnActive = true, onStatusChange }: WebcamFeedProps) {
  const { videoRef, isReady, error, restart } = useWebcam(true);
  const statusRef = useRef(onStatusChange);
  statusRef.current = onStatusChange;

  useEffect(() => {
    statusRef.current?.({ isReady, error });
  }, [isReady, error]);

  if (error) {
    return (
      <div className={`aspect-video rounded-2xl overflow-hidden bg-destructive/10 border-2 border-destructive/30 flex flex-col items-center justify-center gap-3 p-6 ${className}`}>
        <XCircle className="w-12 h-12 text-destructive" />
        <p className="text-destructive font-body text-sm leading-relaxed max-w-xs font-semibold text-center">
          {error}
        </p>
        <p className="text-muted-foreground font-body text-xs max-w-xs text-center">
          Nhấn vào biểu tượng <Camera className="w-4 h-4 inline" /> trên thanh địa chỉ trình duyệt để cấp quyền camera.
        </p>
        <button
          onClick={restart}
          className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-body text-sm font-semibold hover:opacity-90 transition-opacity min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div
      className={`aspect-video rounded-2xl overflow-hidden relative shadow-lg transition-shadow ${
        isReady && glowOnActive
          ? "ring-2 ring-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.25)]"
          : "bg-muted"
      } ${className}`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover rounded-2xl ${isReady ? "" : "hidden"}`}
        style={{ transform: "scaleX(-1)" }}
      />

      {!isReady && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
          <LoadingSpinner size="lg" message="Đang kết nối camera..." />
        </div>
      )}
    </div>
  );
}
