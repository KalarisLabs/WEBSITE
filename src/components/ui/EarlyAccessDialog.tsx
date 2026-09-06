import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { trackAction } from '@/lib/posthog';

interface EarlyAccessDialogProps {
  triggerText?: string;
  triggerClass?: string;
  defaultTopic?: string;
}

export default function EarlyAccessDialog({
  triggerText = 'Request Early Access',
  triggerClass = 'inline-flex items-center justify-center px-6 py-3 rounded-none font-mono text-sm tracking-wider uppercase font-semibold bg-[#1B4D3E] text-white hover:bg-[#143B30] transition-colors border border-[#1B4D3E]',
  defaultTopic = 'Scientific Discovery Harness',
}: EarlyAccessDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please provide a valid research email address.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          organization,
          useCase: defaultTopic,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit request');
      }

      // PostHog Action Tracking
      trackAction('early_access_submit', 'conversion', defaultTopic, {
        organization,
        hasName: Boolean(name),
      });

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setOrganization('');
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
        else trackAction('early_access_open', 'interaction', defaultTopic);
      }}
    >
      <Dialog.Trigger asChild>
        <button type="button" className={triggerClass}>
          {triggerText}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Backdrop Overlay with Glassmorphism */}
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />

        {/* Modal Content */}
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white border border-[#E5E7EB] shadow-2xl p-6 sm:p-8 z-50 focus:outline-none animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-[#1B4D3E]" />
              <Dialog.Title className="font-mono text-xs tracking-widest uppercase text-[#1B4D3E] font-bold">
                Kalaris Labs Access Protocol
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close modal"
                className="font-mono text-xs text-[#4B5563] hover:text-[#111827] px-2 py-1 border border-transparent hover:border-[#E5E7EB] transition-colors"
              >
                [ESC]
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="font-serif text-lg text-[#111827] mb-2 leading-snug">
            Institutional & Research Partner Ingestion
          </Dialog.Description>
          <p className="text-sm text-[#4B5563] mb-6 font-sans leading-relaxed">
            Direct access to our recursive evaluation harnesses, sovereign runtimes, and biochemical literature parsers.
          </p>

          {status === 'success' ? (
            <div className="bg-[#EAF2ED] border border-[#1B4D3E]/30 p-5 text-center">
              <div className="font-mono text-xs text-[#1B4D3E] uppercase tracking-wider font-bold mb-1">
                ACCESS REQUEST REGISTERED
              </div>
              <p className="text-sm text-[#143B30] font-sans">
                Our scientific systems team has received your verification details. We will contact you at <strong>{email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-4 px-4 py-2 bg-[#1B4D3E] text-white font-mono text-xs uppercase tracking-wider hover:bg-[#143B30] transition-colors"
              >
                Close Protocol
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 font-mono">
                  {errorMessage}
                </div>
              )}

              <div>
                <label htmlFor="access-name" className="block font-mono text-xs uppercase tracking-wider text-[#4B5563] mb-1">
                  Lead Scientist / Investigator
                </label>
                <input
                  id="access-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Eleanor Vance"
                  className="w-full px-3 py-2 text-sm border border-[#E5E7EB] focus:border-[#1B4D3E] focus:outline-none font-sans"
                />
              </div>

              <div>
                <label htmlFor="access-email" className="block font-mono text-xs uppercase tracking-wider text-[#4B5563] mb-1">
                  Institutional Email <span className="text-red-600">*</span>
                </label>
                <input
                  id="access-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investigator@lab.ac.uk"
                  className="w-full px-3 py-2 text-sm border border-[#E5E7EB] focus:border-[#1B4D3E] focus:outline-none font-sans"
                />
              </div>

              <div>
                <label htmlFor="access-org" className="block font-mono text-xs uppercase tracking-wider text-[#4B5563] mb-1">
                  University / Institute / Bio-Enterprise
                </label>
                <input
                  id="access-org"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Oxford Computational Genomics / Genentech"
                  className="w-full px-3 py-2 text-sm border border-[#E5E7EB] focus:border-[#1B4D3E] focus:outline-none font-sans"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3 bg-[#1B4D3E] text-white font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#143B30] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {status === 'loading' ? 'Verifying Edge Request...' : 'Submit Verification Request'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] font-mono text-[#4B5563]">
            <span>TLS 1.3 / SOVEREIGN AES-256</span>
            <span>CLOUDFLARE EDGE WORKER</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
