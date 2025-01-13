import { APP_NAME } from "@/app/consts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OnboardingSubmitButton } from "./onboarding-submit-button";

export function OnboardingFormWrapper({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Welcome to Supavec</CardTitle>
        <CardDescription>
          Please tell us a bit about yourself to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
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
      </CardContent>
    </Card>
  );
}
