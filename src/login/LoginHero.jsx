import { loginStyle as style } from "./loginStyles.js";

export function LoginHero() {
  return (
    <div style={style.loginHero}>
      <div style={style.loginHeroBg}>
        <svg viewBox="0 0 500 300" width="90%" height="90%" style={{ opacity: 0.7 }} aria-hidden>
          <defs>
            <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ecdc4" />
              <stop offset="100%" stopColor="#1e5068" />
            </linearGradient>
          </defs>
          {[80, 130, 100, 170, 140, 200, 160].map((h, i) => (
            <rect key={i} x={40 + i * 60} y={260 - h} width={36} height={h} fill="url(#barG)" rx={3} opacity={0.85} />
          ))}
          <polyline
            points="58,180 118,130 178,155 238,85 298,110 358,55 418,80"
            fill="none"
            stroke="#f0c040"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <polyline
            points="58,220 118,200 178,210 238,170 298,185 358,155 418,165"
            fill="none"
            stroke="#e88"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeDasharray="6,3"
          />
          <ellipse cx={440} cy={250} rx={25} ry={8} fill="#4ecdc4" opacity={0.5} />
          <rect x={415} y={200} width={50} height={50} rx={4} fill="#1e7090" opacity={0.3} />
        </svg>
      </div>
    </div>
  );
}
