import { useState, useEffect } from 'react';

interface Props {
  cfCountry?: string;
  edgeColo?: string;
  serverTime?: string;
}

const SPINNERS = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const BARS = [
  ' ▂▃▅▆▇▆▅▃ ',
  '▂▃▅▆▇█▇▆▅▂',
  '▃▅▆▇███▇▆▃',
  '▅▆▇█████▇▅',
  '▆▇███████▇',
  '▅▆▇█████▇▅',
  '▃▅▆▇███▇▆▃',
  '▂▃▅▆▇█▇▆▅▂',
];

const HEX_SEQUENCES = [
  ['0x4B', '0x41', '0x4C', '0x41'],
  ['0x4C', '0x41', '0x52', '0x49'],
  ['0x53', '0x5F', '0x41', '0x49'],
  ['0x52', '0x45', '0x53', '0x43'],
  ['0x45', '0x56', '0x41', '0x4C'],
];

export default function AnimatedAsciiFlanks({
  cfCountry = 'GLO',
  edgeColo = 'EDGE',
  serverTime = '',
}: Props) {
  const [tick, setTick] = useState(0);
  const [hexIdx, setHexIdx] = useState(0);
  const [currentTime, setCurrentTime] = useState(serverTime ? serverTime.slice(11, 23) : '');
  const [hoverLeft, setHoverLeft] = useState(false);
  const [hoverRight, setHoverRight] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 90);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hexTimer = setInterval(() => {
      setHexIdx((i) => (i + 1) % HEX_SEQUENCES.length);
    }, 2400);
    return () => clearInterval(hexTimer);
  }, []);

  useEffect(() => {
    const clockTimer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toISOString().slice(11, 23));
    }, 100);
    return () => clearInterval(clockTimer);
  }, []);

  const spinner = SPINNERS[tick % SPINNERS.length];
  const bar = BARS[tick % BARS.length];
  const currentHex = HEX_SEQUENCES[hexIdx];

  return (
    <>
      {/* Left Telemetry Flank (Visible on screens >= 1280px) */}
      <div
        className="hidden xl:block absolute left-2 2xl:left-8 top-1/2 -translate-y-1/2 pointer-events-auto select-none z-10"
        aria-hidden="true"
        onMouseEnter={() => setHoverLeft(true)}
        onMouseLeave={() => setHoverLeft(false)}
      >
        <div
          className={`flex flex-col gap-1 font-mono text-[10.5px] leading-relaxed p-3 rounded border bg-white/80 backdrop-blur-xs transition-all duration-300 shadow-xs ${
            hoverLeft
              ? 'border-[#1B4D3E]/40 text-[#1B4D3E] shadow-sm'
              : 'border-gray-200/70 text-gray-400 hover:text-gray-700'
          }`}
        >
          <span className="tracking-wider">+ · · · · · · · · · · · · +</span>
          <span className="tracking-wider flex items-center justify-between gap-3">
            <span>| {currentHex.join(' ')}</span>
            <span>|</span>
          </span>
          <span className="tracking-wider flex items-center justify-between gap-3">
            <span>| SCIENTIFIC_HARNESS</span>
            <span>|</span>
          </span>
          <span className="tracking-wider flex items-center justify-between gap-3">
            <span>| WASM_GATE: [PASS]</span>
            <span className="text-[#1B4D3E] font-bold">{spinner} |</span>
          </span>
          <span className="tracking-wider flex items-center justify-between gap-3">
            <span>| SIG: {bar}</span>
            <span>|</span>
          </span>
          <span className="tracking-wider">+ · · · · · · · · · · · · +</span>
        </div>
      </div>

      {/* Right Telemetry Flank (Visible on screens >= 1280px) */}
      <div
        className="hidden xl:block absolute right-2 2xl:right-8 top-1/2 -translate-y-1/2 pointer-events-auto select-none z-10"
        aria-hidden="true"
        onMouseEnter={() => setHoverRight(true)}
        onMouseLeave={() => setHoverRight(false)}
      >
        <div
          className={`flex flex-col gap-1 font-mono text-[10.5px] leading-relaxed p-3 rounded border bg-white/80 backdrop-blur-xs transition-all duration-300 shadow-xs ${
            hoverRight
              ? 'border-[#1B4D3E]/40 text-[#1B4D3E] shadow-sm'
              : 'border-gray-200/70 text-gray-400 hover:text-gray-700'
          }`}
        >
          <span className="tracking-wider">+ · · · · · · · · · · · · +</span>
          <span className="tracking-wider flex items-center justify-between gap-3">
            <span>| 0x52 0x49 0x53 0x20</span>
            <span>|</span>
          </span>
          <span className="tracking-wider flex items-center justify-between gap-3">
            <span>| RECURSIVE_TOPOLOGY</span>
            <span>|</span>
          </span>
          <span className="tracking-wider flex items-center justify-between gap-3">
            <span>| EDGE: {cfCountry.padEnd(3)} [{edgeColo.slice(0, 4)}]</span>
            <span>|</span>
          </span>
          <span className="tracking-wider flex items-center justify-between gap-3">
            <span>| SSR: {currentTime || 'SYNCING...'}</span>
            <span>|</span>
          </span>
          <span className="tracking-wider">+ · · · · · · · · · · · · +</span>
        </div>
      </div>
    </>
  );
}
