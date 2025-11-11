"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Calendar, Newspaper, Loader2, AlertCircle, RefreshCw, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Marquee } from "@/components/ui/marquee";

interface NewsItem {
  id: string;
  url: string;
  title: string;
  content_text: string;
  image?: string;
  date_published: string;
  authors?: Array<{ name: string }>;
}

interface NewsFeed {
  title: string;
  items: NewsItem[];
}

const NewsCard = ({ 
  item, 
  imageErrors, 
  onImageError, 
  formatDate 
}: { 
  item: NewsItem; 
  imageErrors: Set<string>; 
  onImageError: (id: string) => void; 
  formatDate: (date: string) => string;
}) => (
  <Card 
    className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-gray-200 hover:border-blue-300 w-[350px] mx-3"
  >
    {/* Image or Placeholder */}
    <div className="relative w-full h-48 bg-gradient-to-br from-blue-50 to-gray-100 overflow-hidden">
      {item.image && !imageErrors.has(item.id) ? (
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => onImageError(item.id)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
          <ImageIcon className="w-16 h-16 mb-2 opacity-50" />
          <span className="text-xs font-medium">No Image Available</span>
        </div>
      )}
    </div>
    
    <CardHeader className="pb-3">
      <CardTitle className="text-base line-clamp-2 group-hover:text-blue-600 transition-colors">
        {item.title}
      </CardTitle>
      <CardDescription className="line-clamp-3 text-sm">
        {item.content_text}
      </CardDescription>
    </CardHeader>
    
    <CardContent className="pt-0">
      <Separator className="mb-3" />
      
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(item.date_published)}
        </div>
        
        {item.authors && item.authors.length > 0 && (
          <span className="truncate max-w-[120px]">
            {item.authors[0].name}
          </span>
        )}
      </div>
      
      <Button
        asChild
        variant="outline"
        size="sm"
        className="w-full group-hover:bg-blue-50 group-hover:border-blue-300 transition-colors"
      >
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2"
        >
          Read Article
          <ExternalLink className="w-3 h-3" />
        </a>
      </Button>
    </CardContent>
  </Card>
);

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('https://rss.app/feeds/v1.1/zeYSledGHwgZivPo.json');
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data: NewsFeed = await response.json();
      setNews(data.items || []);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Unable to load news feed. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => new Set(prev).add(itemId));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (isLoading) {
    return (
      <div className="w-full py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <Card className="border-none shadow-lg">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Newspaper className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">Latest Tariff News</CardTitle>
              <CardDescription className="text-base">
                Stay informed with real-time updates on tariffs and international trade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading latest news...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <Card className="border-red-200 shadow-lg">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">Unable to Load News</CardTitle>
              <CardDescription className="text-base">{error}</CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <Button onClick={fetchNews} size="lg" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Split news into two rows for alternating scroll directions
  const firstRow = news.slice(0, Math.ceil(news.length / 2));
  const secondRow = news.slice(Math.ceil(news.length / 2));

  return (
    <div className="w-full py-12 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Newspaper className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-3xl font-bold">Latest Tariff News</h2>
            <Badge variant="secondary" className="text-xs">
              Live Feed
            </Badge>
          </div>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Stay informed with real-time updates on tariffs and international trade from trusted sources worldwide
          </p>
        </div>
      </div>

      {/* First Marquee Row - Left to Right */}
      <Marquee pauseOnHover className="[--duration:60s] mb-6">
        {firstRow.map((item) => (
          <NewsCard
            key={item.id}
            item={item}
            imageErrors={imageErrors}
            onImageError={handleImageError}
            formatDate={formatDate}
          />
        ))}
      </Marquee>

      {/* Second Marquee Row - Right to Left */}
      <Marquee reverse pauseOnHover className="[--duration:60s] mb-6">
        {secondRow.map((item) => (
          <NewsCard
            key={item.id}
            item={item}
            imageErrors={imageErrors}
            onImageError={handleImageError}
            formatDate={formatDate}
          />
        ))}
      </Marquee>

      {/* Footer Actions */}
      <div className="container mx-auto px-4 mt-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={fetchNews}
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Refresh Feed
              </>
            )}
          </Button>

          <Button
            asChild
            variant="link"
            size="sm"
            className="gap-1 text-blue-600"
          >
            <a
              href="https://news.google.com/search?q=tariff&hl=en-US&gl=US&ceid=US%3Aen"
              target="_blank"
              rel="noopener noreferrer"
            >
              View all on Google News
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}