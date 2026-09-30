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
      'Kalaris Labs is a research lab building the infrastructure for the agentic era. Its research covers agent harnesses, continual and reinforcement learning, multi-agent simulation, game theory and the economics of agents, agent protocols, evaluations, and AI safety and security.',
  },
  {
    question: 'What is the agentic era?',
    answer:
      'The period in which AI agents act rather than only answer: writing and shipping code, transacting, negotiating, and coordinating with other agents on behalf of people and institutions. Those agents need infrastructure the current internet was not built for, including shared protocols, enforceable mandates, and evaluations they cannot game.',
  },
  {
    question: 'What does safe, clean, and governable infrastructure mean?',
    answer:
      'Safe means agents do what they were asked, within the limits they were given, and nothing more. Clean means their actions can be traced, their incentives read, and their results verified by someone other than the system itself. Governable means every agent acts under a mandate, a checkable statement of who it works for, what it may do, and what it may spend, enforced by infrastructure the agent cannot rewrite.',
  },
  {
    question: 'What is Kalaris Labs working on next?',
    answer:
      'Upcoming public work focuses on agent protocols, game theory, the economics of agents, and AI security and safety. Research is published on the Research and Blog pages as it is ready.',
  },
  {
    question: 'Who founded Kalaris Labs?',
    answer:
      'Kalaris Labs was founded by Sayan Chowdhury, who works on agentic systems architecture and the economic layer of agentic systems.',
  },
  {
    question: 'How can I contact Kalaris Labs?',
    answer:
      'Email hello@kalarislabs.com for research collaboration, press, or fellowship questions.',
  },
];
