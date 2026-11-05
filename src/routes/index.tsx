import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Brain,
  FileText,
  Gavel,
  Mic,
  Printer,
  RadioTower,
  Shield,
  ShieldAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = "http://localhost:8000";

interface IncidentRecord {
  id?: string | number;
  time?: string;
  source?: string;
  sender?: string;
  text?: string;
  category?: string;
  language?: string;
  severity?: number;
  pattern?: string;
  legal_section?: string;
  explanation?: string;
  action_advice?: string;
}

interface HistoryPayload {
  total_scanned?: number;
  threats_flagged?: number;
  top_category?: string;
  feed?: IncidentRecord[];
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sentinel AI — Cyber Threat & Complaint Triage" },
      {
        name: "description",
        content:
          "Real-time Hinglish, voice & context-aware threat shield: live scam scanning, incident feed, and printable complaint evidence dossiers.",
      },
      { property: "og:title", content: "Sentinel AI — Cyber Threat & Complaint Triage" },
      {
        property: "og:description",
        content:
          "Live cyber threat triage dashboard with severity scoring, statutory mapping, and complaint-ready evidence dossiers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SentinelDashboard,
});

function severityTone(severity: number) {
  if (severity <= 3) return "text-success border-success/40 bg-success/15";
  if (severity <= 6) return "text-warning border-warning/40 bg-warning/15";
  return "text-danger border-danger/40 bg-danger/15";
}

function severityBarColor(severity: number) {
  if (severity <= 3) return "bg-success";
  if (severity <= 6) return "bg-warning";
  return "bg-danger";
}

function PulsingDot({ tone }: { tone: "success" | "warning" }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className={cn(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
          tone === "success" ? "bg-success" : "bg-warning",
        )}
      />
      <span
        className={cn(
          "relative inline-flex h-2.5 w-2.5 rounded-full",
          tone === "success" ? "bg-success" : "bg-warning",
        )}
      />
    </span>
  );
}

function KpiCard({
  label,
  value,
  icon,
  valueClass,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[0_0_24px_-12px_var(--scan-glow)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <span className="text-primary/70">{icon}</span>
      </div>
      <p className={cn("mt-3 font-mono text-3xl font-bold tracking-tight", valueClass)}>
        {value}
      </p>
    </div>
  );
}

function EscalatingBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex animate-pulse items-center gap-1 rounded-md border border-danger/50 bg-danger/15 px-2 py-0.5 text-xs font-semibold text-danger">
      {label}
    </span>
  );
}

function DossierModal({ record, onClose }: { record: IncidentRecord; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Complaint Evidence Dossier"
        className="dossier-print my-8 w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4" data-no-print>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Complaint Evidence Dossier
            </p>
            <h3 className="mt-1 text-lg font-bold text-foreground">
              Prepared for attachment to cybercrime.gov.in
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dossier"
            className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="grid grid-cols-[10rem_1fr] gap-2">
            <dt className="font-medium text-muted-foreground">Incident ID</dt>
            <dd className="font-mono text-foreground">{String(record.id ?? "—")}</dd>
          </div>
          <div className="grid grid-cols-[10rem_1fr] gap-2">
            <dt className="font-medium text-muted-foreground">Timestamp</dt>
            <dd className="font-mono text-foreground">{record.time ?? "—"}</dd>
          </div>
          <div className="grid grid-cols-[10rem_1fr] gap-2">
            <dt className="font-medium text-muted-foreground">Source</dt>
            <dd className="text-foreground">{record.source ?? "—"}</dd>
          </div>
          <div className="grid grid-cols-[10rem_1fr] gap-2">
            <dt className="font-medium text-muted-foreground">Sender Handle</dt>
            <dd className="text-foreground">{record.sender ?? "—"}</dd>
          </div>
          <div className="grid grid-cols-[10rem_1fr] gap-2">
            <dt className="font-medium text-muted-foreground">Exact Transcript / Message</dt>
            <dd className="whitespace-pre-wrap rounded-md border border-border bg-background/60 p-3 font-mono text-xs leading-relaxed text-foreground">
              {record.text ?? "—"}
            </dd>
          </div>
          <div className="grid grid-cols-[10rem_1fr] gap-2">
            <dt className="font-medium text-muted-foreground">AI Classification</dt>
            <dd className="text-foreground">
              {record.category ?? "—"} · Severity {record.severity ?? 0}/10 · Pattern:{" "}
              {record.pattern ?? "—"} · Language: {record.language ?? "—"}
            </dd>
          </div>
          <div className="grid grid-cols-[10rem_1fr] gap-2">
            <dt className="font-medium text-muted-foreground">Behavioral Analysis</dt>
            <dd className="text-foreground">{record.explanation ?? "—"}</dd>
          </div>
          <div className="grid grid-cols-[10rem_1fr] gap-2">
            <dt className="font-medium text-muted-foreground">Mapped Statutory Provision</dt>
            <dd className="text-foreground">{record.legal_section ?? "—"}</dd>
          </div>
          <div className="grid grid-cols-[10rem_1fr] gap-2">
            <dt className="font-medium text-muted-foreground">Victim Action Advice</dt>
            <dd className="text-foreground">{record.action_advice ?? "—"}</dd>
          </div>
          <div className="grid grid-cols-[10rem_1fr] gap-2">
            <dt className="font-medium text-muted-foreground">Emergency Helplines</dt>
            <dd className="font-semibold text-foreground">
              National Cyber Crime Helpline: 1930 | Childline: 1098
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-3" data-no-print>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </button>
        </div>

        <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
          Disclaimer: AI-generated summary for complaint attachment, not formal legal advice.
        </p>
      </div>
    </div>
  );
}

