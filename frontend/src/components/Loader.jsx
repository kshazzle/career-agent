import { useState, useEffect } from 'react';

const STEPS = [
  'Analyzing your resume…',
  'Matching keywords to JD…',
  'Rewriting for impact…',
  'Finalizing output…',
];

export default function Loader() {
  const [idx, setIdx]         = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % STEPS.length);
        setVisible(true);
      }, 250);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div data-loader-strip className="glass justify-between">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-4 h-4 border-[1.5px] border-white/15 border-t-white rounded-full spin flex-shrink-0" />
        <span
          key={idx}
          className={[
            'text-[13px] text-white/85 msg-in truncate',
            visible ? 'opacity-100' : 'opacity-0',
            'transition-opacity duration-200',
          ].join(' ')}
        >
          {STEPS[idx]}
        </span>
      </div>
      <div className="flex gap-1.5 flex-shrink-0 pl-2">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={[
              'w-1.5 h-1.5 rounded-full transition-all duration-300',
              i === idx ? 'bg-white' : 'bg-white/15',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  );
}
