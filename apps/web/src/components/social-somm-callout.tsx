import { ArrowUpRight, Wine } from "lucide-react"

const socialSommClubUrl = "https://socialsomm.com/main?somm=tastingswithtay"

export function SocialSommBentoCard(): React.ReactElement {
  return (
    <a
      href={socialSommClubUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block h-full overflow-hidden rounded-2xl border border-brand-burgundy/15 bg-card p-6 transition-all duration-300 hover:border-brand-burgundy/30 hover:shadow-lg"
      aria-label="Join Tay's wine club on Social Somm (opens in a new tab)"
    >
      <div className="pointer-events-none absolute -right-12 -top-16 size-52 rounded-full border border-brand-burgundy/10" />
      <div className="pointer-events-none absolute -right-5 -top-9 size-36 rounded-full border border-brand-burgundy/10" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-burgundy text-brand-cream">
                <Wine className="size-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold tracking-[0.16em] text-[#765A83]">
                SOCIALSOMM
              </span>
            </div>
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
              Tay&apos;s Wine Club
            </p>
            <h3 className="font-serif text-2xl text-foreground transition-colors group-hover:text-primary">
              Join the club
            </h3>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background/70 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
        </div>

        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Tay&apos;s quarterly picks, delivered through Social Somm.
        </p>
      </div>
    </a>
  )
}

export function SocialSommHeroLink(): React.ReactElement {
  return (
    <a
      href={socialSommClubUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group mx-auto mt-8 flex max-w-xl items-center gap-4 rounded-2xl border border-brand-gold/20 bg-white/[0.06] p-3 pr-4 text-left backdrop-blur-sm transition-colors hover:border-brand-gold/40 hover:bg-white/[0.09]"
      aria-label="Join Tay's wine club on Social Somm (opens in a new tab)"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold">
        <Wine className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.65rem] font-semibold tracking-[0.16em] text-[#BFA9C7]">
          SOCIALSOMM
        </span>
        <span className="mt-0.5 block font-serif text-lg text-brand-cream">
          Join Tay&apos;s Wine Club
        </span>
      </span>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-brand-gold/25 text-brand-gold transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </span>
    </a>
  )
}
