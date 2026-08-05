import { ArrowUpRight, Sparkles, Wine } from "lucide-react"

const socialSommClubUrl = "https://socialsomm.com/main?somm=tastingswithtay"

export function SocialSommCallout({ compact = false }: { compact?: boolean }): React.ReactElement {
  return (
    <aside
      className={`relative overflow-hidden border border-[#5523E8]/15 bg-gradient-to-br from-[#F4F0FF] via-white to-[#EEE8FF] shadow-[0_24px_80px_-36px_rgba(85,35,232,0.55)] ${
        compact ? "rounded-3xl" : "rounded-[2rem]"
      }`}
      aria-labelledby={compact ? "social-somm-cellar-title" : "social-somm-home-title"}
    >
      <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[#9B7AF3]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 size-64 rounded-full bg-[#5523E8]/10 blur-3xl" />

      <div
        className={`relative grid items-center gap-8 ${
          compact
            ? "p-7 sm:p-9 lg:grid-cols-[1fr_auto]"
            : "p-8 sm:p-10 lg:grid-cols-[1fr_0.55fr] lg:p-14"
        }`}
      >
        <div>
          <div className="mb-6 flex items-center gap-3 text-[#5523E8]">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#5523E8] text-white shadow-lg shadow-[#5523E8]/20">
              <Wine className="size-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-black tracking-[0.16em]">SOCIALSOMM</span>
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#5523E8]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#5523E8]">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Tay&apos;s Wine Club
          </div>

          <h2
            id={compact ? "social-somm-cellar-title" : "social-somm-home-title"}
            className={`text-balance font-serif text-[#241A30] ${
              compact ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl"
            }`}
          >
            Better bottles, picked by Tay.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#5B5263] sm:text-lg">
            Join Tay on Social Somm for a quarterly collection of favorite sips, delivered straight
            to your door.
          </p>

          <a
            href={socialSommClubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#5523E8] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#5523E8]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4619D0] hover:shadow-xl hover:shadow-[#5523E8]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5523E8] focus-visible:ring-offset-2"
            aria-label="Join Tay's wine club on Social Somm (opens in a new tab)"
          >
            Join Tay&apos;s club
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>

        {!compact && (
          <div className="hidden min-h-64 items-center justify-center lg:flex" aria-hidden="true">
            <div className="relative flex aspect-square w-full max-w-64 items-center justify-center rounded-full border border-[#5523E8]/10 bg-white/55 shadow-inner">
              <div className="absolute inset-5 rounded-full border border-dashed border-[#5523E8]/25" />
              <div className="flex size-28 rotate-3 items-center justify-center rounded-[2rem] bg-[#5523E8] text-white shadow-2xl shadow-[#5523E8]/30">
                <Wine className="size-14" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
