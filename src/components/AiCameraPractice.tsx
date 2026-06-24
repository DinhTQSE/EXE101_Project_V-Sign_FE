import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Camera, CheckCircle, RefreshCw, SkipForward, Video, XCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useWebcam } from "@/hooks/useWebcam";
import { getHolisticSupportError } from "@/services/holisticLandmarkExtractor";
import {
  AI_PRACTICE_TARGETS,
  AiPredictionResponse,
  aiLabelToDisplay,
  aiLabelToGloss,
  normalizeAiLabel,
  recognizeGestureFromVideo,
  resolveAiPracticeTarget,
} from "@/services/aiRecognition";
import { signatureApi } from "@/services/vsignApi";
import { toast } from "sonner";
import { trackAnalyticsEvent } from "@/services/analytics";

type ScanState = "idle" | "scanning" | "success" | "retry" | "error";

interface AiCameraPracticeProps {
  question?: string;
  targetLabel?: string;
  targetDisplay?: string;
  practiceItemId?: string;
  previewMode?: boolean;
  minConfidence?: number;
  captureMs?: number;
  onSuccess?: () => void;
  onSkip?: () => void;
  userStoryId?: string;
}


function predictionConfidence(prediction: AiPredictionResponse | null) {
  return prediction?.confidence ?? 0;
}

function buildSignatureVector(prediction: AiPredictionResponse, durationMs: number) {
  return [
    "ai",
    prediction.status,
    normalizeAiLabel(prediction.label) || "none",
    prediction.confidence ?? 0,
    prediction.frames_processed ?? 0,
    prediction.hands_detected_frames ?? 0,
    Math.round(prediction.inference_ms ?? durationMs),
    prediction.model_version || "unknown-model",
    prediction.label_version || "unknown-labels",
  ].join(":");
}

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) {
      const lower = message.toLowerCase();
      const technicalMarkers = [
        "constructor",
        "mediapipe",
        "webassembly",
        "wasm",
        "module",
        "undefined",
        "null",
        "failed to fetch",
        "networkerror",
        "syntaxerror",
        "backend",
        "service",
      ];
      if (technicalMarkers.some((marker) => lower.includes(marker))) return fallback;
      return message;
    }
  }
  return fallback;
}

