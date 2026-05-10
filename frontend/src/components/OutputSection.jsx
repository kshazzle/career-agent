import { useState, useEffect } from 'react';

function scoreLabel(s) {
  if (s >= 70) return { text: 'Strong match',   color: 'text-[rgba(168,214,188,0.95)]', accent: 'rgba(130, 185, 155, 0.95)' };
  if (s >= 45) return { text: 'Moderate match', color: 'text-[rgba(232,213,168,0.92)]', accent: 'rgba(196, 168, 106, 0.92)' };
  return              { text: 'Weak match',     color: 'text-[rgba(232,176,168,0.92)]', accent: 'rgba(200, 122, 108, 0.92)' };
}

function ScoreBar({ score, color }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score), 150); return () => clearTimeout(t); }, [score]);
  return (
    <div className="w-full h-1 bg-[rgba(247,242,234,0.08)] rounded-full overflow-hidden mt-5">
      <div
        className="h-full rounded-full transition-all duration-[1000ms] ease-out"
        style={{ width: `${w}%`, background: color }}
      />
    </div>
  );
}

function GlassCard({ children, className = '' }) {
  return (
    <div data-card className={['glass transition-all duration-300 flex flex-col', className].join(' ')}>
      {children}
    </div>
  );
}

function IconCopy() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CardHeader({ title, actions, toolbar }) {
  return (
    <div data-card-header {...(toolbar ? { 'data-output-toolbar': '' } : {})}>
      <span data-card-header-label>{title}</span>
      <div data-output-actions>{actions}</div>
    </div>
  );
}

function GlassButton({ children, onClick, disabled, active }) {
  return (
    <button
      type="button"
      data-glass-btn
      onClick={onClick}
      disabled={disabled}
      className={[
        'transition-all duration-200 border outline-none',
        active
          ? 'border-[rgba(196,168,106,0.55)] text-[rgba(232,213,168,0.95)] bg-[rgba(196,168,106,0.14)] shadow-[inset_0_1px_0_rgba(255,252,245,0.1)]'
          : disabled
            ? 'border-[rgba(247,242,234,0.08)] text-[rgba(247,242,234,0.35)] bg-[rgba(8,6,5,0.35)] cursor-not-allowed'
            : 'border-[rgba(247,242,234,0.14)] text-[rgba(247,242,234,0.9)] bg-[rgba(12,10,8,0.45)] hover:bg-[rgba(196,168,106,0.08)] hover:border-[rgba(232,213,168,0.28)] hover:text-[color:var(--cinema-cream)] cursor-pointer',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export default function OutputSection({ result, onDownloadPdf }) {
  const [copied,  setCopied]  = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const label = scoreLabel(result.match_score);

  function handleCopy() {
    navigator.clipboard.writeText(result.optimized_resume).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handlePdf() {
    setPdfBusy(true);
    try { await onDownloadPdf(); } finally { setPdfBusy(false); }
  }

  return (
    <div data-output-stack className="fade-rise w-full">

      <div data-output-stats-grid>

        {/* Score */}
        <GlassCard>
          <div data-score-cell>
            <span data-score-eyebrow className="text-[10px] font-medium tracking-[0.22em] text-[rgba(247,242,234,0.38)] uppercase block">
              Match Score
            </span>
            <div data-score-row className="flex items-end leading-none gap-0.5">
              <span className="font-display text-[3.5rem] sm:text-[3.75rem] text-[color:var(--cinema-cream)] leading-none drop-shadow-[0_4px_48px_rgba(0,0,0,0.35)]">
                {result.match_score}
              </span>
              <span className="font-display text-2xl text-[rgba(247,242,234,0.38)] mb-2">%</span>
            </div>
            <span className={['text-[11px] font-medium tracking-wide', label.color].join(' ')}>
              {label.text}
            </span>
            <ScoreBar score={result.match_score} color={label.accent} />
          </div>
        </GlassCard>

        {/* Keywords */}
        <GlassCard>
          <div data-keywords-cell>
            <div data-keywords-title-row>
              <span className="text-[10.5px] font-medium tracking-[0.18em] text-[rgba(247,242,234,0.38)] uppercase">
                Missing Keywords
              </span>
              <span data-keyword-count>{result.missing_keywords.length}</span>
            </div>
            <div data-keyword-chips>
              {result.missing_keywords.length > 0
                ? result.missing_keywords.map((kw) => (
                    <span key={kw} data-keyword-chip>
                      {kw}
                    </span>
                  ))
                : (
                    <span className="text-[13px] text-[rgba(247,242,234,0.52)] leading-relaxed">
                      Full coverage — no significant gaps detected.
                    </span>
                  )
              }
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Optimized resume */}
      <GlassCard className="overflow-hidden">
        <CardHeader
          toolbar
          title="Optimized Resume"
          actions={
            <>
              <GlassButton onClick={handleCopy} active={copied}>
                {copied ? (
                  <>
                    <span className="text-[rgba(196,168,106,0.95)]">✓</span>
                    Copied
                  </>
                ) : (
                  <>
                    <IconCopy />
                    Copy
                  </>
                )}
              </GlassButton>
              <GlassButton onClick={handlePdf} disabled={pdfBusy}>
                {pdfBusy ? (
                  <>…</>
                ) : (
                  <>
                    <IconDownload />
                    PDF
                  </>
                )}
              </GlassButton>
            </>
          }
        />
        <div data-output-body>
          <textarea
            readOnly
            value={result.optimized_resume}
            className="bg-transparent text-[color:var(--cinema-cream-soft)] font-mono text-[13px] leading-[1.85] outline-none border-none selection:bg-[rgba(196,168,106,0.22)]"
          />
        </div>
      </GlassCard>
    </div>
  );
}
