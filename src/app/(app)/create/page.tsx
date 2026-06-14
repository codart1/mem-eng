"use client";

import { Sparkles, PenLine } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WordLookupPanel } from "@/components/create/word-lookup-panel";
import { ManualCreatePanel } from "@/components/create/manual-create-panel";

export default function CreatePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create cards"
        description="Type a word and let AI build the card, or enter the details yourself."
      />

      <Tabs defaultValue="ai" className="space-y-5">
        <TabsList>
          <TabsTrigger value="ai">
            <Sparkles className="size-4" /> With AI
          </TabsTrigger>
          <TabsTrigger value="manual">
            <PenLine className="size-4" /> Manual
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ai">
          <WordLookupPanel />
        </TabsContent>
        <TabsContent value="manual">
          <ManualCreatePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
