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

export type AiPracticeCategory = "family" | "emotion" | "food" | "beverage" | "school";
export type AiPracticeFilter = "recommended" | AiPracticeCategory;

export interface AiPracticeCategoryInfo {
  id: AiPracticeFilter;
  label: string;
  description: string;
}

export interface AiPracticeTarget {
  label: string;
  display: string;
  gloss: string;
  practiceItemId: string;
  category: AiPracticeCategory;
  region?: string;
  featured?: boolean;
  aliases?: string[];
}

export const AI_PRACTICE_CATEGORIES: AiPracticeCategoryInfo[] = [
  { id: "recommended", label: "Gợi ý hôm nay", description: "Các ký hiệu dễ bắt đầu và thường gặp." },
  { id: "family", label: "Gia đình", description: "Người thân và quan hệ trong gia đình." },
  { id: "emotion", label: "Cảm xúc", description: "Biểu đạt cảm xúc trong giao tiếp." },
  { id: "food", label: "Món ăn", description: "Các món ăn quen thuộc hằng ngày." },
  { id: "beverage", label: "Đồ uống", description: "Cà phê, trà, sữa và đồ uống giải khát." },
  { id: "school", label: "Trường học", description: "Dụng cụ học tập, thầy cô và xưng hô trường học." },
];

