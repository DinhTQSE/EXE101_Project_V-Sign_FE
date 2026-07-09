import { useRef, useState, useEffect, useCallback } from "react";

export interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  isReady: boolean;
  error: string | null;
  restart: () => void;
}

const ERROR_MESSAGE =
  "Không thể kết nối máy ảnh. Vui lòng cấp quyền hoặc đóng các tab khác đang dùng camera.";

/**
 * Reusable webcam hook with strict cleanup.
 * Camera starts immediately on mount and stops all tracks on unmount.
 */
export function useWebcam(autoStart = true): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async () => {
    // Release any existing stream first
    stopStream();
    setError(null);
    setIsReady(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => console.warn("Video play exception:", err));
      }
      setIsReady(true);
    } catch (err) {
      console.error("Camera error:", err);
      setError(ERROR_MESSAGE);
    }
  }, [stopStream]);

  useEffect(() => {
    let cancelled = false;

    if (autoStart) {
      (async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 15 },
            },
            audio: false,
          });
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((err) => console.warn("Video play exception:", err));
          }
          setIsReady(true);
        } catch (err) {
          console.error("Camera error:", err);
          if (!cancelled) setError(ERROR_MESSAGE);
        }
      })();
    }

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [autoStart, stopStream]);

  return { videoRef, isReady, error, restart: startStream };
}
