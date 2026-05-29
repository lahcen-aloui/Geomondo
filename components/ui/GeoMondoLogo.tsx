import SpinningGlobe from './SpinningGlobe';

// "Geo" stays solid green
const GEO_STYLE = {
  color: '#009246',
} as const;

// "Mondo" flows from green → white → red so the transition lands on "Mon"
// and "do" lands on red
const MONDO_STYLE = {
  background: 'linear-gradient(to right, #009246 0%, #ffffff 40%, #ce2b37 75%, #ce2b37 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
} as const;

interface Props {
  className?: string;
  textSize?: string;
  globeClassName?: string;
}

export default function GeoMondoLogo({
  className = '',
  textSize = 'text-xl',
  globeClassName = '',
}: Props) {
  return (
    <span className={`inline-flex items-center gap-0 font-extrabold tracking-tight leading-none ${textSize} ${className}`}>
      <span style={GEO_STYLE}>Geo</span>
      <SpinningGlobe className={globeClassName} />
      <span style={MONDO_STYLE}>Mondo</span>
    </span>
  );
}
