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
  .get(
    "/",
    async ({ store: { servers } }) => {
      return servers.list;
    },
    {
      requireToken: "read",
      detail: {
        summary: "Get servers",
        description:
          "List of every instance of local-sql server, local and remote",
      },
    },
  )
  .post(
    "/",
    async ({ body, store: { servers } }) => {
      return await servers.add(body);
    },
    {
      requireToken: "write",
      body: t.Object({
        name: t.String({ minLength: 1 }),
        url: t.String({ minLength: 1, format: "uri" }),
        token: t.Optional(t.String()),
      }),
      detail: {
        summary: "Add server",
        description:
          "Add remote instance of local-sql server, establish connection and get its connections",
      },
    },
  )
  .get(
    "/:serverId",
    ({ params, store: { servers }, status, permission }) => {
      const server = servers.get(params.serverId);
      if (!server) return status(404, "Server not found");

      return {
        name: server.name,
        url: server.url,
        isConnected: server.isConnected,
        permission, // Return permission from access token
        error: server.lastError,
        connections: server.connections.list,
      };
    },
    {
      requireToken: "read",
      detail: {
        summary: "Get server",
        description: "Get detailed data of server instance with connections",
      },
    },
  )
  .put(
    "/:serverId",
    async ({ body, params, store: { servers }, status }) => {
      const response = await servers.update({
        id: params.serverId,
        ...body,
      });
      if (!response) return status(404, "Server not found");

      console.log(response);
      return response;
    },
    {
      requireToken: "write",
      body: t.Object({
        name: t.String({ minLength: 1 }),
        url: t.String({ minLength: 1, format: "uri" }),
        token: t.Optional(t.String()),
      }),
      detail: {
        summary: "Update server",
        description:
          "Update remote local-sql instance and establish new connection",
      },
    },
  )
  .delete(
    "/:serverId",
    async ({ params, store: { servers }, status }) => {
      if (!servers.has(params.serverId)) return status(404, "Server not found");
      return await servers.delete(params.serverId);
    },
    {
      requireToken: "write",
      detail: {
        summary: "Delete server",
        description:
          "Permanently remove server from local instance of local-sql",
      },
    },
  )
  .post(
    "/:serverId/connect",
    async ({ params, store: { servers }, status }) => {
      const response = await servers.connectServer(params.serverId, true);

      if (!response) return status(404, "Server not found");

      return response;
    },
    {
      requireToken: "read",
      detail: {
        summary: "Connect server",
        description: "Establish connection with remote instance of local-sql",
      },
    },
  )
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
      requireToken: "write",
      body: t.Object({
        name: t.String({ minLength: 1 }),
        uri: t.String({ format: "uri" }),
      }),
      detail: {
        summary: "Add database",
        description: "Add database connection to local-sql instance",
        hide: true,
      },
    },
  )
  .post(
    "/:serverId/database",
    async ({ body, params, store: { servers }, status }) => {
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
        const response =
          await server.gatewayApi.server.local.database.post(body);
        if (response.error) {
          return status(response.error.status, response.error.value);
        }

        return response.data;
      } catch {
        return status(503, "An error occured while connecting to database");
      }
    },
    {
      requireToken: "write",
      body: t.Object({
        name: t.String({ minLength: 1 }),
        uri: t.String({ format: "uri" }),
      }),
      detail: {
        summary: "Add database",
        description: "Add database connection to local-sql instance",
      },
    },
  )
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
    {
      requireToken: "read",
      detail: {
        summary: "Connect to database",
        description:
          "Establish connection with database, get tables with schema",
        hide: true,
      },
    },
  )
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
    {
      requireToken: "read",
      detail: {
        summary: "Connect to database",
        description:
          "Establish connection with database, get tables with schema",
      },
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
    {
      requireToken: "read",
      detail: {
        summary: "Disconnect database",
        hide: true,
      },
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
    {
      requireToken: "read",
      detail: {
        summary: "Disconnect database",
      },
    },
  )
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
    {
      requireToken: "write",
      detail: {
        summary: "Delete database",
        description: "Disconnect database and then permanently remove it",
        hide: true,
      },
    },
  )
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
    {
      requireToken: "write",
      detail: {
        summary: "Delete database",
        description: "Disconnect database and then permanently remove it",
      },
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
    {
      requireToken: "read",
      detail: {
        summary: "Get database tables",
        description: "Lists database tables and their schemas",
        hide: true,
      },
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
    {
      requireToken: "read",
      detail: {
        summary: "Get database tables",
        description: "Lists database tables and their schemas",
      },
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
    {
      requireToken: "read",
      detail: {
        summary: "Get table data",
        description: "Queries database table data",
        hide: true,
      },
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
    {
      requireToken: "read",
      detail: {
        summary: "Get table data",
        description: "Queries database table data",
      },
    },
  );
