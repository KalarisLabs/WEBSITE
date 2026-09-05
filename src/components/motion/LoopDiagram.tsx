import { useState } from 'react';

interface LoopStep {
  id: string;
  name: string;
  shortDesc: string;
  detail: string;
}

const steps: LoopStep[] = [
  {
    id: 'observe',
    name: 'Observe',
    shortDesc: 'Literature & Preprints',
    detail: 'Parses multimodal scientific papers, complex tables, formulas, and raw experimental data points.',
  },
  {
    id: 'reason',
    name: 'Reason',
    shortDesc: 'Hypothesis Formulation',
    detail: 'Cross-checks citation dependency graphs, detects contradictions, and maps mechanistic pathways.',
  },
  {
    id: 'test',
    name: 'Test',
    shortDesc: 'Harness Execution',
    detail: 'Runs computational simulations, chemistry scripts, or automated benchmark evaluation protocols.',
  },
  {
    id: 'evaluate',
    name: 'Evaluate',
    shortDesc: 'Rigorous Verification',
    detail: 'Compares test outputs against known physical constraints and peer-reviewed ground truths.',
  },
  {
    id: 'improve',
    name: 'Improve',
    shortDesc: 'Flywheel Learning',
    detail: 'Feedback from accepted or retried steps updates training signals for subsequent model passes.',
  },
];

export default function LoopDiagram() {
  const [activeStep, setActiveStep] = useState<string>('observe');
  const current = steps.find((s) => s.id === activeStep) || steps[0];

  return (
    <div className="loop-diagram-wrapper" aria-label="The Kalaris Scientific Loop">
      {/* Accessible Screen-Reader Description */}
      <p className="sr-only">
        The Kalaris recursive research loop consists of five methodical stages: Observe literature and data, Reason through hypotheses, Test via computational harness, Evaluate against verified ground truth, and Improve the model parameters recursively.
      </p>

      {/* Stepper Line */}
      <div className="loop-track" role="tablist">
        {steps.map((step, index) => {
          const isSelected = step.id === activeStep;
          return (
            <button
              key={step.id}
              role="tab"
              aria-selected={isSelected}
              className={`loop-step-btn ${isSelected ? 'active' : ''}`}
              onClick={() => setActiveStep(step.id)}
            >
              <div className="step-indicator">
                <span className="step-number">0{index + 1}</span>
                <span className="step-dot" />
              </div>
              <div className="step-text">
                <span className="step-name">{step.name}</span>
                <span className="step-short">{step.shortDesc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Details Card */}
      <div className="loop-detail-box" role="tabpanel">
        <div className="detail-meta">
          <span className="detail-badge">Stage Analysis</span>
          <span className="detail-name">{current.name}</span>
        </div>
        <p className="detail-text">{current.detail}</p>
      </div>

      <style>{`
        .loop-diagram-wrapper {
          margin-top: var(--space-8);
          margin-bottom: var(--space-8);
          font-family: var(--font-sans);
        }

        .loop-track {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.5rem;
          border-top: 1px solid var(--ink);
          padding-top: 1rem;
        }

        @media (max-width: 680px) {
          .loop-track {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }

        .loop-step-btn {
          background: transparent;
          border: none;
          text-align: left;
          padding: 0.5rem 0.25rem;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.15s ease;
        }

        .loop-step-btn:hover {
          background: var(--paper-muted);
        }

        .loop-step-btn.active .step-dot {
          background-color: var(--kalari-green);
          transform: scale(1.3);
        }

        .loop-step-btn.active .step-name {
          color: var(--kalari-green);
          font-weight: 700;
        }

        .step-indicator {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.25rem;
        }

        .step-number {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: var(--muted-ink);
        }

        .step-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: var(--rule);
          transition: transform 0.2s ease, background-color 0.2s ease;
        }

        .step-name {
          display: block;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--ink);
          transition: color 0.15s ease;
        }

        .step-short {
          display: block;
          font-size: 0.68rem;
          color: var(--muted-ink);
          margin-top: 0.15rem;
        }

        .loop-detail-box {
          margin-top: 1.25rem;
          background: var(--paper-muted);
          border: 1px solid var(--rule);
          border-radius: 6px;
          padding: 1rem 1.25rem;
        }

        .detail-meta {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.35rem;
        }

        .detail-badge {
          font-size: 0.62rem;
          font-family: var(--font-mono);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: var(--soft-green);
          color: var(--kalari-green);
          padding: 0.1rem 0.35rem;
          border-radius: 3px;
          font-weight: 700;
        }

        .detail-name {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--ink);
        }

        .detail-text {
          font-family: var(--font-serif);
          font-size: 0.95rem;
          color: var(--ink);
          line-height: 1.5;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
