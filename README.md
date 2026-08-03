# Remielle Desktop Assistant

Một trợ lý desktop (desktop pet) dễ thương, đáng yêu, sống trên màn hình máy tính của bạn — luôn luôn ở trên cùng, sẵn sàng trò chuyện bất cứ khi nào bạn cần. UwU :3

<p align="center">
  <img src="assets/ai_thingking.gif" alt="Remielle đang suy nghĩ" width="200">
</p>

## Tính năng

- 🖥️ **Cửa sổ trong suốt, không viền, luôn trên cùng** — Remielle lơ lửng trên màn hình, click-through khi bạn không cần
- 💬 **Trò chuyện AI** — chạy hoàn toàn local, riêng tư, miễn phí
- ✨ **Streaming phản hồi** — câu trả lời hiện ra từng chữ một như đang gõ
- 😊 **Cá tính dễ thương** — vui vẻ, tinh nghịch, hơi trêu chọc, thích dùng kaomoji (UwU, :3, ~)
- 🌐 **Hỗ trợ Tiếng Việt & Tiếng Anh**
- 🎭 **GIF trạng thái** — đang suy nghĩ, đang gõ, đang chờ bạn nhập
- 🗑️ **Khay hệ thống** — thoát nhanh từ tray icon

## Yêu cầu

- [Node.js](https://nodejs.org/) (có sẵn npm)
- [Ollama](https://ollama.com/) đang chạy ở `http://127.0.0.1:11434`
- Model: `qwen2.5:7b`

```bash
ollama pull qwen2.5:7b
```

## Cài đặt & chạy

```bash
npm install
npm start
```

Hoặc trên Windows, chạy `run.bat` (log được ghi vào `app.log`).

> **Lưu ý:** Đảm bảo Ollama đang chạy trước khi khởi động Remielle, nếu không Remielle sẽ không kết nối được với "não bộ" của mình. T.T

## Cấu trúc dự án

```
├── main.js        # Electron main process (cửa sổ, tray, IPC, gọi Ollama)
├── preload.js     # Cầu nối an toàn giữa renderer và main
├── renderer.js    # Logic giao diện
├── index.html     # Giao diện chính
├── style.css      # Kiểu dáng
└── assets/        # Icon & GIF trạng thái
```

## Tri ân (Credits)

Remielle không thể tồn tại nếu thiếu những dự án và công cụ tuyệt vời sau:

- 💚 **[Gemielle](https://github.com/Rainan1010/Gemielle/tree/main)** — cảm hứng và nền tảng gốc của dự án này, được tạo ra bởi [Rainan1010](https://github.com/Rainan1010). Xin gửi lời cảm ơn chân thành đến tác giả vì ý tưởng desktop pet thú vị này!
- 🦙 **[Ollama](https://ollama.com/)** — nền tảng chạy model LLM local, giúp Remielle có "bộ não" hoạt động hoàn toàn offline và miễn phí
- ⚡ **[Electron](https://www.electronjs.org/)** — framework phát triển ứng dụng desktop

## Giấy phép

ISC
