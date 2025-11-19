# Rema-Blog - Medium-Inspired Publishing Platform

A full-featured publishing platform built with Next.js, React, TypeScript, and Prisma. Inspired by Medium, this platform enables rich content creation, social interactions, and seamless user experiences.

## 🚀 Features

### Core Features
- **Rich Text Editor**: Jodit Editor with support for formatting, images, videos, and embeds
- **User Authentication**: JWT-based authentication with protected routes
- **Post Management**: Full CRUD operations for posts with draft support
- **Media Upload**: Cloudinary integration for image uploads and optimization

### Social Features
- **Comments System**: Nested comments with reply functionality
- **Likes/Claps**: Like posts with optimistic UI updates
- **Follow System**: Follow/unfollow authors with personalized feeds
- **Tags**: Tag posts and filter by tags
- **Search**: Full-text search with debounced queries

### Technical Features
- **TypeScript**: Full type safety across the codebase
- **React Query**: Efficient data fetching and caching
- **SEO Optimized**: Open Graph tags, dynamic metadata
- **Responsive Design**: Modern, mobile-first UI with Tailwind CSS
- **Testing**: Jest and React Testing Library setup
- **Performance**: SSG/ISR for optimal performance

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- Cloudinary account (for image uploads)
- Environment variables configured

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rema-blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/rema_blog"
   JWT_SECRET="your-super-secret-jwt-key-here"
   CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
rema-blog/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/             # Database migrations
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   ├── auth/               # Authentication pages
│   │   ├── post/               # Post detail pages
│   │   ├── write/              # Editor page
│   │   ├── profile/            # User profile
│   │   ├── search/             # Search results
│   │   ├── tag/                # Tag pages
│   │   └── author/            # Author profile pages
│   ├── components/             # React components
│   │   ├── Comments.tsx       # Comments component
│   │   ├── LikeButton.tsx     # Like button with optimistic UI
│   │   ├── FollowButton.tsx   # Follow button
│   │   ├── SearchBar.tsx      # Search bar component
│   │   ├── Header.tsx         # Navigation header
│   │   └── Footer.tsx         # Footer component
│   ├── hooks/                  # Custom React hooks
│   │   └── useDebounce.ts     # Debounce hook
│   ├── lib/                    # Utility libraries
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # Auth utilities
│   │   └── react-query.tsx    # React Query provider
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts           # Shared types
│   └── styles/                # Global styles
├── public/                     # Static assets
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Jest setup
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

## 🧪 Testing

Run tests with:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Type checking:
```bash
npm run type-check
```

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `CLOUDINARY_URL`
     - `NEXT_PUBLIC_API_URL` (your Vercel URL)

3. **Deploy**
   - Vercel will automatically detect Next.js
   - Build settings are pre-configured
   - Deploy on every push to main branch

### Environment Variables for Production

Set these in your Vercel project settings:

- `DATABASE_URL`: Your production PostgreSQL connection string
- `JWT_SECRET`: A strong, random secret key
- `CLOUDINARY_URL`: Your Cloudinary credentials
- `NEXT_PUBLIC_API_URL`: Your production URL (e.g., `https://your-app.vercel.app`)

### Database Migration

Run migrations in production:
```bash
npx prisma migrate deploy
```

## 📚 API Routes

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Sign in user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Posts
- `GET /api/posts` - Get all published posts (paginated)
- `POST /api/posts` - Create new post (requires auth)
- `GET /api/posts/[id]` - Get single post
- `PUT /api/posts/[id]` - Update post (requires auth)
- `DELETE /api/posts/[id]` - Delete post (requires auth)
- `GET /api/posts/my-posts` - Get user's posts (requires auth)

### Comments
- `GET /api/posts/[id]/comments` - Get comments for a post
- `POST /api/posts/[id]/comments` - Create comment (requires auth)

### Likes
- `GET /api/posts/[id]/like` - Get like status
- `POST /api/posts/[id]/like` - Toggle like (requires auth)

### Follow
- `GET /api/users/[id]/follow` - Get follow status
- `POST /api/users/[id]/follow` - Toggle follow (requires auth)

### Tags
- `GET /api/tags` - Get all tags
- `GET /api/tags/[slug]` - Get posts by tag

### Search
- `GET /api/search?q=query` - Search posts

## 🎨 Features in Detail

### Rich Text Editor
- WYSIWYG editor powered by Jodit
- Image uploads via Cloudinary
- Support for videos, links, code blocks
- Live preview while writing

### Authentication
- JWT-based authentication
- Protected routes with middleware
- Password hashing with bcrypt
- Session management via localStorage

### Social Interactions
- **Comments**: Threaded comments with nested replies
- **Likes**: Optimistic UI updates for instant feedback
- **Follow**: Follow authors to personalize your feed
- **Tags**: Organize content with tags

### Performance
- Static Site Generation (SSG) for posts
- Incremental Static Regeneration (ISR) for updates
- Image optimization with Next.js Image
- React Query for efficient data fetching

## 🔒 Security

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation and sanitization
- SQL injection prevention via Prisma

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👤 Author

Built as a demonstration of full-stack Next.js development skills.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- Jodit for the rich text editor
- Cloudinary for image hosting
- Tailwind CSS for styling

---

**Note**: This is a demonstration project. For production use, consider:
- Adding rate limiting
- Implementing proper error logging (e.g., Sentry)
- Adding analytics (e.g., Vercel Analytics, Google Analytics)
- Setting up CI/CD pipelines
- Adding comprehensive test coverage
- Implementing caching strategies
- Adding monitoring and alerting
