# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server using Shopify CLI
- `npm run build` - Generate Prisma client and build Remix app
- `npm run vercel-build` - Build for Vercel deployment (includes Prisma generate and seed)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with caching

### Database Management
- `npm run setup` - Generate Prisma client and deploy migrations
- `npx prisma generate` - Generate Prisma client
- `npx prisma migrate deploy` - Deploy database migrations
- `npx prisma db push` - Push schema changes to database
- `node prisma/seed.js` - Seed database with initial data

### Shopify CLI Commands
- `npm run config:link` - Link to Shopify app configuration
- `npm run config:use` - Use specific app configuration
- `npm run generate` - Generate Shopify app extensions
- `npm run deploy` - Deploy app to Shopify
- `npm run env` - Manage environment variables

## Architecture Overview

### Tech Stack
- **Framework**: Remix (React-based full-stack web framework)
- **Database**: PostgreSQL with Prisma ORM
- **Shopify Integration**: Shopify App Remix with App Bridge
- **UI**: Shopify Polaris design system
- **Authentication**: Shopify OAuth with Prisma session storage
- **Deployment**: Vercel with custom build script

### Database Schema
The app uses PostgreSQL with these main models:
- `Session` - Shopify app session storage
- `Review` - Customer product reviews with ratings, content, and metadata
- `ReviewSettings` - Per-shop configuration for review display and email settings
- `ReviewInvitation` - Automated email invitations for review requests
- `EmailSettings` - Email provider configuration (Mailtrap, SendGrid, etc.)
- `ReviewTemplate` - Customizable email templates for review invitations

### Route Structure
- `/app/*` - Authenticated admin routes (main app interface)
- `/api/*` - API endpoints for external integrations and webhooks
- `/webhooks/*` - Shopify webhook handlers (orders, app lifecycle)
- `/auth/*` - Authentication flows
- `/_index` - Public landing page

### Key Components
- **Email System**: Automated review invitation emails with scheduling
- **Review Management**: CRUD operations for reviews with approval workflows
- **Shopify Extension**: Theme extension in `/extensions/rws/` for storefront review display
- **External API Integration**: For sending reviews to external review management systems

### Email Integration
The app supports multiple email providers:
- Mailtrap (development/testing)
- SendGrid (production)
- Custom SMTP
- External API webhooks

### Environment Variables Required
- `SHOPIFY_API_KEY` - Shopify app API key
- `SHOPIFY_API_SECRET` - Shopify app secret
- `SHOPIFY_APP_URL` - App URL for OAuth
- `DATABASE_URL` - PostgreSQL connection string
- `SCOPES` - Comma-separated Shopify API scopes

### Development Notes
- Uses Prisma client for database operations
- Session storage handled by Shopify App Remix with Prisma adapter
- App Bridge provides embedded app experience in Shopify Admin
- GraphQL Admin API for Shopify data access
- Webhook handlers for order fulfillment and app lifecycle events
- Theme extension provides storefront review widgets

### Testing Scripts
The repository includes numerous testing scripts in the root directory for validating different functionality like webhooks, email processing, and API integrations.