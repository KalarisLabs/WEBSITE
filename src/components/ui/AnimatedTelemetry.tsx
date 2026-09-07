import { useState, useEffect } from 'react';

const SPINNERS = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const LOGS = [
  "init_recursive_harness()",
  "parsing_scientific_ast()",
  "verifying_citation_topology()",
  "allocating_local_runtime()",
  "evaluating_hypothesis()"
];

export default function AnimatedTelemetry() {
  const [tick, setTick] = useState(0);
  const [logIdx, setLogIdx] = useState(0);

  // High speed tick for the spinner
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 80);
    return () => clearInterval(timer);
  }, []);

  // Slower tick for the logs
  useEffect(() => {
    const logTimer = setInterval(() => {
      setLogIdx((i) => (i + 1) % LOGS.length);
    }, 2800);
    return () => clearInterval(logTimer);
  }, []);

  const spinner = SPINNERS[tick % SPINNERS.length];

  return (
    <div className="flex flex-col items-center justify-center font-mono text-[10px] sm:text-xs text-gray-500 mt-2.5 mb-5 tracking-wider select-none">
      <div className="flex items-center gap-2.5 px-3.5 py-1 rounded-full border border-gray-200/80 bg-gray-50/70 shadow-2xs hover:border-[#1B4D3E]/30 transition-colors">
        <span className="text-[#1B4D3E] font-bold">{spinner}</span>
        <span className="text-gray-400 text-[10px]">CORE:</span>
        <span className="font-medium text-gray-700 hidden sm:inline-block">
          {LOGS[logIdx]}
        </span>
        <span className="font-medium text-gray-700 sm:hidden">
          {LOGS[logIdx]}
        </span>
        <span className="animate-pulse font-bold text-[#1B4D3E]">_</span>
      </div>
    </div>
  );
}
