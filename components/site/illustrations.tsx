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
