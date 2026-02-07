interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function Logo({ width = 32, height = 32, className }: LogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="16" cy="16" r="12" fill="white" stroke="#333" strokeWidth="1.5"/>
      <path d="M8 12 C12 14, 20 14, 24 12" stroke="#e91e63" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M8 20 C12 18, 20 18, 24 20" stroke="#e91e63" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M2 8 L6 10" stroke="#673ab7" strokeWidth="2" strokeLinecap="round"/>
      <path d="M2 16 L7 16" stroke="#673ab7" strokeWidth="2" strokeLinecap="round"/>
      <path d="M2 24 L6 22" stroke="#673ab7" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// For use in ImageResponse where we need the raw SVG JSX
export function LogoSVG({ width = 32, height = 32 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="12" fill="white" stroke="#333" strokeWidth="1.5"/>
      <path d="M8 12 C12 14, 20 14, 24 12" stroke="#e91e63" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M8 20 C12 18, 20 18, 24 20" stroke="#e91e63" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M2 8 L6 10" stroke="#673ab7" strokeWidth="2" strokeLinecap="round"/>
      <path d="M2 16 L7 16" stroke="#673ab7" strokeWidth="2" strokeLinecap="round"/>
      <path d="M2 24 L6 22" stroke="#673ab7" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}