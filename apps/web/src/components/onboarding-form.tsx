"use client";

import { APP_NAME } from "@/app/consts";
import { OnboardingSubmitButton } from "./onboarding-submit-button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { completeOnboarding } from "@/app/onboarding/actions";
import { toast } from "sonner";

export const OnboardingForm = () => {
  return (
    <form
      className="space-y-6"
      action={async (formData) => {
        const result = await completeOnboarding(formData);
        if (result.error) {
          toast.error(result.error);
        }
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Your Name</Label>
        <Input id="name" name="name" placeholder="Elon Musk" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal">Main Goal with Supavec</Label>
        <Input
          id="goal"
          name="goal"
          placeholder={`Use ${APP_NAME} to build AI apps`}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="occupation">What do you do in life?</Label>
        <Textarea
          id="job"
          name="job"
          placeholder="Tell us about your occupation or main activities"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="source">How did you hear about Supavec?</Label>
        <Input
          id="how_know"
          name="how_know"
          placeholder="Google, Twitter, etc."
        />
      </div>
      <OnboardingSubmitButton />
    </form>
  );
};
