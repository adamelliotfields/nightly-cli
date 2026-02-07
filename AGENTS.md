# nightly-cli/AGENTS.md

This is a command-line interface for fetching and displaying trending GitHub repositories from the Changelog Nightly newsletter. The newsletter itself is a React SPA that fetches data from a public but undocumented JSON API. This CLI fetches from the same API and displays the data in the terminal using an opinionated format.

## Tree

```
.
├── src/
│   ├── lib/
│   │   ├── cli.ts
│   │   ├── date.ts
│   │   ├── fetch.ts
│   │   └── format.ts
│   └── index.ts
├── AGENTS.md
├── biome.json
├── package.json
├── pnpm-lock.yaml
├── README.md
├── rolldown.config.ts
├── sea-config-windows.json
├── sea-config.json
└── tsconfig.json
```

## Preferences

- No production dependencies.
- Use `pnpm` to install dev dependencies and run commands.
- Use **Standard JS** code style:
  * `printWidth`: 100
  * `tabWidth`: 2
  * `useTabs`: false
  * `semi`: false
  * `singleQuote`: true
  * `quoteProps`: as-needed
  * `jsxSingleQuote`: false
  * `trailingComma`: none
  * `bracketSpacing`: true
  * `objectWrap`: preserve
  * `bracketSameLine`: false
  * `arrowParens`: always

## Types

Run `pnpm check` to check for TypeScript errors. Note that we are using `@typescript/native-preview`, which uses the `tsgo` executable not `tsc`.

## Linting

Run `pnpm lint:fix` to automatically fix linting issues with Biome.

## Testing

No tests have been implemented yet. Prefer `node:assert` and `node:test`.

## Building

The primary installation method is `npm i -g .`.

The `bin` field in `package.json` points to `src/index.ts`, which requires a minimum of Node 22.18.0 for TypeScript support.

We only support Node 25.5.0 and newer for building a single executable application (SEA). This requires bundling `dist/nightly.cjs` with `rolldown` first via `pnpm build` followed by `npm run build:bin` or `npm run build:exe`. Note that we need to run the final build command with `npm` not `pnpm` for `$npm_node_execpath` to be set.
