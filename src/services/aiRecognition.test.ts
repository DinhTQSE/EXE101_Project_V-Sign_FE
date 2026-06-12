import { afterEach, describe, expect, it, vi } from "vitest";
import { predictGestureLandmarks } from "@/services/aiRecognition";

describe("predictGestureLandmarks", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends landmark sequences without raw image/frame fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "ok", label: "com", confidence: 0.9 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const frame = Array.from({ length: 258 }, () => 0);
    await predictGestureLandmarks([frame, frame, frame, frame, frame], {
      targetLabel: "com",
      handsDetectedFrames: 5,
    });

    const body = String(fetchMock.mock.calls[0][1].body);
    const payload = JSON.parse(body) as Record<string, unknown>;
    expect(fetchMock.mock.calls[0][0]).toBe("/ai/predict-landmarks");
    expect(payload.sequence).toBeTruthy();
    expect(payload).not.toHaveProperty("frames");
    expect(payload).not.toHaveProperty("frame");
    expect(payload).not.toHaveProperty("image");
    expect(payload).not.toHaveProperty("video");
    expect(body).not.toMatch(/data:image|base64|jpeg|jpg|png/i);
  });
});
