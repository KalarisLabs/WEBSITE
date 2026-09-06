import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface SubSection {
  label: string;
  href: string;
}

interface NavDropdownMenuProps {
  items: SubSection[];
}

export default function NavDropdownMenu({ items }: NavDropdownMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[#4B5563] hover:text-[#111827] border border-transparent hover:border-[#E5E7EB] rounded-none transition-colors group focus:outline-none focus:border-[#1B4D3E]"
        >
          <span>More</span>
          <svg
            className="w-3 h-3 transition-transform duration-200 group-data-[state=open]:rotate-180"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="min-w-[220px] bg-white border border-[#E5E7EB] shadow-lg p-2 z-50 animate-in fade-in-80 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 focus:outline-none"
        >
          <div className="px-3 py-1.5 font-mono text-[10px] tracking-widest text-[#4B5563] uppercase border-b border-[#E5E7EB] mb-1">
            Ecosystem & Media
          </div>

          {items.map((item) => (
            <DropdownMenu.Item key={item.href} asChild>
              <a
                href={item.href}
                className="flex items-center px-3 py-2 text-sm text-[#111827] hover:bg-[#EAF2ED] hover:text-[#1B4D3E] font-sans transition-colors cursor-pointer outline-none focus:bg-[#EAF2ED] focus:text-[#1B4D3E]"
              >
                {item.label}
              </a>
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Separator className="h-[1px] bg-[#E5E7EB] my-1" />

          <DropdownMenu.Item asChild>
            <a
              href="/llms.txt"
              className="flex items-center justify-between px-3 py-1.5 font-mono text-xs text-[#4B5563] hover:bg-[#EAF2ED] hover:text-[#1B4D3E] transition-colors outline-none cursor-pointer"
            >
              <span>llms.txt standard</span>
              <span className="text-[10px] px-1 bg-[#EAF2ED] text-[#1B4D3E] font-bold">AEO</span>
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
