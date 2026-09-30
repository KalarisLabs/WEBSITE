export const company = {
  oneLiner: 'A research lab building the infrastructure for the agentic era.',
  mission:
    'Build the infrastructure for the agentic era, and keep it safe, clean, and governable.',
  description:
    'Kalaris Labs researches and builds the foundations agents need: the harnesses they run in, the protocols they communicate through, the markets they transact in, and the evaluations and safety work that make them trustworthy.',
  principles: [
    {
      number: '01',
      title: 'Rules before actors',
      body: 'When software acts at machine speed, protocols, mandates, and safeguards have to exist before agents are deployed, not after the damage.',
    },
    {
      number: '02',
      title: 'Safety is a design constraint',
      body: 'Alignment, safety, and security shape everything we build. An agent that is capable but ungoverned is a liability, not progress.',
    },
    {
      number: '03',
      title: 'Built in the open',
      body: 'Infrastructure that only one company can read is a toll booth. We publish our protocol and research work openly.',
    },
  ],
  audiences: [
    'AI researchers',
    'Agent builders',
    'AI safety and security researchers',
    'Economists and game theorists',
    'Protocol and infrastructure engineers',
  ],
} as const;
