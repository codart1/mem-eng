import type { DeckColor } from "@/lib/types";

/**
 * Staff-curated word sets ("Featured sets"). These are prepared here on the
 * server and exposed through `GET /api/word-sets`; the client fetches them and
 * lets the user add any set as a new deck (see the Discover page). The content
 * is intentionally English-only — it's vocabulary learning material, like the
 * cards a user creates themselves.
 */
export interface WordSetEntry {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
  examples?: string[];
  synonyms?: string[];
  antonyms?: string[];
  cefr?: string;
  mnemonic?: string;
}

export interface FeaturedWordSet {
  id: string;
  title: string;
  description: string;
  /** Human-readable difficulty band, e.g. "B2–C1". */
  level: string;
  /** Deck accent applied when the set is added. */
  color: DeckColor;
  words: WordSetEntry[];
}

export const FEATURED_WORD_SETS: FeaturedWordSet[] = [
  {
    id: "ielts-academic-essentials",
    title: "IELTS Academic Essentials",
    description:
      "High-frequency academic words that show up again and again in IELTS reading and writing.",
    level: "B2–C1",
    color: "violet",
    words: [
      {
        word: "substantial",
        phonetic: "/səbˈstænʃ(ə)l/",
        partOfSpeech: "adjective",
        definition: "Large in size, value, or importance.",
        examples: ["The project required a substantial investment of time."],
        synonyms: ["considerable", "significant", "sizeable"],
        antonyms: ["minor", "negligible"],
        cefr: "B2",
      },
      {
        word: "phenomenon",
        phonetic: "/fəˈnɒmɪnən/",
        partOfSpeech: "noun",
        definition: "A fact or situation that is observed to exist or happen.",
        examples: ["Global warming is a well-documented phenomenon."],
        synonyms: ["occurrence", "event"],
        cefr: "C1",
        mnemonic: "Plural is 'phenomena' — one phenomenon, many phenomena.",
      },
      {
        word: "advocate",
        phonetic: "/ˈædvəkeɪt/",
        partOfSpeech: "verb",
        definition: "To publicly support or recommend a particular cause or policy.",
        examples: ["Many experts advocate a balanced approach to the issue."],
        synonyms: ["support", "champion", "endorse"],
        antonyms: ["oppose"],
        cefr: "C1",
      },
      {
        word: "diminish",
        phonetic: "/dɪˈmɪnɪʃ/",
        partOfSpeech: "verb",
        definition: "To become or make smaller, weaker, or less important.",
        examples: ["The medicine helped diminish the pain."],
        synonyms: ["decrease", "reduce", "lessen"],
        antonyms: ["increase", "grow"],
        cefr: "B2",
      },
      {
        word: "inevitable",
        phonetic: "/ɪnˈevɪtəb(ə)l/",
        partOfSpeech: "adjective",
        definition: "Certain to happen; unavoidable.",
        examples: ["With such poor planning, failure was inevitable."],
        synonyms: ["unavoidable", "certain"],
        antonyms: ["avoidable", "uncertain"],
        cefr: "B2",
      },
      {
        word: "comprehensive",
        phonetic: "/ˌkɒmprɪˈhensɪv/",
        partOfSpeech: "adjective",
        definition: "Complete; including all or nearly all elements or aspects.",
        examples: ["The report offers a comprehensive overview of the market."],
        synonyms: ["thorough", "complete", "exhaustive"],
        antonyms: ["partial", "limited"],
        cefr: "B2",
      },
      {
        word: "underlying",
        phonetic: "/ˌʌndəˈlaɪɪŋ/",
        partOfSpeech: "adjective",
        definition: "Important but not immediately obvious; lying beneath the surface.",
        examples: ["We must address the underlying causes of poverty."],
        synonyms: ["fundamental", "basic", "root"],
        cefr: "C1",
      },
      {
        word: "constitute",
        phonetic: "/ˈkɒnstɪtjuːt/",
        partOfSpeech: "verb",
        definition: "To be or be equivalent to; to form or make up something.",
        examples: ["Women constitute nearly half of the workforce."],
        synonyms: ["form", "make up", "comprise"],
        cefr: "C1",
      },
    ],
  },
  {
    id: "business-workplace-english",
    title: "Business & Workplace English",
    description:
      "Practical vocabulary for meetings, emails, and getting things done at work.",
    level: "B1–B2",
    color: "sky",
    words: [
      {
        word: "deadline",
        phonetic: "/ˈdedlaɪn/",
        partOfSpeech: "noun",
        definition: "The latest time or date by which something must be finished.",
        examples: ["We're working hard to meet the deadline."],
        synonyms: ["due date", "time limit"],
        cefr: "B1",
      },
      {
        word: "delegate",
        phonetic: "/ˈdelɪɡeɪt/",
        partOfSpeech: "verb",
        definition: "To give a task or responsibility to someone else.",
        examples: ["A good manager knows how to delegate work."],
        synonyms: ["assign", "hand over", "entrust"],
        cefr: "B2",
      },
      {
        word: "stakeholder",
        phonetic: "/ˈsteɪkhəʊldə/",
        partOfSpeech: "noun",
        definition: "A person or group with an interest or concern in something.",
        examples: ["We consulted all the stakeholders before deciding."],
        synonyms: ["party", "investor"],
        cefr: "B2",
      },
      {
        word: "leverage",
        phonetic: "/ˈliːvərɪdʒ/",
        partOfSpeech: "verb",
        definition: "To use something to maximum advantage.",
        examples: ["The company leveraged its brand to enter new markets."],
        synonyms: ["exploit", "use", "capitalize on"],
        cefr: "B2",
      },
      {
        word: "feasible",
        phonetic: "/ˈfiːzəb(ə)l/",
        partOfSpeech: "adjective",
        definition: "Possible to do easily or conveniently; practical.",
        examples: ["The plan is feasible within our current budget."],
        synonyms: ["viable", "practical", "achievable"],
        antonyms: ["impractical", "unworkable"],
        cefr: "B2",
      },
      {
        word: "streamline",
        phonetic: "/ˈstriːmlaɪn/",
        partOfSpeech: "verb",
        definition: "To make a process simpler, faster, or more efficient.",
        examples: ["New software helped streamline our workflow."],
        synonyms: ["simplify", "optimize"],
        cefr: "B2",
      },
      {
        word: "consensus",
        phonetic: "/kənˈsensəs/",
        partOfSpeech: "noun",
        definition: "General agreement among a group of people.",
        examples: ["The team reached a consensus after a long discussion."],
        synonyms: ["agreement", "accord"],
        antonyms: ["disagreement"],
        cefr: "B2",
      },
      {
        word: "prioritize",
        phonetic: "/praɪˈɒrɪtaɪz/",
        partOfSpeech: "verb",
        definition: "To decide which tasks are most important and deal with them first.",
        examples: ["You need to prioritize your tasks to meet the deadline."],
        synonyms: ["rank", "order"],
        cefr: "B2",
      },
    ],
  },
  {
    id: "everyday-phrasal-verbs",
    title: "Everyday Phrasal Verbs",
    description:
      "The common multi-word verbs native speakers use constantly in casual conversation.",
    level: "A2–B1",
    color: "amber",
    words: [
      {
        word: "get along",
        partOfSpeech: "phrasal verb",
        definition: "To have a friendly relationship with someone.",
        examples: ["I get along well with my new colleagues."],
        synonyms: ["get on", "be friendly"],
        cefr: "A2",
      },
      {
        word: "put off",
        partOfSpeech: "phrasal verb",
        definition: "To postpone or delay something.",
        examples: ["Don't put off your homework until the last minute."],
        synonyms: ["postpone", "delay", "defer"],
        cefr: "B1",
      },
      {
        word: "figure out",
        partOfSpeech: "phrasal verb",
        definition: "To understand or solve something after thinking about it.",
        examples: ["I finally figured out how to fix the bug."],
        synonyms: ["work out", "solve", "understand"],
        cefr: "B1",
      },
      {
        word: "run out",
        partOfSpeech: "phrasal verb",
        definition: "To use up all of something so none is left.",
        examples: ["We've run out of milk."],
        synonyms: ["use up", "deplete"],
        cefr: "A2",
      },
      {
        word: "come up with",
        partOfSpeech: "phrasal verb",
        definition: "To think of or produce an idea or plan.",
        examples: ["She came up with a brilliant solution."],
        synonyms: ["devise", "invent", "think of"],
        cefr: "B1",
      },
      {
        word: "look forward to",
        partOfSpeech: "phrasal verb",
        definition: "To feel pleased and excited about something that is going to happen.",
        examples: ["I'm looking forward to the weekend."],
        synonyms: ["anticipate", "await"],
        cefr: "B1",
      },
      {
        word: "give up",
        partOfSpeech: "phrasal verb",
        definition: "To stop trying to do something; to quit.",
        examples: ["Never give up on your dreams."],
        synonyms: ["quit", "surrender", "abandon"],
        antonyms: ["persist", "persevere"],
        cefr: "A2",
      },
      {
        word: "turn down",
        partOfSpeech: "phrasal verb",
        definition: "To refuse or reject an offer or request.",
        examples: ["He turned down the job offer."],
        synonyms: ["reject", "decline", "refuse"],
        antonyms: ["accept"],
        cefr: "B1",
      },
    ],
  },
  {
    id: "vivid-descriptive-adjectives",
    title: "Vivid Descriptive Adjectives",
    description:
      "Precise, colorful adjectives to make your speaking and writing far more expressive.",
    level: "B2–C1",
    color: "rose",
    words: [
      {
        word: "meticulous",
        phonetic: "/məˈtɪkjələs/",
        partOfSpeech: "adjective",
        definition: "Showing great attention to detail; very careful and precise.",
        examples: ["She kept meticulous notes during the experiment."],
        synonyms: ["thorough", "scrupulous", "painstaking"],
        antonyms: ["careless", "sloppy"],
        cefr: "C1",
      },
      {
        word: "vivid",
        phonetic: "/ˈvɪvɪd/",
        partOfSpeech: "adjective",
        definition: "Producing powerful, clear images in the mind; bright and intense.",
        examples: ["He gave a vivid description of the city."],
        synonyms: ["striking", "graphic", "intense"],
        antonyms: ["dull", "vague"],
        cefr: "B2",
      },
      {
        word: "serene",
        phonetic: "/səˈriːn/",
        partOfSpeech: "adjective",
        definition: "Calm, peaceful, and untroubled.",
        examples: ["The lake was serene in the early morning light."],
        synonyms: ["peaceful", "tranquil", "calm"],
        antonyms: ["agitated", "turbulent"],
        cefr: "C1",
      },
      {
        word: "robust",
        phonetic: "/rəʊˈbʌst/",
        partOfSpeech: "adjective",
        definition: "Strong and healthy, or able to withstand difficult conditions.",
        examples: ["The economy remained robust despite the crisis."],
        synonyms: ["strong", "sturdy", "resilient"],
        antonyms: ["fragile", "weak"],
        cefr: "B2",
      },
      {
        word: "intricate",
        phonetic: "/ˈɪntrɪkət/",
        partOfSpeech: "adjective",
        definition: "Very detailed and complicated; full of small connected parts.",
        examples: ["The watch has an intricate mechanism."],
        synonyms: ["complex", "elaborate", "detailed"],
        antonyms: ["simple", "plain"],
        cefr: "C1",
      },
      {
        word: "candid",
        phonetic: "/ˈkændɪd/",
        partOfSpeech: "adjective",
        definition: "Truthful and straightforward; frank.",
        examples: ["She was candid about her mistakes."],
        synonyms: ["frank", "honest", "forthright"],
        antonyms: ["evasive", "guarded"],
        cefr: "B2",
      },
      {
        word: "tenacious",
        phonetic: "/təˈneɪʃəs/",
        partOfSpeech: "adjective",
        definition: "Holding firmly to a purpose; determined and persistent.",
        examples: ["Her tenacious effort finally paid off."],
        synonyms: ["persistent", "determined", "dogged"],
        antonyms: ["irresolute"],
        cefr: "C1",
      },
      {
        word: "lucid",
        phonetic: "/ˈluːsɪd/",
        partOfSpeech: "adjective",
        definition: "Clear and easy to understand; thinking clearly.",
        examples: ["He gave a lucid explanation of the theory."],
        synonyms: ["clear", "coherent", "intelligible"],
        antonyms: ["confusing", "muddled"],
        cefr: "C1",
      },
    ],
  },
];
