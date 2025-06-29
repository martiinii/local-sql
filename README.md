![Local SQL](https://raw.githubusercontent.com/martiinii/local-sql/main/assets/github.svg)

---

Local SQL is a web based, local-first modern database browser.
Visit [localsql.dev](https://localsql.dev), add connection and start browsing your tables.

> [!IMPORTANT]
> This project is under heavy development, check TODO section for current progress. Some things can be broken, some are missing

## Features

- **Privacy-Focused** Your database connection details are stored exclusively in sql database on your computer. No sensitive data is ever transmitted to or shared with any external services - only your locally running server.
- **Local Server** A simple command-line tool initiates a local web server, enabling secure communication between your browser and databases. This ensures all database operations are performed locally on your machine.
- **Secure Gateway**: Connect multiple `local-sql` instances together to manage all your databases from a single interface. This is perfect for accessing databases in isolated environments without exposing them publicly.

## TODO

- [x] Implement data fetching and data viewer
- [ ] Inserting and updating data
- [ ] Implement pagination
- [x] Manage existing servers & connections
- [x] Explore different way to save connections (in browser local-storage vs server db with os app data directory)
- [x] Server key generation (for gateways), permissions
- [x] Better building process and CLI
- [x] Docker image for API

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

