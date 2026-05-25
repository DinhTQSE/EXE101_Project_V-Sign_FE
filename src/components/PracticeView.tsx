import { useState } from "react";
import { Cpu, ChevronRight } from "lucide-react";
import AiCameraPractice from "@/components/AiCameraPractice";
import { AI_PRACTICE_TARGETS } from "@/services/aiRecognition";

export default function PracticeView() {
  const [targetIndex, setTargetIndex] = useState(0);
  const current = AI_PRACTICE_TARGETS[targetIndex];

  const cycleTarget = () => {
    setTargetIndex((prev) => (prev + 1) % AI_PRACTICE_TARGETS.length);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero header */}
      <div className="hero-panel p-5 md:p-7 flex items-center gap-4 mb-6">
        <div
          className="icon-tile shrink-0"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Cpu className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white leading-tight">Nhận diện AI</h2>
          <p className="font-body text-sm md:text-base text-white/85">
            Thực hiện ký hiệu trước camera để AI nhận diện.
          </p>
        </div>
      </div>

      {/* Target selector */}
      <div className="card-pop p-4 md:p-5 mb-6">
        <p className="text-xs font-body text-muted-foreground mb-3 uppercase tracking-wide">
          Chọn ký hiệu luyện tập
        </p>
        <div className="flex gap-2 flex-wrap">
          {AI_PRACTICE_TARGETS.map((target, idx) => (
            <button
              key={target.label}
              onClick={() => setTargetIndex(idx)}
              className={`font-body transition-all ${
                idx === targetIndex
                  ? "chip-active"
                  : "chip-soft text-muted-foreground hover:text-foreground"
              }`}
            >
              {target.display}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Target display */}
        <div className="card-pop p-6 flex flex-col items-center justify-center min-h-[340px]">
          <div className="coral-box w-full mb-4">{current.display}</div>
          <p className="text-sm text-muted-foreground font-body text-center">
            Hãy thực hiện ký hiệu "{current.display}" trước camera.
          </p>
          <button
            onClick={cycleTarget}
            className="mt-4 flex items-center gap-1.5 text-xs font-body font-semibold text-primary hover:underline"
          >
            Đổi bài luyện tập <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Camera panel */}
        <AiCameraPractice
          key={current.label}
          question={`Thực hiện ký hiệu '${current.display}' trước camera`}
          targetLabel={current.label}
          targetDisplay={current.display}
          practiceItemId={current.practiceItemId}
          minConfidence={0.7}
        />
      </div>
    </div>
  );
}
