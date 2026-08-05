# JavaScript Interview Handbook app

A statically generated Next.js frontend wiki. JavaScript source content lives under the repository's `javascript/` directory, with a parallel `react/` structure ready for future content.

## Development

```bash
npm install
npm run dev
```

The `predev` and `prebuild` hooks regenerate `generated/content.ts` from the source files. Add or edit JavaScript chapters under `../javascript/handbook/` and Q&A under `../javascript/q-and-a/`, then restart development or run:

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
