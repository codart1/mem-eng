"use client";

import { useParams } from "next/navigation";
import { StudySession } from "@/components/study/study-session";

export default function DeckStudyPage() {
  const params = useParams<{ deckId: string }>();
  return <StudySession deckId={params.deckId} />;
}
