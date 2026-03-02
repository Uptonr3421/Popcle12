# Popcle12 - Loyalty App

A modern loyalty application built with React, TypeScript, and Tailwind CSS, optimized for Vercel deployment and v0 by Vercel editing.

## Project Overview

**Popcle12** is a loyalty application designed to help businesses manage customer rewards and engagement. The project is configured for seamless integration with Vercel and v0 by Vercel, enabling collaborative development through AI-assisted code generation and GitHub-based workflows.

### Quick Links

- **v0 Project**: [https://v0.app/chat/rGDFcrHa6iZ](https://v0.app/chat/rGDFcrHa6iZ)
- **GitHub Repository**: [https://github.com/Uptonr3421/Popcle12](https://github.com/Uptonr3421/Popcle12)
- **Vercel Project ID**: `prj_VVDatbRYlUGcSH6EgxUFhEMXhGxi`

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui with Radix UI
- **Package Manager**: pnpm
- **Deployment**: Vercel
- **Version Control**: GitHub with v0 integration

## Project Structure

```
Popcle12/
├── client/                 # Frontend application
│   ├── public/            # Static assets (favicon, robots.txt, etc.)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── contexts/      # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   ├── App.tsx        # Main application component
│   │   ├── main.tsx       # React entry point
│   │   └── index.css      # Global styles and design tokens
│   └── index.html         # HTML template
├── shared/                # Shared types and constants
├── server/                # Server-side code (placeholder)
├── vercel.json           # Vercel deployment configuration
├── .v0.config.json       # v0 by Vercel configuration
├── next.config.js        # Next.js compatibility configuration
├── vite.config.ts        # Vite build configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- pnpm 10.x or higher
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Uptonr3421/Popcle12.git
cd Popcle12

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The development server will start at `http://localhost:3000`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm check` | Run TypeScript type checking |
| `pnpm format` | Format code with Prettier |

## Vercel Deployment

This project is configured for automatic deployment to Vercel.

### Setup

1. **Connect GitHub Repository**: Push your code to the `Uptonr3421/Popcle12` repository on GitHub.

2. **Create Vercel Project**: 
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Select the `Popcle12` repository
   - Vercel will automatically detect the Vite configuration

3. **Environment Variables**: Configure the following environment variables in Vercel project settings:
   - `VITE_APP_TITLE`
   - `VITE_APP_LOGO`
   - `VITE_APP_ID`
   - `VITE_ANALYTICS_ENDPOINT`
   - `VITE_ANALYTICS_WEBSITE_ID`
   - `VITE_FRONTEND_FORGE_API_URL`
   - `VITE_FRONTEND_FORGE_API_KEY`
   - `VITE_OAUTH_PORTAL_URL`

4. **Deploy**: Push to the repository to trigger automatic deployments.

## v0 by Vercel Integration

This project is fully configured for v0 by Vercel, enabling AI-assisted development and editing.

### Setup

1. **Connect to v0**:
   - Go to [v0.app](https://v0.app)
   - Create a new project or import existing one
   - Connect your GitHub repository (`Uptonr3421/Popcle12`)
   - Select the Vercel project (ID: `prj_VVDatbRYlUGcSH6EgxUFhEMXhGxi`)

2. **Workflow**:
   - v0 automatically creates feature branches (e.g., `v0/main-abc123`)
   - Changes are auto-committed as you work
   - Create pull requests directly from v0
   - Merge PRs to deploy to Vercel

3. **Component Development**:
   - Components in `client/src/components/` are automatically available in v0
   - Use shadcn/ui components for consistency
   - Follow TypeScript best practices for type safety

### Configuration Files

- **`.v0.config.json`**: Specifies project settings, component directories, and build configuration for v0
- **`vercel.json`**: Defines Vercel deployment settings, build commands, and environment variables
- **`.vercelignore`**: Excludes unnecessary files from deployment

## Development Guidelines

### Component Development

1. **Create components in `client/src/components/`** following the shadcn/ui pattern
2. **Use TypeScript** for all components with proper type definitions
3. **Export components as named exports** for v0 recognition
4. **Follow the existing design system** defined in `client/src/index.css`

### Styling

- Use Tailwind CSS utilities for styling
- Define design tokens in `client/src/index.css`
- Maintain consistency with the existing color palette and spacing system
- Implement responsive design with mobile-first approach

### State Management

- Use React hooks (useState, useContext, useReducer) for state management
- Leverage React Context for global state
- Keep component state local when possible

## Design System

The project includes a comprehensive design system with:

- **Color Palette**: Defined as CSS variables in `index.css`
- **Typography**: Font system with hierarchy rules
- **Spacing**: Consistent spacing scale
- **Components**: Pre-built shadcn/ui components ready for use

## Performance Optimization

- Code splitting with Vite
- Lazy loading for routes and components
- Image optimization for web
- CSS minification and tree-shaking
- Production source maps disabled for security

## Security

- Content Security Policy headers configured
- XSS protection enabled
- Frame options set to SAMEORIGIN
- Referrer policy configured for privacy

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Clear node_modules and reinstall: `rm -rf node_modules pnpm-lock.yaml && pnpm install`
2. Check TypeScript errors: `pnpm check`
3. Review Vite configuration in `vite.config.ts`

### v0 Integration Issues

If v0 cannot connect:

1. Verify GitHub repository is public or v0 has access
2. Check Vercel project ID in `.v0.config.json`
3. Ensure environment variables are configured in Vercel
4. Review v0 documentation at [v0.app/docs](https://v0.app/docs)

### Deployment Issues

If deployment fails:

1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Review `.vercelignore` for excluded files
4. Ensure `vercel.json` is properly formatted

## Contributing

1. Create a feature branch from the main branch
2. Make your changes and commit with descriptive messages
3. Create a pull request for review
4. After approval, merge to main for deployment

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [v0 by Vercel Documentation](https://v0.app/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Vite Documentation](https://vitejs.dev)

## License

MIT

## Support

For issues and questions:

1. Check existing GitHub issues
2. Review v0 documentation and FAQs
3. Contact Vercel support for deployment issues
4. Refer to framework documentation for development questions

---

**Project ID**: prj_VVDatbRYlUGcSH6EgxUFhEMXhGxi  
**Repository**: https://github.com/Uptonr3421/Popcle12  
**Deployment**: Vercel  
**Last Updated**: March 2, 2026
