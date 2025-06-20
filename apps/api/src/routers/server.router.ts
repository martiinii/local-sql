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
  // List all servers
  .get("/", async ({ store: { servers } }) => {
    return servers.list;
  })
  // Add server
  .post(
    "/",
    async ({ body, store: { servers } }) => {
      return await servers.add(body);
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        url: t.String({ minLength: 1, format: "uri" }),
        token: t.Optional(t.String()),
      }),
    },
  )
  // Delete server
  .delete("/:serverId", async ({ params, store: { servers }, status }) => {
    if (!servers.has(params.serverId)) return status(404, "Server not found");
    return await servers.delete(params.serverId);
  })
  // Get server data
  .get("/:serverId", ({ params, store: { servers }, status }) => {
    const server = servers.get(params.serverId);
    if (!server) return status(404, "Server not found");

    return {
      name: server.name,
      url: server.url,
      connections: server.connections.list,
    };
  })
  // Update server data
  .put(
    "/:serverId",
    async ({ body, params, store: { servers }, status }) => {
      const response = await servers.update({
        id: params.serverId,
        ...body,
      });
      if (!response) return status(404, "Server not found");

      return response;
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        url: t.String({ minLength: 1, format: "uri" }),
        token: t.Optional(t.String()),
      }),
    },
  )
  // Local server instance
  // Add database
  .post(
    `/${LOCAL_SERVER_ID}/database`,
    async ({ body, store: { servers }, status }) => {
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

      const response = await server.addConnection(body);
      return response;
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        uri: t.String({ format: "uri" }),
      }),
    },
  )
  // Connect to database
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
  // Disconnect database
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
  // Delete database
  .delete(
    `/${LOCAL_SERVER_ID}/database/:databaseId`,
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

      await server.removeConnection(params.databaseId);
    },
  )
  // Get database tables
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
  // Get data from table
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
  // Connect to server
  .post(
    "/:serverId/connect",
    async ({ params, store: { servers }, status }) => {
      const response = await servers.connectServer(params.serverId, true);

      if (!response) return status(404, "Server not found");

      return response;
    },
  )
  // Connect to database
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
  // Disconnect database
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
  // Delete database
  .delete(
    "/:serverId/database/:databaseId",
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
          .delete();
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
  // Get database tables
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
  // Get data from table
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
