import { TextRevealBlock } from '@/components/sora-ui/texts/text-reveal-block';

/** Page headline, wiped in line by line with the brand blue block. */
export default function FellowshipHeadline() {
  return (
    <TextRevealBlock
      blockColor="var(--blue)"
      direction="left"
      duration={0.7}
      stagger={0.18}
      delay={0.15}
    >
      <h1 className="fellowship-title">For the extraordinary.</h1>
    </TextRevealBlock>
  );
}
