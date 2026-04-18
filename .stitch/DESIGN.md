# TheoLingua marketing page — Stitch / design brief

Use this with **Google Stitch** (text-to-design) or handoff to design. Goal: **visual-first**, **low copy**, **editorial + ed-tech** mood.

## Brand tokens

| Role | Token | Hex |
|------|--------|-----|
| Primary / CTA | theo-yellow | `#C8D832` |
| Text / UI dark | theo-black | `#1A1A1A` |
| Page bg / warm white | theo-white | `#FAFAF5` |
| Accent tint | theo-tint | `#F4F8B0` |

## Atmosphere

- **Calm authority** — seminary / Bible college audience, not startup hype.
- **Breathing room** — generous section padding (`py-20`–`py-28`), max-width content (`max-w-6xl`), avoid walls of text.
- **Visual hierarchy** — one H2 idea per section; body copy **≤ 2 short sentences** above the fold per section.
- **Motion** — subtle: hover lifts, border glow, no distracting loops except hero video.

## Stitch prompt (paste into Google Stitch)

```text
Marketing landing page for "TheoLingua" — English for theological students in India.

MOOD: Editorial, calm, trustworthy, modern ed-tech. Not cluttered. Lots of whitespace.

DESIGN SYSTEM:
- Primary accent: chartreuse yellow #C8D832 on near-black #1A1A1A text
- Background: warm off-white #FAFAF5; alternate sections with white and very subtle gray
- Typography: bold condensed headlines (Poppins-like), readable body (Inter-like)
- Cards: large radius (24–32px), soft shadow, thin borders; hover: lift 4px + yellow border tint
- Imagery: full-bleed hero video with dark gradient overlay; blob-shaped photo crops; no stock cliché smiles only — study & community

PAGE SECTIONS (mobile-first):
1. Sticky header: logo left, nav links, yellow pill "Book a Demo"
2. Hero: one H1, one subline max 20 words, two CTAs, three stat chips in a row below
3. Problem/solution: 3 icon cards (not bullet paragraphs) + one supporting image
4. Program: bento grid (2x2 + 1 wide) with emoji or simple icons, titles + one line each
5. Learning path: three level cards, minimal copy; optional carousel on mobile
6. Two columns: Classroom vs Self-study — two large cards, icon per bullet or short phrases only
7. Partner strip: ScioLabs + 4 stat tiles
8. Testimonials: cards with quote + name; rating row
9. Institutions: dark section, 3 numbered steps, yellow CTA
10. Final CTA: sign in / register two cards
11. FAQ: two columns accordion, closed by default

CONSTRAINTS: Reduce paragraph count; prefer icons, numbers, and photography over long explanations.
```

## Implementation notes (codebase)

- Public home: `app/(public)/page.tsx` — section components inline.
- Calendly: popup via `lib/calendly.ts` — keep CTA buttons, not raw links.
- Header / footer: `components/layout/Header.tsx`, `Footer.tsx`.
