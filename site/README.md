# JavaScript Interview Handbook app

A statically generated Next.js reading app for the Markdown handbook in the repository's `book/` directory, ready for Vercel.

## Development

```bash
npm install
npm run dev
```

The `predev` and `prebuild` hooks regenerate `generated/content.ts` from the manuscript. Add or edit a chapter under `../book/`, then restart development or run:

```bash
npm run generate:content
```

## Production check

```bash
npm test
```

The app includes full-text chapter search, a complete handbook roadmap, local reading progress, adjustable reading size, dark mode, Mermaid diagrams, and static parameters for every published chapter.

## Vercel

Set the Vercel project's root directory to `site`. Each push to the connected GitHub repository will then create a deployment automatically.
