"use client";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Newspaper, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
type NewsItem = {
  id: string;
  url: string;
  title: string;
  content_text: string;
  date_published: string;
};
export function NewsFeed() {
  const news = useQuery({
    queryKey: ["tradeNews"],
    staleTime: 300_000,
    retry: false,
    queryFn: async (): Promise<NewsItem[]> => {
      const response = await fetch(
        "https://rss.app/feeds/v1.1/zeYSledGHwgZivPo.json",
        { signal: AbortSignal.timeout(10_000) },
      );
      if (!response.ok) throw new Error("News unavailable");
      const data = await response.json();
      return Array.isArray(data.items) ? data.items.slice(0, 3) : [];
    },
  });
  return (
    <section className="border-t bg-card py-16">
      <div className="site-container">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="section-title">Around the world of trade</h2>
            <p className="mt-3 text-muted-foreground">
              A little context for your next decision.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label="Refresh trade news"
            disabled={news.isFetching}
            onClick={() => news.refetch()}
          >
            <RefreshCw className={news.isFetching ? "animate-spin" : ""} />
          </Button>
        </div>
        {news.isPending ? (
          <p className="py-8 text-sm text-muted-foreground" role="status">
            Loading trade headlines…
          </p>
        ) : news.isError || !news.data?.length ? (
          <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-background p-6">
            <Newspaper className="size-6 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">
                Headlines are currently unavailable.
              </p>
              <p className="text-sm text-muted-foreground">
                Refresh to try again, or explore trade coverage directly.
              </p>
            </div>
            <a
              href="https://news.google.com/search?q=international%20trade"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary"
            >
              Read trade news
              <ExternalLink className="size-4" />
            </a>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {news.data.map((item) => (
              <article key={item.id} className="border-t pt-5">
                <p className="text-xs text-muted-foreground">
                  {Number.isFinite(Date.parse(item.date_published))
                    ? new Date(item.date_published).toLocaleDateString(
                        undefined,
                        { day: "numeric", month: "short", year: "numeric" },
                      )
                    : "Trade news"}
                </p>
                <h3 className="mt-3 text-lg font-semibold leading-snug">
                  {item.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                  {item.content_text}
                </p>
                {/^https?:\/\//i.test(item.url) && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm text-primary"
                  >
                    Read article
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
