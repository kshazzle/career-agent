export default function Header() {
  return (
    <header className="flex items-center justify-between gap-3 mb-6 pb-5 border-b border-[#E4E4EA]">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5B5BD6] to-[#4F4FC4] flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_-2px_rgba(91,91,214,0.5)]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 12L6 4L9 9L11 6L13 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-[15px] font-semibold text-[#0F0F10] tracking-tight leading-none truncate">
            OfferForge
          </h1>
          <p className="text-[11px] text-[#8E8E99] mt-1 truncate">
            AI resume optimizer
          </p>
        </div>
      </div>

      <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-[#3D3D40] bg-white border border-[#E4E4EA] px-3 py-1.5 rounded-full shadow-[0_1px_2px_rgba(15,15,16,0.04)] flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] pulse-dot inline-block" />
        Free · No login
      </span>
    </header>
  );
}
