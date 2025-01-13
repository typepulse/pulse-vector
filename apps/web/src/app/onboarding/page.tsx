import { OnboardingForm } from "@/components/onboarding-form";
import { APP_NAME } from "../consts";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Supavec Logo" className="size-10" />
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
