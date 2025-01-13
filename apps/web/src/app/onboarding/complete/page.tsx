import { APP_NAME } from "@/app/consts";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OnboardingCompletePage() {
  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Thank You!</CardTitle>
          <CardDescription>
            Your onboarding is complete. Welcome to {APP_NAME}!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Join our Discord community to connect with other Supavec users and
            get support.
          </p>
          <Button variant="outline" className="w-full">
            <Icons.discord className="mr-2 size-4" />
            Join {APP_NAME} Discord
          </Button>
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="lg">
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
