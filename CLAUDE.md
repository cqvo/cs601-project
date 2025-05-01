## Project Reference Documentation

This project references the following documents for configuration and implementation details:

- **APPWRITE.md**: Contains Appwrite configuration details, database schema, and integration guidelines
  - Includes authentication setup, collection structure with JSONB approach for related data
  - Defines security rules and permission structure
  - Provides code examples for common API operations# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal resume management system built with SvelteKit. The application has:

- A public-facing resume page that dynamically displays content
- A private dashboard (authentication required) for content management
- CRUD operations for resume sections, entries, and details
- Show/hide toggles for controlling what appears on the public page

## Tech Stack

- **Frontend**: SvelteKit with Svelte 5 (runes)
- **UI Library**: Skeleton v3 with Tailwind CSS
- **Icons**: Lucide
- **Backend**: Appwrite (Auth, Database, Storage)
- **Package Manager**: PNPM

## Build/Test/Lint Commands

- Build: `pnpm build`
- Dev server: `pnpm dev`
- Lint: `pnpm lint`
- Format: `pnpm format`
- Type check: `pnpm check`
- Run all tests: `pnpm test`
- Run tests in watch mode: `pnpm test:unit`
- Run a single test file: `pnpm test:unit src/path/to/file.test.ts`
- Run tests matching pattern: `pnpm test:unit -t "test pattern"`

## Project Structure

```
src/
├── app.d.ts              # TypeScript declarations
├── app.html              # SvelteKit HTML template
├── lib/                  # Shared library code
│   ├── components/       # Reusable Svelte components
│   ├── server/           # Server-only code
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── appwrite/         # Appwrite client setup and API functions
├── params/               # Route parameters
├── routes/               # SvelteKit routes
│   ├── +layout.svelte    # Root layout
│   ├── +page.svelte      # Public resume page
│   ├── dashboard/        # Private dashboard routes
│   │   ├── +layout.svelte  # Dashboard layout with auth guard
│   │   ├── +page.svelte    # Dashboard home
│   │   └── settings/       # Settings pages
│   └── login/             # Authentication routes
└── tests/                # Test files and utilities
```

## Code Style Guidelines

- **Formatting**: Prettier with Svelte and Tailwind plugins
- **Types**: Strict TypeScript mode enabled
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Imports**: ES modules only (package.json type=module)
- **Components**: Use Svelte 5 with SvelteKit
- **CSS**: Use Tailwind with Skeleton component library
- **Error Handling**: Use type-safe patterns with strict checks
- **Testing**: Vitest with Testing Library patterns
  - Tests co-located with components (*.svelte.test.ts)
  - Component tests use render/screen pattern

## Svelte 5 Guidelines

- Use runes (`$state`, `$derived`, `$effect`, `$props`) for reactivity
- Directly mutate reactive state (`count++` not `setCount(count + 1)`)
- Define component props with `$props()` with default values
- Keep derived values pure with `$derived`
- Use `$effect` only for side effects
- Implement error boundaries with `<svelte:boundary>`
- Use filesystem-based routing, following SvelteKit patterns

## Skeleton UI Guidelines

- Import components from `@skeletonlabs/skeleton`
- Use functional props for behavior, style props for appearance
- Follow utility-first approach with Tailwind classes
- Apply component classes via the `classes` prop
- Set theme via `data-theme` attribute at the document level
- Use Tailwind's responsive breakpoint variants when needed

## Responsive Design Guidelines

- Implement mobile-first design approach
- Start with mobile layouts and scale up using Tailwind breakpoints
- Use Tailwind's responsive classes (sm:, md:, lg:, xl:) to adapt layouts
- Test all interfaces at multiple viewport sizes
- Ensure touch-friendly UI elements on mobile (adequate spacing, larger touch targets)
- Implement responsive typography using Tailwind's text utilities
- Use Skeleton's responsive container components
- Consider different navigation patterns for mobile vs desktop
- Optimize image loading and sizing for various devices

## Print Optimization

- Create a print-specific stylesheet using Tailwind's `print:` modifier
- Optimize the resume page for printing:
  - Use a white background with print-friendly colors
  - Hide unnecessary navigation, buttons, and UI elements
  - Adjust margins to maximize content area
  - Ensure text remains readable when printed
  - Format page breaks appropriately to avoid splitting sections
  - Use print-specific typography adjustments (sizing, line-height)
  - Create printer-friendly tables and lists
  - Show full URLs for links (use `print:after:content-[attr(href)]`)
  - Test with actual printers and PDF exports
- Include a dedicated "print version" button on the resume page

## Appwrite Integration

- **Auth**: Use Appwrite Auth for user login/registration
- **Database**: Store resume sections and content in Appwrite DB
  - Collections: `sections`, `entries`, `skills`, etc.
  - Use appropriate indexes for efficient queries
- **Storage**: Handle file uploads (profile pictures, attachments)
- **Security**: Implement proper role-based access control
  - Public content accessible without authentication
  - Dashboard protected with auth middleware

## Resume Data Structure

Resume data should follow a structured format:

- **Sections**: Major resume categories (e.g., experience, education, skills)
- **Entries**: Individual items within sections (e.g., job positions, degrees)
- **Metadata**: Control attributes like `isVisible`, `order`, `lastUpdated`

## Authentication Flow

1. Users login through `/login`
2. Successful logins redirect to `/dashboard`
3. Failed attempts return to login with error message
4. Dashboard routes check auth status in layout load function
5. Unauthenticated access to dashboard redirects to login