import { DIAGRAM } from "@/lib/design-system";

import ChapterShell from "../components/ChapterShell";

/* --------------------------------------------------------------------------
   AuthSection — chapter 03. The anchor: a real JWT carved apart
   (header.payload.signature) with live claim keys — not a diagram that
   pretends. The stepper is secondary.
   -------------------------------------------------------------------------- */

const TOKEN = {
  header: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  payload: "eyJzdWIiOiI1IiwiaWF0IjoxNzI4NzQ4MDAwLCJleHAiOjE3Mjg3NDg5MDAsImp0aSI6InV1aWQiLCJyb2xlIjoiU1RVREVOVCJ9",
  signature: "tFPg9W6hM5Q3r8sRxZ2vYbKqAxC1nDwE7jGmH0lIuS4",
};

const claims = [
  { key: "sub", value: "user id", note: "who" },
  { key: "iat", value: "issued at (s)", note: "when" },
  { key: "exp", value: "expiry (s)", note: "15 min access" },
  { key: "jti", value: "token id", note: "single-flight reuse detection" },
  { key: "role", value: "authority", note: "STUDENT / INSTRUCTOR / ADMIN" },
];

export default function AuthSection({ id }) {
  return (
    <ChapterShell
      id={id}
      number="03"
      eyebrow="Auth & Security"
      title="A token you can read in two minutes."
      claim="Real JWT structure from the auth module — header, payload, signature — with every claim keyed to a rule in the code, not a slide."
    >
      <div className={`${DIAGRAM.group} space-y-5`}>
        {/* The carved token */}
        <div className="flex flex-wrap items-stretch gap-2 font-mono text-[11px] break-all md:text-xs" role="img" aria-label="JWT carved into header, payload, signature">
          <span className="rounded-lg border border-ember/50 bg-ember/5 px-3 py-2 text-ember">HDR</span>
          <span className="rounded-lg border border-aurora/50 bg-aurora/5 px-3 py-2 text-aurora">PAYLOAD</span>
          <span className="rounded-lg border border-border bg-card/60 px-3 py-2 text-muted-foreground">SIGNATURE</span>
          <div className="w-full rounded-lg bg-background/60 px-4 py-3 leading-relaxed text-muted-foreground">
            {TOKEN.header}<span className="text-ember">.</span>
            {TOKEN.payload}<span className="text-aurora">.</span>
            {TOKEN.signature}
          </div>
        </div>

        {/* Claims */}
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {claims.map((c) => (
            <div key={c.key} className={`rounded-lg border ${DIAGRAM.nodeDim ? "" : ""} border-border bg-card/50 p-3`}>
              <dt className="font-mono text-sm text-ember">{c.key}</dt>
              <dd className="mt-1 font-mono text-2xs uppercase tracking-[0.08em] text-muted-foreground">{c.value}</dd>
              <dd className="mt-0.5 text-xs">{c.note}</dd>
            </div>
          ))}
        </dl>

        <div className={DIAGRAM.callout}>15-minute access · 7-day refresh · reuse detection on jti — no silent logout storms.</div>
      </div>
    </ChapterShell>
  );
}