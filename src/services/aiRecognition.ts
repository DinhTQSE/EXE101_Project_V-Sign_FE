import { captureHolisticLandmarkSequence } from "@/services/holisticLandmarkExtractor";
import { getApiBaseUrl } from "@/services/apiConfig";

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
  model_version?: string | null;
  label_version?: string | null;
  message?: string | null;
}

export interface AiPracticeTarget {
  label: string;
  display: string;
  gloss: string;
  practiceItemId: string;
  aliases?: string[];
}

export const AI_PRACTICE_TARGETS: AiPracticeTarget[] = [
  { label: "anhhai_bt", display: "Anh hai (Bắc/Trung)", gloss: "ANHHAI_BT", practiceItemId: "practice-mvp-anhhai-bt", aliases: ["anh hai bac trung", "anh hai mien bac mien trung"] },
  { label: "anhhai", display: "Anh hai (Nam)", gloss: "ANHHAI", practiceItemId: "practice-mvp-anhhai", aliases: ["anh hai nam", "anh hai"] },
  { label: "bo", display: "Bố", gloss: "BO", practiceItemId: "practice-mvp-bo", aliases: ["bố"] },
  { label: "chi_bt", display: "Chị (Bắc/Trung)", gloss: "CHI_BT", practiceItemId: "practice-mvp-chi-bt", aliases: ["chi bac trung", "chị bắc trung", "chi mien bac mien trung"] },
  { label: "chi", display: "Chị (Nam)", gloss: "CHI", practiceItemId: "practice-mvp-chi", aliases: ["chị nam", "chi nam", "chị"] },
  { label: "congai", display: "Con gái", gloss: "CONGAI", practiceItemId: "practice-mvp-congai", aliases: ["con gái", "con gai"] },
  { label: "contrai", display: "Con trai", gloss: "CONTRAI", practiceItemId: "practice-mvp-contrai", aliases: ["con trai"] },
  { label: "emgai", display: "Em gái", gloss: "EMGAI", practiceItemId: "practice-mvp-emgai", aliases: ["em gái", "em gai"] },
  { label: "emtrai", display: "Em trai (Bắc)", gloss: "EMTRAI", practiceItemId: "practice-mvp-emtrai", aliases: ["em trai bac", "em trai mien bac"] },
  { label: "emtrai_nt", display: "Em trai (Nam/Trung)", gloss: "EMTRAI_NT", practiceItemId: "practice-mvp-emtrai-nt", aliases: ["em trai nam trung", "em trai mien nam mien trung"] },
  { label: "me", display: "Mẹ", gloss: "ME", practiceItemId: "practice-mvp-me", aliases: ["mẹ", "má", "ma"] },
  { label: "buon", display: "Buồn thảm", gloss: "BUON", practiceItemId: "practice-mvp-buon", aliases: ["buồn", "buồn thảm", "buon tham"] },
  { label: "hoangso", display: "Hoảng sợ", gloss: "HOANGSO", practiceItemId: "practice-mvp-hoangso", aliases: ["hoảng sợ", "hoang so"] },
  { label: "noigian", display: "Nổi giận", gloss: "NOIGIAN", practiceItemId: "practice-mvp-noigian", aliases: ["nổi giận", "noi gian"] },
  { label: "thuongyeu_bt", display: "Thương yêu (Bắc/Trung)", gloss: "THUONGYEU_BT", practiceItemId: "practice-mvp-thuongyeu-bt", aliases: ["thuong yeu bac trung", "thương yêu bắc trung"] },
  { label: "thuongyeu", display: "Thương yêu (Nam)", gloss: "THUONGYEU", practiceItemId: "practice-mvp-thuongyeu", aliases: ["thương yêu nam", "thuong yeu nam", "thương yêu"] },
  { label: "vuive_bt", display: "Vui sướng (Bắc/Trung)", gloss: "VUIVE_BT", practiceItemId: "practice-mvp-vuive-bt", aliases: ["vui suong bac trung", "vui ve bac trung"] },
  { label: "vuive", display: "Vui sướng (Nam)", gloss: "VUIVE", practiceItemId: "practice-mvp-vuive", aliases: ["vui sướng nam", "vui suong nam", "vui sướng", "vui ve"] },
  { label: "banhmi_nt", display: "Bánh mì (Nam/Trung)", gloss: "BANHMI_NT", practiceItemId: "practice-mvp-banhmi-nt", aliases: ["banh mi nam trung", "bánh mì nam trung"] },
  { label: "banhmi", display: "Bánh mì (Bắc)", gloss: "BANHMI", practiceItemId: "practice-mvp-banhmi", aliases: ["bánh mì bắc", "banh mi bac", "bánh mì", "banh mi"] },
  { label: "buncha", display: "Bún chả", gloss: "BUNCHA", practiceItemId: "practice-mvp-buncha", aliases: ["bún chả", "bun cha"] },
  { label: "bundau", display: "Bún đậu", gloss: "BUNDAU", practiceItemId: "practice-mvp-bundau", aliases: ["bún đậu", "bun dau"] },
  { label: "bunmam", display: "Bún mắm", gloss: "BUNMAM", practiceItemId: "practice-mvp-bunmam", aliases: ["bún mắm", "bun mam"] },
  { label: "bunngang", display: "Bún ngan", gloss: "BUNNGANG", practiceItemId: "practice-mvp-bunngang", aliases: ["bún ngan", "bun ngan", "bún ngang"] },
  { label: "bunoc", display: "Bún ốc", gloss: "BUNOC", practiceItemId: "practice-mvp-bunoc", aliases: ["bún ốc", "bun oc"] },
  { label: "chao", display: "Cháo", gloss: "CHAO", practiceItemId: "practice-mvp-chao", aliases: ["cháo", "cháo sườn"] },
  { label: "com", display: "Cơm", gloss: "COM", practiceItemId: "practice-mvp-com", aliases: ["cơm", "com"] },
  { label: "pho_nt", display: "Phở (Nam/Trung)", gloss: "PHO_NT", practiceItemId: "practice-mvp-pho-nt", aliases: ["phở nam trung", "pho nam trung"] },
  { label: "pho", display: "Phở (Bắc)", gloss: "PHO", practiceItemId: "practice-mvp-pho", aliases: ["phở bắc", "pho bac", "phở", "pho"] },
];

