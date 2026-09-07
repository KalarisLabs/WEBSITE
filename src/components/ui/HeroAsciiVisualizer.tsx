import { useState, useEffect } from 'react';

// Shading ramps from darkest/background to brightest/foreground
const HELIX_CHARS = ['·', ':', '+', '*', '%', '#', '@'];
const DENSITY_CHARS = [' ', '·', ':', '-', '=', '+', '*', '#', '%', '@'];

export default function HeroAsciiVisualizer() {
  const [activeTab, setActiveTab] = useState<'helix' | 'harness' | 'orbital'>('helix');
  const [isRunning, setIsRunning] = useState(true);
  const [tick, setTick] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [metrics, setMetrics] = useState({
    cycles: 14892,
    passRate: 99.84,
    latency: 0.82,
    astDepth: 64,
  });

  // Animation frame loop
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 45); // ~22 FPS for smooth mechanical feel without excessive CPU
    return () => clearInterval(interval);
  }, [isRunning]);

  // Subtle telemetry jitter for authentic scientific instrumentation
  useEffect(() => {
    const metricInterval = setInterval(() => {
      setMetrics((prev) => ({
        cycles: prev.cycles + Math.floor(Math.random() * 5 + 1),
        passRate: +(99.8 + Math.random() * 0.18).toFixed(2),
        latency: +(0.75 + Math.random() * 0.15).toFixed(2),
        astDepth: 64,
      }));
    }, 1800);
    return () => clearInterval(metricInterval);
  }, []);

  // 1. RENDER 3D DOUBLE HELIX IN ASCII
  const renderHelix = () => {
    const width = 56;
    const height = 13;
    const grid: string[][] = Array.from({ length: height }, () =>
      Array(width).fill(' ')
    );

    const speed = hovered ? 0.08 : 0.05;
    const t = tick * speed;
    const basePairs = ['A─T', 'G═C', 'T─A', 'C═G', 'A═T', 'G─C'];

    for (let y = 0; y < height; y++) {
      const zOffset = (y / height) * Math.PI * 2.2;
      const angle1 = t + zOffset;
      const angle2 = angle1 + Math.PI;

      // Strand 1 coordinates
      const x1 = Math.round(width / 2 + Math.cos(angle1) * 18);
      const depth1 = Math.sin(angle1); // -1 (back) to +1 (front)

      // Strand 2 coordinates
      const x2 = Math.round(width / 2 + Math.cos(angle2) * 18);
      const depth2 = Math.sin(angle2);

      // Draw connecting base-pair rungs when strand 1 is behind or crossing
      if (Math.abs(x1 - x2) > 4) {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const pair = basePairs[y % basePairs.length];
        const mid = Math.floor((minX + maxX) / 2);

        for (let x = minX + 1; x < maxX; x++) {
          if (x >= mid - 1 && x <= mid + 1) {
            const charIdx = x - (mid - 1);
            grid[y][x] = pair[charIdx] || '─';
          } else {
            grid[y][x] = (x % 2 === 0) ? '·' : '─';
          }
        }
      }

      // Draw strand 1 node
      const charIdx1 = Math.min(
        HELIX_CHARS.length - 1,
        Math.max(0, Math.floor(((depth1 + 1) / 2) * (HELIX_CHARS.length - 1)))
      );
      if (x1 >= 0 && x1 < width) {
        grid[y][x1] = depth1 > 0 ? HELIX_CHARS[charIdx1] : '·';
      }

      // Draw strand 2 node
      const charIdx2 = Math.min(
        HELIX_CHARS.length - 1,
        Math.max(0, Math.floor(((depth2 + 1) / 2) * (HELIX_CHARS.length - 1)))
      );
      if (x2 >= 0 && x2 < width) {
        grid[y][x2] = depth2 > 0 ? HELIX_CHARS[charIdx2] : '·';
      }
    }

    return grid.map((row) => row.join('')).join('\n');
  };

  // 2. RENDER RECURSIVE EVALUATION HARNESS GRAPH
  const renderHarness = () => {
    const p1 = (tick % 24);
    const p2 = ((tick + 8) % 24);
    const p3 = ((tick + 16) % 24);

    const getPacket = (step: number, range: number) => {
      const pos = Math.floor((step / range) * 14);
      return '─'.repeat(Math.max(0, pos)) + '▶' + '─'.repeat(Math.max(0, 14 - pos));
    };

    const pulse = (tick % 6 < 3) ? '●' : '○';
    const wasmGate = (tick % 8 < 4) ? '[WASM:ISOLATED]' : '[WASM:VERIFIED]';

    return [
      `┌─ SCIENTIFIC RECURSIVE EVALUATION HARNESS v3.4 ────────────┐`,
      `│ [01/LITERATURE_AST] ──${getPacket(p1, 24)} [02/HYPOTHESIS_GEN]    │`,
      `│          │                                      │         │`,
      `│     ${pulse} DETERMINISTIC                        ▼ RETRACTION  │`,
      `│       SANDBOX VERIFICATION                  SCANNING GATE │`,
      `│          │                                      │         │`,
      `│          ▼                                      ▼         │`,
      `│ [04/GROUNDED_PROOF] ◀─${getPacket(p2, 24)} ${wasmGate} │`,
      `│          │                                                │`,
      `│          └─── RECURSIVE LOOP RE-ANCHOR ──${getPacket(p3, 24)}┘         │`,
      `└───────────────────────────────────────────────────────────┘`,
    ].join('\n');
  };

  // 3. RENDER QUANTUM ORBITAL WAVEFORM
  const renderOrbital = () => {
    const width = 56;
    const height = 11;
    const lines: string[] = [];
    const t = tick * 0.08;

    for (let y = 0; y < height; y++) {
      let row = '';
      const ny = (y - height / 2) / (height / 2);
      for (let x = 0; x < width; x++) {
        const nx = (x - width / 2) / (width / 4);
        const r = Math.sqrt(nx * nx + ny * ny);
        const val = Math.sin(r * 2.8 - t) * Math.cos(nx * 1.5 + t * 0.5);
        const norm = (val + 1) / 2; // 0 to 1
        const charIdx = Math.floor(norm * (DENSITY_CHARS.length - 1));
        row += DENSITY_CHARS[charIdx] || ' ';
      }
      lines.push(row);
    }
    return lines.join('\n');
  };

  return (
    <div
      className="w-full my-8 select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Kalaris Scientific ASCII Visualizer"
    >
      <div className="relative rounded-lg border border-gray-200/90 bg-white/95 p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-gray-300 hover:shadow-[0_8px_30px_-4px_rgba(27,77,62,0.08)]">
        {/* Frame ASCII Corner Crosshairs */}
        <span className="absolute top-2 left-2.5 font-mono text-[10px] text-gray-300 pointer-events-none select-none">+</span>
        <span className="absolute top-2 right-2.5 font-mono text-[10px] text-gray-300 pointer-events-none select-none">+</span>
        <span className="absolute bottom-2 left-2.5 font-mono text-[10px] text-gray-300 pointer-events-none select-none">+</span>
        <span className="absolute bottom-2 right-2.5 font-mono text-[10px] text-gray-300 pointer-events-none select-none">+</span>

        {/* Console Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-gray-100 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B4D3E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B4D3E]"></span>
            </span>
            <span className="font-semibold text-gray-900 tracking-wider">
              KALARIS_CORE // ASCII_ENGINE
            </span>
            <span className="text-gray-400 hidden md:inline">|</span>
            <span className="text-[#1B4D3E] font-medium hidden md:inline">
              REPRODUCIBLE_AI
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-gray-50/80 p-0.5 rounded border border-gray-200/70 text-[10px]">
            <button
              type="button"
              onClick={() => setActiveTab('helix')}
              className={`px-2 py-0.5 rounded transition-colors font-mono cursor-pointer ${
                activeTab === 'helix'
                  ? 'bg-white text-[#1B4D3E] font-bold shadow-xs border border-gray-200/60'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              [01/HELIX]
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('harness')}
              className={`px-2 py-0.5 rounded transition-colors font-mono cursor-pointer ${
                activeTab === 'harness'
                  ? 'bg-white text-[#1B4D3E] font-bold shadow-xs border border-gray-200/60'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              [02/HARNESS]
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orbital')}
              className={`px-2 py-0.5 rounded transition-colors font-mono cursor-pointer ${
                activeTab === 'orbital'
                  ? 'bg-white text-[#1B4D3E] font-bold shadow-xs border border-gray-200/60'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              [03/ORBITAL]
            </button>
          </div>
        </div>

        {/* ASCII Canvas Visualizer Viewport */}
        <div className="relative overflow-x-auto bg-gray-50/40 rounded border border-gray-100 p-2 sm:p-4 flex items-center justify-center min-h-[220px] sm:min-h-[240px]">
          {/* Subtle watermark in background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center font-mono text-5xl font-black tracking-widest text-[#1B4D3E]">
            KALARIS
          </div>

          <pre
            className="font-mono text-[9px] sm:text-[11px] md:text-[12px] leading-[1.2] text-gray-800 tracking-wider whitespace-pre select-text transition-all duration-75"
            style={{
              fontFeatureSettings: '"tnum"',
            }}
          >
            {activeTab === 'helix' && renderHelix()}
            {activeTab === 'harness' && renderHarness()}
            {activeTab === 'orbital' && renderOrbital()}
          </pre>

          {/* Interactive Pause/Play Button overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-600 hover:text-[#1B4D3E] cursor-pointer"
              title={isRunning ? "Pause animation" : "Resume animation"}
            >
              {isRunning ? '⏸ PAUSE' : '▶ RUN'}
            </button>
          </div>
        </div>

        {/* Micro-Telemetry Footer */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 pt-3 mt-3 border-t border-gray-100 font-mono text-[10px] text-gray-500">
          <div className="flex items-center gap-3">
            <span>
              CYCLES: <strong className="text-gray-900">{metrics.cycles}</strong>
            </span>
            <span className="text-gray-300">·</span>
            <span>
              VERIFIED: <strong className="text-[#1B4D3E]">{metrics.passRate}%</strong>
            </span>
            <span className="text-gray-300 hidden sm:inline">·</span>
            <span className="hidden sm:inline">
              LATENCY: <strong className="text-gray-700">{metrics.latency}ms</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400">AST_DEPTH: {metrics.astDepth}</span>
            <span className="text-gray-300">|</span>
            <span className="inline-flex items-center gap-1 text-[#1B4D3E] font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1B4D3E]"></span>
              SANDBOX_GATED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
