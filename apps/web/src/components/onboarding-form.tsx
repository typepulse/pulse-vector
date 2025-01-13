import { APP_NAME } from "@/app/consts";
import { Button } from "@/components/ui/button";
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

export function OnboardingForm({
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
            <Input id="name" placeholder="Elon Musk" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal">Main Goal with Supavec</Label>
            <Input id="goal" placeholder={`Use ${APP_NAME} to build AI apps`} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation">What do you do in life?</Label>
            <Textarea
              id="occupation"
              placeholder="Tell us about your occupation or main activities"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">How did you hear about Supavec?</Label>
            <Input id="source" placeholder="Google, Twitter, etc." />
          </div>
          <Button type="submit" className="w-full">
            Complete Onboarding
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
