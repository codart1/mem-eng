"use client";

import { Sparkles, PenLine } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WordLookupPanel } from "@/components/create/word-lookup-panel";
import { ManualCreatePanel } from "@/components/create/manual-create-panel";
import { useT } from "@/lib/i18n";

export default function CreatePage() {
  const t = useT();
  return (
    <div className="space-y-6">
      <PageHeader title={t.create.title} description={t.create.description} />

      <Tabs defaultValue="ai" className="space-y-5">
        <TabsList>
          <TabsTrigger value="ai">
            <Sparkles className="size-4" /> {t.create.withAi}
          </TabsTrigger>
          <TabsTrigger value="manual">
            <PenLine className="size-4" /> {t.create.manual}
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
