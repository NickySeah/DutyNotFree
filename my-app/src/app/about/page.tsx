import Link from "next/link";
import { ArrowUpRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
const team = [
  "Bryan Lee",
  "Denzyl Ng",
  "Fermin Lim",
  "Nicholas Seah",
  "Zhen Yang",
];
export default function AboutPage() {
  return (
    <div className="site-container py-16 md:py-24">
      <GraduationCap className="mb-7 size-8 text-primary" />
      <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-[-2px] md:text-6xl">
        Trade is complicated.
        <br />
        Understanding it shouldn’t be.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        DutyNotFree began as a student project at Singapore Management
        University, bringing tariff calculations, product classifications, and
        trade agreements into one workspace.
      </p>
      <div className="my-16 grid gap-12 border-y py-12 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Built to make the details clearer
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Explore the available trade dataset, compare duties, and see how
            agreements can affect a cost estimate. This is an educational tool:
            calculations depend on the data available in the application.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            The people behind the project
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {team.map((name) => (
              <li key={name} className="text-muted-foreground">
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <h2 className="section-title">Start with your next trade route.</h2>
      <Button asChild size="lg" className="mt-6">
        <Link href="/register">
          Explore DutyNotFree
          <ArrowUpRight />
        </Link>
      </Button>
    </div>
  );
}
