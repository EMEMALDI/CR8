# CR8 - Digital Content Marketplace Platform

A comprehensive full-stack marketplace for creators to sell and monetize all types of digital content including music, videos, courses, PDFs, images, and more.

## 🚀 Features

### For Creators
- **Multi-format Content Support**: Music, videos, images, PDFs, documents, courses
- **Flexible Monetization**: Single purchases, monthly subscriptions, or hybrid models
- **Professional Creator Dashboard**: Real-time analytics, earnings tracking, subscriber management
- **Secure Media Streaming**: HLS video streaming and protected audio playback
- **Custom Requests**: Accept paid custom work commissions from fans
- **Paid Messaging System**: Optional paid DMs for exclusive communication
- **Marketing Tools**: Discount codes, content bundles, affiliate program
- **Stripe Connect Integration**: Direct payouts to your bank account

### For Users
- **Content Discovery**: Advanced search, filtering, and browsing
- **Multiple Purchase Options**: Buy once or subscribe to favorite creators
- **Built-in Music Player**: Full-featured player with playlists, favorites, resume playback
- **Personal Library**: Organize and manage all purchased content
- **Collaborative Playlists**: Create and share playlists with friends
- **Smart Playlists**: Auto-generated playlists based on your preferences
- **Notifications**: Real-time updates on new content from subscribed creators

### Platform Features
- **Secure Payments**: Stripe integration with fraud protection
- **Content Protection**: Token-based authentication and optional watermarking
- **10% Platform Fee**: Creators keep 90% of all revenue
- **Multi-role System**: Users, Creators, and Admins with granular permissions
- **Admin Moderation**: Content review, user management, reporting system
- **Responsive Design**: Optimized for desktop and mobile devices

## 🛠 Tech Stack

### Frontend
- **Next.js 16.0.1** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI component library (Radix UI + Tailwind)
- **Lucide React** - Icons
- **Zustand** - State management

### Backend & Database
- **Next.js API Routes** - Backend API
- **PostgreSQL** - Primary database
- **Prisma 7** - Type-safe ORM with 29 models
- **Redis (Upstash)** - Caching and rate limiting

### Authentication & Payments
- **Clerk** - Authentication (Email, Phone, Google OAuth)
- **Stripe** - Payment processing
- **Stripe Connect** - Creator payouts
- **Svix** - Webhook verification

### File Storage & Streaming
- **AWS S3 / Cloudflare R2** - File storage
- **HLS Streaming** - Adaptive bitrate video streaming
- **Secure Audio Streaming** - Token-protected music playback

### Additional Services
- **Resend** - Email notifications
- **Pusher/Ably** - Real-time notifications
- **Meilisearch** - Advanced search functionality
- **BullMQ** - Background job processing

## 📦 Installation

### Prerequisites
- Node.js 20.11.0 or higher
- npm 10.0.0 or higher
- PostgreSQL database
- Stripe account
- Clerk account

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd CR8
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
- Database URL (PostgreSQL)
- Clerk keys (publishable and secret)
- Stripe keys (publishable and secret)
- Stripe webhook secret
- Storage credentials (optional)
- Other service keys (optional)

4. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
CR8/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── user/            # User management APIs
│   │   │   ├── creator/         # Creator management APIs
│   │   │   ├── content/         # Content CRUD APIs
│   │   │   ├── payments/        # Payment processing APIs
│   │   │   └── webhooks/        # Stripe & Clerk webhooks
│   │   ├── (auth)/              # Authentication pages
│   │   ├── (public)/            # Public pages
│   │   ├── (user)/              # User dashboard
│   │   ├── (creator)/           # Creator dashboard
│   │   ├── (admin)/             # Admin panel
│   │   ├── layout.tsx           # Root layout with ClerkProvider
│   │   └── page.tsx             # Landing page
│   ├── components/
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── stripe.ts            # Stripe client
│   │   └── utils.ts             # Utility functions
│   └── middleware.ts            # Clerk authentication middleware
├── prisma/
│   ├── schema.prisma            # Database schema (29 models)
│   └── migrations/              # Database migrations
├── public/                      # Static assets
├── .env.example                 # Environment variables template
├── .nvmrc                       # Node.js version (20.11.0)
├── package.json                 # Dependencies and scripts
├── vercel.json                  # Vercel deployment config
└── README.md
```

## 🗄 Database Schema

The platform includes **29 comprehensive models**:

### Core Models
- `User` - User accounts with roles (USER, CREATOR, ADMIN)
- `CreatorProfile` - Creator-specific information and Stripe Connect
- `Content` - All types of digital content
- `ContentFile` - Multiple file versions per content

### Payment Models
- `Purchase` - One-time content purchases
- `SubscriptionTier` - Creator subscription plans
- `Subscription` - Active user subscriptions
- `Payout` - Creator earnings withdrawals

### Music & Engagement
- `Playlist` - User and smart playlists
- `PlaylistItem` - Playlist tracks
- `PlaylistCollaborator` - Shared playlists
- `PlaybackHistory` - Resume playback
- `Favorite` - Liked content
- `Comment` - Threaded comments
- `Review` - Ratings and reviews
- `Tag` - Content categorization

### Advanced Features
- `Notification` - In-app notifications
- `Message` - Paid DM system
- `CustomRequest` - Commission system
- `Report` - Content moderation
- `AffiliateLink` - Referral program
- `ContentBundle` - Discounted bundles
- `DiscountCode` - Promotional codes

## 🔌 API Endpoints

### Authentication
- `POST /api/user/upgrade-to-creator` - Become a creator
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update profile

### Creator Management
- `GET /api/creator/profile` - Get creator stats
- `PATCH /api/creator/profile` - Update creator profile

### Content Management
- `POST /api/content/create` - Create content
- `GET /api/content/[id]` - Get content details
- `PATCH /api/content/[id]` - Update content
- `DELETE /api/content/[id]` - Archive content
- `PATCH /api/content/[id]/publish` - Publish content

### Payments
- `POST /api/payments/purchase` - Purchase content
- `POST /api/subscriptions/create` - Subscribe to creator
- `DELETE /api/subscriptions/[id]/cancel` - Cancel subscription
- `POST /api/payouts/request` - Request payout (creators)

### Webhooks
- `POST /api/webhooks/clerk` - Clerk user sync
- `POST /api/webhooks/stripe` - Stripe payment events

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**
- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Click "New Project"
- Import your GitHub repository
- Vercel will auto-detect Next.js

3. **Configure Environment Variables**
Add all variables from `.env.example` in Vercel dashboard

4. **Deploy**
Vercel will automatically deploy on every push to main

### Database Setup
- Use Vercel Postgres, Supabase, or external PostgreSQL
- Run migrations after first deployment:
```bash
npx prisma migrate deploy
```

### Post-Deployment
- Configure Stripe webhooks in Stripe dashboard
- Configure Clerk webhooks in Clerk dashboard
- Test payment flows in Stripe test mode
- Switch to production mode when ready

## 🔧 Development

### Database Commands
```bash
# Generate Prisma client
npx prisma generate

# Create new migration
npx prisma migrate dev --name description

# Reset database (dev only)
npx prisma migrate reset

# Open Prisma Studio (GUI)
npx prisma studio
```

### Build and Run
```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Lint code
npm run lint
```

## 🎯 Environment Variables

See `.env.example` for complete list. Required variables:

```env
# Database
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CONNECT_CLIENT_ID="ca_..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PLATFORM_COMMISSION_RATE="0.10"
MINIMUM_PAYOUT="50.00"
```

## 📈 Roadmap

- [x] **Phase 1**: Foundation (Database, Auth, APIs)
- [x] **Phase 2**: Core Features (Content, Payments)
- [ ] **Phase 3**: Media Players (Music, Video with HLS)
- [ ] **Phase 4**: Advanced Features (Search, Notifications, Affiliates)
- [ ] **Phase 5**: Admin Panel & Moderation
- [ ] **Phase 6**: Mobile App (React Native)

## 🤝 Contributing

This is a private project. Contact the team for contribution guidelines.

## 📄 License

Proprietary - All rights reserved © 2025

## 📞 Support

For support or questions:
- Email: support@cr8.com
- Documentation: [Coming soon]

---

Built with ❤️ for creators worldwide
