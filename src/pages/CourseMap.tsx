import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle, Play, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import mascotImg from "@/assets/mascot.png";
import PremiumModal from "@/components/PremiumModal";

interface CourseMapProps {
  onStartLesson?: () => void;
}

interface Chapter {
  id: number;
  badge: string;
  title: string;
  lessons: { id: number; title: string }[];
  free: boolean;
}

const chapters: Chapter[] = [
  {
    id: 1, badge: "CHAPTER 1", title: "Từ vựng VSL cơ bản",
    lessons: [
      { id: 101, title: "Xin chào" }, { id: 102, title: "Tạm biệt" },
      { id: 1, title: "Địa chỉ" }, { id: 2, title: "Tiếp tân" },
      { id: 3, title: "Thói quen" }, { id: 4, title: "Không nên" },
      { id: 5, title: "Ngày giải phóng Miền Nam 30/4" },
    ],
    free: true,
  },
  {
    id: 2, badge: "CHAPTER 2", title: "Gia đình & Người thân",
    lessons: [
      { id: 5, title: "Bố / Mẹ" }, { id: 6, title: "Anh / Chị" },
      { id: 7, title: "Ông / Bà" }, { id: 8, title: "Con cái" },
    ],
    free: true,
  },
  {
    id: 3, badge: "CHAPTER 3", title: "Cơ bản về VSL",
    lessons: [
      { id: 9, title: "Bảng chữ cái ký hiệu" }, { id: 10, title: "Số đếm 1-10" },
      { id: 11, title: "Ngày trong tuần" }, { id: 12, title: "Tháng trong năm" },
      { id: 13, title: "Màu sắc" }, { id: 14, title: "Hình dạng" },
      { id: 15, title: "Vâng / Không" }, { id: 16, title: "Câu hỏi cơ bản" },
      { id: 17, title: "Giới thiệu bản thân" }, { id: 18, title: "Tuổi tác" },
      { id: 19, title: "Nghề nghiệp" }, { id: 20, title: "Ôn tập chương 3" },
    ],
    free: true,
  },
  {
    id: 4, badge: "CHAPTER 4", title: "Đồ ăn & Thức uống",
    lessons: [
      { id: 21, title: "Cơm / Phở" }, { id: 22, title: "Nước / Trà / Cà phê" },
      { id: 23, title: "Trái cây" }, { id: 24, title: "Rau củ" },
    ],
    free: true,
  },
  {
    id: 5, badge: "CHAPTER 5", title: "Hoạt động hàng ngày",
    lessons: [
      { id: 25, title: "Ăn / Uống" }, { id: 26, title: "Ngủ / Thức dậy" },
      { id: 27, title: "Đi làm / Đi học" }, { id: 28, title: "Ôn tập" },
    ],
    free: true,
  },
  {
    id: 6, badge: "CHAPTER 6", title: "Cảm xúc & Tâm trạng",
    lessons: [
      { id: 29, title: "Vui / Buồn" }, { id: 30, title: "Giận / Sợ" },
      { id: 31, title: "Yêu / Ghét" }, { id: 32, title: "Mệt / Khỏe" },
    ],
    free: false,
  },
  {
    id: 7, badge: "CHAPTER 7", title: "Giao tiếp nâng cao",
    lessons: [
      { id: 33, title: "Tại bệnh viện" }, { id: 34, title: "Tại siêu thị" },
      { id: 35, title: "Tại trường học" }, { id: 36, title: "Tại công sở" },
    ],
    free: false,
  },
  {
    id: 8, badge: "CHAPTER 8", title: "Chuyên sâu & Chứng chỉ",
    lessons: [
      { id: 37, title: "Phiên dịch cơ bản" }, { id: 38, title: "Ngữ pháp VSL" },
      { id: 39, title: "Bài thi cuối khóa" }, { id: 40, title: "Nhận chứng chỉ" },
    ],
    free: false,
  },
];

export default function CourseMap({ onStartLesson }: CourseMapProps) {
  const { userName, stats, isPremium, layoutMode } = useAuth();
  const { completedLessons } = stats;
  const [premiumOpen, setPremiumOpen] = useState(false);

  const allLessonIds = chapters.flatMap(c => c.lessons.map(l => l.id));
  const nextLessonId = allLessonIds.find(id => !completedLessons.includes(id)) || 1;

  const getChapterProgress = (chapter: Chapter) => {
    const done = chapter.lessons.filter(l => completedLessons.includes(l.id)).length;
    return { done, total: chapter.lessons.length, percent: Math.round((done / chapter.lessons.length) * 100) };
  };

  const isChildMode = layoutMode === "child";

  return (
    <div className="max-w-3xl mx-auto py-2">
      {/* Mascot welcome */}
      <div className="flex items-start gap-4 mb-8">
        <motion.img
          src={mascotImg}
          alt="Mascot"
          className={`object-contain drop-shadow-lg shrink-0 ${isChildMode ? "w-24 h-24" : "w-20 h-20"}`}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="speech-bubble flex-1">
          <p className={`font-body text-foreground ${isChildMode ? "text-base font-semibold" : "text-sm"}`}>
            {isChildMode
              ? `Chào bạn nhỏ ${userName || "ơi"}! 🌈 Hãy cùng khám phá lộ trình học nhé! Mỗi chương là một cuộc phiêu lưu mới! 🚀✨`
              : `Chào ${userName || "bạn"}! Đây là lộ trình học tập của bạn. Hoàn thành từng chương để mở khóa nội dung mới! 🚀`
            }
          </p>
        </div>
      </div>

      {/* Chapter cards */}
      <div className="space-y-4">
        {chapters.map((chapter, i) => {
          const progress = getChapterProgress(chapter);
          const isLocked = !chapter.free && !isPremium;
          const isActive = chapter.lessons.some(l => l.id === nextLessonId) && !isLocked;

          return (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => {
                if (isLocked) {
                  setPremiumOpen(true);
                } else if (isActive) {
                  onStartLesson?.();
                }
              }}
              className={`card-pastel p-5 cursor-pointer transition-all ${
                isLocked ? "opacity-60" : isActive ? "ring-2 ring-primary/40 shadow-md hover:shadow-lg" : "hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <span
                    className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 ${
                      isLocked
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/15 text-primary"
                    }`}
                  >
                    {chapter.badge}
                  </span>
                  <h3 className={`font-display font-bold text-foreground ${isChildMode ? "text-lg" : "text-base"}`}>
                    {chapter.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-body mt-1">
                    {progress.done} / {progress.total} bài học hoàn thành
                  </p>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-3 max-w-xs">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress.percent}%`,
                        background: isLocked ? "hsl(var(--muted-foreground))" : "var(--gradient-primary)",
                      }}
                    />
                  </div>
                </div>

                <div className="ml-4 shrink-0">
                  {isLocked ? (
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-amber-500" />
                    </div>
                  ) : progress.percent === 100 ? (
                    <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--success))]/15 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-[hsl(var(--success))]" />
                    </div>
                  ) : isActive ? (
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
                      <Play className="w-6 h-6 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {isActive && (
                <div className="mt-3 flex justify-end">
                  <span className="btn-primary-gradient text-xs py-1.5 px-5">Học ngay</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </div>
  );
}
