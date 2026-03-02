# Popcle - Loyalty App

A modern loyalty program application built with Next.js, Tailwind CSS, and Vercel deployment.

## Quick Links

- **v0 Project**: https://v0.app/chat/rGDFcrHa6iZ
- **GitHub Repository**: https://github.com/Uptonr3421/Popcle12
- **Vercel Project ID**: `prj_VVDatbRYlUGcSH6EgxUFhEMXhGxi`

## Technology Stack

- **Framework**: Next.js 15.0+
- **Styling**: Tailwind CSS 3.4+
- **Language**: TypeScript
- **Deployment**: Vercel
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js 24.x or higher
- npm or yarn package manager
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Uptonr3421/Popcle12.git
cd Popcle12

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── public/                # Static assets
├── styles/                # Additional stylesheets
├── utils/                 # Helper utilities
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── next.config.mjs        # Next.js configuration
├── vercel.json            # Vercel deployment configuration
├── .v0.config.json        # v0 by Vercel configuration
└── README.md              # This file
```

## Vercel Deployment

### Automatic Deployment

The repository is configured for automatic deployment on Vercel:

1. Push changes to the `main` branch
2. Vercel automatically detects the push
3. Builds and deploys the application
4. Preview deployments created for pull requests

### Manual Deployment

```bash
# Deploy to Vercel
npm run build
vercel deploy
```

### Environment Variables

Configure environment variables in Vercel project settings:

- `NEXT_PUBLIC_APP_URL`: Application URL (auto-set by Vercel)

## v0 by Vercel Integration

### Setup

1. Visit https://v0.app
2. Connect your GitHub repository (`Uptonr3421/Popcle12`)
3. Link to Vercel project ID: `prj_VVDatbRYlUGcSH6EgxUFhEMXhGxi`
4. Start editing with AI assistance

### Workflow

- v0 creates feature branches automatically (`v0/main-*`)
- Changes are auto-committed as you work
- Create pull requests from v0 interface
- Merge to main for automatic Vercel deployment

### Component Guidelines

- Store components in `components/` directory
- Use TypeScript for type safety
- Follow Tailwind CSS conventions
- Maintain consistent naming patterns

## Build Configuration

### Vercel Configuration (vercel.json)

- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Dev Command**: `npm run dev`
- **Install Command**: `npm install`
- **Framework**: Next.js
- **Node Version**: 24.x

### v0 Configuration (.v0.config.json)

- **Project ID**: `prj_VVDatbRYlUGcSH6EgxUFhEMXhGxi`
- **Framework**: Next.js
- **TypeScript**: Enabled
- **Tailwind**: Enabled
- **Git Sync**: Enabled with auto-commit and auto-push

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Clear cache: `rm -rf .next node_modules`
2. Reinstall dependencies: `npm install`
3. Rebuild: `npm run build`

### Vercel Deployment Issues

- Check build logs in Vercel dashboard
- Verify environment variables are set
- Ensure Node.js version matches (24.x)
- Check for TypeScript errors: `npm run lint`

### v0 Integration Issues

- Ensure GitHub repository is connected
- Verify Vercel project ID is correct
- Check that component directories exist
- Confirm TypeScript and Tailwind are enabled

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit: `git commit -am 'Add feature'`
4. Push: `git push origin feature/your-feature`
5. Create a pull request

## License

MIT

## Support

For issues and questions:
- GitHub Issues: https://github.com/Uptonr3421/Popcle12/issues
- v0 Support: https://v0.app/chat/rGDFcrHa6iZ
- Vercel Support: https://vercel.com/support
