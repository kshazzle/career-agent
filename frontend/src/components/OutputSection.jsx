import { useState, useEffect } from 'react';

function scoreLabel(s) {
  if (s >= 70) return { text: 'Strong match',   color: 'text-emerald-300', accent: '#34d399' };
  if (s >= 45) return { text: 'Moderate match', color: 'text-amber-300',   accent: '#fbbf24' };
  return              { text: 'Weak match',     color: 'text-rose-300',    accent: '#fb7185' };
}

function ScoreBar({ score, color }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score), 150); return () => clearTimeout(t); }, [score]);
  return (
    <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden mt-5">
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
          ? 'border-emerald-400/45 text-emerald-300 bg-emerald-400/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
          : disabled
            ? 'border-white/[0.08] text-white/35 bg-white/[0.03] cursor-not-allowed'
            : 'border-white/[0.14] text-white/90 bg-white/[0.06] hover:bg-white/[0.11] hover:border-white/22 hover:text-white cursor-pointer',
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
            <span data-score-eyebrow className="text-[10px] font-medium tracking-[0.22em] text-white/40 uppercase block">
              Match Score
            </span>
            <div data-score-row className="flex items-end leading-none gap-0.5">
              <span className="font-display text-[3.5rem] sm:text-[3.75rem] text-white leading-none">
                {result.match_score}
              </span>
              <span className="font-display text-2xl text-white/40 mb-2">%</span>
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
              <span className="text-[10.5px] font-medium tracking-[0.18em] text-white/40 uppercase">
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
                    <span className="text-[13px] text-white/55 leading-relaxed">
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
                    <span className="text-emerald-400">✓</span>
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
            className="bg-transparent text-white/88 font-mono text-[13px] leading-[1.85] outline-none border-none"
          />
        </div>
      </GlassCard>
    </div>
  );
}