export const AI_PRACTICE_TARGETS: AiPracticeTarget[] = [
  { label: "anhhai_bt", display: "Anh hai", gloss: "ANHHAI_BT", category: "family", region: "Bắc/Trung", practiceItemId: "practice-mvp-anhhai-bt", featured: true, aliases: ["anh hai bắc trung", "anh hai bac trung", "anh hai miền bắc miền trung", "anh hai miền trung", "anh hai mien trung"] },
  { label: "anhhai", display: "Anh hai", gloss: "ANHHAI", category: "family", region: "Nam", practiceItemId: "practice-mvp-anhhai", aliases: ["anh hai nam", "anh hai", "anh hai miền nam", "anh hai mien nam"] },
  { label: "bo", display: "Bố", gloss: "BO", category: "family", practiceItemId: "practice-mvp-bo", featured: true, aliases: ["bố", "ba", "cha", "bo"] },
  { label: "chi_bt", display: "Chị", gloss: "CHI_BT", category: "family", region: "Bắc/Trung", practiceItemId: "practice-mvp-chi-bt", aliases: ["chị bắc trung", "chi bac trung", "chị miền bắc miền trung", "chị miền trung", "chi mien trung"] },
  { label: "chi", display: "Chị", gloss: "CHI", category: "family", region: "Nam", practiceItemId: "practice-mvp-chi", aliases: ["chị nam", "chi nam", "chị", "chị miền nam", "chi mien nam"] },
  { label: "congai", display: "Con gái", gloss: "CONGAI", category: "family", practiceItemId: "practice-mvp-congai", aliases: ["con gái", "con gai"] },
  { label: "contrai", display: "Con trai", gloss: "CONTRAI", category: "family", practiceItemId: "practice-mvp-contrai", aliases: ["con trai"] },
  { label: "emgai", display: "Em gái", gloss: "EMGAI", category: "family", practiceItemId: "practice-mvp-emgai", aliases: ["em gái", "em gai"] },
  { label: "emtrai", display: "Em trai", gloss: "EMTRAI", category: "family", region: "Bắc", practiceItemId: "practice-mvp-emtrai", aliases: ["em trai bắc", "em trai bac", "em trai miền bắc", "em trai miền trung", "em trai mien trung"] },
  { label: "emtrai_nt", display: "Em trai", gloss: "EMTRAI_NT", category: "family", region: "Nam/Trung", practiceItemId: "practice-mvp-emtrai-nt", aliases: ["em trai nam trung", "em trai miền nam miền trung", "em trai miền nam", "em trai mien nam"] },
  { label: "me", display: "Mẹ", gloss: "ME", category: "family", practiceItemId: "practice-mvp-me", featured: true, aliases: ["mẹ", "má", "me", "ma"] },
  { label: "ongba", display: "Ông bà", gloss: "ONG_BA", category: "family", practiceItemId: "practice-mvp-ongba", aliases: ["ông bà", "ong ba", "ông bà ngoại", "ông bà nội"] },
  { label: "buon", display: "Buồn thảm", gloss: "BUON", category: "emotion", practiceItemId: "practice-mvp-buon", featured: true, aliases: ["buồn", "buồn thảm", "buon tham"] },
  { label: "hoangso", display: "Hoảng sợ", gloss: "HOANGSO", category: "emotion", practiceItemId: "practice-mvp-hoangso", aliases: ["hoảng sợ", "hoang so"] },
  { label: "noigian", display: "Nổi giận", gloss: "NOIGIAN", category: "emotion", practiceItemId: "practice-mvp-noigian", aliases: ["nổi giận", "noi gian"] },
  { label: "thuongyeu_bt", display: "Thương yêu", gloss: "THUONGYEU_BT", category: "emotion", region: "Bắc/Trung", practiceItemId: "practice-mvp-thuongyeu-bt", aliases: ["thương yêu bắc trung", "thuong yeu bac trung"] },
  { label: "thuongyeu", display: "Thương yêu", gloss: "THUONGYEU", category: "emotion", region: "Nam", practiceItemId: "practice-mvp-thuongyeu", featured: true, aliases: ["thương yêu nam", "thuong yeu nam", "thương yêu"] },
  { label: "vuive_bt", display: "Vui sướng", gloss: "VUIVE_BT", category: "emotion", region: "Bắc/Trung", practiceItemId: "practice-mvp-vuive-bt", aliases: ["vui sướng bắc trung", "vui suong bac trung", "vui vẻ bắc trung"] },
  { label: "vuive", display: "Vui sướng", gloss: "VUIVE", category: "emotion", region: "Nam", practiceItemId: "practice-mvp-vuive", featured: true, aliases: ["vui sướng nam", "vui suong nam", "vui sướng", "vui vẻ"] },
  { label: "banhmi_nt", display: "Bánh mì", gloss: "BANHMI_NT", category: "food", region: "Nam/Trung", practiceItemId: "practice-mvp-banhmi-nt", aliases: ["bánh mì nam trung", "banh mi nam trung"] },
  { label: "banhmi", display: "Bánh mì", gloss: "BANHMI", category: "food", region: "Bắc", practiceItemId: "practice-mvp-banhmi", featured: true, aliases: ["bánh mì bắc", "banh mi bac", "bánh mì", "banh mi"] },
  { label: "buncha", display: "Bún chả", gloss: "BUNCHA", category: "food", practiceItemId: "practice-mvp-buncha", aliases: ["bún chả", "bun cha"] },
  { label: "bundau", display: "Bún đậu", gloss: "BUNDAU", category: "food", practiceItemId: "practice-mvp-bundau", aliases: ["bún đậu", "bun dau"] },
  { label: "bunmam", display: "Bún mắm", gloss: "BUNMAM", category: "food", practiceItemId: "practice-mvp-bunmam", aliases: ["bún mắm", "bun mam"] },
  { label: "bunngang", display: "Bún ngan", gloss: "BUNNGANG", category: "food", practiceItemId: "practice-mvp-bunngang", aliases: ["bún ngan", "bun ngan", "bún ngang"] },
  { label: "bunoc", display: "Bún ốc", gloss: "BUNOC", category: "food", practiceItemId: "practice-mvp-bunoc", aliases: ["bún ốc", "bun oc"] },
  { label: "chao", display: "Cháo", gloss: "CHAO", category: "food", practiceItemId: "practice-mvp-chao", aliases: ["cháo", "cháo sườn", "chao"] },
  { label: "com", display: "Cơm", gloss: "COM", category: "food", practiceItemId: "practice-mvp-com", featured: true, aliases: ["cơm", "com"] },
  { label: "pho_nt", display: "Phở", gloss: "PHO_NT", category: "food", region: "Nam/Trung", practiceItemId: "practice-mvp-pho-nt", aliases: ["phở nam trung", "pho nam trung"] },
  { label: "pho", display: "Phở", gloss: "PHO", category: "food", region: "Bắc", practiceItemId: "practice-mvp-pho", featured: true, aliases: ["phở bắc", "pho bac", "phở", "pho"] },
  { label: "ca_phe", display: "Cà phê", gloss: "CA_PHE", category: "beverage", practiceItemId: "practice-mvp-caphe", featured: true, aliases: ["cà phê", "ca phe", "café", "cafe", "caphe"] },
  { label: "da", display: "Đá", gloss: "DA", category: "beverage", practiceItemId: "practice-mvp-da", aliases: ["đá", "da"] },
  { label: "den", display: "Đen", gloss: "DEN", category: "beverage", practiceItemId: "practice-mvp-den", aliases: ["đen", "den"] },
  { label: "nong", display: "Nóng", gloss: "NONG", category: "beverage", practiceItemId: "practice-mvp-nong", aliases: ["nóng", "nong"] },
  { label: "sua", display: "Sữa", gloss: "SUA", category: "beverage", practiceItemId: "practice-mvp-sua", featured: true, aliases: ["sữa", "sua"] },
  { label: "tra", display: "Trà", gloss: "TRA", category: "beverage", practiceItemId: "practice-mvp-tra", aliases: ["trà", "tra"] },
  { label: "co_giao", display: "Cô giáo", gloss: "CO_GIAO", category: "school", practiceItemId: "practice-school-co-giao", featured: true, aliases: ["cô giáo", "co giao"] },
  { label: "thay_giao", display: "Thầy giáo", gloss: "THAY_GIAO", category: "school", practiceItemId: "practice-school-thay-giao", aliases: ["thầy giáo", "thay giao"] },
  { label: "hoc_tro", display: "Học trò", gloss: "HOC_TRO", category: "school", practiceItemId: "practice-school-hoc-tro", aliases: ["học trò", "hoc tro"] },
  { label: "lop_truong", display: "Lớp trưởng", gloss: "LOP_TRUONG", category: "school", practiceItemId: "practice-school-lop-truong", aliases: ["lớp trưởng", "lop truong"] },
  { label: "lop_pho", display: "Lớp phó", gloss: "LOP_PHO", category: "school", practiceItemId: "practice-school-lop-pho", aliases: ["lớp phó", "lop pho"] },
  { label: "but", display: "Bút", gloss: "BUT", category: "school", practiceItemId: "practice-school-but", featured: true, aliases: ["bút", "but"] },
  { label: "cap_sach", display: "Cặp sách", gloss: "CAP_SACH", category: "school", practiceItemId: "practice-school-cap-sach", aliases: ["cặp sách", "cap sach"] },
  { label: "quyen_vo", display: "Quyển vở", gloss: "QUYEN_VO", category: "school", practiceItemId: "practice-school-quyen-vo", aliases: ["quyển vở", "quyen vo"] },
  { label: "sach_giao_khoa", display: "Sách giáo khoa", gloss: "SACH_GIAO_KHOA", category: "school", practiceItemId: "practice-school-sach-giao-khoa", aliases: ["sách giáo khoa", "sach giao khoa"] },
];

