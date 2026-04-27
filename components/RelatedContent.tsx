"use client";

import Image from "next/image";
import { BookOpen, ExternalLink, Newspaper, Play } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  NewsContent,
  RelatedContent as RelatedContentItem,
  VideoContent,
} from "@/lib/types";

interface Props {
  blogs: RelatedContentItem[];
  news: NewsContent[];
  videos: VideoContent[];
}

export function RelatedContentSection({ blogs, news, videos }: Props) {
  const total = blogs.length + news.length + videos.length;
  if (total === 0) return null;

  const defaultTab =
    videos.length > 0 ? "videos" : blogs.length > 0 ? "blogs" : "news";

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">참고할 만한 콘텐츠</h2>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          {videos.length > 0 && (
            <TabsTrigger value="videos">
              <Play className="mr-1 h-4 w-4" />
              영상 ({videos.length})
            </TabsTrigger>
          )}
          {blogs.length > 0 && (
            <TabsTrigger value="blogs">
              <BookOpen className="mr-1 h-4 w-4" />
              블로그 ({blogs.length})
            </TabsTrigger>
          )}
          {news.length > 0 && (
            <TabsTrigger value="news">
              <Newspaper className="mr-1 h-4 w-4" />
              뉴스 ({news.length})
            </TabsTrigger>
          )}
        </TabsList>

        {videos.length > 0 && (
          <TabsContent value="videos">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => (
                <VideoCard key={v.videoId} video={v} />
              ))}
            </div>
          </TabsContent>
        )}

        {blogs.length > 0 && (
          <TabsContent value="blogs">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {blogs.map((b, i) => (
                <BlogCard key={`${b.link}-${i}`} blog={b} />
              ))}
            </div>
          </TabsContent>
        )}

        {news.length > 0 && (
          <TabsContent value="news">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {news.map((n, i) => (
                <NewsCard key={`${n.link}-${i}`} news={n} />
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </section>
  );
}

function VideoCard({ video }: { video: VideoContent }) {
  return (
    <a
      href={video.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group overflow-hidden rounded-lg border bg-background transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-video bg-muted">
        {video.thumbnail && (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            unoptimized
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
          <div className="rounded-full bg-white/90 p-3 opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-5 w-5 fill-current" />
          </div>
        </div>
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
          {video.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">{video.channel}</span>
          <span>{video.publishedAt}</span>
        </div>
      </div>
    </a>
  );
}

function BlogCard({ blog }: { blog: RelatedContentItem }) {
  return (
    <a
      href={blog.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-lg border bg-background p-4 transition-colors hover:bg-accent"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
          {blog.title}
        </h3>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
        {blog.description}
      </p>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{blog.blogger}</span>
        <span>{blog.postdate}</span>
      </div>
    </a>
  );
}

function NewsCard({ news }: { news: NewsContent }) {
  return (
    <a
      href={news.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-lg border bg-background p-4 transition-colors hover:bg-accent"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
          {news.title}
        </h3>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
        {news.description}
      </p>
      <div className="mt-3 text-xs text-muted-foreground">{news.pubDate}</div>
    </a>
  );
}
