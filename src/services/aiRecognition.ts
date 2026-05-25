export type AiStatus = "ok" | "no_hands" | "error";

export interface AiTopPrediction {
  label: string;
  confidence: number;
}

export interface AiPredictionResponse {
  status: AiStatus;
  label?: string | null;
  confidence?: number | null;
  top3?: AiTopPrediction[] | null;
  frames_processed?: number | null;
  hands_detected_frames?: number | null;
  inference_ms?: number | null;
  message?: string | null;
}

export interface AiPracticeTarget {
  label: string;
  display: string;
  gloss: string;
  practiceItemId: string;
}

export const AI_PRACTICE_TARGETS: AiPracticeTarget[] = [
  { label: "ca_phe", display: "Cà phê", gloss: "CA_PHE", practiceItemId: "practice-ai-ca-phe" },
  { label: "da", display: "Đá", gloss: "DA", practiceItemId: "practice-ai-da" },
  { label: "den", display: "Đen", gloss: "DEN", practiceItemId: "practice-ai-den" },
  { label: "nong", display: "Nóng", gloss: "NONG", practiceItemId: "practice-ai-nong" },
  { label: "sua", display: "Sữa", gloss: "SUA", practiceItemId: "practice-ai-sua" },
  { label: "tra", display: "Trà", gloss: "TRA", practiceItemId: "practice-ai-tra" },
];

const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || "/ai";

function stripDataUrl(dataUrl: string) {
  return dataUrl.replace(/^data:image\/[a-zA-Z+.-]+;base64,/, "");
}

export function normalizeAiLabel(value?: string | null) {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function aiLabelToGloss(value?: string | null) {
  return normalizeAiLabel(value).toUpperCase();
}

export function aiLabelToDisplay(value?: string | null) {
  const normalized = normalizeAiLabel(value);
  return AI_PRACTICE_TARGETS.find((target) => target.label === normalized)?.display || value || "Không rõ";
}

export function resolveAiPracticeTarget(text?: string | null) {
  const normalized = normalizeAiLabel(text);
  return AI_PRACTICE_TARGETS.find((target) => normalized.includes(target.label)) || null;
}

function captureFrame(video: HTMLVideoElement, maxWidth: number, quality: number) {
  const sourceWidth = video.videoWidth || 640;
  const sourceHeight = video.videoHeight || 480;
  const scale = Math.min(1, maxWidth / sourceWidth);
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Không thể tạo canvas để lấy frame camera.");
  ctx.drawImage(video, 0, 0, width, height);
  return stripDataUrl(canvas.toDataURL("image/jpeg", quality));
}

export async function captureFramesFromVideo(
  video: HTMLVideoElement,
  options: { durationMs?: number; fps?: number; maxWidth?: number; quality?: number } = {}
) {
  const durationMs = options.durationMs ?? 3000;
  const fps = options.fps ?? 10;
  const maxWidth = options.maxWidth ?? 640;
  const quality = options.quality ?? 0.75;
  const frameCount = Math.max(5, Math.round((durationMs / 1000) * fps));
  const intervalMs = durationMs / frameCount;
  const frames: string[] = [];

  for (let i = 0; i < frameCount; i += 1) {
    frames.push(captureFrame(video, maxWidth, quality));
    if (i < frameCount - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  return frames;
}

export async function predictGestureFrames(frames: string[]) {
  const response = await fetch(`${AI_BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ frames }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || "AI service không xử lý được gesture.");
  }
  return payload as AiPredictionResponse;
}

export async function recognizeGestureFromVideo(
  video: HTMLVideoElement,
  options: { durationMs?: number; fps?: number; maxWidth?: number; quality?: number } = {}
) {
  const startedAt = performance.now();
  const frames = await captureFramesFromVideo(video, options);
  const prediction = await predictGestureFrames(frames);
  const durationMs = Math.round(performance.now() - startedAt);
  return { frames, prediction, durationMs };
}
