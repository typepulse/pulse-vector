import { Icons } from "@/components/icons";
import {
  BrainIcon,
  Code2,
  CodeIcon,
  GlobeIcon,
  Lock,
  PlugIcon,
  Scale,
  UsersIcon,
  Wrench,
  ZapIcon,
  Linkedin,
} from "lucide-react";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: "Supavec",
  description: "Connect your data to LLMs, no matter the source.",
  cta: "Get Started",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: ["Rag As A Service", "Tool Integration", "Workflow Automation"],
  links: {
    twitter: "https://x.com/supavec_ai",
    discord: "https://go.supavec.com/discord",
    github: "https://github.com/taishikato/supavec",
  },
  hero: {
    title: "Supavec",
    description:
      "The open-source alternative to Carbon.ai. Build powerful RAG applications with any data source, at any scale.",
    cta: "Get Started",
  },
  whySupavec: [
    {
      name: "Full Control with Open Source",
      description:
        "Choose between our cloud version or self-host on your infrastructure - unlike Carbon.ai, you're never locked in. Fully open source under MIT license, giving you the freedom to adapt and modify.",
      icon: <Code2 className="size-6" />,
    },
    {
      name: "Enterprise-Grade Privacy",
      description:
        "Built with Supabase Row Level Security (RLS), ensuring your data stays private and secure on your infrastructure with granular access control.",
      icon: <Lock className="size-6" />,
    },
    {
      name: "Built to Scale",
      description:
        "Handle millions of documents, process any size, support concurrent processing, and scale horizontally. Built on Supabase, Next.js, and TypeScript.",
      icon: <Scale className="size-6" />,
    },
    {
      name: "Developer-First",
      description:
        "Simple API, comprehensive documentation, easy integration, and quick setup with a modern tech stack.",
      icon: <Wrench className="size-6" />,
    },
  ],
  features: [
    {
      name: "Simple Agent Workflows",
      description:
        "Easily create and manage AI agent workflows with intuitive APIs.",
      icon: <BrainIcon className="h-6 w-6" />,
    },
    {
      name: "Multi-Agent Systems",
      description:
        "Build complex systems with multiple AI agents working together.",
      icon: <UsersIcon className="h-6 w-6" />,
    },
    {
      name: "Tool Integration",
      description:
        "Seamlessly integrate external tools and APIs into your agent workflows.",
      icon: <PlugIcon className="h-6 w-6" />,
    },
    {
      name: "Cross-Language Support",
      description:
        "Available in all major programming languages for maximum flexibility.",
      icon: <GlobeIcon className="h-6 w-6" />,
    },
    {
      name: "Customizable Agents",
      description:
        "Design and customize agents to fit your specific use case and requirements.",
      icon: <CodeIcon className="h-6 w-6" />,
    },
    {
      name: "Efficient Execution",
      description:
        "Optimize agent performance with built-in efficiency and scalability features.",
      icon: <ZapIcon className="h-6 w-6" />,
    },
  ],
  pricing: [
    {
      name: "Basic",
      price: { monthly: "$9", yearly: "$99" },
      frequency: { monthly: "month", yearly: "year" },
      description: "Perfect for individuals and small projects.",
      features: [
        "100 AI generations per month",
        "Basic text-to-image conversion",
        "Email support",
        "Access to community forum",
      ],
      cta: "Get Started",
    },
    {
      name: "Pro",
      price: { monthly: "$29", yearly: "$290" },
      frequency: { monthly: "month", yearly: "year" },
      description: "Ideal for professionals and growing businesses.",
      features: [
        "1000 AI generations per month",
        "Advanced text-to-image conversion",
        "Priority email support",
        "API access",
        "Custom AI model fine-tuning",
        "Collaboration tools",
      ],
      cta: "Get Started",
    },
    {
      name: "Enterprise",
      price: { monthly: "$999", yearly: "Custom" },
      frequency: { monthly: "month", yearly: "year" },
      description: "Tailored solutions for large organizations.",
      features: [
        "Unlimited AI generations",
        "Dedicated account manager",
        "24/7 phone and email support",
        "Custom AI model development",
        "On-premises deployment option",
        "Advanced analytics and reporting",
      ],
      popular: true,
      cta: "Get Started",
    },
  ],
  footer: {
    socialLinks: [
      {
        icon: <Icons.github className="size-5" />,
        url: "https://github.com/taishikato/supavec",
      },
      {
        icon: <Icons.twitter className="size-5" />,
        url: "https://x.com/supavec_ai",
      },
      {
        icon: <Icons.discord className="size-5" />,
        url: "https://go.supavec.com/discord",
      },
      {
        icon: <Linkedin className="size-5" />,
        url: "https://www.linkedin.com/company/supavec",
      },
    ],
    // links: [
    //   { text: "Pricing", url: "#" },
    //   { text: "Contact", url: "#" },
    // ],
    bottomText: "All rights reserved.",
    brandText: "Supavec",
  },
};

export type SiteConfig = typeof siteConfig;
