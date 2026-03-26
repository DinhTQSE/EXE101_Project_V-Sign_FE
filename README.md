# V-sign - Học Ngôn ngữ Ký hiệu Việt Nam (VSL)

V-sign là một nền tảng học tập hiện đại dành cho người khiếm thính và những người muốn tìm hiểu về Ngôn ngữ Ký hiệu Việt Nam (VSL). Dự án tập trung vào tính tương tác cao, giao diện thân thiện và hỗ trợ AI nhận diện ký hiệu.

## 🚀 Công nghệ sử dụng
Dự án được xây dựng với bộ công cụ hiện đại:
- **Framework**: Vite + React + TypeScript
- **UI/UX**: Tailwind CSS + Shadcn UI + Framer Motion
- **State Management**: React Context (`AuthContext`) + TanStack Query
- **Local Storage**: Lưu trữ tiến độ học tập và thông tin người dùng cục bộ.

## 📁 Cấu trúc dự án (Project Structure)
```text
src/
├── assets/          # Logo, mascot và hình ảnh minh họa
├── components/      # Các thành phần giao diện tái sử dụng (Shadcn UI, LessonModal, WebcamFeed...)
├── contexts/        # Quản lý trạng thái toàn cục (Xác thực, Tiến độ học tập)
├── hooks/           # Các custom hooks (Camera, Theme)
├── lib/             # Các hàm tiện ích (utils, configuration)
├── pages/           # Các màn hình chính (Landing, Dashboard, VocabularyPack, ReviewChallenge...)
└── main.tsx         # Điểm khởi đầu của ứng dụng

public/
└── videos/          # Các video hướng dẫn ký hiệu VSL
```

## 🔄 Luồng ứng dụng (Application Flow)

1. **Chào mừng (Landing Page)**: 
   - Giới thiệu dự án và kêu gọi người dùng bắt đầu.
   - Kiểm tra trạng thái đăng nhập tự động qua `localStorage`.

2. **Khởi tạo (Onboarding)**:
   - Nếu là người dùng mới, hệ thống sẽ hỏi thông tin về: vai trò, độ tuổi và mục tiêu học tập.
   - Tự động chuyển đổi giao diện sang **Chế độ Trẻ em** hoặc **Người lớn** tùy theo độ tuổi.

3. **Bảng điều khiển (Dashboard)**:
   - Hub trung tâm chứa các phân khóa học, từ điển, và xếp hạng.
   - Hiển thị Widget tiến độ hàng ngày.

4. **Học tập (Learning Flow)**:
   - Chọn **Khóa học** -> **Unit** -> **Chương** -> **Bài học**.
   - Mỗi bài học gồm 3 bước: 
     - 📽️ **Lý thuyết**: Xem video hướng dẫn.
     - ✍️ **Thực hành**: Làm bài tập trắc nghiệm hoặc điền từ.
     - 🤖 **Kiểm tra AI**: Thực hiện ký hiệu trước camera (giả lập nhận diện).

5. **Ôn tập & Thử thách (Review & Challenge)**:
   - Chơi các trò chơi: Lật thẻ (Flashcards), Trắc nghiệm tốc độ (Speed Quiz), và Nối từ (Matching).

## 📋 Yêu cầu hệ thống (Prerequisites)
Trước khi cài đặt, hãy đảm bảo máy tính của bạn đã cài đặt:
- **Node.js**: Phiên bản `>= 18.x`
- **npm**: Phiên bản `>= 9.x`

Điều này giúp đảm bảo tính tương thích với các thư viện hiện đại như Vite 5 và các plugin của React 18.

## 🛠️ Hướng dẫn cài đặt & Chạy dự án

1. **Cài đặt thư viện**:
   ```bash
   npm install
   ```

2. **Chạy server phát triển**:
   ```bash
   npm run dev
   ```
   Sau đó mở trình duyệt tại: `http://localhost:5173`

## 🧪 Kiến trúc AI & Backend (Hiện tại & Tương lai)
Hiện tại, dự án đang ở giai đoạn **Frontend Mockup**. Phần nhận diện ngôn ngữ ký hiệu được thiết kế để mở rộng theo 2 hướng:
1. **Local Processing**: Tích hợp trực tiếp các thư viện như `TensorFlow.js` hoặc `MediaPipe` vào Frontend để xử lý nhận diện ngay trên trình duyệt (thông qua `hooks/useWebcam.ts`).
2. **Backend API**: Gọi API đến một máy chủ Backend xử lý AI chuyên sâu (như Python/FastAPI với các model LSTM/CNN).

> [!IMPORTANT]
> **Trạng thái hiện tại**: Toàn bộ luồng nhận diện AI trong các bài học (`CameraStep`) và Tab "Nhận diện AI" đang sử dụng cơ chế **giả lập (mocking)** để minh họa trải nghiệm người dùng. Các kết quả trả về hiện tại là cố định và phục vụ mục đích kiểm thử giao diện.

---
*Dự án được generate và phát triển với sự hỗ trợ của Lovable AI.*
