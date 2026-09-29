export interface FaqEntry {
  question: string;
  answer: string;
}

// Rendered on the homepage and mirrored in FAQPage JSON-LD and llms.txt, so
// every answer must stay true to what is visible on the site.
export const FAQS: FaqEntry[] = [
  {
    question: 'What is Kalaris Labs?',
    answer:
      'Kalaris Labs is an applied AI research company building recursive, self-improving infrastructure for scientific research. The infrastructure carries context from papers, codebases, and experimental iterations into the agents that run the next experiment.',
  },
  {
    question: 'Why does verification matter for AI in science?',
    answer:
      'AI systems are already producing research-level advances in mathematics because results there can be verified quickly, abundantly, and reliably. Most experimental sciences lack that loop. Kalaris Labs builds the infrastructure that brings reproducible environments, traceable results, and verified context to those fields.',
  },
  {
    question: 'What does recursive, self-improving infrastructure mean?',
    answer:
      'Each experiment leaves structured evidence: environments, execution traces, results, and the literature it relied on. The next iteration starts from that verified context instead of from scratch, so research work compounds rather than resetting.',
  },
  {
    question: 'Who is Kalaris Labs building for?',
    answer:
      'Anyone doing research: laboratory scientists, independent researchers, students, and research engineers who want to spend their time on hypotheses and results rather than on setting up tooling.',
  },
  {
    question: 'Who founded Kalaris Labs?',
    answer:
      'Kalaris Labs was founded by Sayan Chowdhury, who works on agentic systems architecture and scientific infrastructure.',
  },
  {
    question: 'How can I contact Kalaris Labs?',
    answer:
      'Email hello@kalarislabs.com for research collaboration, press, or fellowship questions.',
  },
];
