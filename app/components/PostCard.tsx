import Link from "next/link"
import Image from "next/image"
import type { Post } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PostCardProps {
  post: Post
  className?: string
  action?: React.ReactNode
}

export function PostCard({ post, className, action }: PostCardProps) {
  return (
    <article className={cn("group rounded-xl border border-border bg-card overflow-hidden", className)}>
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>

      <div className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h2 className="mb-2 text-lg font-semibold leading-snug text-foreground hover:text-primary transition-colors">
            {post.title}
          </h2>
        </Link>

        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span suppressHydrationWarning>
            {new Date(post.publishedAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <div className="flex items-center gap-3">
            <span>{post.readingTime} min lectura</span>
            {action}
          </div>
        </div>
      </div>
    </article>
  )
}
