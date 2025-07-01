![Local SQL](https://raw.githubusercontent.com/martiinii/local-sql/main/assets/github.svg)

<div align="center">

[![Release](https://github.com/martiinii/local-sql/actions/workflows/release.yml/badge.svg)](https://github.com/martiinii/local-sql/actions/workflows/release.yml)
![NPM Version](https://img.shields.io/npm/v/local-sql)
![GitHub License](https://img.shields.io/github/license/martiinii/local-sql)
</div>
---

Local SQL is a web based, local-first modern database browser.
Visit [localsql.dev](https://localsql.dev), add connection and start browsing your tables.

> [!IMPORTANT]
> This project is under heavy development, check TODO section for current progress. Some things can be broken, some are missing

## Features

- **Privacy-Focused** Your database connection details are stored exclusively in SQLite database on your computer. No sensitive data is ever transmitted to or shared with any external services - only your locally running server.
- **Local Server** A simple command-line tool initiates a local web server, enabling secure communication between your browser and databases. This ensures all database operations are performed locally on your machine.
- **Secure Gateway** Connect multiple `local-sql` instances together to manage all your databases from a single interface. This is perfect for accessing databases in isolated environments without exposing them publicly.
- **Built-in Docker Image** Official Images on GHCR and Docker Hub let you containerize Local SQL and connect to non-exposed databases securely.
- **Token-Based Authentication** Generate `read` or `write` access token to secure public instances of Local-SQL.

## TODO

- [x] Implement data fetching and data viewer
- [ ] Inserting and updating data
- [ ] Implement pagination
- [ ] Schema visualizer
- [ ] Role based access control (per-table, improve permission: read-only, read & write, admin)
- [ ] SQL query runner and natural-language support using AI
- [ ] Add more database adapters
- [ ] Add documentation
- [ ] Theming options (tweakcn?)
- [x] Manage existing servers & connections
- [x] Explore different way to save connections (in browser local-storage vs server db with os app data directory)
- [x] Server key generation (for gateways), permissions
- [x] Better building process and CLI
- [x] Docker image for local-sql API

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

### CLI Options

- `-V, --version`        output the version number  
- `-p, --port <number>`  specify the app port number  
- `--no-ui`              run API only (no web UI)  
- `--no-api`             run web UI only (no API)  
- `--verbose`            enable detailed logs  
- `-h, --help`           display help for command

## Docker

Local SQL (API) is also available as a Docker image on:

- Github Container Registry: `ghcr.io/martiinii/local-sql:latest`
- Docker Hub: `martiinii/local-sql:latest`

Use Docker compose to run:

```yml
services:
  local-sql:
    image: ghcr.io/martiinii/local-sql:latest
    container_name: local-sql
    restart: unless-stopped

    # --- Security best-practice
    # 1. Start the container WITHOUT REQUIRE_TOKEN to initialize.
    # 2. Visit https://localsql.dev or start local-sql locally, connect to this instance of local-sql API and generate write token. Then edit server connection and paste generated token.
    # 3. Uncomment the block below to enforce token authentication:

    # environment:
    #   REQUIRE_TOKEN: "true"

    # 4. Restart the container; all connections will now require your token.

    volumes:
      - lsql:/app/db
    ports:
      - "57597:57597"

volumes:
  lsql:
```

## Built with
- [React](https://react.dev/)
- [Next.js](https://nextjs.org/)
- [Elysia](https://elysiajs.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix Primitives](https://www.radix-ui.com/primitives)
- [Tailwind](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Turborepo](https://turborepo.com/)
- [drizzle-orm](https://orm.drizzle.team/)
- [Bun](https://bun.sh/)
- [TypeScript](https://www.typescriptlang.org/)

And a huge thank you to the creators of the many other open-source dependencies that make this project possible.

## Credits

- [Etienne](https://github.com/etienne-dldc) - for generously providing `local-sql` package name
- [check-site-meta](https://github.com/alfonsusac/check-site-meta) - inspiration for CLI tool (and Next.js standalone output to npm package)
- [better-auth](https://www.better-auth.com/) - for awesome CI release workflow
- [drizzle-orm](https://orm.drizzle.team/) - `drizle-studio` was my source of inspiration for `local-sql`

