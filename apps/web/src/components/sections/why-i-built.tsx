import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";
import { Section } from "../section";

export const WhyIBuit = () => {
  return (
    <Section id="why-i-built">
      <div className="border overflow-hidden w-full p-6 lg:p-12">
        <h2 className="text-foreground mb-6 text-balance font-medium text-3xl">
          Why I Built Pulse Vector
        </h2>
        <div className="relative">
          <HeroVideoDialog
            className="block"
            animationStyle="from-center"
            videoSrc="/supavec-intro.mp4"
            thumbnailSrc="/intro-video-cover.jpg"
            thumbnailAlt="Why I Built Pulse Vector"
          />
        </div>
      </div>
    </Section>
  );
};
