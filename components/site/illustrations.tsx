import { cn } from "@/lib/utils";

/** Red turntable; the platter spins while `playing`. */
export function Turntable({
  playing,
  className,
}: {
  playing: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 320 240"
      className={className}
      role="img"
      aria-label="Red record player"
    >
      <rect x="6" y="10" width="308" height="222" rx="18" fill="#A01010" />
      <rect
        x="6"
        y="10"
        width="308"
        height="222"
        rx="18"
        fill="url(#tt-shine)"
      />
      <defs>
        <linearGradient id="tt-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#000" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <circle cx="130" cy="121" r="98" fill="#5c0808" />
      <g
        className={cn("spin-slow", !playing && "paused")}
        style={{ transformOrigin: "130px 121px", transformBox: "view-box" }}
      >
        <circle cx="130" cy="121" r="92" fill="#141212" />
        {[84, 76, 68, 60, 52, 44].map((r) => (
          <circle
            key={r}
            cx="130"
            cy="121"
            r={r}
            fill="none"
            stroke="#2b2626"
            strokeWidth="1"
          />
        ))}
        <circle cx="130" cy="121" r="30" fill="#A01010" />
        <path
          d="M112 112 q18 -14 36 0"
          stroke="#F7F3E8"
          strokeWidth="3"
          fill="none"
          opacity="0.8"
        />
        <circle cx="130" cy="121" r="4" fill="#F7F3E8" />
      </g>
      <circle
        cx="268"
        cy="46"
        r="14"
        fill="#d9d4cc"
        stroke="#7a0b0b"
        strokeWidth="3"
      />
      <path
        d="M268 46 L268 150 L222 186"
        stroke="#d9d4cc"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <rect
        x="208"
        y="178"
        width="22"
        height="14"
        rx="3"
        fill="#d9d4cc"
        transform="rotate(-38 219 185)"
      />
      <circle cx="286" cy="206" r="8" fill="#F7F3E8" opacity="0.85" />
      <circle cx="262" cy="206" r="8" fill="#F7F3E8" opacity="0.5" />
    </svg>
  );
}

/** Default calendar illustration when no monthly image is uploaded. */
export function Mushroom({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Painted mushroom"
    >
      <ellipse
        cx="100"
        cy="178"
        rx="70"
        ry="10"
        fill="#8B7878"
        opacity="0.25"
      />
      <path
        d="M82 108 C80 140 76 160 72 176 L128 176 C124 160 120 140 118 108 Z"
        fill="#FFFDF6"
        stroke="#2a1a17"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M22 110 C24 52 66 22 104 24 C146 26 182 58 180 108 C150 120 54 122 22 110 Z"
        fill="#A01010"
        stroke="#2a1a17"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {[
        [62, 64, 11],
        [102, 48, 9],
        [140, 70, 12],
        [86, 92, 7],
        [124, 98, 6],
        [44, 96, 6],
        [160, 96, 5],
      ].map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#FFFDF6" />
      ))}
      <path
        d="M40 182 q8 -18 16 0 M150 182 q6 -14 12 0"
        stroke="#4d7a3a"
        strokeWidth="3"
        fill="none"
      />
    </svg>
  );
}

/** Hand-drawn heart placeholder drawn over the selected day. */
export function HeartScribble({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 56" className={className} aria-hidden="true">
      <path
        d="M30 50 C16 40 4 30 5 17 C6 7 17 2 25 9 C28 12 29 15 30 18 C31 14 34 9 38 7 C47 3 56 10 55 20 C54 32 42 41 31 51 C30 52 29 51 28 50"
        fill="none"
        stroke="#A01010"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27 47 C15 38 8 29 9 19"
        fill="none"
        stroke="#A01010"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
