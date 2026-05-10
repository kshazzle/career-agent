import { useState } from 'react';
import axios from 'axios';
import './App.css';
import AmbientParticles from './components/AmbientParticles';
import InputSection from './components/InputSection';
import Loader from './components/Loader';
import OutputSection from './components/OutputSection';

export default function App() {
  const [resumeMode, setResumeMode]         = useState('text');
  const [resume, setResume]                 = useState('');
  const [resumeFile, setResumeFile]         = useState(null);
  const [jdMode, setJdMode]                 = useState('text');
  const [jobDescription, setJobDescription] = useState('');
  const [jdUrl, setJdUrl]                   = useState('');
  const [result, setResult]                 = useState(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');

  function resetResult() {
    if (result) setResult(null);
    if (error)  setError('');
  }

  async function handleOptimize() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      let data;
      if (resumeMode === 'pdf' || jdMode === 'url') {
        const form = new FormData();
        resumeMode === 'pdf' && resumeFile
          ? form.append('resume_file', resumeFile)
          : form.append('resume_text', resume);
        jdMode === 'url'
          ? form.append('jd_url', jdUrl)
          : form.append('jd_text', jobDescription);
        ({ data } = await axios.post('/api/optimize/upload', form));
      } else {
        ({ data } = await axios.post('/api/optimize', {
          resume,
          job_description: jobDescription,
        }));
      }
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPdf() {
    const res = await axios.post(
      '/api/pdf',
      { text: result.optimized_resume },
      { responseType: 'blob' },
    );
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const a   = document.createElement('a');
    a.href = url; a.download = 'optimized-resume.pdf'; a.click();
    URL.revokeObjectURL(url);
  }

  const canSubmit =
    !loading &&
    (resumeMode === 'pdf' ? !!resumeFile : !!resume.trim()) &&
    (jdMode   === 'url'  ? !!jdUrl.trim() : !!jobDescription.trim());

  return (
    <div
      data-app-shell
      className="relative w-full min-h-screen overflow-x-hidden text-[color:var(--cinema-cream-soft)]"
      style={{ background: 'var(--cinema-brown-deep)' }}
    >
      {/* ── Hero video + layered atmosphere (depth: bg → scrims → bloom → grain) ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div data-hero-video-wrap>
          <video data-hero-video autoPlay loop muted playsInline preload="auto">
            <source src="/hero-bg2.mp4" type="video/mp4" />
          </video>
        </div>
        {/* Warm ambient blobs (orchard sunset) */}
        <div
          className="absolute -bottom-24 -left-48 w-[680px] h-[680px] rounded-full blur-[130px] opacity-[0.35] aurora-warm-1"
          style={{
            background:
              'radial-gradient(circle, rgba(214,140,88,0.55) 0%, rgba(180,96,52,0.15) 45%, transparent 72%)',
          }}
        />
        <div
          className="absolute -top-28 -right-40 w-[560px] h-[560px] rounded-full blur-[128px] opacity-[0.28] aurora-warm-2"
          style={{
            background:
              'radial-gradient(circle, rgba(196,168,106,0.42) 0%, rgba(140,96,48,0.12) 50%, transparent 70%)',
          }}
        />
        <div data-landing-sunset />
        <div data-landing-fog />
        <div data-landing-vignette />
        <div data-landing-bloom-bottom />
        <div data-landing-grain />
      </div>

      <AmbientParticles />

      {/* ── Nav ── */}
      <nav data-app-nav className="relative z-20 fade-rise">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[rgba(196,168,106,0.12)] border border-[rgba(232,213,168,0.22)] flex items-center justify-center backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,252,245,0.08)]">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 12L6 4L9 9L11 6L13 12" stroke="#f7f2ea" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-display text-[20px] tracking-tight text-[color:var(--cinema-cream)]">
            OfferForge<sup className="text-[10px] text-[color:var(--cinema-cream-muted)] ml-0.5">®</sup>
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[12px] text-[color:var(--cinema-cream-muted)] glass-pill rounded-full px-3.5 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[rgba(196,168,106,0.85)] pulse-dot inline-block shadow-[0_0_12px_rgba(196,168,106,0.55)]" />
          Free · No login
        </div>
      </nav>

      {/* ── Main content ── */}
      <main data-app-main className="relative z-20">
        {/* Hero */}
        <div data-hero>
          <p data-hero-eyebrow className="fade-rise">OfferForge</p>
          <h1 data-hero-title className="fade-rise-1">Land your dream offer.</h1>
          <p data-hero-subtitle className="fade-rise-2">
            Paste your resume and a job description. We rewrite it to beat the ATS
            and match the role — in seconds.
          </p>
        </div>

        {/* Inputs */}
        <div className="w-full fade-rise-3">
          <InputSection
            resumeMode={resumeMode}         setResumeMode={(m) => { setResumeMode(m); resetResult(); }}
            resume={resume}                  setResume={(v) => { setResume(v); resetResult(); }}
            resumeFile={resumeFile}          setResumeFile={(f) => { setResumeFile(f); resetResult(); }}
            jdMode={jdMode}                  setJdMode={(m) => { setJdMode(m); resetResult(); }}
            jobDescription={jobDescription}  setJobDescription={(v) => { setJobDescription(v); resetResult(); }}
            jdUrl={jdUrl}                    setJdUrl={(v) => { setJdUrl(v); resetResult(); }}
            onSubmit={handleOptimize}
            canSubmit={canSubmit}
            loading={loading}
          />
        </div>

        {error && (
          <div className="w-full mt-5 text-[13px] text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-3 backdrop-blur">
            {error}
          </div>
        )}

        {loading && <div className="w-full mt-8"><Loader /></div>}

        {result && (
          <div className="w-full mt-8">
            <OutputSection result={result} onDownloadPdf={handleDownloadPdf} />
          </div>
        )}
      </main>
    </div>
  );
}
