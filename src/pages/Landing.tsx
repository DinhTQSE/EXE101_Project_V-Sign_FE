import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Video, Camera, Brain, ChevronDown, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/vsign-logo.png";
import mascotImg from "@/assets/mascot.png";
import { LoginModal } from "@/components/LoginModal";

export default function Landing() {
  const location = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<"login" | "signup">("signup");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const openLogin = () => { setLoginMode("login"); setLoginOpen(true); };
  const openSignup = () => { setLoginMode("signup"); setLoginOpen(true); };

  useEffect(() => {
    const authMode = (location.state as { authMode?: "login" | "signup" } | null)?.authMode;
    if (authMode) {
      setLoginMode(authMode);
      setLoginOpen(true);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navbar */}
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50 px-6 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <img src={logo} alt="V-Sign" className="h-10 cursor-pointer transition-transform duration-200 hover:scale-105" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollTo("about")} className="text-sm font-body font-medium text-muted-foreground hover:text-primary transition-colors">Về V-Sign</button>
              <button onClick={() => scrollTo("features")} className="text-sm font-body font-medium text-muted-foreground hover:text-primary transition-colors">Khóa học</button>
              <Link to="/dictionary" className="text-sm font-body font-medium text-muted-foreground hover:text-primary transition-colors">Từ điển</Link>
              <button onClick={() => scrollTo("contact")} className="text-sm font-body font-medium text-muted-foreground hover:text-primary transition-colors">Liên hệ</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={openLogin} className="px-5 py-2 rounded-2xl border-2 border-secondary text-secondary font-semibold text-sm hover:bg-secondary hover:text-secondary-foreground transition-all">
              Đăng nhập
            </button>
            <button onClick={openSignup} className="btn-primary-gradient text-sm py-2">
              Đăng ký
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-6" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary font-semibold text-sm mb-6">
              <Sparkles className="w-4 h-4" /> Nền tảng học VSL cho người Việt
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-display font-bold text-foreground leading-tight mb-6">
              V-Sign: Học<br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>Ngôn ngữ Ký hiệu</span><br />
              Việt Nam hiệu quả hơn
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg font-body leading-relaxed">
              Nền tảng hỗ trợ người Việt học VSL thông qua lộ trình cá nhân hóa và công nghệ nhận diện hình ảnh.
            </p>
            <button onClick={openSignup} className="btn-primary-gradient text-lg px-12 py-4">
              Bắt đầu học ngay!
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex-1 flex flex-col items-center">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="speech-bubble max-w-[280px] text-center mb-2 font-body text-foreground">
              <p className="font-semibold">Chào mừng bạn! 👋</p>
              <p className="text-sm text-muted-foreground mt-1">Cùng tôi học VSL nhé!</p>
            </motion.div>
            <motion.img src={mascotImg} alt="V-Sign Mascot" className="w-64 md:w-80 drop-shadow-2xl" animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
          </motion.div>
        </div>
        <div className="flex justify-center mt-12">
          <button onClick={() => scrollTo("features")} className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronDown className="w-8 h-8 animate-bounce" />
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-display font-bold text-center text-foreground mb-4">
            Tại sao chọn V-Sign?
          </motion.h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto font-body">
            Phương pháp học hiện đại kết hợp video, AI và lộ trình cá nhân hóa
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Video, title: "Video chuẩn VSL", desc: "Học từ các video mẫu ngôn ngữ ký hiệu Việt Nam với hướng dẫn chi tiết từng bước.", color: "hsl(14 68% 62%)" },
              { icon: Camera, title: "Luyện tập với Camera", desc: "Luyện tập trước camera và nhận phản hồi tức thì từ hệ thống nhận diện hình ảnh.", color: "hsl(230 30% 63%)" },
              { icon: Brain, title: "Lộ trình học bài bản", desc: "Hệ thống tạo lộ trình học phù hợp với mục tiêu và tốc độ của riêng bạn.", color: "hsl(14 68% 62%)" },
            ].map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="card-pastel p-8 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: feature.color }}>
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground font-body">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-6 bg-muted/50">
        <div className="container mx-auto text-center max-w-3xl">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
            Về V-Sign
          </motion.h2>
          <p className="text-muted-foreground font-body text-lg leading-relaxed mb-8">
            V-Sign là nền tảng học ngôn ngữ ký hiệu Việt Nam (VSL), được thiết kế để kết nối cộng đồng người khiếm thính và người nghe.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "Sứ mệnh", text: "Kết nối cộng đồng qua ngôn ngữ ký hiệu" },
              { label: "Mục tiêu", text: "Giúp nhiều người Việt tiếp cận VSL dễ dàng hơn" },
              { label: "Đối tượng", text: "Mọi lứa tuổi, mọi trình độ" },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-pastel p-6">
                <h4 className="font-display font-bold text-primary text-lg mb-2">{item.label}</h4>
                <p className="text-muted-foreground font-body text-sm">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-6 border-t border-border">
        <div className="container mx-auto text-center">
          <h3 className="font-display font-bold text-foreground text-xl mb-2">Liên hệ</h3>
          <p className="text-muted-foreground font-body mb-6">Email: <a href="mailto:v-sign.contact@gmail.com" className="text-primary hover:underline transition-colors">v-sign.contact@gmail.com</a></p>
          <p className="text-sm text-muted-foreground font-body">© 2026 V-Sign. Nền tảng học ngôn ngữ ký hiệu Việt Nam.</p>
        </div>
      </footer>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} defaultMode={loginMode} />
    </div>
  );
}
