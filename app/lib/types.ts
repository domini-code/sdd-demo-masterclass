export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  coverImage: string
  publishedAt: string
  readingTime: number
  tags: string[]
}

export interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
}
