import { afterEach, describe, expect, it, vi } from "vitest";
import { predictGestureLandmarks } from "@/services/aiRecognition";

describe("predictGestureLandmarks", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends landmark sequences without raw image/frame fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { status: "ok", label: "com", confidence: 0.9 } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const frame = Array.from({ length: 258 }, () => 0);
    const prediction = await predictGestureLandmarks([frame, frame, frame, frame, frame], {
      targetLabel: "com",
      handsDetectedFrames: 5,
      accessToken: "test-token",
    });

    const body = String(fetchMock.mock.calls[0][1].body);
    const payload = JSON.parse(body) as Record<string, unknown>;
    expect(fetchMock.mock.calls[0][0]).toBe("/api/v1/signature-workflows/predict-landmarks");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer test-token");
    expect(payload.sequence).toBeTruthy();
    expect(payload).not.toHaveProperty("frames");
    expect(payload).not.toHaveProperty("frame");
    expect(payload).not.toHaveProperty("image");
    expect(payload).not.toHaveProperty("video");
    expect(body).not.toMatch(/data:image|base64|jpeg|jpg|png/i);
    expect(prediction.label).toBe("com");
  });

  it("sanitizes non-finite and out-of-bounds landmark values before sending", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { status: "ok", label: "com", confidence: 0.9 } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const frame = Array.from({ length: 258 }, (_, index) => {
      if (index === 0) return Number.NaN;
      if (index === 1) return Number.POSITIVE_INFINITY;
      if (index === 2) return Number.NEGATIVE_INFINITY;
      if (index === 3) return 11;
      if (index === 4) return -11;
      return 0;
    });

    await predictGestureLandmarks([frame, frame, frame, frame, frame], {
      handsDetectedFrames: 99,
    });

    const body = String(fetchMock.mock.calls[0][1].body);
    const payload = JSON.parse(body) as { sequence: number[][]; hands_detected_frames: number };
    expect(payload.sequence[0][0]).toBe(0);
    expect(payload.sequence[0][1]).toBe(0);
    expect(payload.sequence[0][2]).toBe(0);
    expect(payload.sequence[0][3]).toBe(10);
    expect(payload.sequence[0][4]).toBe(-10);
    expect(payload.hands_detected_frames).toBe(5);
  });
});

describe("resolveAiPracticeTarget", () => {
  it("matches 'Lớp phó' to 'lop_pho' target and not 'Phở'", async () => {
    const { resolveAiPracticeTarget } = await import("@/services/aiRecognition");
    const target = resolveAiPracticeTarget("Lớp phó");
    expect(target?.label).toBe("lop_pho");
    expect(target?.display).toBe("Lớp phó");
  });

  it("correctly resolves exact targets and quoted target text", async () => {
    const { resolveAiPracticeTarget } = await import("@/services/aiRecognition");
    expect(resolveAiPracticeTarget("Phở")?.display).toBe("Phở");
    expect(resolveAiPracticeTarget("pho")?.display).toBe("Phở");
    expect(resolveAiPracticeTarget("Thực hiện ký hiệu 'Phở' trước camera")?.display).toBe("Phở");
  });
});
