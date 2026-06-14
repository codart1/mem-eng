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

  common: {
    cancel: "Hủy",
    save: "Lưu",
    saveChanges: "Lưu thay đổi",
    saving: "Đang lưu…",
    working: "Đang xử lý…",
    edit: "Sửa",
    delete: "Xóa",
    confirm: "Xác nhận",
    synonyms: "Từ đồng nghĩa",
    antonyms: "Từ trái nghĩa",
  },

  rating: {
    again: "Lại",
    hard: "Khó",
    good: "Tốt",
    easy: "Dễ",
  },

  cardState: {
    new: "Mới",
    learning: "Đang học",
    relearning: "Học lại",
    review: "Ôn tập",
    dueNow: "đến hạn",
    inTime: "sau {time}",
  },

  decks: {
    title: "Bộ thẻ",
    description: "Sắp xếp vốn từ của bạn thành những bộ sưu tập tập trung.",
    newDeck: "Bộ thẻ mới",
    emptyTitle: "Chưa có bộ thẻ nào",
    emptyDescription: "Tạo bộ thẻ đầu tiên, rồi thêm từ thủ công hoặc bằng AI.",
    createDeck: "Tạo bộ thẻ",
  },

  deckCard: {
    options: "Tùy chọn bộ thẻ",
    cards: "thẻ",
    due: "đến hạn",
    new: "mới",
    study: "Học",
    allDone: "Đã xong",
    browse: "Xem",
    deleteTitle: 'Xóa "{name}"?',
    deleteDescription: "Bộ thẻ này và các thẻ trong đó sẽ bị xóa. Không thể hoàn tác.",
    deleteConfirm: "Xóa bộ thẻ",
    deleted: "Đã xóa bộ thẻ",
  },

  deckDialog: {
    editTitle: "Sửa bộ thẻ",
    newTitle: "Bộ thẻ mới",
    description: "Bộ thẻ nhóm những từ liên quan. Chọn một màu để phân biệt chúng.",
    name: "Tên",
    namePlaceholder: "vd. Từ vựng IELTS",
    descLabel: "Mô tả",
    descPlaceholder: "Tùy chọn — bộ thẻ này dùng để làm gì?",
    color: "Màu",
    createDeck: "Tạo bộ thẻ",
    nameRequired: "Vui lòng đặt tên cho bộ thẻ.",
    updated: "Đã cập nhật bộ thẻ",
    created: "Đã tạo bộ thẻ",
    saveError: "Có lỗi khi lưu bộ thẻ.",
  },

  deckDetail: {
    notFoundTitle: "Không tìm thấy bộ thẻ",
    notFoundDescription: "Bộ thẻ này có thể đã bị xóa.",
    backToDecks: "Quay lại bộ thẻ",
    decks: "Bộ thẻ",
    editDeck: "Sửa bộ thẻ",
    addCard: "Thêm thẻ",
    study: "Học",
    emptyTitle: "Bộ thẻ này trống",
    emptyDescription: "Thêm từ thủ công, hoặc tạo ngay lập tức bằng AI.",
    addManually: "Thêm thủ công",
    useAi: "Dùng AI",
    search: "Tìm trong {count} thẻ…",
    noMatch: 'Không có thẻ nào khớp với "{query}".',
  },

  cardRow: {
    options: "Tùy chọn thẻ",
    deleteTitle: 'Xóa "{word}"?',
    deleteConfirm: "Xóa",
    deleted: "Đã xóa thẻ",
  },

  cardDialog: {
    editTitle: "Sửa thẻ",
    newTitle: "Thẻ mới",
    description: "Điền thông tin của từ. Mỗi ví dụ một dòng.",
    word: "Từ",
    pronunciation: "Phát âm",
    partOfSpeech: "Từ loại",
    posPlaceholder: "danh từ, động từ…",
    cefr: "Trình độ CEFR",
    cefrPlaceholder: "A1–C2",
    definition: "Định nghĩa",
    examples: "Ví dụ",
    examplesPlaceholder: "Mỗi câu ví dụ một dòng",
    commaSeparated: "phân tách bằng dấu phẩy",
    memoryHook: "Mẹo ghi nhớ",
    mnemonicPlaceholder: "Mẹo ghi nhớ (tùy chọn)",
    addCard: "Thêm thẻ",
    required: "Cần có từ và định nghĩa.",
    updated: "Đã cập nhật thẻ",
    added: 'Đã thêm "{word}"',
    saveError: "Không thể lưu thẻ.",
  },

  create: {
    title: "Tạo thẻ",
    description: "Gõ một từ và để AI dựng thẻ, hoặc tự nhập thông tin chi tiết.",
    withAi: "Bằng AI",
    manual: "Thủ công",
  },

  wordLookup: {
    placeholder: "Gõ bất kỳ từ tiếng Anh nào — vd. “serendipity”",
    generate: "Tạo",
    noDeckTitle: "Tạo một bộ thẻ để lưu từ",
    noDeckDescription: "Bạn cần ít nhất một bộ thẻ trước khi thêm thẻ.",
    newDeck: "Bộ thẻ mới",
  },

  manualCreate: {
    noDeckTitle: "Chưa có bộ thẻ nào",
    noDeckDescription: "Hãy tạo một bộ thẻ trước, rồi thêm thẻ vào đó.",
    newDeck: "Bộ thẻ mới",
    deck: "Bộ thẻ",
    chooseDeck: "Chọn một bộ thẻ",
    newCard: "Thẻ mới",
  },

  genPreview: {
    otherSenses: "Các nghĩa khác",
    chooseDeck: "Chọn một bộ thẻ",
    add: "Thêm vào bộ thẻ",
    added: "Đã thêm",
    pickDeck: "Hãy chọn một bộ thẻ trước.",
    addedToast: 'Đã thêm "{word}"',
    addError: "Không thể thêm thẻ.",
  },

  study: {
    showAnswer: "Hiện đáp án",
    caughtUpTitle: "Bạn đã ôn hết rồi",
    caughtUpDescription: "Hiện không có thẻ nào đến hạn. Thêm từ mới hoặc quay lại sau.",
    addWords: "Thêm từ",
    dashboard: "Tổng quan",
    revealAria: "Hiện định nghĩa",
    tapReveal: "Chạm hoặc nhấn Space để xem",
    endSession: "Kết thúc phiên",
    left: "còn {count}",
  },

  sessionSummary: {
    complete: "Hoàn thành phiên học",
    niceWork: "Làm tốt lắm — lịch ôn của bạn đã được cập nhật.",
    reviewed: "Đã ôn",
    accuracy: "Độ chính xác",
    time: "Thời gian",
    keepGoing: "Học tiếp",
    done: "Xong",
  },

  stats: {
    title: "Thống kê",
    description: "Theo dõi số lần ôn, tỷ lệ ghi nhớ và những gì sắp tới.",
    noDataTitle: "Chưa có dữ liệu",
    noDataDescription:
      "Khi bạn bắt đầu học, tiến trình và dự báo sẽ hiện ở đây.",
    totalReviews: "Tổng số lần ôn",
    matureCards: "Thẻ đã thuộc",
    dayStreak: "Chuỗi ngày",
    retention: "Tỷ lệ ghi nhớ",
    reviewsLast30: "Số lần ôn — 30 ngày qua",
    reviewsName: "Lần ôn",
    dueForecast14: "Dự báo đến hạn — 14 ngày tới",
    dueName: "Đến hạn",
    cardMaturity: "Độ thuần thục của thẻ",
    new: "Mới",
    learning: "Đang học",
    review: "Ôn tập",
  },

  settings: {
    title: "Cài đặt",
    description: "Cá nhân hóa Lexio và quản lý dữ liệu của bạn.",
    appearance: "Giao diện",
    appearanceDesc: "Chọn cách Lexio hiển thị.",
    themeSystem: "Hệ thống",
    themeLight: "Sáng",
    themeDark: "Tối",
    scheduling: "Lập lịch",
    schedulingDesc: "Tinh chỉnh thuật toán FSRS và khối lượng học mỗi ngày.",
    targetRetention: "Tỷ lệ ghi nhớ mục tiêu",
    retentionHint: "Tỷ lệ ghi nhớ cao hơn nghĩa là ôn thường xuyên hơn. 90% là mức mặc định tốt.",
    newPerDay: "Thẻ mới / ngày",
    reviewsPerDay: "Lượt ôn / ngày (0 = ∞)",
    intervalFuzz: "Ngẫu nhiên khoảng cách",
    fuzzHint: "Làm khoảng cách ôn ngẫu nhiên một chút để các lượt ôn không dồn cục.",
    saveScheduling: "Lưu lịch",
    schedulingSaved: "Đã lưu cài đặt lập lịch",
    ai: "Tạo bằng AI",
    aiDesc:
      "Lexio tạo thẻ bằng Claude Haiku. Thêm khóa API Anthropic của riêng bạn để dùng tài khoản của mình — khóa chỉ được lưu trên thiết bị này.",
    apiKeyLabel: "Khóa API Anthropic",
    apiKeyHint:
      "Tùy chọn. Không có khóa, việc tạo thẻ sẽ dùng khóa của máy chủ nếu được cấu hình. Một từ thông thường tốn một phần nhỏ của xu.",
    apiKeySaved: "Đã lưu khóa API",
    apiKeyCleared: "Đã xóa khóa API",
    data: "Dữ liệu của bạn",
    dataDesc: "Mọi thứ nằm trong trình duyệt của bạn. Sao lưu hoặc chuyển giữa các thiết bị.",
    exportBackup: "Xuất bản sao lưu",
    importBackup: "Nhập bản sao lưu",
    backupDownloaded: "Đã tải bản sao lưu",
    backupImported: "Đã nhập bản sao lưu",
    importInvalid: "Không phải bản sao lưu Lexio hợp lệ.",
    importFailed: "Nhập thất bại.",
    resetEverything: "Đặt lại mọi thứ",
    resetEverythingDesc: "Xóa vĩnh viễn toàn bộ bộ thẻ, thẻ và lịch sử.",
    reset: "Đặt lại",
    resetTitle: "Đặt lại toàn bộ dữ liệu?",
    resetDescription:
      "Thao tác này xóa mọi bộ thẻ, thẻ và nhật ký ôn tập trên thiết bị này. Không thể hoàn tác.",
    resetConfirm: "Xóa tất cả",
  },

  generate: {
    failed: "Tạo thất bại. Vui lòng thử lại.",
  },
};
