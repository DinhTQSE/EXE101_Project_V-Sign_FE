import type { Results } from "@mediapipe/holistic";

export const HOLISTIC_RAW_FEATURE_SIZE = 258;

type Landmark = {
  x: number;
  y: number;
  z: number;
  visibility?: number;
};

type HolisticInstance = {
  close(): Promise<void>;
  onResults(listener: (results: Results) => void): void;
  send(inputs: { image: HTMLVideoElement }): Promise<void>;
  setOptions(options: {
    modelComplexity: number;
    smoothLandmarks: boolean;
    minDetectionConfidence: number;
    minTrackingConfidence: number;
  }): void;
};

type HolisticConstructor = new (config?: {
  locateFile?: (path: string, prefix?: string) => string;
}) => HolisticInstance;

export interface LandmarkCaptureOptions {
  durationMs?: number;
  fps?: number;
  roundDecimals?: number;
}

export interface LandmarkCaptureResult {
  sequence: number[][];
  durationMs: number;
  handsDetectedFrames: number;
}

export function getHolisticSupportError() {
  if (typeof window === "undefined") {
    return "Trình duyệt chưa sẵn sàng chạy camera AI.";
  }
  if (!window.isSecureContext && window.location.hostname !== "localhost") {
    return "Camera AI cần kết nối HTTPS để truy cập camera an toàn.";
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return "Trình duyệt hoặc thiết bị này chưa hỗ trợ camera.";
  }
  if (!("WebAssembly" in window)) {
    return "Trình duyệt này chưa hỗ trợ tính năng nhận diện camera.";
  }
  return null;
}

function zeros(length: number) {
  return Array.from({ length }, () => 0);
}

function createPreviousLandmarks() {
  return {
    pose: zeros(132),
    left: zeros(63),
    right: zeros(63),
  };
}

function flattenPose(landmarks: Landmark[] | undefined, previous: number[]) {
  if (!landmarks?.length) return previous;
  return landmarks.flatMap((landmark) => [
    landmark.x,
    landmark.y,
    landmark.z,
    landmark.visibility ?? 0,
  ]);
}

function flattenHand(landmarks: Landmark[] | undefined, previous: number[]) {
  if (!landmarks?.length) return previous;
  return landmarks.flatMap((landmark) => [landmark.x, landmark.y, landmark.z]);
}

function extractRawFeatures(results: Results, previous: ReturnType<typeof createPreviousLandmarks>) {
  const pose = flattenPose(results.poseLandmarks as Landmark[] | undefined, previous.pose);
  const left = flattenHand(results.leftHandLandmarks as Landmark[] | undefined, previous.left);
  const right = flattenHand(results.rightHandLandmarks as Landmark[] | undefined, previous.right);

  previous.pose = pose;
  previous.left = left;
  previous.right = right;

  return {
    features: [...pose, ...left, ...right],
    handsDetected: Boolean(results.leftHandLandmarks?.length || results.rightHandLandmarks?.length),
  };
}

function applyEmaSmoothing(current: number[], previous: number[] | null, alpha = 0.7) {
  if (!previous) return current;
  return current.map((value, index) => alpha * value + (1 - alpha) * previous[index]);
}

export function normalizeHolisticFeatures(rawFeatures: number[], roundDecimals = 5) {
  if (rawFeatures.length !== HOLISTIC_RAW_FEATURE_SIZE) {
    throw new Error(`Expected ${HOLISTIC_RAW_FEATURE_SIZE} features, got ${rawFeatures.length}.`);
  }

  const landmarks = [...rawFeatures];
  const noseX = landmarks[0];
  const noseY = landmarks[1];
  const noseZ = landmarks[2];
  const factor = 10 ** roundDecimals;

  for (let i = 0; i < 33; i += 1) {
    const base = i * 4;
    landmarks[base] -= noseX;
    landmarks[base + 1] -= noseY;
    landmarks[base + 2] -= noseZ;
  }

  for (let i = 0; i < 21; i += 1) {
    const leftBase = 132 + i * 3;
    const rightBase = 195 + i * 3;
    landmarks[leftBase] -= noseX;
    landmarks[leftBase + 1] -= noseY;
    landmarks[leftBase + 2] -= noseZ;
    landmarks[rightBase] -= noseX;
    landmarks[rightBase + 1] -= noseY;
    landmarks[rightBase + 2] -= noseZ;
  }

  return landmarks.map((value) => Math.round(value * factor) / factor);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function resolveHolisticConstructor(moduleValue: unknown): HolisticConstructor {
  const moduleRecord = asRecord(moduleValue);
  const defaultRecord = asRecord(moduleRecord.default);
  const moduleExportsRecord = asRecord(moduleRecord["module.exports"]);
  const windowRecord = typeof window === "undefined" ? {} : asRecord(window);
  const constructor =
    moduleRecord.Holistic ||
    defaultRecord.Holistic ||
    moduleExportsRecord.Holistic ||
    windowRecord.Holistic;

  if (typeof constructor !== "function") {
    throw new Error("Không thể khởi tạo camera AI. Vui lòng tải lại trang và thử lại.");
  }

  return constructor as HolisticConstructor;
}

async function createHolistic(): Promise<HolisticInstance> {
  const holisticModule = await import("@mediapipe/holistic");
  const Holistic = resolveHolisticConstructor(holisticModule);
  const holistic = new Holistic({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
  });
  holistic.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  return holistic;
}

function sendFrame(holistic: HolisticInstance, video: HTMLVideoElement) {
  return new Promise<Results>((resolve, reject) => {
    try {
      holistic.onResults((results) => resolve(results));
      holistic.send({ image: video }).catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

export async function captureHolisticLandmarkSequence(
  video: HTMLVideoElement,
  options: LandmarkCaptureOptions = {}
): Promise<LandmarkCaptureResult> {
  const supportError = getHolisticSupportError();
  if (supportError) throw new Error(supportError);

  const durationMs = options.durationMs ?? 3000;
  const fps = options.fps ?? 8;
  const frameCount = Math.max(5, Math.round((durationMs / 1000) * fps));
  const intervalMs = durationMs / frameCount;
  const previous = createPreviousLandmarks();
  const sequence: number[][] = [];
  let previousSmoothed: number[] | null = null;
  let handsDetectedFrames = 0;
  const startedAt = performance.now();
  const holistic = await createHolistic();

  try {
    for (let i = 0; i < frameCount; i += 1) {
      const results = await sendFrame(holistic, video);
      const { features, handsDetected } = extractRawFeatures(results, previous);
      const smoothed = applyEmaSmoothing(features, previousSmoothed, 0.7);
      previousSmoothed = smoothed;
      sequence.push(normalizeHolisticFeatures(smoothed, options.roundDecimals ?? 5));

      if (handsDetected) handsDetectedFrames += 1;
      if (i < frameCount - 1) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }
  } finally {
    holistic.close();
  }

  return {
    sequence,
    durationMs: Math.round(performance.now() - startedAt),
    handsDetectedFrames,
  };
}
