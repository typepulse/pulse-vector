import { ButtonColorful } from "@/components/ui/button-colorful";

export const CTA = () => {
  return (
    <section className="text-center">
      <p className="text-sm font-semibold tracking-tight text-balance text-muted-foreground text-center">
        Ready to build youir own?
      </p>
      <h2 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl text-center">
        Build your AI app in minutes
      </h2>
      <div className="text-center text-muted-foreground mt-2 text-lg">
        With Supavec, you can easily connect your files to AI and build an app
        in minutes.
      </div>
      <a href="https://www.supavec.com?src=examples-chat-with-pdf">
        <ButtonColorful className="mt-6" label="Get started" />
      </a>
    </section>
  );
};