function SentinelDashboard() {
  const [connected, setConnected] = useState(false);
  const [history, setHistory] = useState<HistoryPayload | null>(null);
  const [inputText, setInputText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<IncidentRecord | null>(null);
  const [dossierRecord, setDossierRecord] = useState<IncidentRecord | null>(null);

  const pollHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/history`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: HistoryPayload = await res.json();
      setHistory(data);
      setConnected(true);
    } catch {
      setConnected(false);
      setHistory(null);
    }
  }, []);

  useEffect(() => {
    pollHistory();
    const interval = setInterval(pollHistory, 2000);
    return () => clearInterval(interval);
  }, [pollHistory]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          source: "Web Scanner",
          chat_id: "web_console",
          sender: "Dashboard Operator",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: IncidentRecord = await res.json();
      setAnalysis(data);
    } catch {
      setAnalyzeError(
        "Could not reach the backend on localhost:8000. Start the Python server and try again.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const feed = history?.feed ?? [];
  const totalScanned = history?.total_scanned ?? 0;
  const threatsFlagged = history?.threats_flagged ?? 0;
  const topCategory = history?.top_category ?? "None yet";
  const severity = analysis?.severity ?? 0;

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-foreground lg:px-8">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-lg border border-primary/30 bg-primary/10 p-2.5 text-primary">
            <Shield className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sentinel AI</h1>
            <p className="text-sm text-muted-foreground">
              Real-Time Hinglish, Voice &amp; Context-Aware Threat Shield
            </p>
          </div>
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
            connected
              ? "border-success/40 bg-success/10 text-success"
              : "border-warning/40 bg-warning/10 text-warning",
          )}
        >
          <PulsingDot tone={connected ? "success" : "warning"} />
          {connected ? "Backend Connected" : "Waiting for Backend..."}
        </div>
      </header>

      <section className="mx-auto mt-6 grid max-w-7xl gap-4 sm:grid-cols-3">
        <KpiCard
          label="Total Messages Scanned"
          value={totalScanned}
          icon={<Activity className="h-5 w-5" />}
        />
        <KpiCard
          label="Threats Flagged (Sev ≥ 4)"
          value={threatsFlagged}
          icon={<ShieldAlert className="h-5 w-5" />}
          valueClass="text-danger"
        />
        <KpiCard
          label="Primary Threat Vector"
          value={topCategory}
          icon={<Brain className="h-5 w-5" />}
          valueClass="text-warning"
        />
      </section>

      <section className="mx-auto mt-6 max-w-7xl rounded-xl border border-border bg-card p-5 shadow-[0_0_24px_-12px_var(--scan-glow)]">
        <div className="flex items-center gap-2">
          <RadioTower className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Live Message &amp; Scam Scanner</h2>
        </div>
        <form onSubmit={handleAnalyze} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste a suspicious message, Hinglish chat, or scam link..."
            rows={3}
            className="flex-1 resize-y rounded-lg border border-input bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={analyzing || !inputText.trim()}
            className="inline-flex h-fit items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Shield className="h-4 w-4" />
            {analyzing ? "Analyzing..." : "Analyze Threat"}
          </button>
        </form>
        {analyzeError && (
          <p className="mt-3 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
            {analyzeError}
          </p>
        )}

        {analysis && (
          <div className="mt-5 rounded-lg border border-primary/25 bg-background/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Latest Analysis Result
              </p>
              {analysis.pattern === "escalating" && (
                <EscalatingBadge label="📈 ESCALATING HARASSMENT PATTERN" />
              )}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="font-mono text-2xl font-bold">{severity}/10</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all", severityBarColor(severity))}
                  style={{ width: `${Math.min(Math.max(severity, 0), 10) * 10}%` }}
                />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["category", "language", "source"] as const).map((key) =>
                analysis[key] ? (
                  <span
                    key={key}
                    className="rounded-md border border-border bg-card px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {analysis[key]}
                  </span>
                ) : null,
              )}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  AI Risk Analysis
                </p>
                <p className="mt-1 text-sm">{analysis.explanation ?? "—"}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recommended Victim Action
                </p>
                <p className="mt-1 text-sm">{analysis.action_advice ?? "—"}</p>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-md border border-primary/25 bg-primary/5 p-3">
              <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm">
                <span className="font-semibold">Applicable Law:</span>{" "}
                {analysis.legal_section ?? "—"}
              </p>
            </div>
            <button
              onClick={() => setDossierRecord(analysis)}
              className="mt-4 inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <FileText className="h-4 w-4" />
              Open Complaint Evidence Dossier
            </button>
          </div>
        )}
      </section>

      <section className="mx-auto mt-6 max-w-7xl rounded-xl border border-border bg-card p-5 shadow-[0_0_24px_-12px_var(--scan-glow)]">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Live Incident Feed</h2>
        </div>
        {feed.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
            <RadioTower className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Listening for incoming Telegram Chat, Voice Notes, and Web scans...
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">ID</th>
                  <th className="py-2 pr-4 font-medium">Source</th>
                  <th className="py-2 pr-4 font-medium">Message</th>
                  <th className="py-2 pr-4 font-medium">Classification</th>
                  <th className="py-2 pr-4 font-medium">Severity</th>
                  <th className="py-2 pr-4 font-medium">Applicable Law</th>
                  <th className="py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {feed.map((item, index) => (
                  <tr key={String(item.id ?? index)} className="border-b border-border/60 align-top">
                    <td className="py-3 pr-4 font-mono text-xs">
                      <div>{String(item.id ?? "—")}</div>
                      <div className="text-muted-foreground">{item.time ?? "—"}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1.5">
                        {String(item.source ?? "").includes("Voice") && (
                          <Mic className="h-3.5 w-3.5 text-primary" />
                        )}
                        <span>{item.source ?? "—"}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{item.sender ?? "—"}</div>
                    </td>
                    <td className="max-w-xs py-3 pr-4">
                      <span className="line-clamp-3 text-xs">{item.text ?? "—"}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md border border-border bg-background/60 px-2 py-0.5 text-xs">
                          {item.category ?? "—"}
                        </span>
                        <span className="rounded-md border border-border bg-background/60 px-2 py-0.5 text-xs">
                          {item.language ?? "—"}
                        </span>
                        {item.pattern === "escalating" && <EscalatingBadge label="ESCALATING" />}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={cn(
                          "inline-block rounded-md border px-2 py-0.5 font-mono text-xs font-semibold",
                          severityTone(item.severity ?? 0),
                        )}
                      >
                        {item.severity ?? 0}/10
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs">{item.legal_section ?? "—"}</td>
                    <td className="py-3">
                      <button
                        onClick={() => setDossierRecord(item)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        View Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {dossierRecord && (
        <DossierModal record={dossierRecord} onClose={() => setDossierRecord(null)} />
      )}
    </div>
  );
}
