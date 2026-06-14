// English dictionary — the source of truth. The Vietnamese dictionary is typed
// as `typeof en`, so adding a key here forces a matching translation there.

export const en = {
  nav: {
    dashboard: "Dashboard",
    decks: "Decks",
    study: "Study",
    create: "Create",
    stats: "Stats",
    settings: "Settings",
    offlineFirst: "Offline-first",
    toggleTheme: "Toggle theme",
  },

  language: {
    label: "Language",
    description: "Choose the language for Lexio's interface.",
  },

  landing: {
    nav: {
      features: "Features",
      how: "How it works",
      faq: "FAQ",
      open: "Open app",
      cta: "Start free",
    },
    hero: {
      badge: "Spaced repetition · AI flashcards · Offline",
      title: "Learn English vocabulary that finally sticks.",
      subtitle:
        "Lexio turns the words you keep forgetting into lasting memory — with AI-built flashcards and a review schedule tuned to how your brain actually works.",
      ctaPrimary: "Start learning — it's free",
      ctaSecondary: "See how it works",
      note: "No sign-up. Works offline. Your data stays on your device.",
      cardWord: "ephemeral",
      cardPos: "adjective",
      cardDef: "lasting for a very short time.",
      cardExample: "“Fame in this industry can be ephemeral.”",
      cardHint: "Tap to reveal",
      again: "Again",
      good: "Good",
      easy: "Easy",
      floatDue: "due today",
      floatStreak: "7-day streak",
      floatKeep: "keep it up",
    },
    stats: {
      retention: "average retention",
      offline: "works offline",
      free: "to start",
      freeValue: "Free",
    },
    problem: {
      kicker: "The problem",
      title: "You look words up. Then you forget them.",
      subtitle:
        "Learning vocabulary isn't the hard part — keeping it is. Most methods quietly work against your memory.",
      items: [
        {
          title: "The forgetting curve wins",
          body: "Without timely review, you lose most new words within days. Cramming feels productive, but it fades almost as fast as it forms.",
        },
        {
          title: "Word lists don't adapt",
          body: "Notebooks and static lists never tell you what to review or when. So you re-read everything, or — more often — nothing at all.",
        },
        {
          title: "Generic apps, generic words",
          body: "Mass-market apps drill the same tourist phrases on everyone. They don't learn the words that matter for your exam, job, or reading.",
        },
      ],
    },
    how: {
      kicker: "How Lexio works",
      title: "Memory, on a schedule.",
      subtitle:
        "Three simple steps turn fleeting encounters with new words into durable, recallable knowledge.",
      steps: [
        {
          title: "Add words in seconds",
          body: "Type a word and let Claude build a rich card — definition, real examples, pronunciation, and nuance. Or write your own by hand.",
        },
        {
          title: "Review at the perfect moment",
          body: "Lexio uses FSRS, a modern spaced-repetition algorithm, to surface each card right before you'd forget it — never too early, never too late.",
        },
        {
          title: "Watch it stick",
          body: "Rate how well you recalled, and the schedule adapts. Track streaks and retention as your vocabulary compounds, a few minutes a day.",
        },
      ],
    },
    features: {
      kicker: "Everything you need",
      title: "Small app. Serious memory science.",
      subtitle:
        "All the substance of a power-user flashcard tool, with none of the friction.",
      items: [
        {
          title: "AI-built flashcards",
          body: "Definitions, example sentences, and usage notes generated on demand with Claude.",
        },
        {
          title: "FSRS scheduling",
          body: "State-of-the-art spaced repetition that adapts each interval to your memory.",
        },
        {
          title: "Works fully offline",
          body: "Install it as an app and study on the subway, on a flight, anywhere.",
        },
        {
          title: "Your data, your device",
          body: "Everything lives in your browser. No account, and a one-click backup anytime.",
        },
        {
          title: "Decks for everything",
          body: "Organize by exam, topic, or book — color-coded, searchable, and yours.",
        },
        {
          title: "Insightful stats",
          body: "Retention, reviews, and streaks, visualized so you stay motivated.",
        },
      ],
    },
    showcase: {
      kicker: "A closer look",
      title: "Designed to make reviewing a pleasure.",
      subtitle:
        "A calm, focused interface that gets out of the way — in light or dark, on any screen.",
      points: [
        "One-tap reviews with a clean flip animation",
        "Smart daily queue: due, new, and learning cards",
        "Streaks and retention that keep you coming back",
      ],
    },
    faq: {
      kicker: "Questions",
      title: "Everything else you might wonder.",
      items: [
        {
          q: "Is it really free?",
          a: "Yes. Lexio is free to use. AI card generation uses a small amount of credits — you can add your own Anthropic API key in Settings to use your account.",
        },
        {
          q: "Do I need an account?",
          a: "No account and no sign-up. Your decks, cards, and progress are stored locally on your device.",
        },
        {
          q: "Does it really work offline?",
          a: "Yes. Install Lexio as an app and it works fully offline. Only AI card generation needs a connection — everything else is local.",
        },
        {
          q: "What is FSRS?",
          a: "The Free Spaced Repetition Scheduler — a modern algorithm that predicts when you're about to forget a card and schedules the review just in time.",
        },
        {
          q: "Where is my data stored?",
          a: "Entirely in your browser (IndexedDB). You can export a full backup as a file and import it on another device whenever you like.",
        },
      ],
    },
    cta: {
      title: "Start building a vocabulary that lasts.",
      subtitle: "Free, offline, and entirely yours. Your first deck is one click away.",
      button: "Open Lexio",
      note: "No sign-up required.",
    },
    footer: {
      tagline: "Learn English, one word at a time.",
      product: "Product",
      rights: "All rights reserved.",
    },
  },

  dashboard: {
    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",
    welcomeTitle: "Welcome to Lexio",
    welcomeDescription:
      "Build vocabulary that sticks. Create a deck, add words with AI, and review them on a smart schedule.",
    generateWithAi: "Generate words with AI",
    createDeck: "Create a deck",
    readyOne: "card ready to review",
    readyMany: "cards ready to review",
    caughtUp: "You're all caught up",
    subReady: "A few minutes a day keeps vocabulary fresh.",
    subCaughtUp: "Nothing due right now — add new words or take a break.",
    studyNow: "Study now",
    nothingDue: "Nothing due",
    dueToday: "Due today",
    newAvailable: "New available",
    dayStreak: "Day streak",
    keepGoing: "Keep it going!",
    startStreak: "Study to start a streak",
    retention: "Retention",
    yourDecks: "Your decks",
    allDecks: "All decks",
    cardsOffline: "cards · works fully offline",
  },

  common: {
    cancel: "Cancel",
    save: "Save",
    saveChanges: "Save changes",
    saving: "Saving…",
    working: "Working…",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    synonyms: "Synonyms",
    antonyms: "Antonyms",
  },

  rating: {
    again: "Again",
    hard: "Hard",
    good: "Good",
    easy: "Easy",
  },

  cardState: {
    new: "New",
    learning: "Learning",
    relearning: "Relearning",
    review: "Review",
    dueNow: "due now",
    inTime: "in {time}",
  },

  decks: {
    title: "Decks",
    description: "Organize your vocabulary into focused collections.",
    newDeck: "New deck",
    emptyTitle: "No decks yet",
    emptyDescription: "Create your first deck, then add words manually or with AI.",
    createDeck: "Create a deck",
  },

  deckCard: {
    options: "Deck options",
    cards: "cards",
    due: "due",
    new: "new",
    study: "Study",
    allDone: "All done",
    browse: "Browse",
    deleteTitle: 'Delete "{name}"?',
    deleteDescription: "This deck and its cards will be removed. This can't be undone.",
    deleteConfirm: "Delete deck",
    deleted: "Deck deleted",
  },

  deckDialog: {
    editTitle: "Edit deck",
    newTitle: "New deck",
    description: "Decks group related words. Pick a color to tell them apart.",
    name: "Name",
    namePlaceholder: "e.g. IELTS Vocabulary",
    descLabel: "Description",
    descPlaceholder: "Optional — what's this deck for?",
    color: "Color",
    createDeck: "Create deck",
    nameRequired: "Please give the deck a name.",
    updated: "Deck updated",
    created: "Deck created",
    saveError: "Something went wrong saving the deck.",
  },

  deckDetail: {
    notFoundTitle: "Deck not found",
    notFoundDescription: "This deck may have been deleted.",
    backToDecks: "Back to decks",
    decks: "Decks",
    editDeck: "Edit deck",
    addCard: "Add card",
    study: "Study",
    emptyTitle: "This deck is empty",
    emptyDescription: "Add words manually, or generate them instantly with AI.",
    addManually: "Add manually",
    useAi: "Use AI",
    search: "Search {count} cards…",
    noMatch: 'No cards match "{query}".',
  },

  cardRow: {
    options: "Card options",
    deleteTitle: 'Delete "{word}"?',
    deleteConfirm: "Delete",
    deleted: "Card deleted",
  },

  cardDialog: {
    editTitle: "Edit card",
    newTitle: "New card",
    description: "Fill in the word details. Examples go one per line.",
    word: "Word",
    pronunciation: "Pronunciation",
    partOfSpeech: "Part of speech",
    posPlaceholder: "noun, verb…",
    cefr: "CEFR level",
    cefrPlaceholder: "A1–C2",
    definition: "Definition",
    examples: "Examples",
    examplesPlaceholder: "One example sentence per line",
    commaSeparated: "comma, separated",
    memoryHook: "Memory hook",
    mnemonicPlaceholder: "Optional mnemonic",
    addCard: "Add card",
    required: "A word and a definition are required.",
    updated: "Card updated",
    added: 'Added "{word}"',
    saveError: "Could not save the card.",
  },

  create: {
    title: "Create cards",
    description: "Type a word and let AI build the card, or enter the details yourself.",
    withAi: "With AI",
    manual: "Manual",
  },

  wordLookup: {
    placeholder: "Type any English word — e.g. “serendipity”",
    generate: "Generate",
    noDeckTitle: "Create a deck to save words",
    noDeckDescription: "You'll need at least one deck before adding cards.",
    newDeck: "New deck",
  },

  manualCreate: {
    noDeckTitle: "No decks yet",
    noDeckDescription: "Create a deck first, then add cards to it.",
    newDeck: "New deck",
    deck: "Deck",
    chooseDeck: "Choose a deck",
    newCard: "New card",
  },

  genPreview: {
    otherSenses: "Other senses",
    chooseDeck: "Choose a deck",
    add: "Add to deck",
    added: "Added",
    pickDeck: "Pick a deck first.",
    addedToast: 'Added "{word}"',
    addError: "Could not add the card.",
  },

  study: {
    showAnswer: "Show answer",
    caughtUpTitle: "You're all caught up",
    caughtUpDescription: "No cards are due right now. Add new words or come back later.",
    addWords: "Add words",
    dashboard: "Dashboard",
    revealAria: "Reveal definition",
    tapReveal: "Tap or press Space to reveal",
    endSession: "End session",
    left: "{count} left",
  },

  sessionSummary: {
    complete: "Session complete",
    niceWork: "Nice work — your schedule is updated.",
    reviewed: "Reviewed",
    accuracy: "Accuracy",
    time: "Time",
    keepGoing: "Keep going",
    done: "Done",
  },

  stats: {
    title: "Stats",
    description: "Track your reviews, retention, and what's coming up.",
    noDataTitle: "No data yet",
    noDataDescription:
      "Once you start studying, your progress and forecast will show up here.",
    totalReviews: "Total reviews",
    matureCards: "Mature cards",
    dayStreak: "Day streak",
    retention: "Retention",
    reviewsLast30: "Reviews — last 30 days",
    reviewsName: "Reviews",
    dueForecast14: "Due forecast — next 14 days",
    dueName: "Due",
    cardMaturity: "Card maturity",
    new: "New",
    learning: "Learning",
    review: "Review",
  },

  settings: {
    title: "Settings",
    description: "Personalize Lexio and manage your data.",
    appearance: "Appearance",
    appearanceDesc: "Choose how Lexio looks.",
    themeSystem: "System",
    themeLight: "Light",
    themeDark: "Dark",
    scheduling: "Scheduling",
    schedulingDesc: "Tune the FSRS algorithm and your daily workload.",
    targetRetention: "Target retention",
    retentionHint: "Higher retention means more frequent reviews. 90% is a good default.",
    newPerDay: "New cards / day",
    reviewsPerDay: "Reviews / day (0 = ∞)",
    intervalFuzz: "Interval fuzz",
    fuzzHint: "Slightly randomize intervals so reviews don't clump.",
    saveScheduling: "Save scheduling",
    schedulingSaved: "Scheduling settings saved",
    ai: "AI generation",
    aiDesc:
      "Lexio generates cards with Claude Haiku. Add your own Anthropic API key to use your account — it's stored only on this device.",
    apiKeyLabel: "Anthropic API key",
    apiKeyHint:
      "Optional. Without a key, generation uses the server's key if one is configured. A typical word costs a fraction of a cent.",
    apiKeySaved: "API key saved",
    apiKeyCleared: "API key cleared",
    data: "Your data",
    dataDesc: "Everything lives in your browser. Back it up or move it between devices.",
    exportBackup: "Export backup",
    importBackup: "Import backup",
    backupDownloaded: "Backup downloaded",
    backupImported: "Backup imported",
    importInvalid: "Not a valid Lexio backup.",
    importFailed: "Import failed.",
    resetEverything: "Reset everything",
    resetEverythingDesc: "Permanently delete all decks, cards, and history.",
    reset: "Reset",
    resetTitle: "Reset all data?",
    resetDescription:
      "This deletes every deck, card, and review log on this device. This cannot be undone.",
    resetConfirm: "Delete everything",
  },

  generate: {
    failed: "Generation failed. Please try again.",
  },
};

export type Dictionary = typeof en;