export default function AiCameraPractice({
  question = "Thực hiện ký hiệu trước camera",
  targetLabel,
  targetDisplay,
  practiceItemId,
  previewMode = false,
  minConfidence = 0.55,
  captureMs = 3000,
  onSuccess,
  onSkip,
  userStoryId,
}: AiCameraPracticeProps) {
  const { accessToken } = useAuth();
  const supportError = useMemo(() => getHolisticSupportError(), []);
  const { videoRef, isReady, error, restart } = useWebcam(!supportError);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [prediction, setPrediction] = useState<AiPredictionResponse | null>(null);
  const [message, setMessage] = useState("");
  const [failCount, setFailCount] = useState(0);

  useEffect(() => {
    setFailCount(0);
  }, [targetLabel, practiceItemId]);

  const requestedTarget = useMemo(
    () => resolveAiPracticeTarget(targetLabel) || resolveAiPracticeTarget(question),
    [question, targetLabel]
  );
  const targetText = targetDisplay || requestedTarget?.display || "một ký hiệu";
  const confidence = predictionConfidence(prediction);
  const cameraError = supportError || error;
  const canScan = isReady && !cameraError && scanState !== "scanning";

  const handleScan = async () => {
    if (!videoRef.current || !canScan) return;
    trackAnalyticsEvent("use_AI_camera");
    setScanState("scanning");
    setPrediction(null);
    setMessage("");

    try {
      const result = await recognizeGestureFromVideo(videoRef.current, {
        durationMs: captureMs,
        fps: 8,
        targetLabel: requestedTarget?.label || targetLabel,
        accessToken: accessToken || undefined,
      });
      const nextPrediction = result.prediction;
      const predictedTarget = resolveAiPracticeTarget(nextPrediction.label);
      const logTarget = requestedTarget || predictedTarget || AI_PRACTICE_TARGETS[0];
      const confidentEnough = nextPrediction.status === "ok" && (nextPrediction.confidence ?? 0) >= minConfidence;
      const correct = confidentEnough && (!requestedTarget || normalizeAiLabel(nextPrediction.label) === requestedTarget.label);

      const res = await signatureApi.submitAttempt(
        {
          userStoryId: userStoryId || "US-AI-MVP-PRACTICE",
          practiceItemId: practiceItemId || logTarget.practiceItemId,
          signatureVector: buildSignatureVector(nextPrediction, result.durationMs),
          durationMs: result.durationMs,
          aiStatus: nextPrediction.status,
          targetGloss: requestedTarget?.gloss || logTarget.gloss,
          predictedGloss: aiLabelToGloss(nextPrediction.label),
          confidence: nextPrediction.confidence ?? undefined,
          correct,
          framesProcessed: nextPrediction.frames_processed ?? undefined,
          handsDetectedFrames: nextPrediction.hands_detected_frames ?? undefined,
          inferenceMs: nextPrediction.inference_ms ?? undefined,
          modelVersion: nextPrediction.model_version ?? undefined,
          labelVersion: nextPrediction.label_version ?? undefined,
        },
        accessToken || undefined
      );

      if (res.warningMessage) {
        toast.warning(res.warningMessage);
      }


      setPrediction(nextPrediction);
      if (correct) {
        setScanState("success");
        setMessage(`AI nhận diện đúng ký hiệu ${targetText}.`);
        setTimeout(() => onSuccess?.(), 900);
      } else {
        setScanState("retry");
        setFailCount((prev) => prev + 1);
        setMessage(
          nextPrediction.status === "no_hands"
            ? "AI chưa phát hiện tay trong khung hình. Hãy đưa tay rõ hơn và thử lại."
            : `AI nhận diện thành ký hiệu ${aiLabelToDisplay(nextPrediction.label)}. Hãy thử lại chậm hơn và đúng ký hiệu yêu cầu.`
        );
      }
    } catch (err: unknown) {
      setScanState("error");
      setFailCount((prev) => prev + 1);
      setMessage(errorMessage(err, "Không thể hoàn tất nhận diện. Vui lòng thử lại sau."));
    }
  };

  return (
    <div className="card-pop p-4 text-center md:p-5">
      <h3 className="font-display font-extrabold text-lg leading-tight text-foreground mb-4 md:text-xl">{question}</h3>
      <div className="rounded-[18px] bg-primary/10 border border-primary/20 px-4 py-3 mb-4 text-left">
        <p className="text-xs font-body text-foreground">
          Đưa tay vào khung hình, thực hiện ký hiệu trong vài giây rồi bấm bắt đầu nhận diện.
        </p>
      </div>
      {previewMode && (
        <div className="rounded-[18px] bg-amber-100/70 border border-amber-200 px-4 py-3 mb-4 text-left">
          <p className="text-xs font-body text-amber-800">Đây là lượt luyện tập thử trước khi nâng cấp gói Cao cấp.</p>
        </div>
      )}

      <div className="aspect-video rounded-[20px] md:rounded-[22px] overflow-hidden relative shadow-lg mb-4 bg-muted ring-1 ring-border/80">
        {cameraError ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 bg-destructive/10">
            <XCircle className="w-12 h-12 text-destructive" />
            <p className="text-destructive font-body text-sm font-semibold text-center">{cameraError}</p>
            <button disabled={Boolean(supportError)} onClick={restart} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:hidden">
              <RefreshCw className="w-4 h-4" /> Thử lại camera
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isReady ? "" : "hidden"}`}
              style={{ transform: "scaleX(-1)" }}
            />
            {!isReady && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <Camera className="w-10 h-10 text-primary" />
                <p className="text-muted-foreground font-body text-sm">Đang kết nối camera...</p>
              </div>
            )}
          </>
        )}

        {scanState === "scanning" && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/25 backdrop-blur-sm">
            <motion.div
              className="w-36 h-36 border-4 border-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute flex flex-col items-center gap-2">
              <LoadingSpinner size="sm" color="white" />
              <span className="text-white font-display font-bold text-sm">Đang phân tích...</span>
            </div>
          </div>
        )}
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 rounded-2xl border px-4 py-3 text-sm text-foreground ${
            scanState === "success" ? "bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]/30" : "bg-destructive/10 border-destructive/30"
          }`}
        >
          {scanState === "success" ? <CheckCircle className="w-4 h-4 inline mr-1 text-[hsl(var(--success))]" /> : <XCircle className="w-4 h-4 inline mr-1 text-destructive" />}
          {message}
        </motion.div>
      )}

      <div className="flex flex-col gap-2 items-center justify-center animate-fade-in">
        <button onClick={handleScan} disabled={!canScan} className="btn-primary-gradient flex items-center gap-2 mx-auto disabled:opacity-50">
          <Video className="w-4 h-4" /> {scanState === "scanning" ? "Đang quét..." : "Bắt đầu nhận diện AI"}
        </button>
        {failCount >= 3 && onSkip && (
          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border hover:bg-muted rounded-xl transition-all"
          >
            <SkipForward className="w-4 h-4" /> Bỏ qua luyện tập
          </button>
        )}
      </div>
    </div>
  );
}
