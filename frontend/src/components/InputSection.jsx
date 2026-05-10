import { useRef } from 'react';

function PillToggle({ value, onChange, options }) {
  return (
    <div data-pill-toggle>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          data-active={value === opt.value ? 'true' : 'false'}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const RESUME_OPTS = [{ value: 'text', label: 'Text' }, { value: 'pdf', label: 'PDF' }];
const JD_OPTS    = [{ value: 'text', label: 'Text' }, { value: 'url', label: 'URL'  }];

function GlassCard({ children, className = '' }) {
  return (
    <div data-card className={['glass transition-all duration-300', className].join(' ')}>
      {children}
    </div>
  );
}

function CardHeader({ label, toggle }) {
  return (
    <div data-card-header>
      <span data-card-header-label>{label}</span>
      {toggle}
    </div>
  );
}

const TA_CLASS = [
  'w-full flex-1 bg-transparent text-white/90',
  'font-mono text-[13px] leading-[1.7]',
  'resize-none outline-none border-none',
  'placeholder:text-white/30 placeholder:font-sans placeholder:text-[13px]',
].join(' ');

export default function InputSection({
  resumeMode, setResumeMode, resume, setResume, resumeFile, setResumeFile,
  jdMode, setJdMode, jobDescription, setJobDescription, jdUrl, setJdUrl,
  onSubmit, canSubmit, loading,
}) {
  const fileRef = useRef(null);

  return (
    <div className="w-full">
      <div data-input-grid>

        {/* Resume card */}
        <GlassCard>
          <CardHeader
            label="Resume"
            toggle={<PillToggle value={resumeMode} onChange={setResumeMode} options={RESUME_OPTS} />}
          />
          {resumeMode === 'text' ? (
            <div data-card-body className="flex">
              <textarea
                placeholder="Paste your resume…"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                disabled={loading}
                className={TA_CLASS + ' disabled:opacity-40'}
              />
            </div>
          ) : (
            <div
              onClick={() => !loading && fileRef.current?.click()}
              className={[
                'flex flex-col items-center justify-center gap-3 min-h-[220px]',
                'm-4 border border-dashed border-white/15 rounded-xl',
                'transition-all duration-200',
                loading
                  ? 'opacity-40 cursor-not-allowed'
                  : 'cursor-pointer hover:border-white/30 hover:bg-white/[0.02]',
              ].join(' ')}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              />
              <div className={[
                'w-11 h-11 rounded-xl flex items-center justify-center border',
                resumeFile
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/[0.04] border-white/10 text-white/50',
              ].join(' ')}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 12V3M9 3l-4 4M9 3l4 4M3 13v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-[13px] font-medium text-white/85">
                  {resumeFile ? resumeFile.name : 'Upload PDF'}
                </p>
                <p className="text-[11px] text-white/40 mt-1">
                  {resumeFile ? 'Click to change' : 'Click to browse'}
                </p>
              </div>
            </div>
          )}
        </GlassCard>

        {/* JD card */}
        <GlassCard>
          <CardHeader
            label="Job Description"
            toggle={<PillToggle value={jdMode} onChange={setJdMode} options={JD_OPTS} />}
          />
          {jdMode === 'text' ? (
            <div data-card-body className="flex">
              <textarea
                placeholder="Paste the job description…"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={loading}
                className={TA_CLASS + ' disabled:opacity-40'}
              />
            </div>
          ) : (
            <div data-jd-url-panel>
              <label className="sr-only" htmlFor="jd-url-input">
                Job posting URL
              </label>
              <div data-jd-url-field>
                <span data-jd-url-icon aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </span>
                <input
                  id="jd-url-input"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  spellCheck={false}
                  placeholder="https://jobs.company.com/…"
                  value={jdUrl}
                  onChange={(e) => setJdUrl(e.target.value)}
                  disabled={loading}
                  className={[
                    'font-mono text-[13px] text-white/92',
                    'placeholder:text-white/35 placeholder:font-sans',
                    'disabled:opacity-40',
                  ].join(' ')}
                />
              </div>
              <p data-jd-url-hint>
                Paste a public posting link. Works with Greenhouse, Ashby, Lever, and most boards.
              </p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* CTA row */}
      <div data-cta-row>
        <button
          type="button"
          data-cta-primary
          {...(loading ? { 'data-loading': '' } : {})}
          onClick={onSubmit}
          disabled={!canSubmit}
          className="group"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-[1.5px] border-white/25 border-t-white rounded-full spin flex-shrink-0" />
              Optimizing
            </>
          ) : (
            <>
              Optimize Resume
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </button>

        <span className="text-[11.5px] text-white/35 max-w-[280px] text-center leading-relaxed">
          {loading ? (
            <span className="text-white/45">Usually takes a few seconds.</span>
          ) : canSubmit ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
              Ready to optimize
            </span>
          ) : (
            'Fill both fields to continue'
          )}
        </span>
      </div>
    </div>
  );
}
