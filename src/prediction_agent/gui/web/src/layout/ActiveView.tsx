import { useEffect, useMemo, useState } from "react";
import { fetchText } from "@/lib/server";
import { CodeViewerCard } from "@/components/CodeViewerCard";
import { SessionLogCard, eventsToLogs } from "@/components/SessionLogCard";
import type { LogEntry } from "@/components/SessionLogCard";
import type { WatchEvent } from "@/hooks/useWatchSocket";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Database, TrendingUp, FileText } from "lucide-react";

interface ActiveViewProps {
  events: WatchEvent[];
  offline: boolean;
}

/** File-backed event types that get rendered as feed cards. */
const CARD_TYPES = new Set(["data", "prediction", "report"]);

const TYPE_META: Record<string, { label: string; icon: typeof Database }> = {
  data: { label: "data", icon: Database },
  prediction: { label: "prediction", icon: TrendingUp },
  report: { label: "report", icon: FileText },
};

interface FeedItem {
  relativePath: string;
  type: string;
  timestamp: string;
  previousContent: string | null;
}

/** Collapse events to the latest event per file, newest first. */
function toFeedItems(events: WatchEvent[]): FeedItem[] {
  const byPath = new Map<string, FeedItem>();
  for (const e of events) {
    if (!CARD_TYPES.has(e.type)) continue;
    byPath.set(e.relative_path, {
      relativePath: e.relative_path,
      type: e.type,
      timestamp: e.timestamp,
      previousContent: e.previous_content,
    });
  }
  return Array.from(byPath.values()).sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
}

export function ActiveView({ events, offline }: ActiveViewProps) {
  // Historical logs from file, refreshed whenever session.jsonl is broadcast.
  const [historicalLogs, setHistoricalLogs] = useState<LogEntry[]>([]);

  function parseSessionJsonl(text: string): LogEntry[] {
    return text
      .trim()
      .split("\n")
      .map((line) => {
        try {
          return JSON.parse(line) as LogEntry;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as LogEntry[];
  }

  useEffect(() => {
    fetchText("gui/logs/session.jsonl")
      .then((text) => {
        if (text) setHistoricalLogs(parseSessionJsonl(text));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const latest = [...events]
      .reverse()
      .find(
        (e) =>
          e.type === "log" &&
          e.relative_path === "gui/logs/session.jsonl" &&
          e.content,
      );
    if (latest?.content) setHistoricalLogs(parseSessionJsonl(latest.content));
  }, [events]);

  // Live logs derived from non-log file events.
  const liveLogs = useMemo(
    () => eventsToLogs(events.filter((e) => e.type !== "log")),
    [events],
  );
  const sessionLogs = useMemo(
    () => [...historicalLogs, ...liveLogs],
    [historicalLogs, liveLogs],
  );

  const feedItems = useMemo(() => toFeedItems(events), [events]);

  // Waiting placeholder when connected with no activity yet.
  if (!offline && feedItems.length === 0 && sessionLogs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Alert className="w-auto">
          <AlertTitle>Waiting for activity…</AlertTitle>
          <AlertDescription>
            The agent hasn&apos;t written any data yet. Fetched data,
            predictions, and reports will appear here live.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {offline && (
        <Alert className="w-full">
          <AlertTitle>Offline mode</AlertTitle>
          <AlertDescription>
            Showing previously generated data. Start the GUI server for live
            updates.
          </AlertDescription>
        </Alert>
      )}

      {feedItems.length > 0 && (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}
        >
          {feedItems.map((item) => {
            const meta = TYPE_META[item.type] ?? TYPE_META.data;
            const Icon = meta.icon;
            const filename = item.relativePath.split("/").pop() ?? item.relativePath;
            return (
              <div key={item.relativePath} className="flex flex-col">
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="size-4 text-foreground/60" />
                  <span className="text-sm font-heading">{filename}</span>
                  <Badge className="ml-auto text-[9px] px-1 py-0 uppercase">
                    {meta.label}
                  </Badge>
                </div>
                <CodeViewerCard
                  file={item.relativePath}
                  hideTitle
                  previousContent={item.previousContent}
                  className="h-[320px] flex flex-col py-0 gap-0"
                />
              </div>
            );
          })}
        </div>
      )}

      {sessionLogs.length > 0 && (
        <div className="min-h-[240px]">
          <SessionLogCard logs={sessionLogs} />
        </div>
      )}
    </div>
  );
}