const AI_PREDICT_URL = `${getApiBaseUrl()}/signature-workflows/predict-landmarks`;
const AI_FEATURE_BOUND = 10;

function sanitizeFeature(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(-AI_FEATURE_BOUND, Math.min(AI_FEATURE_BOUND, value));
}

function sanitizeLandmarkSequence(sequence: number[][]) {
  return sequence.map((frame) => frame.map(sanitizeFeature));
}

function sanitizeHandsDetectedFrames(value: number | undefined, sequenceLength: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }
  return Math.max(0, Math.min(sequenceLength, Math.trunc(value)));
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
  if (!text) return null;
  const normalized = normalizeAiLabel(text);
  if (!normalized) return null;

  const matchKey = (inputNorm: string) =>
    AI_PRACTICE_TARGETS.find((target) => {
      const keys = [
        target.label,
        target.gloss,
        target.display,
        ...(target.aliases || []),
      ].map(normalizeAiLabel);
      return keys.some((key) => key && inputNorm === key);
    });

  const exact = matchKey(normalized);
  if (exact) return exact;

  const textWithoutParentheses = text.replace(/\s*\([^)]*\)/g, "").trim();
  if (textWithoutParentheses && textWithoutParentheses !== text) {
    const strippedNorm = normalizeAiLabel(textWithoutParentheses);
    if (strippedNorm) {
      const matchStripped = matchKey(strippedNorm);
      if (matchStripped) return matchStripped;
    }
  }

  const quotedMatch = text.match(/['"“‘]([^'"”’]+)['"”’]/);
  if (quotedMatch?.[1]) {
    const quotedNorm = normalizeAiLabel(quotedMatch[1]);
    if (quotedNorm) {
      const targetFromQuote = matchKey(quotedNorm);
      if (targetFromQuote) return targetFromQuote;
    }
  }

  return null;
}

export async function predictGestureLandmarks(
  sequence: number[][],
  options: { targetLabel?: string | null; handsDetectedFrames?: number; accessToken?: string } = {}
) {
  const safeSequence = sanitizeLandmarkSequence(sequence);
  const safeHandsDetectedFrames = sanitizeHandsDetectedFrames(options.handsDetectedFrames, safeSequence.length);

  const response = await fetch(AI_PREDICT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
    },
    body: JSON.stringify({
      sequence: safeSequence,
      target_label: options.targetLabel ? normalizeAiLabel(options.targetLabel) : undefined,
      hands_detected_frames: safeHandsDetectedFrames,
    }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || "Không thể xử lý ký hiệu. Vui lòng thử lại.");
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
