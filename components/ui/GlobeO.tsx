// Inline SVG globe used as the "o" in "Geo" across the wordmark.
interface Props {
  className?: string;
  size?: string | number;
}

export default function GlobeO({ className = '', size = '0.85em' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block align-middle ${className}`}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <ellipse cx="12" cy="12" rx="4.5" ry="10" />
      <line x1="2.5" y1="9" x2="21.5" y2="9" />
      <line x1="2.5" y1="15" x2="21.5" y2="15" />
    </svg>
  );
}
