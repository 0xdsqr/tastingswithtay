# Tastings with Tay — Brand Guidelines

## Brand Personality

**Warm. Knowledgeable. Elegant. Real. Joyful.**

Taylor is a WSET-certified wine enthusiast, CFP® at ALTIUS Financial, sourdough baker (starter: ClintYEASTwood Jr), podcast host, and mom — the brand should feel like sunshine meeting sophistication.

## Logo System

### Primary Wordmark
- "tastings with" in Cormorant Garamond Light, tracked small caps
- "Tay" in Dancing Script, the visual hero
- Sage leaf flourish accent
- Gold decorative dot and separator line

### Icon Mark
- Script "T" monogram in gold circle frame
- Sage leaf accent
- Use for favicon, social avatar, merch pocket print

### Clear Space
- Minimum clear space: 1× the height of the "T" monogram on all sides

## Typography

| Use | Font | Weight |
|-----|------|--------|
| Logo / Display | Cormorant Garamond | 300–400 |
| Logo Script | Dancing Script | 500–600 |
| Headings | Playfair Display | 400–700 |
| Body / UI | Inter | 300–500 |

## Color Palette

### Primary — "Texas Sunset Wine Country"

| Color | Hex | CSS Variable | Use |
|-------|-----|-------------|-----|
| Burgundy Wine | `#722F37` | `--color-brand-burgundy` | Primary brand — sophistication, wine authority |
| Warm Gold | `#D4A76A` | `--color-brand-gold` | Secondary — warmth, sourdough, Texas sunshine |
| Cream | `#FAF5EF` | `--color-brand-cream` | Background — warm, inviting, never cold |
| Charcoal | `#2C2C2C` | `--color-brand-charcoal` | Text — warm black, not harsh |

### Accents — Use Sparingly

| Color | Hex | CSS Variable | Use |
|-------|-----|-------------|-----|
| Sage Green | `#A8B5A0` | `--color-brand-sage` | Fresh, natural, leaf accents |
| Dusty Rose | `#C9929B` | `--color-brand-rose` | Rosé wine, feminine softness |
| Terracotta | `#C4704B` | `--color-brand-terracotta` | Texas earth, warmth |

### Dark Mode Adjustments

| Color | Hex | CSS Variable |
|-------|-----|-------------|
| Burgundy Light | `#9B4A53` | `--color-brand-burgundy-light` |
| Gold Light | `#E0BF8E` | `--color-brand-gold-light` |

### Rules
- Never use pure black (`#000000`) — always warm charcoal
- One-color logo works in: Burgundy, Charcoal, or reversed on cream
- The palette should feel like a well-set dinner table, not a corporate deck

## Tailwind Usage

```tsx
// Brand colors as Tailwind classes
<div className="bg-brand-burgundy text-brand-cream" />
<div className="text-brand-gold" />
<div className="border-brand-sage" />

// With opacity
<div className="bg-brand-burgundy/80" />
<div className="text-brand-cream/60" />
```

## Asset Locations

```
.github/assets/
├── brand-guidelines.md      ← this file
├── logo-full.svg            ← primary wordmark (light bg)
├── logo-full.png
├── logo-full-dark.svg       ← reversed wordmark (dark bg)
├── logo-full-dark.png
├── logo-full-sm.png         ← small wordmark
├── logo-icon.svg            ← T monogram icon
├── logo-icon-256.png
├── logo-icon-64.png
├── logo-icon-32.png
├── logo-apple-touch.png     ← apple touch icon (256px)
```

## Do / Don't

✅ Use brand colors consistently across all surfaces
✅ Let the serif and script fonts do the heavy lifting
✅ Keep layouts airy — generous whitespace
✅ Use sage green for natural/fresh accents only

❌ Don't use pure black for text
❌ Don't crowd the logo — respect clear space
❌ Don't use more than 2 accent colors per surface
❌ Don't set body text in serif — use Inter for readability
