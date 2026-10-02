'use client';

// A small fanned-card illustration for the landing page — three "quiz
// cards" (two with a plain "?", the front one winking) that settle into
// their fanned positions on load. Decorative only (aria-hidden), and the
// one animation on the page per the "spend your motion in one place"
// principle — everything else on the landing step is static.
//
// Each card is an outer <g transform="translate(...)"> (static position,
// an SVG presentation attribute) wrapping an inner <g class="hero-card">
// (CSS-animated rotation only) — a CSS `transform` on an SVG element
// replaces rather than composes with a `transform` attribute, so position
// and the animated rotation have to live on separate elements.
export default function Hero() {
  return (
    <svg
      className="hero-art"
      viewBox="0 0 320 200"
      width="320"
      height="200"
      aria-hidden="true"
      focusable="false"
    >
      <g transform="translate(118,102)">
        <g className="hero-card hero-card-1" style={{ '--rot': '-16deg' }}>
          <rect x="-55" y="-72" width="110" height="144" rx="20" fill="var(--yel)" />
          <text
            x="0"
            y="16"
            textAnchor="middle"
            fontSize="54"
            fontWeight="800"
            fill="#2b1b3d"
            fontFamily="'Bricolage Grotesque', sans-serif"
          >
            ?
          </text>
        </g>
      </g>
      <g transform="translate(204,102)">
        <g className="hero-card hero-card-2" style={{ '--rot': '11deg' }}>
          <rect x="-55" y="-72" width="110" height="144" rx="20" fill="var(--fg)" opacity="0.1" />
          <rect
            x="-55"
            y="-72"
            width="110"
            height="144"
            rx="20"
            fill="none"
            stroke="var(--fg)"
            strokeWidth="2"
            opacity="0.3"
          />
          <text
            x="0"
            y="16"
            textAnchor="middle"
            fontSize="54"
            fontWeight="800"
            fill="var(--fg)"
            opacity="0.45"
            fontFamily="'Bricolage Grotesque', sans-serif"
          >
            ?
          </text>
        </g>
      </g>
      <g transform="translate(160,98)">
        <g className="hero-card hero-card-3" style={{ '--rot': '-3deg' }}>
          <rect x="-58" y="-76" width="116" height="152" rx="22" fill="var(--pink)" />
          <path d="M -30 -8 q 8 -10 16 0" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="22" cy="-8" r="7" fill="#fff" />
          <circle cx="23" cy="-8" r="3" fill="#2b1b3d" />
          <path d="M -24 20 q 24 20 48 0" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>
      </g>
    </svg>
  );
}
