# HubSpot AI Configuration Platform

## Overview

This is a B2B SaaS platform that uses AI to automatically configure HubSpot CRM based on industry-specific needs. Users select their industry (real estate, e-commerce, healthcare, etc.), connect their HubSpot account via API key, and the system generates and applies custom properties, lists, and workflows tailored to their business sector.

The application streamlines HubSpot setup by eliminating manual configuration work, providing industry-optimized CRM structures through AI-powered generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**Routing**: Wouter for client-side routing with four main pages:
- Industry selection (`/`)
- HubSpot connection (`/connect`)
- AI configuration process (`/configure`)
- Configuration dashboard (`/dashboard`)

**UI Component System**: shadcn/ui design system built on Radix UI primitives
- All components follow a consistent "New York" style variant
- Tailwind CSS for styling with custom design tokens
- Theme support (light/dark mode) with ThemeProvider context
- Sidebar-based layout with collapsible navigation

**State Management**: 
- TanStack Query (React Query) for server state management
- React Context for theme and sidebar state
- Local component state for form interactions

**Design Philosophy**: Material Design + modern SaaS patterns prioritizing clarity, progressive disclosure, and real-time feedback. The design emphasizes functionality over decoration with a professional polish suitable for B2B productivity tools.

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**Development/Production Split**:
- Development mode uses Vite middleware for HMR and SSR of the React application
- Production mode serves pre-built static assets from the `dist/public` directory
- Separate entry points (`index-dev.ts` and `index-prod.ts`)

**API Structure**: RESTful endpoints under `/api`:
- `GET /api/industries` - Returns available industry configurations
- `POST /api/hubspot/test-connection` - Validates HubSpot API keys
- `POST /api/hubspot/generate-config` - Triggers AI generation and applies configuration

**Data Storage Strategy**:
- Uses in-memory storage (`MemStorage`) for development/demo purposes
- Database schema defined with Drizzle ORM for PostgreSQL (schema in `shared/schema.ts`)
- Two main tables: `users` and `configuration_sessions`
- **Critical security decision**: HubSpot API keys are NEVER stored - only used during request processing

**Session Management**: Configuration sessions track the status of each setup process (connecting, generating, applying, completed, error) but explicitly exclude storing sensitive API credentials.

### AI Integration

**OpenAI Service**: Uses Replit's AI Integrations service (OpenAI-compatible API)
- Generates industry-specific CRM configurations via GPT models
- Creates custom properties, segmented lists, and workflow automations
- Implements retry logic with `p-retry` for rate limit handling
- Concurrency limiting with `p-limit` to prevent API throttling

**Prompt Engineering**: The system uses structured prompts to generate JSON configurations containing:
- 8-12 custom properties per industry with appropriate field types
- 4-6 segmented contact/company lists
- 3-5 workflow automations

### HubSpot Integration

**Client Library**: Official `@hubspot/api-client` package

**Operations**:
- Connection testing via API health check
- Property creation on contact objects
- List creation (manual and dynamic)
- Workflow creation (though actions/triggers are placeholders)

**Error Handling**: Comprehensive error catching for API failures with user-friendly French error messages.

## External Dependencies

### Third-Party APIs

**HubSpot API**: 
- User-provided API keys for authentication
- Full CRM access required to create properties, lists, and workflows
- No OAuth flow - direct API key authentication

**OpenAI API** (via Replit AI Integrations):
- Base URL: `process.env.AI_INTEGRATIONS_OPENAI_BASE_URL`
- API Key: `process.env.AI_INTEGRATIONS_OPENAI_API_KEY`
- Used for generating industry-specific configurations

### Database

**PostgreSQL** (via Neon serverless):
- Connection string: `process.env.DATABASE_URL`
- Driver: `@neondatabase/serverless`
- ORM: Drizzle ORM with schema defined in `shared/schema.ts`
- Migration management via `drizzle-kit`

### UI Component Libraries

**Core Dependencies**:
- Radix UI primitives (accordion, dialog, dropdown, select, etc.)
- Tailwind CSS for styling
- Lucide React for icons
- TanStack Query for data fetching
- React Hook Form with Zod validation

### Build & Development Tools

- Vite for frontend bundling and dev server
- esbuild for server-side bundling in production
- TypeScript for type safety across client and server
- Replit-specific plugins for development experience (cartographer, dev banner, error overlay)

### Font Resources

**Google Fonts CDN**:
- Inter (primary UI font)
- JetBrains Mono (monospace for code/API keys)
- Additional fonts: Architects Daughter, DM Sans, Fira Code, Geist Mono

### Session & State Management

- `connect-pg-simple` for PostgreSQL-backed session storage
- In-memory fallback storage for development