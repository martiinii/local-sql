import { LOCAL_SERVER_ID } from "@local-sql/db-types";
import { Elysia, t } from "elysia";
import { adapter } from "../adapter";
import { setupPlugin } from "../plugins/setup.plugin";

export const serverRouter = new Elysia({
  prefix: "/server",
  name: "server",
  tags: ["Server"],
  adapter: adapter,
})
  .use(setupPlugin)
  .get("/", async ({ store: { servers } }) => {
    return servers.list;
  })
  .post(
    "/",
    async ({ body, store: { servers } }) => {
      await servers.add(body);
      return servers.list;
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        url: t.String({ minLength: 1, format: "uri" }),
        token: t.Optional(t.String()),
      }),
    },
  )
  .delete("/:serverId", async ({ params, store: { servers } }) => {
    await servers.delete(params.serverId);
    return servers.list;
  })
  .get("/:serverId", ({ params, store: { servers }, status }) => {
    const connections = servers.get(params.serverId)?.connections;
    if (!connections) return status(404, "Server not found");

    return connections.list;
  })
  // Local server instance
  .post(
    `/${LOCAL_SERVER_ID}/database/:databaseId/connect`,
    async ({ params, store: { servers }, status }) => {
      const server = servers.get(LOCAL_SERVER_ID);
      if (!server) return status(404, "Server not found");

      // Should always be connected to local server, but we can perform additional check
      if (!server.isConnected) {
        const connectResponse = await server.connect();
        if (!connectResponse.isConnected)
          return status(
            503,
            "An error occured while connecting to local instance of local-sql server",
          );
      }

      const db = server.connections.get(params.databaseId);
      if (!db) return status(404, "Database not found");

      const connectionStatus = await db.connect();
      if (!connectionStatus.isConnected) {
        return status(503, "An error occured while connecting to database");
      }

      return {
        isConnected: true as const,
        tables: connectionStatus.tables,
      };
    },
  )
  .post(
    `/${LOCAL_SERVER_ID}/database/:databaseId/disconnect`,
    async ({ params, store: { servers }, status }) => {
      const server = servers.get(LOCAL_SERVER_ID);
      if (!server) return status(404, "Server not found");

      // Should always be connected to local server, but we can perform additional check
      if (!server.isConnected) {
        const connectResponse = await server.connect();
        if (!connectResponse.isConnected)
          return status(
            503,
            "An error occured while connecting to local instance of local-sql server",
          );
      }

      const db = server.connections.get(params.databaseId);
      if (!db) return status(404, "Database not found");

      await db.disconnect();

      return {
        connectionStatus: false,
      } as const;
    },
  )
  .get(
    `/${LOCAL_SERVER_ID}/database/:databaseId/tables`,
    async ({ params, store: { servers }, status }) => {
      const server = servers.get(LOCAL_SERVER_ID);
      if (!server) return status(404, "Server not found");

      // Should always be connected to local server, but we can perform additional check
      if (!server.isConnected) {
        const connectResponse = await server.connect();
        if (!connectResponse.isConnected)
          return status(
            503,
            "An error occured while connecting to local instance of local-sql server",
          );
      }
      const db = server.connections.get(params.databaseId);
      if (!db) return status(404, "Database not found");

      const res = await db.queryTables();
      if (!res) return status(503, "Database not connected");

      return res;
    },
  )
  .get(
    `/${LOCAL_SERVER_ID}/database/:databaseId/data/:table`,
    async ({ params, store: { servers }, status }) => {
      const server = servers.get(LOCAL_SERVER_ID);
      if (!server) return status(404, "Server not found");

      // Should always be connected to local server, but we can perform additional check
      if (!server.isConnected) {
        const connectResponse = await server.connect();
        if (!connectResponse.isConnected)
          return status(
            503,
            "An error occured while connecting to local instance of local-sql server",
          );
      }
      const db = server.connections.get(params.databaseId);
      if (!db) return status(404, "Database not found");

      const res = await db.queryData(params.table);
      if (!res)
        return status(503, "Database not connected or table not accessible");

      return res;
    },
  )
  // Other servers (local server is used as gateway)
  .post(
    "/:serverId/database/:databaseId/connect",
    async ({ params, store: { servers }, status }) => {
      const server = servers.get(params.serverId);
      if (!server) return status(404, "Server not found");

      if (!server.isConnected) {
        const connectResponse = await server.connect();
        if (!connectResponse.isConnected)
          return status(
            503,
            "An error occured while connecting to remote instance of local-sql server",
          );
      }

      try {
        const response = await server.gatewayApi.server.local
          .database({ databaseId: params.databaseId })
          .connect.post();
        if (response.error) {
          return status(response.error.status, response.error.value);
        }

        return response.data;
      } catch {
        return status(503, "An error occured while connecting to database");
      }
    },
  )
  .post(
    "/:serverId/database/:databaseId/disconnect",
    async ({ params, store: { servers }, status }) => {
      const server = servers.get(params.serverId);
      if (!server) return status(404, "Server not found");

      // Should always be connected to local server, but we can perform additional check
      if (!server.isConnected) {
        const connectResponse = await server.connect();
        if (!connectResponse.isConnected)
          return status(
            503,
            "An error occured while connecting to remote instance of local-sql server",
          );
      }

      try {
        const response = await server.gatewayApi.server.local
          .database({ databaseId: params.databaseId })
          .disconnect.post();
        if (response.error) {
          return status(response.error.status, response.error.value);
        }

        return response.data;
      } catch {
        return status(
          503,
          "An error occured while disconnecting this database",
        );
      }
    },
  )
  .get(
    "/:serverId/database/:databaseId/tables",
    async ({ params, store: { servers }, status }) => {
      const server = servers.get(params.serverId);
      if (!server) return status(404, "Server not found");

      // Should always be connected to local server, but we can perform additional check
      if (!server.isConnected) {
        const connectResponse = await server.connect();
        if (!connectResponse.isConnected)
          return status(
            503,
            "An error occured while connecting to remote instance of local-sql server",
          );
      }

      try {
        const response = await server.gatewayApi.server.local
          .database({ databaseId: params.databaseId })
          .tables.get();
        if (response.error) {
          return status(response.error.status, response.error.value);
        }

        return response.data;
      } catch {
        return status(
          503,
          "An error occured while fetching this database tables",
        );
      }
    },
  )
  .get(
    "/:serverId/database/:databaseId/data/:table",
    async ({ params, store: { servers }, status }) => {
      const server = servers.get(params.serverId);
      if (!server) return status(404, "Server not found");

      // Should always be connected to local server, but we can perform additional check
      if (!server.isConnected) {
        const connectResponse = await server.connect();
        if (!connectResponse.isConnected)
          return status(
            503,
            "An error occured while connecting to remote instance of local-sql server",
          );
      }

      try {
        const response = await server.gatewayApi.server.local
          .database({ databaseId: params.databaseId })
          .data({ table: params.table })
          .get();
        if (response.error) {
          return status(response.error.status, response.error.value);
        }

        return response.data;
      } catch {
        return status(503, "An error occured while fetching this table data");
      }
    },
  );
