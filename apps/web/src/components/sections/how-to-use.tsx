import { APP_NAME } from "@/app/consts";
import { FeatureSelector } from "@/components/feature-selector";
import { Section } from "@/components/section";

interface FeatureOption {
  id: number;
  title: string;
  description: string;
}

const featureOptions: FeatureOption[] = [
  {
    id: 1,
    title: "Create an account",
    description: "Sign up for a free account",
  },
  {
    id: 2,
    title: "Generate your API key",
    description: "Generate an API key for your account",
  },
  {
    id: 3,
    title: "Start using the API",
    description: "Start using the API to build your application",
  },
];

export async function HowToUse() {
  return (
    <Section id="how-to-use" title={`How to use ${APP_NAME}`}>
      <div className="border-x border-t">
        <FeatureSelector features={featureOptions} />
      </div>
    </Section>
  );
}
