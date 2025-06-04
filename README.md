# Local SQL (WIP)

Local SQL is a web based, local-first modern database browser.
Visit [localsql.dev](https://localsql.dev), add connection and start browsing your tables.

> [!IMPORTANT]
> This project is under heavy development, check TODO section for current progress. Some things can be broken, some are missing

## Features
- **Privacy-Focused** Your database connection details are stored exclusively in your browser's local storage. No sensitive data is ever transmitted to or shared with any external services - only your locally running server.
- **Local Server** A simple command-line tool initiates a local web server, enabling secure communication between your browser and databases. This ensures all database operations are performed locally on your machine.

## TODO
- [x] Implement data fetching and data viewer
- [ ] Inserting and updating data
- [ ] Manage existing connections
- [ ] Implement pagination
- [ ] Explore different way to save connections (in browser local-storage vs server db with os app data directory)

## Get started
Try out Local SQL [online dashboard](https://localsql.dev) or run app locally:
```sh
# Bun.js
bunx --bun local-sql@latest

# pnpm
pnpm dlx local-sql@latest

# Node.js
npx local-sql@latest
```