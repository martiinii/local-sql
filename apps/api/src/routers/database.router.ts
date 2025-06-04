import { Elysia } from "elysia";
import { adapter } from "../adapter";
import { setupPlugin } from "../plugins/setup.plugin";

export const databaseRouter = new Elysia({
  prefix: "/db",
  name: "database",
  tags: ["Database"],
  adapter: adapter,
})
  .use(setupPlugin)
  .get("/", ({ store: { databases } }) => {
    return databases.connectionNames;
  })
  .post("/:slug/connect", async ({ params, store: { databases }, status }) => {
    const db = databases.get(params.slug);
    if (!db) return status(404, "Database not found");

    const connectionStatus = await db.connect();
    if (!connectionStatus) {
      return status(503, "An error occured while connecting to database");
    }

    return {
      connectionStatus: true,
    } as const;
  })
  .post(
    "/:slug/disconnect",
    async ({ params, store: { databases }, status }) => {
      const db = databases.get(params.slug);
      if (!db) return status(404, "Database not found");

      await db.disconnect();

      return {
        connectionStatus: false,
      } as const;
    },
  )
  .get("/:slug/tables", async ({ params, store: { databases }, status }) => {
    const db = databases.get(params.slug);
    if (!db) return status(404, "Database not found");

    const res = await db.queryTables();
    if (!res) return status(503, "Database not connected");

    return res;
  })
  .get(
    "/:slug/data/:table",
    async ({ params, store: { databases }, status }) => {
      const db = databases.get(params.slug);
      if (!db) return status(404, "Database not found");

      const res = await db.queryData(params.table);
      if (!res)
        return status(503, "Database not connected or table not accessible");

      return res;
    },
  );
