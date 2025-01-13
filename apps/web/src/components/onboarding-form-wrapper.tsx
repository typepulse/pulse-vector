import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OnboardingForm } from "./onboarding-form";

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
        <OnboardingForm />
      </CardContent>
    </Card>
  );
}
