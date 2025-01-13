"use client";

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

export const OnboardingSubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Saving..." : "Complete Onboarding"}
    </Button>
  );
};
