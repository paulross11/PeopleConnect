# CRM Database System

## Overview

This is a comprehensive Customer Relationship Management (CRM) system built for tracking people, jobs, and clients. The application uses a modern full-stack architecture with React frontend and Express.js backend, designed with a clean, utility-focused interface inspired by Linear and Notion for optimal data management and productivity workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with custom design tokens supporting light/dark themes
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Framework**: Express.js with TypeScript for RESTful API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **API Design**: RESTful endpoints following standard HTTP methods (GET, POST, PUT, DELETE)
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Request Logging**: Custom middleware for API request logging and performance monitoring

### Database Schema
- **People Table**: Core entity storing contact information (name, email, phone, address)
- **Jobs Table**: Work items with status tracking, linked to people and clients
- **Clients Table**: Company/organization information with contact details
- **Relationships**: Foreign key relationships between jobs, people, and clients for data integrity

### Design System
- **Color Palette**: Professional color scheme with light/dark mode support
- **Typography**: Inter font family optimized for data-dense interfaces
- **Layout**: Consistent spacing system using Tailwind utilities
- **Components**: Modular component architecture with proper separation of concerns

### Development Workflow
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Code Organization**: Monorepo structure with shared types and schemas
- **Build Process**: Separate build configurations for client and server with optimized bundling

## External Dependencies

### Database
- **Neon Database**: PostgreSQL-compatible serverless database with connection pooling
- **Connection**: Uses @neondatabase/serverless for WebSocket-based connections

### UI Framework
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Lucide React**: Modern icon library for consistent iconography
- **next-themes**: Theme management for light/dark mode switching

### Development Tools
- **Drizzle Kit**: Database schema management and migration tools
- **ESBuild**: Fast bundling for server-side code
- **PostCSS**: CSS processing with Tailwind CSS integration

### Fonts
- **Google Fonts**: Inter family for primary typography
- **Additional Fonts**: DM Sans, Fira Code, Geist Mono for specialized use cases

### Validation & Forms
- **Zod**: Runtime type validation and schema definition
- **React Hook Form**: Performant form library with minimal re-renders
- **Hookform Resolvers**: Integration between React Hook Form and Zod validation