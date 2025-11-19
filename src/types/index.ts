// TypeScript types for the application

export interface User {
  id: number
  email: string
  name: string | null
  bio: string | null
  avatar: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: number
  title: string
  content: string
  published: boolean
  authorId: number
  deletedAt: Date | null
  coverImage: string | null
  slug: string | null
  excerpt: string | null
  author?: User
  tags?: Tag[]
  comments?: Comment[]
  likes?: Like[]
  _count?: {
    likes: number
    comments: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  id: number
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: number
  content: string
  postId: number
  authorId: number
  parentId: number | null
  parent?: Comment | null
  replies?: Comment[]
  post?: Post
  author?: User
  createdAt: Date
  updatedAt: Date
}

export interface Like {
  id: number
  postId: number
  authorId: number
  post?: Post
  author?: User
  createdAt: Date
}

export interface Follow {
  id: number
  followerId: number
  followingId: number
  follower?: User
  following?: User
  createdAt: Date
}

export interface ApiResponse<T> {
  success?: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AuthUser {
  id: number
  email: string
  name: string | null
  token: string
}

