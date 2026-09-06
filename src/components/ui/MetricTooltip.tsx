import * as Tooltip from '@radix-ui/react-tooltip';

interface MetricTooltipProps {
  label: string;
  tooltipText: string;
  code?: string;
}

export default function MetricTooltip({
  label,
  tooltipText,
  code,
}: MetricTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F8F9FA] hover:bg-[#EAF2ED] border border-[#E5E7EB] hover:border-[#1B4D3E]/30 font-mono text-xs text-[#111827] transition-colors cursor-help focus:outline-none focus:border-[#1B4D3E]"
          >
            <span>{label}</span>
            {code && <span className="text-[#1B4D3E] font-bold">[{code}]</span>}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={6}
            className="z-50 max-w-xs bg-[#111827] text-white p-3 font-sans text-xs shadow-xl border border-[#374151] animate-in fade-in-50 zoom-in-95"
          >
            <p className="leading-relaxed">{tooltipText}</p>
            <Tooltip.Arrow className="fill-[#111827]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
