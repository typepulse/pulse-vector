"use client";

import { HeroVideoDialog } from "./ui/hero-video-dialog";

interface FeatureOption {
  id: number;
  title: string;
  description: string;
}

interface FeatureSelectorProps {
  features: FeatureOption[];
}

export const FeatureSelector: React.FC<FeatureSelectorProps> = ({
  features,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 relative">
      <div className="md:col-span-2 border-b md:border-b-0 bg-background md:border-r border-border sticky top-[var(--header-height)]">
        <div className="flex md:flex-col md:h-full feature-btn-container overflow-x-auto p-4 pb-2">
          {features.map((option) => (
            <button
              key={option.id}
              className={`flex-shrink-0 md:flex-1 w-64 md:w-full text-left p-4 mb-2 mr-2 last:mr-0 md:mr-0 rounded border border-border`}
            >
              <h3 className="font-medium tracking-tight">{option.title}</h3>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>
      <div className="col-span-1 md:col-span-3">
        <HeroVideoDialog
          className="block"
          previewClassName="rounded-none"
          animationStyle="from-center"
          videoSrc="/supavec-intro.mp4"
          thumbnailSrc="/intro-video-cover.jpg"
          thumbnailAlt="Why I Built Supavec"
        />
      </div>
    </div>
  );
};