const AI_PREDICT_URL = `${getApiBaseUrl()}/signature-workflows/predict-landmarks`;

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
  if (!normalized) return null;
  return AI_PRACTICE_TARGETS.find((target) => {
    const keys = [target.label, target.gloss, target.display, ...(target.aliases || [])].map(normalizeAiLabel);
    return keys.some((key) => key && (normalized === key || normalized.includes(key)));
  }) || null;
}

export async function predictGestureLandmarks(
  sequence: number[][],
  options: { targetLabel?: string | null; handsDetectedFrames?: number; accessToken?: string } = {}
) {
  const response = await fetch(AI_PREDICT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
    },
    body: JSON.stringify({
      sequence,
      target_label: options.targetLabel ? normalizeAiLabel(options.targetLabel) : undefined,
      hands_detected_frames: options.handsDetectedFrames,
    }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || "AI service khong xu ly duoc gesture.");
  }
  return (payload?.data ?? payload) as AiPredictionResponse;
}

export async function recognizeGestureFromVideo(
  video: HTMLVideoElement,
  options: { durationMs?: number; fps?: number; targetLabel?: string | null; accessToken?: string } = {}
) {
  const startedAt = performance.now();
  const capture = await captureHolisticLandmarkSequence(video, {
    durationMs: options.durationMs,
    fps: options.fps ?? 8,
  });
  const prediction = await predictGestureLandmarks(capture.sequence, {
    targetLabel: options.targetLabel,
    handsDetectedFrames: capture.handsDetectedFrames,
    accessToken: options.accessToken,
  });
  const durationMs = Math.round(performance.now() - startedAt);
  return { sequence: capture.sequence, prediction, durationMs };
}
