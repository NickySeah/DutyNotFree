"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Globe2, MoveRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/lib/checkRole";
import Feature from "@/components/feature";
import { NewsFeed } from "@/components/NewsFeed";
export default function HomePage() {
  const { isAuthenticated } = useUserRole();
  return (
    <>
      <section className="site-container grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div>
          <div className="mb-7 flex items-center gap-2 text-sm text-primary">
            <Globe2 className="size-4" />
            International trade, made clearer
          </div>
          <h1 className="max-w-xl text-5xl font-semibold leading-[1.08] tracking-[-2.5px] md:text-6xl lg:text-7xl">
            Know the cost.
            <br />
            Before it ships.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            Navigate tariffs, explore trade agreements, and understand your
            import costs. All in one considered workspace.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="h-12 px-6">
              <Link href={isAuthenticated ? "/calculator" : "/register"}>
                Start calculating
                <ArrowUpRight />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/#tools">
                Explore the toolkit
                <MoveRight />
              </Link>
            </Button>
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="size-4 text-primary" />
            Built for curious importers and suppliers.
          </p>
        </div>
        <div className="relative pb-10 pl-0 sm:pl-7">
          <div className="relative h-[340px] overflow-hidden rounded-2xl md:h-[430px]">
            <Image
              src="/images/shipyard.jpg"
              alt="Container port connecting international trade routes"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-8 rounded-xl border bg-card p-5 shadow-lg sm:right-16">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold">
                Every route starts with a clearer picture.
              </p>
              <Globe2 className="size-5 shrink-0 text-primary" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Your origin</p>
                <p className="mt-1 text-sm font-medium">Where it begins</p>
              </div>
              <span className="flex-1 border-t border-dashed border-primary/40" />
              <MoveRight className="size-4 text-primary" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Your destination
                </p>
                <p className="mt-1 text-sm font-medium">What comes next</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="border-y bg-card">
        <div className="site-container grid gap-6 py-7 text-sm sm:grid-cols-3">
          <p className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-primary" />
            Understand the applicable duties
          </p>
          <p className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-primary" />
            Find trade agreement benefits
          </p>
          <p className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-primary" />
            Plan with a detailed cost breakdown
          </p>
        </div>
      </div>
      <Feature />
      <NewsFeed />
      <section className="site-container mb-16 flex flex-col items-start justify-between gap-8 rounded-2xl border bg-card p-8 sm:flex-row sm:items-center md:p-12">
        <div>
          <h2 className="section-title">A better-informed next move.</h2>
          <p className="mt-3 text-muted-foreground">
            Bring your products, trade routes, and tariff questions together.
          </p>
        </div>
        <Button asChild size="lg" className="h-12">
          <Link href={isAuthenticated ? "/tariff" : "/register"}>
            Open your workspace
            <ArrowUpRight />
          </Link>
        </Button>
      </section>
    </>
  );
}
