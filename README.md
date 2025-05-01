# Personal Resume CMS

A personal resume management system built with SvelteKit and Appwrite. This application provides a public-facing resume page and a private dashboard for content management.

## Features

- **Public Resume Page**: Dynamically display your professional information
- **Private Dashboard**: Secure area for content management (authentication required)
- **Content Management**: CRUD operations for resume sections, entries, and details
- **Visibility Control**: Show/hide toggles for controlling what appears on your public resume
- **Responsive Design**: Mobile-first approach with Tailwind responsive utilities
- **Print Optimization**: Print-friendly resume formatting

## Tech Stack

- **Frontend**: SvelteKit with Svelte 5 (runes)
- **UI Library**: Skeleton v3 with Tailwind CSS
- **Icons**: Lucide
- **Backend**: Appwrite (Auth, Database, Storage)
- **Package Manager**: PNPM

## Getting Started

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Configure Appwrite (see APPWRITE.md for details)
4. Start the development server with `pnpm dev`
5. Visit `http://localhost:5173` to see the application

## Development Commands

- **Build**: `pnpm build`
- **Development Server**: `pnpm dev`
- **Linting**: `pnpm lint`
- **Formatting**: `pnpm format`
- **Type Checking**: `pnpm check`
- **Testing**: `pnpm test`
- **Watch Tests**: `pnpm test:unit`
- **Run Specific Test**: `pnpm test:unit src/path/to/file.test.ts`
- **Run Tests by Pattern**: `pnpm test:unit -t "test pattern"`

## Authentication System

The application implements a robust authentication system with Appwrite:

- **Session Management**: Automatic handling of authentication state across page loads and navigation
- **Server-Side Validation**: Server hooks validate authentication status before rendering protected routes
- **Expiration Handling**: Graceful handling of session expiration with automatic refresh
- **Redirect Preservation**: Maintains intended destination when authentication is required
- **Security**: Protected routes with proper server and client authentication checks

## License

MIT