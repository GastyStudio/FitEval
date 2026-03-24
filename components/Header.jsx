import Link from "next/link";

// Logo SVG de FitEval
function LogoMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" rx="100" fill="#141414"/>
      <path d="M256 80L420 174V362L256 456L92 362V174L256 80Z" fill="#141414" stroke="#2A2A2A" strokeWidth="8"/>
      <rect x="152" y="300" width="48" height="110" rx="10" fill="#2A2A2A"/>
      <rect x="232" y="230" width="48" height="180" rx="10" fill="#FF6B1A" opacity="0.7"/>
      <rect x="312" y="170" width="48" height="240" rx="10" fill="#FF6B1A"/>
      <circle cx="336" cy="152" r="22" fill="#FF6B1A"/>
      <path d="M176 299 L256 229 L336 152" stroke="#FF6B1A" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.35"/>
    </svg>
  );
}

export default function Header() {
  return (
    <header className="app-header">
      <Link href="/clients" style={{ textDecoration: "none" }}>
        <div className="brand">
          <LogoMark />
          <div className="brand-text">
            <span className="brand-name">Fit<span>Eval</span></span>
            <span className="brand-slogan">No hay excusas, hay datos.</span>
          </div>
        </div>
      </Link>
      
      <a
        href="https://instagram.com/gastycoriaok"
        target="_blank"
        rel="noopener noreferrer"
        className="by-tag"
      >
        by @gastycoriaok
      </a>
    </header>
  );
}