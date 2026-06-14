import type { Dictionary } from "./en";

// Vietnamese dictionary. Typed as `Dictionary` so it must mirror en.ts exactly.

export const vi: Dictionary = {
  nav: {
    dashboard: "Tổng quan",
    decks: "Bộ thẻ",
    study: "Học",
    create: "Tạo thẻ",
    stats: "Thống kê",
    settings: "Cài đặt",
    offlineFirst: "Hoạt động offline",
    toggleTheme: "Đổi giao diện sáng/tối",
  },

  language: {
    label: "Ngôn ngữ",
    description: "Chọn ngôn ngữ cho giao diện Lexio.",
  },

  landing: {
    nav: {
      features: "Tính năng",
      how: "Cách hoạt động",
      faq: "Câu hỏi",
      open: "Mở ứng dụng",
      cta: "Dùng miễn phí",
    },
    hero: {
      badge: "Lặp lại ngắt quãng · Thẻ AI · Offline",
      title: "Học từ vựng tiếng Anh để nhớ lâu thật sự.",
      subtitle:
        "Lexio biến những từ bạn cứ quên thành trí nhớ bền vững — với thẻ ghi nhớ do AI tạo và lịch ôn tập được điều chỉnh đúng theo cách bộ não bạn vận hành.",
      ctaPrimary: "Bắt đầu học — miễn phí",
      ctaSecondary: "Xem cách hoạt động",
      note: "Không cần đăng ký. Hoạt động offline. Dữ liệu nằm trên thiết bị của bạn.",
      cardWord: "ephemeral",
      cardPos: "tính từ",
      cardDef: "tồn tại trong thời gian rất ngắn; phù du.",
      cardExample: "“Danh tiếng trong ngành này có thể rất phù du.”",
      cardHint: "Chạm để xem nghĩa",
      again: "Lại",
      good: "Tốt",
      easy: "Dễ",
      floatDue: "đến hạn hôm nay",
      floatStreak: "chuỗi 7 ngày",
      floatKeep: "tiếp tục nhé",
    },
    stats: {
      retention: "tỷ lệ ghi nhớ trung bình",
      offline: "hoạt động offline",
      free: "để bắt đầu",
      freeValue: "Miễn phí",
    },
    problem: {
      kicker: "Vấn đề",
      title: "Bạn tra nghĩa của từ. Rồi lại quên.",
      subtitle:
        "Học từ vựng không phải là phần khó — giữ được nó mới khó. Hầu hết các cách học đều âm thầm chống lại trí nhớ của bạn.",
      items: [
        {
          title: "Đường cong lãng quên luôn thắng",
          body: "Nếu không ôn tập đúng lúc, bạn sẽ quên phần lớn từ mới chỉ trong vài ngày. Học nhồi nhét có vẻ hiệu quả, nhưng phai nhanh gần như ngay khi vừa hình thành.",
        },
        {
          title: "Danh sách từ không thích ứng",
          body: "Sổ tay và danh sách cố định không bao giờ cho bạn biết nên ôn gì và khi nào. Thế là bạn đọc lại tất cả, hoặc — thường gặp hơn — chẳng đọc gì cả.",
        },
        {
          title: "Ứng dụng đại trà, từ vựng đại trà",
          body: "Các ứng dụng phổ thông dạy ai cũng những câu du lịch giống nhau. Chúng không học được những từ quan trọng cho kỳ thi, công việc hay việc đọc của riêng bạn.",
        },
      ],
    },
    how: {
      kicker: "Lexio hoạt động thế nào",
      title: "Ghi nhớ, theo đúng lịch.",
      subtitle:
        "Ba bước đơn giản biến những lần thoáng gặp từ mới thành kiến thức bền vững, có thể nhớ lại bất cứ lúc nào.",
      steps: [
        {
          title: "Thêm từ trong vài giây",
          body: "Gõ một từ và để Claude dựng nên một tấm thẻ đầy đủ — định nghĩa, ví dụ thực tế, cách phát âm và sắc thái. Hoặc tự viết thẻ theo ý bạn.",
        },
        {
          title: "Ôn đúng thời điểm vàng",
          body: "Lexio dùng FSRS, một thuật toán lặp lại ngắt quãng hiện đại, để đưa mỗi tấm thẻ ra ngay trước khi bạn sắp quên — không quá sớm, không quá muộn.",
        },
        {
          title: "Nhìn từ vựng bám rễ",
          body: "Bạn đánh giá mức độ nhớ, và lịch ôn tự điều chỉnh. Theo dõi chuỗi ngày và tỷ lệ ghi nhớ khi vốn từ tích lũy dần, chỉ vài phút mỗi ngày.",
        },
      ],
    },
    features: {
      kicker: "Mọi thứ bạn cần",
      title: "Ứng dụng nhỏ gọn. Khoa học trí nhớ nghiêm túc.",
      subtitle:
        "Đầy đủ chiều sâu của một công cụ thẻ ghi nhớ chuyên nghiệp, nhưng không hề rườm rà.",
      items: [
        {
          title: "Thẻ ghi nhớ do AI tạo",
          body: "Định nghĩa, câu ví dụ và ghi chú cách dùng được tạo tức thì bằng Claude.",
        },
        {
          title: "Lập lịch bằng FSRS",
          body: "Lặp lại ngắt quãng tiên tiến, điều chỉnh từng khoảng thời gian theo trí nhớ của bạn.",
        },
        {
          title: "Hoạt động hoàn toàn offline",
          body: "Cài như một ứng dụng và học trên tàu điện, trên máy bay, ở bất cứ đâu.",
        },
        {
          title: "Dữ liệu của bạn, trên máy bạn",
          body: "Mọi thứ nằm trong trình duyệt. Không cần tài khoản, sao lưu chỉ với một cú nhấp.",
        },
        {
          title: "Bộ thẻ cho mọi mục tiêu",
          body: "Sắp xếp theo kỳ thi, chủ đề hay cuốn sách — gắn màu, tìm kiếm được, và là của bạn.",
        },
        {
          title: "Thống kê sâu sắc",
          body: "Tỷ lệ ghi nhớ, số lần ôn và chuỗi ngày, trực quan hóa để giữ động lực.",
        },
      ],
    },
    showcase: {
      kicker: "Nhìn gần hơn",
      title: "Thiết kế để việc ôn tập trở nên dễ chịu.",
      subtitle:
        "Giao diện tĩnh lặng, tập trung và không gây vướng víu — ở chế độ sáng hay tối, trên mọi màn hình.",
      points: [
        "Ôn tập chỉ một chạm với hiệu ứng lật thẻ mượt mà",
        "Hàng đợi hằng ngày thông minh: thẻ đến hạn, thẻ mới và đang học",
        "Chuỗi ngày và tỷ lệ ghi nhớ khiến bạn muốn quay lại",
      ],
    },
    faq: {
      kicker: "Thắc mắc",
      title: "Mọi điều khác bạn có thể băn khoăn.",
      items: [
        {
          q: "Có thật sự miễn phí không?",
          a: "Có. Lexio miễn phí sử dụng. Việc tạo thẻ bằng AI dùng một lượng nhỏ credit — bạn có thể thêm khóa API Anthropic của riêng mình trong phần Cài đặt để dùng tài khoản của bạn.",
        },
        {
          q: "Tôi có cần tài khoản không?",
          a: "Không cần tài khoản và không cần đăng ký. Bộ thẻ, thẻ và tiến trình của bạn được lưu cục bộ trên thiết bị.",
        },
        {
          q: "Có thật sự hoạt động offline không?",
          a: "Có. Cài Lexio như một ứng dụng và nó hoạt động hoàn toàn offline. Chỉ việc tạo thẻ bằng AI mới cần kết nối — mọi thứ khác đều cục bộ.",
        },
        {
          q: "FSRS là gì?",
          a: "Free Spaced Repetition Scheduler — một thuật toán hiện đại dự đoán thời điểm bạn sắp quên một tấm thẻ và xếp lịch ôn ngay đúng lúc.",
        },
        {
          q: "Dữ liệu của tôi được lưu ở đâu?",
          a: "Hoàn toàn trong trình duyệt của bạn (IndexedDB). Bạn có thể xuất một bản sao lưu đầy đủ thành tệp và nhập lại trên thiết bị khác bất cứ khi nào.",
        },
      ],
    },
    cta: {
      title: "Bắt đầu xây dựng vốn từ bền vững.",
      subtitle: "Miễn phí, offline và hoàn toàn của bạn. Bộ thẻ đầu tiên chỉ cách một cú nhấp.",
      button: "Mở Lexio",
      note: "Không cần đăng ký.",
    },
    footer: {
      tagline: "Học tiếng Anh, mỗi lần một từ.",
      product: "Sản phẩm",
      rights: "Bảo lưu mọi quyền.",
    },
  },

  dashboard: {
    greetingMorning: "Chào buổi sáng",
    greetingAfternoon: "Chào buổi chiều",
    greetingEvening: "Chào buổi tối",
    welcomeTitle: "Chào mừng đến với Lexio",
    welcomeDescription:
      "Xây dựng vốn từ nhớ lâu. Tạo một bộ thẻ, thêm từ bằng AI, và ôn chúng theo lịch thông minh.",
    generateWithAi: "Tạo từ bằng AI",
    createDeck: "Tạo bộ thẻ",
    readyOne: "thẻ sẵn sàng để ôn",
    readyMany: "thẻ sẵn sàng để ôn",
    caughtUp: "Bạn đã ôn hết rồi",
    subReady: "Vài phút mỗi ngày giúp từ vựng luôn tươi mới.",
    subCaughtUp: "Hiện không có thẻ đến hạn — thêm từ mới hoặc nghỉ một chút.",
    studyNow: "Học ngay",
    nothingDue: "Không có thẻ đến hạn",
    dueToday: "Đến hạn hôm nay",
    newAvailable: "Thẻ mới",
    dayStreak: "Chuỗi ngày",
    keepGoing: "Tiếp tục nào!",
    startStreak: "Học để bắt đầu chuỗi ngày",
    retention: "Tỷ lệ ghi nhớ",
    yourDecks: "Bộ thẻ của bạn",
    allDecks: "Tất cả bộ thẻ",
    cardsOffline: "thẻ · hoạt động hoàn toàn offline",
  },
};
