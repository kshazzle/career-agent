import { useState } from 'react';
import axios from 'axios';
import './App.css';
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
    <div data-app-shell className="relative w-full min-h-screen bg-[#0A0A0C] text-white overflow-x-hidden">
      {/* ── Hero video + atmospheric layers ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <video
          data-hero-video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/hero-background.mp4" type="video/mp4" />
        </video>
        {/* Readability: vignette + bottom-heavy dim so hero copy and cards stay crisp */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,10,12,0.45) 0%, rgba(10,10,12,0.25) 28%, rgba(10,10,12,0.55) 55%, rgba(10,10,12,0.88) 100%), radial-gradient(ellipse 90% 60% at 50% 0%, rgba(10,10,12,0.35) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] opacity-25 aurora-1"
          style={{ background: 'radial-gradient(circle, rgba(91,91,214,0.5) 0%, rgba(91,91,214,0) 70%)' }}
        />
        <div
          className="absolute top-20 -right-32 w-[520px] h-[520px] rounded-full blur-[120px] opacity-20 aurora-2"
          style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.45) 0%, rgba(244,114,182,0) 70%)' }}
        />
        {/* Grain */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.7\'/></svg>")',
          }}
        />
      </div>

      {/* ── Nav ── */}
      <nav data-app-nav className="relative z-10 fade-rise">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 12L6 4L9 9L11 6L13 12" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-display text-[20px] tracking-tight text-white">
            OfferForge<sup className="text-[10px] text-white/40 ml-0.5">®</sup>
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[12px] text-white/70 glass-pill rounded-full px-3.5 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot inline-block" />
          Free · No login
        </div>
      </nav>

      {/* ── Main content ── */}
      <main data-app-main className="relative z-10">
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
