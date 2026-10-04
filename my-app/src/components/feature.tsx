import {
  Calculator,
  Database,
  Globe2,
  Bell,
  Package,
  BarChart3,
} from "lucide-react";
const tools = [
  {
    icon: Calculator,
    title: "See the full cost",
    text: "Estimate duties across multiple products with a clear breakdown of the rules applied.",
  },
  {
    icon: Database,
    title: "Explore the tariff landscape",
    text: "Search the available dataset by product classification, origin, destination, and tariff type.",
  },
  {
    icon: Globe2,
    title: "Find the agreement advantage",
    text: "Understand trade agreement rates, exclusions, and product-specific concessions.",
  },
  {
    icon: Package,
    title: "Build your product library",
    text: "Keep your HS classifications and products organized for the next calculation.",
  },
  {
    icon: Bell,
    title: "Keep a watch on your routes",
    text: "Follow tariff rules and receive email notifications when those rules change.",
  },
  {
    icon: BarChart3,
    title: "Turn data into perspective",
    text: "Compare the available tariff rates with focused charts and useful filters.",
  },
];
export default function Feature() {
  return (
    <section id="tools" className="site-container py-20">
      <div className="mb-12 grid gap-5 md:grid-cols-2">
        <h2 className="section-title max-w-md">
          The details of trade.
          <br />A simpler way to see them.
        </h2>
        <p className="max-w-md self-end text-base leading-relaxed text-muted-foreground">
          From the first product classification to the final estimate, your
          toolkit keeps the essential details connected.
        </p>
      </div>
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map(({ icon: Icon, title, text }) => (
          <div key={title} className="border-t pt-7">
            <Icon className="mb-5 size-6 text-primary" />
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
