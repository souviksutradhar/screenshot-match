# Sentinel AI — Multi-Lingual Cyber Threat & Complaint Triage (Frontend)

Single dark-mode page at `/` (replaces the placeholder `src/routes/index.tsx`), built with React, Tailwind tokens, and Lucide icons. The Python backend is assumed to exist at `http://localhost:8000` — no backend work in this plan.

## Scope

- `const API_BASE = "http://localhost:8000"` at the top of the file, exactly as specified.
- Every fetch (`GET /history`, `POST /analyze`) wrapped in try/catch. If the Python server isn't running, the app never crashes: badge flips to "Waiting for Backend...", KPIs stay at 0 / "None yet", and the feed shows its empty state.

## Page sections

1. **Header** — Title "Sentinel AI", subtitle "Real-Time Hinglish, Voice & Context-Aware Threat Shield", live connection badge with pulsing green dot ("Backend Connected") when `/history` succeeds, amber pulsing dot ("Waiting for Backend...") otherwise.
2. **KPI cards (3)** — polled every 2 s from `GET /history`: "Total Messages Scanned" (`total_scanned`), "Threats Flagged (Sev ≥ 4)" (`threats_flagged`, red), "Primary Threat Vector" (`top_category`, amber).
3. **Live Message & Scam Scanner** — textarea + "Analyze Threat" button; POSTs `{ text, source: "Web Scanner", chat_id: "web_console", sender: "Dashboard Operator" }` to `/analyze`. Result card shows: severity /10 with color-coded bar (0–3 green, 4–6 amber, 7–10 red), badges for `category` / `language` / `source`, pulsing red "📈 ESCALATING HARASSMENT PATTERN" badge when `pattern === "escalating"`, AI Risk Analysis (`explanation`), Recommended Victim Action (`action_advice`), Applicable Law box (`legal_section`), and an "Open Complaint Evidence Dossier" button.
4. **Live Incident Feed table** — polls `GET /history` every 2000 ms via `useEffect` + `setInterval`; columns ID (id + time), Source (source + sender, microphone icon when source contains "Voice"), Message, Classification (category, language, pulsing "ESCALATING" pill), Severity badge, Applicable Law, "View Dossier" action. Empty state: "Listening for incoming Telegram Chat, Voice Notes, and Web scans...".
5. **Complaint Evidence Dossier modal** — printable layout for cybercrime.gov.in: Incident ID, Timestamp, Source, Sender Handle, Exact Transcript, AI Classification (category, severity/10, pattern, language), Behavioral Analysis, Mapped Statutory Provision, Victim Action Advice, helplines "National Cyber Crime Helpline: 1930 | Childline: 1098". Buttons: "Print / Save as PDF" (`window.print()`) and close. Mandatory footer disclaimer: "Disclaimer: AI-generated summary for complaint attachment, not formal legal advice."

## Technical details

- **Theme**: dark cybersecurity look defined in `src/styles.css` via semantic tokens (deep navy/charcoal background, green/amber/red status accents, subtle glow for cards) so no hardcoded color classes appear in the page. Print styles so the dossier modal prints cleanly.
- **Structure**: all dashboard logic in `src/routes/index.tsx` (state, polling, fetch handlers); the dossier modal and result/row rendering stay small local components in the same file or a sibling under `src/components/`. Lucide icons only (Shield, Radio, Mic, FileText, etc.).
- **Head metadata**: `/` gets a unique title ("Sentinel AI — Cyber Threat & Complaint Triage") and description; no og:image (no absolute hero URL).
- **Verification**: build check, then a Playwright pass against the live preview — confirm the page renders, badge shows "Waiting for Backend...", KPIs show defaults, and feed shows the empty state with the backend intentionally unreachable. Backend-connected paths can't be exercised here (no local Python server in this sandbox), so I'll confirm the code paths by review and note that.
